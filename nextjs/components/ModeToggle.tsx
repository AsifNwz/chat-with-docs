"use client";

import { Sun, Moon } from "lucide-react";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ModeToggle() {
	const { setTheme } = useTheme();
	const [isDark, setIsDark] = useState(true);

	return (
		<>
			{isDark ? (
				<Button
					variant="outline"
					className="rounded-full border-0 bg-accent outline-none"
					onClick={() => {
						setIsDark((prev) => !prev);
						setTheme("light");
					}}
				>
					<Sun className="h-[1.2rem] w-[1.2rem]" />
				</Button>
			) : (
				<Button
					variant="outline"
					className="rounded-full border-0 bg-accent outline-none"
					onClick={() => {
						setIsDark((prev) => !prev);
						setTheme("dark");
					}}
				>
					<Moon className="h-[1.2rem] w-[1.2rem]" />
				</Button>
			)}
		</>
	);
}
