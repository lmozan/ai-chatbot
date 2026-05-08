from pydantic import BaseModel, Field
from typing import Optional, List, Any
from enum import Enum


class Category(str, Enum):
    FITNESS = "fitness"
    PRODUCTIVITY = "productivity"
    LEARNING = "learning"
    CODING = "coding"
    CREATIVITY = "creativity"
    MINDFULNESS = "mindfulness"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


class Challenge(BaseModel):
    id: str
    title: str
    description: str
    category: str
    difficulty: str
    xp_reward: int
    tags: List[str]
    min_level: int
    max_level: Optional[int] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    user_id: str = "default_user"
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    message: str
    suggested_challenge: Optional[dict] = None


class ChallengeRequest(BaseModel):
    user_id: str = "default_user"
    category: Optional[str] = None
    query: Optional[str] = None


class ProofResponse(BaseModel):
    accepted: bool
    message: str
    xp_awarded: int = 0
    new_level: Optional[int] = None
    old_level: Optional[int] = None
    level_up: bool = False
    achievement_unlocked: Optional[str] = None


class UserStatsResponse(BaseModel):
    user_id: str
    username: str
    level: int
    xp: int
    xp_to_next_level: int
    xp_progress: float
    streak: int
    total_challenges: int
    completed_challenges: int
    achievements: List[str]
    challenge_history: List[Any]


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    level: int
    xp: int
    completed_challenges: int
    streak: int
