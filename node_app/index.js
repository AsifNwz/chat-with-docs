// index.js
import express from "express";
import cors from "cors";
import multer from "multer";
import amqplib from "amqplib";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";
import * as cheerio from "cheerio";
import { vectorStore } from "./helper.js";
import { addDocumentsToVectorStore } from "./helper.js";

const client = new OpenAI();
const port = 8000;
const app = express();
app.use(express.json());
app.use(cors());

// ---- RabbitMQ ----
let amqpChannel;
const QUEUE_NAME = "file-queue";

async function initAMQP() {
	while (true) {
		try {
			const conn = await amqplib.connect("amqp://rabbitmq:5672");
			// const conn = await amqplib.connect("amqp://localhost:5672");
			amqpChannel = await conn.createChannel();
			await amqpChannel.assertQueue(QUEUE_NAME, { durable: true });
			console.log("✅ RabbitMQ connected");
			initResponseQueue();
			break;
		} catch (err) {
			console.error("❌ RabbitMQ connection failed:", err.message);
			console.log("⏳ Retrying in 5s...");
			await new Promise((res) => setTimeout(res, 5000));
		}
	}
}
initAMQP();

// ---- File Upload ----
const storage = multer.diskStorage({
	destination: "/uploads",
	filename: (_req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// ---- Send request ----
async function sendToQueue(payload) {
	if (!amqpChannel) return console.error("⚠️ AMQP channel not ready");

	const correlationId = uuidv4();
	payload.correlationId = correlationId;

	amqpChannel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), {
		persistent: true,
		replyTo: "response-queue",
		correlationId,
	});
	console.log("📩 Sent to queue:", payload?.filename || payload?.url);
}

// ---- Listen for responses ----
async function initResponseQueue() {
	await amqpChannel.assertQueue("response-queue", { durable: false });

	amqpChannel.consume(
		"response-queue",
		async (msg) => {
			const response = JSON.parse(msg.content.toString());
			console.log("✅ Got response from worker:", response?.file);
			const fileName = response?.file;
			if (!fileName) return;

			let md_file = fileName;
			if (!fileName.toLowerCase().endsWith(".md")) {
				md_file = fileName.replace(/\.[^/.]+$/, "") + ".md";
			}
			await addDocumentsToVectorStore(md_file);
			// optional: match response with request
			// if (msg.properties.correlationId) {
			// 	console.log("🔗 Correlation ID:", msg.properties.correlationId);
			// }
		},
		{ noAck: true }
	);
}

// ---- Routes ----
app.get("/", (_req, res) => {
	res.json({ message: "Chat with your PDF Server is running" });
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
	await sendToQueue({
		type: "file",
		filename: req.file.originalname,
		destination: req.file.destination,
		path: req.file.path,
	});
	res.sendStatus(200);
});

app.post("/api/parse-url", async (req, res) => {
	try {
		const { url, parseAll } = req?.body;
		if (!url) res.status(400).json({ error: "URL is required" });

		const rootDomain = new URL(url).hostname.replace(/^www\./, "");

		const response = await fetch(url);
		if (!response.ok) {
			return res.status(400).json({ error: "Failed to fetch URL" });
		}

		// send original URL
		await sendToQueue({ type: "url", url });

		// parse internal links
		if (parseAll) {
			// Check for internal links
			const html = await response.text();
			const $ = cheerio.load(html);
			const links = new Set();

			$("a[href]").each((_, el) => {
				let href = $(el).attr("href");
				if (!href || href.startsWith("javascript:")) return;

				const absoluteUrl = new URL(href, url).href;
				const linkDomain = new URL(absoluteUrl).hostname.replace(/^www\./, "");

				// ✅ filter only same root domain
				if (linkDomain !== rootDomain) return;

				// ✅ filter out non-html files
				if (
					absoluteUrl.match(
						/\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|docx?|xlsx?|pptx?|mp4|avi|mov|webm|mkv|flv|ogg|mp3|wav)$/i
					)
				)
					return;

				links.add(absoluteUrl);
			});

			// console.log("🔗 Final links:", [...links]);
			console.log("Toal links:", links.size);

			// send filtered links
			for (const link of links) {
				await sendToQueue({ type: "url", url: link });
			}
		}

		res.sendStatus(200);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Something went wrong" });
	}
});

app.post("/api/chat", async (req, res) => {
	const { query, history } = req?.body;
	if (!query) {
		return res.status(400).send("Query is required");
	}

	// 	const recentHistory = history
	// 		.filter((m) => m.role === "user")
	// 		.map((m) => `${m.role}: ${m.content}`)
	// 		.join("\n");

	// 	const rewriteResponse = await client.responses.create({
	// 		model: "gpt-4o-mini",
	// 		input: [
	// 			{
	// 				role: "system",
	// 				content: `You are a query rewriter for a document retrieval system.
	// Take the user's question and rewrite it into a clear, standalone search query.
	// Do NOT answer the question, only rewrite it for document retrieval.
	// Use the conversation history to understand context:
	// ${recentHistory}`,
	// 			},
	// 			{ role: "user", content: query },
	// 		],
	// 	});

	// 	const rewrittenQuery = rewriteResponse.output[0].content[0].text.trim();

	// console.log("Rewritten query:", rewrittenQuery);

	const retriever = vectorStore.asRetriever({
		searchType: "mmr",
		searchKwargs: {
			fetchK: 10,
		},
		k: 2,
		// filter: (doc) => {
		//   return doc.metadata.source === "pdf";
		// }
	});

	const context = await retriever.invoke(query);
	console.log("Query:", query);

	// console.log("Context:", context);

	// 	const SYSTEM_PROMPT = `
	// You are a helpful assistant.
	// - Always answer only the user's question.
	// - Do not include responses from other people, transcripts, or unrelated text.
	// - Format your response in valid Markdown.
	// - Keep answers concise, clear, and directly relevant.

	// Question: ${query}

	// Context: ${JSON.stringify(result)}

	// Here is the recent conversation history:
	// ${history.map((m) => `${m.role}: ${m.content}`).join("\n\n")}
	// `;

	const stream = await client.responses.create({
		model: "gpt-4o-mini",
		stream: true,
		input: [
			{
				role: "system",
				content: `You are a helpful assistant.  
- Format your response in valid Markdown.  
- Always answer in sections and references and with conclusions, send in blockquote.  
- Provide relevant answer to the user's question.
- If there is no context, respond according asking the user to upload a file or provide a link.
`,
			},
			// conversation history (user+assistant turns)
			...history.map((m) => ({
				role: m.role,
				content: m.content,
			})),
			{
				role: "user",
				content: `Question: ${query}\n\nContext: ${JSON.stringify(context)}`,
			},
		],
	});

	res.setHeader("Content-Type", "text/markdown");
	for await (const event of stream) {
		// console.log(event.delta);
		res.write(event.delta || "");
	}
	res.end();
});

// ---- Start Server ----
app.listen(port, "0.0.0.0", () =>
	console.log(`🚀 Server running on: http://localhost:${port}`)
);
