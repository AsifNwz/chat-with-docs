"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";

const base_url = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const b_url = `${base_url}/api/parse-url`;

export default function UrlParser() {
  const [url, setUrl] = useState("");
  const [parseAll, setParseAll] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function handleParse() {
    setIsSending(true);
    if (url.trim() && url.startsWith("http")) {
      try {
        const response = await fetch(b_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url, parseAll: parseAll }),
        });

        if (response.ok) {
          toast.success("URL parsed successfully");
          setParseAll(false);
          setUrl("");
          setIsSending(false);
        } else {
          toast.error("URL parse failed");
          // setParseAll(false);
          setIsSending(false);
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
        toast.error("URL parse failed");
        setIsSending(false);
      }
    }
    setIsSending(false);
  }
  return (
    <div className="mx-2 mt-10 flex items-center gap-2">
      <p>URL:</p>
      <Input
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <Checkbox
          checked={parseAll}
          className="size-5 hover:cursor-pointer"
          onCheckedChange={(checked) => setParseAll(checked === true)}
        />

        <Button
          onClick={handleParse}
          disabled={isSending}
          className="h-7 rounded-sm"
        >
          Parse
        </Button>
      </div>
    </div>
  );
}
