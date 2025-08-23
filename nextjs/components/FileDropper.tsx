"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { useState } from "react";
import { toast } from "sonner";

const base_url = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const url = `${base_url}/api/upload`;

export default function FileDropper() {
	const [files, setFiles] = useState<File[]>([]);

	const handleFileUpload = async (files: File[]) => {
		setFiles(files);
		const formData = new FormData();
		formData.append("file", files[0]);

		const response = await fetch(url, {
			method: "POST",
			body: formData,
		});

		if (response.ok) {
			toast.success("File uploaded successfully");
			setFiles([]);
		} else {
			toast.error("File upload failed");
		}
	};
	return (
		<div>
			<FileUpload files={files} onChange={handleFileUpload} />
		</div>
	);
}
