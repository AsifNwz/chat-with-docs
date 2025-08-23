"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

export default function LineLoadingTwo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [mounted, setMounted] = useState(false); // <--- client-only flag

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    setContainerWidth(width + 128);
  }, [mounted]);

  useEffect(() => {
    if (!containerWidth) return;
    const controls = animate(x, [-32, containerWidth], {
      duration: 1,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [containerWidth, x]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="bg-background relative mt-2 h-[8px] w-full overflow-hidden"
    >
      {/* Dull base line */}
      <div className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-[#e11d4880] via-[#facc1580] to-[#22c55e80]" />

      {/* Vibrant glowing wave */}
      <motion.div
        className="pointer-events-none absolute top-1/2 h-[10px] w-32 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#e11d48] via-[#facc15] to-[#22c55e] mix-blend-screen blur-md"
        style={{ x }}
      />
    </div>
  );
}
