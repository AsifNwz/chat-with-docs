"use client";

import { motion } from "framer-motion";

export default function LineLoading() {
  return (
    <div className="bg-background relative mt-4 h-[2px] w-full overflow-hidden rounded">
      <motion.div
        className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-rose-600 to-green-600"
        animate={{ x: ["-100%", "0%"], opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
