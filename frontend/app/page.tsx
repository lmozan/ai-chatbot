"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Zap, BarChart3, Trophy, Flame } from "lucide-react";
import { UserStats, TabId } from "@/lib/types";
import { getUserStats } from "@/lib/api";
import WhaleMascot from "@/components/WhaleMascot";
import XPBar from "@/components/XPBar";
import ChatInterface from "@/components/ChatInterface";
import ChallengesPanel from "@/components/ChallengesPanel";
import UserStatsComp from "@/components/UserStats";
import Leaderboard from "@/components/Leaderboard";

const USER_ID_KEY = "bwai_user_id";

function generateUserId(): string {
  return "user_" + Math.random().toString(36).slice(2, 10);
}

function getUserId(): string {
  if (typeof window === "undefined") return "default_user";
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = generateUserId();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "chat", label: "Chat", icon: <MessageCircle size={20} /> },
  { id: "challenges", label: "Challenges", icon: <Zap size={20} /> },
  { id: "stats", label: "Stats", icon: <BarChart3 size={20} /> },
  { id: "leaderboard", label: "Rank", icon: <Trophy size={20} /> },
];

function OceanParticles() {
  return (
    <div className="ocean-bg" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            animationDuration: `${6 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 8}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [userId] = useState<string>(() => {
    if (typeof window !== "undefined") return getUserId();
    return "default_user";
  });
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [prevXp, setPrevXp] = useState(0);
  const [xpFlash, setXpFlash] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await getUserStats(userId);
      setStats((prev) => {
        if (prev && data.xp > prev.xp) {
          setXpFlash(true);
          setTimeout(() => setXpFlash(false), 1500);
        }
        return data;
      });
    } catch {
      // Backend not running — stats stay null
    } finally {
      setStatsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const level = stats?.level ?? 1;
  const xp = stats?.xp ?? 0;
  const streak = stats?.streak ?? 0;

  return (
    <div className="min-h-screen relative flex flex-col">
      <OceanParticles />

      {/* Header */}
      <header className="relative z-10 flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-2">
          <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3">
            {/* Logo */}
            <WhaleMascot size={44} animate glow />

            {/* Title + XP */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="font-bold text-base leading-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span className="gradient-text">Blue Whale AI</span>
                </h1>
                {streak > 0 && (
                  <motion.span
                    className="flex items-center gap-0.5 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5"
                    animate={xpFlash ? { scale: [1, 1.2, 1] } : undefined}
                  >
                    <Flame size={10} />
                    {streak}d
                  </motion.span>
                )}
              </div>
              <XPBar
                xp={xp}
                level={level}
                xpProgress={stats?.xp_progress ?? 0}
                xpToNextLevel={stats?.xp_to_next_level ?? 100}
                compact
              />
            </div>

            {/* Level badge */}
            <motion.div
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex flex-col items-center justify-center"
              animate={xpFlash ? { scale: [1, 1.2, 1], borderColor: ["rgba(0,212,255,0.4)", "rgba(0,212,255,0.9)", "rgba(0,212,255,0.4)"] } : undefined}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs text-white/50 leading-none">Lv</span>
              <span className="text-sm font-bold text-cyan-400 leading-tight">{level}</span>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="max-w-2xl mx-auto w-full px-4 flex-1 flex flex-col min-h-0 py-3">
          <div className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto"
              >
                {activeTab === "chat" && (
                  <div className="glass-strong rounded-2xl p-4 h-full flex flex-col" style={{ minHeight: "calc(100vh - 220px)" }}>
                    <ChatInterface userId={userId} onStatsRefresh={loadStats} />
                  </div>
                )}

                {activeTab === "challenges" && (
                  <div className="pb-4">
                    <ChallengesPanel userId={userId} onStatsRefresh={loadStats} />
                  </div>
                )}

                {activeTab === "stats" && (
                  <div className="pb-4">
                    <UserStatsComp stats={stats} userId={userId} onRefresh={loadStats} />
                  </div>
                )}

                {activeTab === "leaderboard" && (
                  <div className="pb-4">
                    <Leaderboard currentUserId={userId} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="relative z-10 flex-shrink-0 pb-safe">
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="glass-strong rounded-2xl p-1.5 flex">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all relative ${
                    isActive ? "text-white" : "text-white/40 hover:text-white/60"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.1))",
                        border: "1px solid rgba(0,212,255,0.25)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors ${isActive ? "text-cyan-400" : ""}`}>
                    {tab.icon}
                  </span>
                  <span className="relative z-10 text-xs font-medium leading-none">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
