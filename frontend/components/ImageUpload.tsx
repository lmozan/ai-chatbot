"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle2, XCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { submitProof } from "@/lib/api";
import { ProofResponse } from "@/lib/types";

interface ImageUploadProps {
  userId: string;
  challengeId: string;
  xpReward: number;
  onSuccess?: (result: ProofResponse) => void;
}

type UploadState = "idle" | "preview" | "uploading" | "success" | "failed";

export default function ImageUpload({ userId, challengeId, xpReward, onSuccess }: ImageUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ProofResponse | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setState("preview");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!file) return;
    setState("uploading");
    try {
      const res = await submitProof(userId, challengeId, file);
      setResult(res);
      setState(res.accepted ? "success" : "failed");
      if (res.accepted) onSuccess?.(res);
    } catch (err) {
      setResult({
        accepted: false,
        message: "Could not reach the server. Make sure the backend is running!",
        xp_awarded: 0,
      });
      setState("failed");
    }
  };

  const reset = () => {
    setState("idle");
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="space-y-3 pt-2">
      <AnimatePresence mode="wait">
        {/* Idle / Drop zone */}
        {(state === "idle" || state === "preview") && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                dragging
                  ? "border-cyan-400 bg-cyan-500/10"
                  : "border-white/20 hover:border-cyan-500/50 hover:bg-white/5"
              }`}
            >
              {preview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Proof preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                  <p className="text-xs text-white/50 mt-2">{file?.name}</p>
                </div>
              ) : (
                <div className="py-4 space-y-2">
                  <ImageIcon className="mx-auto text-white/30" size={32} />
                  <p className="text-sm text-white/60">Drop your proof image here or <span className="text-cyan-400">browse</span></p>
                  <p className="text-xs text-white/30">JPG, PNG, WEBP — max 10MB</p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {state === "preview" && (
              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 py-2 text-sm rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all">
                  Change
                </button>
                <motion.button
                  onClick={handleSubmit}
                  className="flex-1 btn-ocean py-2 text-sm flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload size={14} />
                  Submit for {xpReward} XP
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* Uploading */}
        {state === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 space-y-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="inline-flex"
            >
              <Loader2 className="text-cyan-400" size={36} />
            </motion.div>
            <p className="text-sm text-white/70">Blue Whale AI is analyzing your proof...</p>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Success */}
        {state === "success" && result && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-emerald-400">Proof Verified! 🎉</p>
                <p className="text-sm text-white/70 mt-1">{result.message}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-1">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">+{result.xp_awarded}</p>
                <p className="text-xs text-white/50">XP Earned</p>
              </div>
              {result.level_up && (
                <>
                  <div className="w-px h-8 bg-white/20" />
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-2xl font-bold text-cyan-400">Lv.{result.new_level}</p>
                    <p className="text-xs text-cyan-400/70">Level Up! 🚀</p>
                  </motion.div>
                </>
              )}
              {result.achievement_unlocked && (
                <>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="text-center">
                    <p className="text-lg">{result.achievement_unlocked}</p>
                    <p className="text-xs text-white/50">Achievement!</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Failed */}
        {state === "failed" && result && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-400">Not Quite There</p>
                <p className="text-sm text-white/70 mt-1">{result.message}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="btn-glow w-full py-2 text-sm"
            >
              Try Again 🔄
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
