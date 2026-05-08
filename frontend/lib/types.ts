export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  xp_reward: number;
  tags: string[];
  min_level: number;
  max_level?: number | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  suggested_challenge?: Challenge | null;
}

export interface UserStats {
  user_id: string;
  username: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  xp_progress: number;
  streak: number;
  total_challenges: number;
  completed_challenges: number;
  achievements: string[];
  challenge_history: ChallengeHistoryEntry[];
  active_challenge?: string | null;
}

export interface ChallengeHistoryEntry {
  challenge_id: string;
  xp_earned: number;
  timestamp: string;
  level_at_time: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  level: number;
  xp: number;
  completed_challenges: number;
  streak: number;
}

export interface ProofResponse {
  accepted: boolean;
  message: string;
  xp_awarded: number;
  old_level?: number;
  new_level?: number;
  level_up?: boolean;
  achievement_unlocked?: string | null;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export type TabId = "chat" | "challenges" | "stats" | "leaderboard";
