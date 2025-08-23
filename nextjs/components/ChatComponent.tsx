/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import "highlight.js/styles/atom-one-dark.css";

// import "highlight.js/styles/monokai.css";

import Image from "next/image";
import { useTheme } from "next-themes";

import dynamic from "next/dynamic";

const LineLoading = dynamic(() => import("./LineLoading"), { ssr: false });
const LineLoadingTwo = dynamic(() => import("./LineLoadingTwo"), {
  ssr: false,
});

const url = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface Message {
  role: "user" | "assistant";
  content: string;
}
export default function ChatComponent() {
  const { theme } = useTheme();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  //   const [messages, setMessages] = useState<Message[]>([
  //     {
  //       role: "user",
  //       content: "Hello",
  //     },
  //     {
  //       role: "assistant",
  //       content: `

  // # Markdown Test File

  // ## Paragraphs
  // This is a paragraph to test normal text rendering.
  // It has multiple sentences to simulate real content and wrapping behavior in the browser.

  // Another paragraph with some **bold** and *italic* formatting, and \`inline code\`.

  // ---

  // ## Unordered List
  // - Item 1
  // - Item 2
  //   - Nested item 2a
  //   - Nested item 2b
  // - Item 3

  // ## Ordered List
  // 1. Step 1
  // 2. Step 2
  //    1. Step 2a
  //    2. Step 2b
  // 3. Step 3

  // ---

  // ## Tables

  // | Name       | Age | Role         |
  // |------------|-----|--------------|
  // | Alice      | 30  | Developer    |
  // | Bob        | 28  | Designer     |
  // | Charlie    | 35  | Project Lead |

  // ---

  // ## Long Python Code Block

  // \`\`\`python
  // import os
  // import sys
  // from pathlib import Path
  // from time import sleep

  // class FileProcessor:
  //     def __init__(self, directory):
  //         self.directory = Path(directory)

  //     def scan_files(self):
  //         files = list(self.directory.glob("**/*.txt"))
  //         print(f"Found {len(files)} files")
  //         return files

  //     def process_file(self, filepath):
  //         print(f"Processing {filepath}")
  //         with open(filepath, "r") as f:
  //             content = f.read()
  //         # simulate processing
  //         sleep(0.1)
  //         return content.upper()

  //     def run(self):
  //         files = self.scan_files()
  //         for f in files:
  //             result = self.process_file(f)
  //             print(result[:100], "...")  # preview first 100 chars

  // if __name__ == "__main__":
  //     processor = FileProcessor("./data")
  //     processor.run()

  // \`\`\`

  // ### JavaScript
  // \`\`\`javascript
  // function fetchData(url) {
  //     return fetch(url)
  //         .then(response => {
  //             if (!response.ok) throw new Error("Network error");
  //             return response.json();
  //         })
  //         .then(data => {
  //             console.log("Data received:", data);
  //             return data;
  //         })
  //         .catch(err => console.error("Fetch failed:", err));
  // }

  // async function main() {
  //     const urls = ["https://api.example.com/user", "https://api.example.com/posts"];
  //     for (const url of urls) {
  //         const data = await fetchData(url);
  //         console.log("Processed data length:", data.length);
  //     }
  // }

  // main();

  // \`\`\`

  // ### Bash
  // \`\`\`bash
  // #!/bin/bash
  // echo "Starting script..."
  // for file in *.txt; do
  //     echo "Processing $file"
  // done

  // \`\`\`

  // ### SQL
  // \`\`\`sql
  // SELECT id, name, email
  // FROM users
  // WHERE active = 1
  // ORDER BY created_at DESC;

  // \`\`\`

  // ### VBNET
  // \`\`\`vbnet

  // This file is long enough to test scrolling, syntax highlighting, and Markdown rendering.

  // Do you want me to **also generate an even larger file with hundreds of lines of code** for stress testing the UI?

  // \`\`\`

  //     `,
  //     },
  //   ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    // Prefer bottom sentinel to avoid layout jitter
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    // Hard fallback in case sentinel fails
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsStreaming(true);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    const query = input;
    setInput("");
    scrollToBottom("smooth");

    const lastFive = messages?.slice(-5);

    // Ask backend
    const response = await fetch(`${url}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, history: lastFive }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    let aiMessage = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiMessage += decoder.decode(value);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: aiMessage };
        return updated;
      });

      scrollToBottom("auto");
    }

    setIsStreaming(false);
    // final smooth settle
    scrollToBottom("smooth");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Safety: also react to any message list change (initial loads, edits)
  useEffect(() => {
    scrollToBottom(isStreaming ? "auto" : "smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Chat window */}
      <div
        ref={scrollRef}
        className="bg-sidebar max-h-[80vh] min-h-[80vh] flex-1 space-y-4 overflow-auto p-4"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] overflow-auto rounded-md p-3 text-sm ${
              msg.role === "user" ? "bg-accent ml-auto" : "mr-auto"
            }`}
          >
            {msg.role === "assistant" ? (
              <div className="markdown-content bg-accent/50 rounded-md p-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    img: ({ src, alt }: any) => (
                      <Image
                        src={src}
                        alt={alt}
                        width={500}
                        height={500}
                        className="mb-2 max-w-2xl rounded"
                      />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              msg.content
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {isStreaming ? (
        theme === "dark" ? (
          <LineLoadingTwo />
        ) : (
          <LineLoading />
        )
      ) : null}

      {/* Input area */}
      <div className="bg-sidebar flex gap-2 border-t p-4">
        <Textarea
          placeholder="Type a message..."
          value={input}
          disabled={isStreaming}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none rounded-md shadow-2xl"
        />
        {/* <Button className="rounded-2xl" variant="outline" onClick={handleSend}>
					<Send />
				</Button> */}
      </div>
    </div>
  );
}
