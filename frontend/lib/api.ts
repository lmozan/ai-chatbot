import { Challenge, ChatMessage, UserStats, ProofResponse, LeaderboardEntry, Category } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function sendChat(
  message: string,
  userId: string,
  history: ChatMessage[]
): Promise<{ message: string; suggested_challenge?: Challenge | null }> {
  return apiFetch("/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      user_id: userId,
      history: history.map((h) => ({ role: h.role, content: h.content })),
    }),
  });
}

export async function getChallenges(
  userId: string,
  category?: string,
  query?: string
): Promise<{ challenges: Challenge[]; user_level: number }> {
  return apiFetch("/challenge", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, category, query }),
  });
}

export async function acceptChallenge(userId: string, challengeId: string): Promise<{ message: string; challenge: Challenge }> {
  return apiFetch("/challenge/accept", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, challenge_id: challengeId }),
  });
}

export async function getCategories(): Promise<{ categories: Category[] }> {
  return apiFetch("/challenge/categories");
}

export async function submitProof(
  userId: string,
  challengeId: string,
  imageFile: File
): Promise<ProofResponse> {
  const form = new FormData();
  form.append("user_id", userId);
  form.append("challenge_id", challengeId);
  form.append("image", imageFile);

  const res = await fetch(`${API_URL}/submit-proof`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function getUserStats(userId: string): Promise<UserStats> {
  return apiFetch(`/user-stats/${userId}`);
}

export async function getLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
  return apiFetch("/leaderboard");
}

export async function updateUsername(userId: string, username: string): Promise<{ message: string; username: string }> {
  return apiFetch(`/user-stats/${userId}/username`, {
    method: "PATCH",
    body: JSON.stringify({ username }),
  });
}
