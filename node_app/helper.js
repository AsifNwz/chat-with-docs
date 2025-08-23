import "dotenv/config";
import fs from "fs";
import { QdrantClient } from "@qdrant/js-client-rest";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { MarkdownTextSplitter } from "@langchain/textsplitters";

// call openai for each chunk
export const embeddings = new OpenAIEmbeddings({
	model: "text-embedding-3-large",
});

const client = new QdrantClient({
	url: "http://qdrant:6333",
	// url: "http://localhost:6333",
});

// store the docs as embeddings in quadrant
export const vectorStore = await QdrantVectorStore.fromExistingCollection(
	embeddings, // open ai embeddings
	{
		client,
		collectionName: "Chat_With_Your_PDF_&_Links",
	}
);

export async function addDocumentsToVectorStore(fileName) {
	// const filePath = `../uploads_data/${fileName}`;
	const filePath = `/uploads/${fileName}`;

	const fileSize = fs.statSync(filePath).size;
	// read the md
	const loader = new TextLoader(filePath);
	const docs = await loader.load();

	let finalDocs = [];

	if (fileSize < 50 * 1024) {
		console.log("📄 Small file detected, skipping split...");
		finalDocs = docs;
	} else {
		console.log("📄 Large file detected, splitting...");
		const splitter = new MarkdownTextSplitter({
			chunkSize: 3000,
			chunkOverlap: 200,
			keepSeparator: true,
		});
		finalDocs = await splitter.splitDocuments(docs);
	}

	await vectorStore.addDocuments(finalDocs);
	console.log("✅ Added documents to vector store");
}
