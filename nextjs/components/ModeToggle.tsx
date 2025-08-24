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
          className="bg-accent rounded-full border-0 outline-none"
          onClick={() => {
            setIsDark((prev) => !prev);
            setTheme("light");
          }}
        >
          <Sun />
        </Button>
      ) : (
        <Button
          variant="outline"
          className="bg-accent rounded-full border-0 outline-none"
          onClick={() => {
            setIsDark((prev) => !prev);
            setTheme("dark");
          }}
        >
          <Moon />
        </Button>
      )}
    </>
  );
}
