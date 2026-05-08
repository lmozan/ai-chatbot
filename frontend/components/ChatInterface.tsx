"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { sendChat } from "@/lib/api";
import { ChatMessage, Challenge } from "@/lib/types";
import ChallengeCard from "./ChallengeCard";

interface ChatInterfaceProps {
  userId: string;
  onStatsRefresh: () => void;
}

const QUICK_PROMPTS = [
  "Give me a challenge 🎯",
  "Show my progress 📊",
  "Motivate me! 💪",
  "Fitness challenge 🏃",
  "Coding challenge 💻",
  "Mindfulness task 🧘",
];

function formatContent(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

export default function ChatInterface({ userId, onStatsRefresh }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "🐋 Welcome to the deep, Whale Rider! I'm **Blue Whale AI** — your guide through the ocean of self-mastery.\n\nAsk me for a challenge, check your progress, or tell me what area you want to level up today! 🌊",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
        const result = await sendChat(text.trim(), userId, history as ChatMessage[]);

        const botMsg: ChatMessage = {
          role: "assistant",
          content: result.message,
          timestamp: Date.now(),
          suggested_challenge: result.suggested_challenge,
        };
        setMessages((prev) => [...prev, botMsg]);
        onStatsRefresh();
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "🌊 The ocean currents are disrupted — can't reach the server. Make sure the backend is running on port 8000!",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, userId, loading, onStatsRefresh]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4" style={{ minHeight: 0 }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/40 text-sm mt-1">
                  🐋
                </div>
              )}
              <div className={`max-w-[85%] space-y-2`}>
                <div
                  className={`px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user" ? "msg-user text-white" : "msg-assistant text-white/90"
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                />
                {msg.suggested_challenge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ChallengeCard
                      challenge={msg.suggested_challenge}
                      userId={userId}
                      onAccepted={onStatsRefresh}
                      compact
                    />
                  </motion.div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-blue-500/20 border border-blue-500/40 text-sm mt-1">
                  👤
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start gap-2"
          >
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/40 text-sm">
              🐋
            </div>
            <div className="msg-assistant px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 typing-dot inline-block" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 typing-dot inline-block" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 typing-dot inline-block" />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="whitespace-nowrap px-3 py-1.5 text-xs rounded-full glass border border-white/10 text-white/70 hover:text-white hover:border-cyan-500/40 transition-all flex-shrink-0 disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-white/10">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Talk to Blue Whale AI..."
          disabled={loading}
          className="flex-1 ocean-input px-4 py-3 text-sm"
        />
        <motion.button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-ocean px-4 py-3 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <Send size={16} />
          )}
        </motion.button>
      </form>
    </div>
  );
}
