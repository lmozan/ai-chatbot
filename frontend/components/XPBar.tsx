"use client";

import { motion } from "framer-motion";

interface XPBarProps {
  xp: number;
  level: number;
  xpProgress: number;
  xpToNextLevel: number;
  compact?: boolean;
}

export default function XPBar({ xp, level, xpProgress, xpToNextLevel, compact = false }: XPBarProps) {
  const pct = Math.min(xpProgress * 100, 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-cyan-400 font-bold whitespace-nowrap">Lv.{level}</span>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full xp-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-white/50 whitespace-nowrap">{xp} XP</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-cyan-400 font-semibold">Level {level}</span>
        <span className="text-white/60">
          <span className="text-white font-medium">{xp.toLocaleString()}</span> XP
          <span className="text-white/40 ml-1">· {xpToNextLevel} to next</span>
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Shine overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </div>
      <div className="flex justify-between text-xs text-white/30">
        <span>0%</span>
        <span>{Math.round(pct)}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
