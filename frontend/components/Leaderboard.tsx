"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Star, RefreshCw } from "lucide-react";
import { LeaderboardEntry } from "@/lib/types";
import { getLeaderboard } from "@/lib/api";

interface LeaderboardProps {
  currentUserId: string;
}

const RANK_STYLES: Record<number, { bg: string; text: string; icon: string }> = {
  1: { bg: "bg-yellow-500/20 border-yellow-500/40", text: "text-yellow-400", icon: "🥇" },
  2: { bg: "bg-gray-400/20 border-gray-400/40", text: "text-gray-300", icon: "🥈" },
  3: { bg: "bg-amber-600/20 border-amber-600/40", text: "text-amber-500", icon: "🥉" },
};

export default function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard();
      setEntries(data.leaderboard);
    } catch {
      setError("Could not load leaderboard. Make sure the backend is running!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white flex items-center gap-2">
          <Trophy size={18} className="text-yellow-400" />
          Ocean Leaderboard
        </h2>
        <motion.button
          onClick={load}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="text-white/40 hover:text-white/70 transition-colors"
        >
          <RefreshCw size={16} />
        </motion.button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="glass rounded-xl p-4 text-center space-y-2">
          <p className="text-white/50 text-sm">{error}</p>
          <button onClick={load} className="text-cyan-400 text-sm hover:text-cyan-300">Try again</button>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <motion.div
          className="glass rounded-2xl p-8 text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-5xl">🌊</p>
          <p className="text-white/70 font-medium">The ocean is empty...</p>
          <p className="text-white/40 text-sm">Be the first to complete a challenge and claim the throne!</p>
        </motion.div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const isMe = entry.user_id === currentUserId;
            const rankStyle = RANK_STYLES[entry.rank] || {
              bg: "bg-white/5 border-white/10",
              text: "text-white/50",
              icon: `#${entry.rank}`,
            };

            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`glass rounded-xl p-3 border flex items-center gap-3 transition-all ${
                  isMe ? "border-cyan-500/50 bg-cyan-500/5" : "border-white/10"
                } ${entry.rank <= 3 ? rankStyle.bg : ""}`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  entry.rank <= 3 ? rankStyle.text : "text-white/40"
                }`}>
                  {entry.rank <= 3 ? rankStyle.icon : `#${entry.rank}`}
                </div>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  isMe ? "bg-cyan-500/20 border border-cyan-500/40" : "bg-white/5 border border-white/10"
                }`}>
                  🐋
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm truncate ${isMe ? "text-cyan-400" : "text-white"}`}>
                      {entry.username}
                      {isMe && <span className="ml-1 text-xs text-cyan-400/60">(you)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Star size={10} className="text-yellow-400" />
                      Lv.{entry.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame size={10} className="text-orange-400" />
                      {entry.streak}d
                    </span>
                    <span>✅ {entry.completed_challenges}</span>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-sm ${entry.rank <= 3 ? rankStyle.text : "text-white/70"}`}>
                    {entry.xp.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/30">XP</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
