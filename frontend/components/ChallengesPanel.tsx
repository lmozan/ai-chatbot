"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Challenge, Category } from "@/lib/types";
import { getChallenges, getCategories } from "@/lib/api";
import ChallengeCard from "./ChallengeCard";

interface ChallengesPanelProps {
  userId: string;
  onStatsRefresh: () => void;
}

export default function ChallengesPanel({ userId, onStatsRefresh }: ChallengesPanelProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    getCategories()
      .then((d) => setCategories(d.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadChallenges();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCat]);

  const loadChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChallenges(userId, selectedCat);
      setChallenges(data.challenges);
      setUserLevel(data.user_level);
    } catch {
      setError("Could not load challenges. Make sure the backend is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Category</p>
          <motion.button
            onClick={loadChallenges}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <RefreshCw size={14} />
          </motion.button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCat(undefined)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              !selectedCat
                ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-400"
                : "glass border border-white/10 text-white/50 hover:text-white/80"
            }`}
          >
            🌊 All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id === selectedCat ? undefined : cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCat === cat.id
                  ? "bg-white/15 border border-white/30 text-white"
                  : "glass border border-white/10 text-white/50 hover:text-white/80"
              }`}
              style={selectedCat === cat.id ? { borderColor: `${cat.color}50`, color: cat.color } : {}}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* User level indicator */}
      <p className="text-xs text-white/30">
        Showing challenges for <span className="text-cyan-400">Level {userLevel}</span> and below
      </p>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass rounded-xl p-6 text-center space-y-2">
          <p className="text-4xl">🌊</p>
          <p className="text-white/50 text-sm">{error}</p>
          <button onClick={loadChallenges} className="text-cyan-400 text-sm hover:text-cyan-300">
            Retry
          </button>
        </div>
      )}

      {/* Challenges */}
      {!loading && !error && (
        <AnimatePresence>
          {challenges.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-xl p-6 text-center space-y-2"
            >
              <p className="text-4xl">🔍</p>
              <p className="text-white/50 text-sm">No challenges found for your level in this category.</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {challenges.map((challenge, i) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <ChallengeCard
                    challenge={challenge}
                    userId={userId}
                    onAccepted={onStatsRefresh}
                    compact={false}
                    rank={i + 1}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
