import json
import math
import os
import logging
from datetime import date, datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)

USERS_FILE = os.getenv("USERS_FILE", "./storage/users.json")

ACHIEVEMENTS = [
    {"id": "first_steps", "name": "First Steps 🌊", "condition": "completed_challenges", "threshold": 1},
    {"id": "dedicated", "name": "Dedicated Diver 🐠", "condition": "completed_challenges", "threshold": 5},
    {"id": "explorer", "name": "Ocean Explorer 🐋", "condition": "completed_challenges", "threshold": 20},
    {"id": "legend", "name": "Whale Legend 🔱", "condition": "completed_challenges", "threshold": 50},
    {"id": "week_warrior", "name": "Week Warrior ⚡", "condition": "streak", "threshold": 7},
    {"id": "month_master", "name": "Month Master 🏆", "condition": "streak", "threshold": 30},
    {"id": "rising_tide", "name": "Rising Tide 🌊", "condition": "level", "threshold": 5},
    {"id": "deep_diver", "name": "Deep Diver 🤿", "condition": "level", "threshold": 10},
    {"id": "whale_master", "name": "Whale Master 🐳", "condition": "level", "threshold": 15},
    {"id": "xp_1000", "name": "XP Hunter 💎", "condition": "xp", "threshold": 1000},
    {"id": "xp_5000", "name": "XP Legend 🌟", "condition": "xp", "threshold": 5000},
]


def get_level(xp: int) -> int:
    return 1 + int(math.sqrt(xp / 100))


def xp_for_level(level: int) -> int:
    return (level - 1) ** 2 * 100


def xp_for_next_level(level: int) -> int:
    return level ** 2 * 100


class UserService:
    def __init__(self):
        os.makedirs(os.path.dirname(USERS_FILE) if os.path.dirname(USERS_FILE) else ".", exist_ok=True)
        if not os.path.exists(USERS_FILE):
            with open(USERS_FILE, "w") as f:
                json.dump({}, f)

    def _load(self) -> dict:
        try:
            with open(USERS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}

    def _save(self, users: dict):
        with open(USERS_FILE, "w") as f:
            json.dump(users, f, indent=2, default=str)

    def get_user(self, user_id: str) -> dict:
        users = self._load()
        if user_id not in users:
            username_num = user_id[:6].upper()
            users[user_id] = {
                "user_id": user_id,
                "username": f"Whale Rider #{username_num}",
                "xp": 0,
                "streak": 0,
                "last_active": str(date.today()),
                "achievements": [],
                "challenge_history": [],
                "total_challenges": 0,
                "completed_challenges": 0,
                "active_challenge": None,
            }
            self._save(users)
        return users[user_id]

    def set_username(self, user_id: str, username: str) -> dict:
        users = self._load()
        user = self.get_user(user_id)
        user["username"] = username
        users[user_id] = user
        self._save(users)
        return user

    def set_active_challenge(self, user_id: str, challenge_id: str) -> dict:
        users = self._load()
        user = self.get_user(user_id)
        user["active_challenge"] = challenge_id
        user["total_challenges"] += 1
        users[user_id] = user
        self._save(users)
        return user

    def add_xp(self, user_id: str, xp: int, challenge_id: str) -> dict:
        users = self._load()
        user = self.get_user(user_id)

        old_xp = user["xp"]
        old_level = get_level(old_xp)

        user["xp"] += xp
        new_level = get_level(user["xp"])

        today = str(date.today())
        last_active = user.get("last_active", "")
        if last_active != today:
            yesterday = str(date.today() - timedelta(days=1))
            if last_active == yesterday:
                user["streak"] = user.get("streak", 0) + 1
            else:
                user["streak"] = 1
            user["last_active"] = today

        user["challenge_history"].append({
            "challenge_id": challenge_id,
            "xp_earned": xp,
            "timestamp": str(datetime.now()),
            "level_at_time": new_level,
        })
        user["completed_challenges"] = user.get("completed_challenges", 0) + 1
        user["active_challenge"] = None

        new_achievement = self._check_achievements(user, old_level, new_level)

        users[user_id] = user
        self._save(users)

        return {
            "user": user,
            "level_up": new_level > old_level,
            "old_level": old_level,
            "new_level": new_level,
            "achievement": new_achievement,
        }

    def _check_achievements(self, user: dict, old_level: int, new_level: int) -> Optional[str]:
        current_level = new_level
        completed = user.get("completed_challenges", 0)
        streak = user.get("streak", 0)
        xp = user.get("xp", 0)
        earned = user.get("achievements", [])

        for ach in ACHIEVEMENTS:
            if ach["name"] in earned:
                continue
            cond = ach["condition"]
            thresh = ach["threshold"]
            if cond == "completed_challenges" and completed >= thresh:
                user["achievements"].append(ach["name"])
                return ach["name"]
            elif cond == "streak" and streak >= thresh:
                user["achievements"].append(ach["name"])
                return ach["name"]
            elif cond == "level" and current_level >= thresh:
                user["achievements"].append(ach["name"])
                return ach["name"]
            elif cond == "xp" and xp >= thresh:
                user["achievements"].append(ach["name"])
                return ach["name"]
        return None

    def get_user_stats(self, user_id: str) -> dict:
        user = self.get_user(user_id)
        xp = user["xp"]
        level = get_level(xp)
        current_level_xp = xp_for_level(level)
        next_level_xp = xp_for_next_level(level)
        xp_in_level = xp - current_level_xp
        xp_needed = next_level_xp - current_level_xp
        progress = xp_in_level / xp_needed if xp_needed > 0 else 0

        return {
            "user_id": user_id,
            "username": user["username"],
            "level": level,
            "xp": xp,
            "xp_to_next_level": next_level_xp - xp,
            "xp_progress": round(min(progress, 1.0), 3),
            "streak": user.get("streak", 0),
            "total_challenges": user.get("total_challenges", 0),
            "completed_challenges": user.get("completed_challenges", 0),
            "achievements": user.get("achievements", []),
            "challenge_history": user.get("challenge_history", [])[-10:],
            "active_challenge": user.get("active_challenge"),
        }

    def get_leaderboard(self) -> list:
        users = self._load()
        board = []
        for uid, user in users.items():
            xp = user.get("xp", 0)
            board.append({
                "user_id": uid,
                "username": user.get("username", f"Rider #{uid[:6]}"),
                "level": get_level(xp),
                "xp": xp,
                "completed_challenges": user.get("completed_challenges", 0),
                "streak": user.get("streak", 0),
            })
        board.sort(key=lambda x: x["xp"], reverse=True)
        for i, entry in enumerate(board):
            entry["rank"] = i + 1
        return board
