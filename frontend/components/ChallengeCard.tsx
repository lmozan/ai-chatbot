"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Star, Zap, Tag, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { Challenge } from "@/lib/types";
import { acceptChallenge } from "@/lib/api";
import ImageUpload from "./ImageUpload";

interface ChallengeCardProps {
  challenge: Challenge;
  userId: string;
  onAccepted?: () => void;
  compact?: boolean;
  rank?: number;
}

const CATEGORY_STYLES: Record<string, { icon: string; color: string; bg: string }> = {
  fitness:     { icon: "💪", color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20" },
  productivity:{ icon: "⚡", color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
  learning:    { icon: "📚", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  coding:      { icon: "💻", color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20" },
  creativity:  { icon: "🎨", color: "text-pink-400",   bg: "bg-pink-500/10 border-pink-500/20" },
  mindfulness: { icon: "🧘", color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20" },
};

const DIFFICULTY_STYLES: Record<string, string> = {
  easy:   "badge-easy",
  medium: "badge-medium",
  hard:   "badge-hard",
  expert: "badge-expert",
};

export default function ChallengeCard({
  challenge,
  userId,
  onAccepted,
  compact = false,
  rank,
}: ChallengeCardProps) {
  const [expanded, setExpanded] = useState(!compact);
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const catStyle = CATEGORY_STYLES[challenge.category] || {
    icon: "🎯",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptChallenge(userId, challenge.id);
      setAccepted(true);
      onAccepted?.();
    } catch {
      // ignore
    } finally {
      setAccepting(false);
    }
  };

  return (
    <motion.div
      className="glass border border-white/10 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: "rgba(0,212,255,0.3)" }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => compact && setExpanded((v) => !v)}
      >
        {/* Category icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${catStyle.bg}`}>
          <span className="text-lg">{catStyle.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white text-sm leading-tight">{challenge.title}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {rank && (
                <span className="text-xs font-bold text-amber-400">#{rank}</span>
              )}
              {compact && (
                <button className="text-white/40 hover:text-white/70 transition-colors">
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs capitalize ${catStyle.color}`}>{challenge.category}</span>
            <span className="text-white/20">·</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLES[challenge.difficulty] || ""}`}>
              {challenge.difficulty}
            </span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <Zap size={10} />
              {challenge.xp_reward} XP
            </span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-3">
              <p className="text-sm text-white/70 leading-relaxed">{challenge.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {challenge.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Min level */}
              <div className="flex items-center gap-1 text-xs text-white/40">
                <Star size={10} />
                <span>Requires Level {challenge.min_level}</span>
              </div>

              {/* Actions */}
              {!accepted ? (
                <motion.button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="btn-ocean w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {accepting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} />
                      Accept Challenge
                    </>
                  )}
                </motion.button>
              ) : (
                <div className="space-y-2">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                  >
                    <CheckCircle size={15} />
                    Challenge Accepted! 🎉
                  </motion.div>
                  <motion.button
                    onClick={() => setShowUpload((v) => !v)}
                    className="btn-glow w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                  >
                    <Upload size={15} />
                    Submit Proof for XP
                  </motion.button>
                </div>
              )}

              {/* Proof Upload */}
              <AnimatePresence>
                {showUpload && accepted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <ImageUpload
                      userId={userId}
                      challengeId={challenge.id}
                      xpReward={challenge.xp_reward}
                      onSuccess={() => {
                        setShowUpload(false);
                        onAccepted?.();
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
