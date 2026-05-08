"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface WhaleMascotProps {
  size?: number;
  animate?: boolean;
  className?: string;
  glow?: boolean;
}

export default function WhaleMascot({
  size = 80,
  animate = true,
  className = "",
  glow = true,
}: WhaleMascotProps) {
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      animate={animate ? { y: [0, -10, 0] } : undefined}
      transition={animate ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
      style={{ width: size, height: size }}
    >
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <Image
        src="/whale.svg"
        alt="Blue Whale AI Mascot"
        width={size}
        height={size}
        priority
        style={{ filter: glow ? "drop-shadow(0 0 8px rgba(0,212,255,0.6))" : undefined }}
      />
    </motion.div>
  );
}
