"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Target, Clock, Edit2, Check } from "lucide-react";
import { UserStats as UserStatsType } from "@/lib/types";
import XPBar from "./XPBar";
import { updateUsername } from "@/lib/api";

interface UserStatsProps {
  stats: UserStatsType | null;
  userId: string;
  onRefresh: () => void;
}

const LEVEL_TITLES: Record<number, string> = {
  1: "Ocean Hatchling",
  2: "Tide Walker",
  3: "Current Rider",
  4: "Wave Surfer",
  5: "Rising Tide",
  6: "Deep Swimmer",
  7: "Sea Champion",
  8: "Ocean Master",
  9: "Whale Guardian",
  10: "Blue Whale Lord",
};

function getLevelTitle(level: number): string {
  if (level >= 10) return "🐳 Blue Whale Lord";
  if (level >= 9) return "🔱 Whale Guardian";
  if (level >= 8) return "🌊 Ocean Master";
  if (level >= 7) return "🏆 Sea Champion";
  if (level >= 6) return "🤿 Deep Swimmer";
  if (level >= 5) return "🌊 Rising Tide";
  if (level >= 4) return "🏄 Wave Surfer";
  if (level >= 3) return "🌀 Current Rider";
  if (level >= 2) return "🚶 Tide Walker";
  return "🥚 Ocean Hatchling";
}

export default function UserStats({ stats, userId, onRefresh }: UserStatsProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-white/40 text-center space-y-2">
          <div className="text-4xl">🌊</div>
          <p className="text-sm">Loading your ocean profile...</p>
        </div>
      </div>
    );
  }

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await updateUsername(userId, nameInput.trim());
      onRefresh();
      setEditingName(false);
    } catch { /* ignore */ }
    finally { setSavingName(false); }
  };

  const recentHistory = stats.challenge_history.slice().reverse().slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <motion.div
        className="glass-strong rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-3xl">
              🐋
            </div>
            <motion.div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 border-2 border-ocean-900 flex items-center justify-center text-xs font-bold text-black"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              {stats.level}
            </motion.div>
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="ocean-input flex-1 px-2 py-1 text-sm"
                  placeholder={stats.username}
                  autoFocus
                  maxLength={30}
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white truncate">{stats.username}</h2>
                <button
                  onClick={() => { setEditingName(true); setNameInput(stats.username); }}
                  className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            )}
            <p className="text-sm text-cyan-400/80">{getLevelTitle(stats.level)}</p>
          </div>
        </div>

        {/* XP Bar */}
        <XPBar
          xp={stats.xp}
          level={stats.level}
          xpProgress={stats.xp_progress}
          xpToNextLevel={stats.xp_to_next_level}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Flame size={18} className="text-orange-400" />, value: stats.streak, label: "Day Streak", color: "text-orange-400" },
            { icon: <Target size={18} className="text-cyan-400" />, value: stats.completed_challenges, label: "Completed", color: "text-cyan-400" },
            { icon: <Trophy size={18} className="text-yellow-400" />, value: stats.achievements.length, label: "Badges", color: "text-yellow-400" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="glass rounded-xl p-3 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-white/40">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      {stats.achievements.length > 0 && (
        <motion.div
          className="glass rounded-2xl p-4 space-y-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" />
            Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.achievements.map((ach, i) => (
              <motion.span
                key={ach}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-3 py-1.5 rounded-full text-sm bg-yellow-500/10 border border-yellow-500/30 text-yellow-300"
              >
                {ach}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent History */}
      {recentHistory.length > 0 && (
        <motion.div
          className="glass rounded-2xl p-4 space-y-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Clock size={16} className="text-white/50" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentHistory.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-white/70 font-mono text-xs">{entry.challenge_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-semibold">+{entry.xp_earned} XP</span>
                  <span className="text-white/30 text-xs">Lv.{entry.level_at_time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {stats.completed_challenges === 0 && (
        <motion.div
          className="glass rounded-2xl p-6 text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-4xl">🌊</p>
          <p className="text-white/60 text-sm">No completed challenges yet.</p>
          <p className="text-white/40 text-xs">Head to Chat and ask for a challenge to get started!</p>
        </motion.div>
      )}
    </div>
  );
}
