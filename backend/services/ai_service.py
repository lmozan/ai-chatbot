import os
import json
import random
import logging
import base64
from typing import List, Optional

logger = logging.getLogger(__name__)

# Groq model IDs
CHAT_MODEL = "llama-3.3-70b-versatile"
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"


def get_level(xp: int) -> int:
    import math
    return 1 + int(math.sqrt(xp / 100))


MOCK_INTROS = [
    "🐋 Welcome to the deep, Whale Rider! I'm Blue Whale AI — your guide through the ocean of self-mastery.",
    "🌊 Hey there! Blue Whale AI here, ready to dive into challenges with you. What area of your life are we conquering today?",
    "⚡ A new Whale Rider emerges from the depths! I'm your AI companion for growth, challenges, and leveling up. Let's make some waves!",
]

MOCK_MOTIVATIONS = [
    "🐋 Remember — even the blue whale started small. Every massive journey begins with one tiny ripple. What can you do RIGHT NOW?",
    "🌊 The ocean gets deeper with time. You're building something incredible, one challenge at a time. Keep going!",
    "⚡ Setbacks are just the tide pulling back before the next massive wave. Your comeback starts NOW.",
    "🔱 You showed up today. That's already 80% of the battle. Now let's make the remaining 20% legendary.",
    "🐳 Every expert was once a beginner. Every whale was once a calf. Trust the process and keep swimming.",
    "💫 The deepest parts of the ocean are dark — but that's where the most extraordinary creatures live. Embrace the challenge.",
]

MOCK_CHALLENGE_RESPONSES = [
    "🌊 I've pulled up a challenge perfectly matched to your level from the deep!",
    "⚡ Here's a challenge from the Blue Whale archives, calibrated just for you:",
    "🎯 The ocean has spoken — this challenge is calling your name:",
    "🐋 I found exactly what you need. This challenge will test and grow you:",
]

MOCK_DEFAULTS = [
    "🐋 I'm here to help you grow! Ask me for a challenge in fitness, productivity, learning, coding, creativity, or mindfulness. What area are you leveling up today?",
    "🌊 Every great Whale Rider knows that consistency is the key to the deep ocean. What challenge shall we conquer?",
    "⚡ You're talking to the right AI! Tell me what you want to improve, and I'll match you with the perfect challenge.",
    "🐳 The depths of self-improvement are vast. Let me guide you. Ask for a challenge, share your goals, or tell me how you're feeling!",
]


class AIService:
    def __init__(self, rag_service, user_service):
        self.rag = rag_service
        self.users = user_service
        self.use_ai = False
        self.client = None

        api_key = os.getenv("GROQ_API_KEY", "").strip()
        if api_key and api_key != "your_groq_api_key_here":
            try:
                from groq import Groq
                self.client = Groq(api_key=api_key)
                self.use_ai = True
                logger.info(f"Using Groq Llama ({CHAT_MODEL}) for responses")
            except ImportError:
                logger.warning("groq package not installed. Run: pip install groq")
            except Exception as e:
                logger.error(f"Groq init error: {e}")
        else:
            logger.info("No GROQ_API_KEY found. Running in intelligent mock mode.")

    # ──────────────────────────── CHAT ────────────────────────────

    def chat(self, message: str, user_id: str, history: list) -> dict:
        user = self.users.get_user(user_id)
        level = get_level(user["xp"])

        category = self._detect_category(message)
        wants_challenge = self._wants_challenge(message)
        query = message if not wants_challenge else f"challenge for level {level} {category or ''} user"

        challenges = self.rag.retrieve_challenges(
            query=query,
            user_level=level,
            category=category,
            n=3,
        )

        if self.use_ai:
            response_text = self._groq_response(message, user, level, challenges, history)
        else:
            response_text = self._mock_response(message, user, level, challenges)

        suggested = challenges[0] if (wants_challenge and challenges) else None

        return {
            "message": response_text,
            "suggested_challenge": suggested,
        }

    def _groq_response(self, message: str, user: dict, level: int, challenges: list, history: list) -> str:
        streak = user.get("streak", 0)
        completed = user.get("completed_challenges", 0)
        achievements = user.get("achievements", [])

        system_prompt = (
            "You are Blue Whale AI — a motivational AI coach helping users level up their lives "
            "through gamified self-improvement challenges.\n\n"
            "Your personality: Energetic, encouraging, wise like a deep ocean. Use occasional ocean/whale "
            "metaphors but don't overdo it. Be warm, direct, and personalized. Use markdown bold (**text**) "
            "for emphasis and emojis sparingly but effectively.\n\n"
            f"Current user profile:\n"
            f"- Level: {level}\n"
            f"- XP: {user['xp']}\n"
            f"- Streak: {streak} days\n"
            f"- Challenges completed: {completed}\n"
            f"- Achievements: {', '.join(achievements) if achievements else 'None yet'}\n\n"
            f"Relevant challenges from the database (reference these when suggesting):\n"
            f"{json.dumps(challenges[:2], indent=2)}\n\n"
            "Guidelines:\n"
            "- Keep responses concise (2-4 sentences for chat, more for challenge explanations)\n"
            "- When suggesting a challenge, describe it enthusiastically with its XP reward\n"
            "- Celebrate the user's progress when relevant\n"
            "- Always end with an encouraging call to action"
        )

        messages = [{"role": "system", "content": system_prompt}]
        for h in history[-6:]:
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})

        try:
            completion = self.client.chat.completions.create(
                model=CHAT_MODEL,
                messages=messages,
                max_tokens=400,
                temperature=0.8,
            )
            return completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq chat error: {e}")
            return self._mock_response(message, user, level, challenges)

    # ──────────────────────────── MOCK ────────────────────────────

    def _mock_response(self, message: str, user: dict, level: int, challenges: list) -> str:
        msg = message.lower()
        streak = user.get("streak", 0)
        xp = user.get("xp", 0)
        completed = user.get("completed_challenges", 0)
        achievements = user.get("achievements", [])

        if any(w in msg for w in ["hello", "hi", "hey", "start", "begin", "greet"]):
            intro = random.choice(MOCK_INTROS)
            return f"{intro} You're Level {level} with {xp} XP. Ready to make waves? Ask me for a challenge in any area — fitness, coding, mindfulness, and more! 🚀"

        if self._wants_challenge(message):
            if challenges:
                c = challenges[0]
                prefix = random.choice(MOCK_CHALLENGE_RESPONSES)
                return (
                    f"{prefix}\n\n"
                    f"**{c['title']}** ({c['difficulty'].upper()}) — {c['description']}\n\n"
                    f"Complete this to earn **{c['xp_reward']} XP**. Are you ready to accept? 💪"
                )
            return "🐋 Let me search the ocean for your perfect challenge! Try specifying a category — fitness, coding, productivity, learning, creativity, or mindfulness."

        if any(w in msg for w in ["level", "xp", "progress", "rank", "stat"]):
            return (
                f"📊 Here's your ocean profile:\n"
                f"• Level **{level}** | **{xp} XP** earned\n"
                f"• 🔥 **{streak}-day** streak\n"
                f"• ✅ **{completed}** challenges completed\n"
                f"• 🏆 **{len(achievements)}** achievements\n\n"
                f"You're making serious waves out there! Keep the streak alive! 🌊"
            )

        if any(w in msg for w in ["motivat", "inspire", "help", "stuck", "give up", "tired", "hard"]):
            return random.choice(MOCK_MOTIVATIONS) + f" You've completed {completed} challenges. Level {level} is just the beginning! 🌊"

        if any(w in msg for w in ["streak", "consecutive", "daily", "habit"]):
            if streak > 0:
                return f"🔥 Your streak is **{streak} days** strong! Streaks are where champions are made — consistency beats intensity every time. Don't break the chain!"
            return "🌊 No active streak yet! Complete your first challenge today and start your journey to becoming a legendary Whale Rider!"

        if any(w in msg for w in ["achievement", "badge", "unlock", "reward", "trophy"]):
            if achievements:
                return f"🏆 Your achievements: {' | '.join(achievements)}\n\nThere are more hidden treasures in the depths — keep challenging yourself to unlock them all!"
            return "🏆 No achievements yet! Complete your first challenge to unlock **'First Steps 🌊'**. The ocean of achievements awaits!"

        if any(w in msg for w in ["fitness", "workout", "exercise", "gym", "run", "push", "squat"]):
            return "💪 Fitness challenges build the foundation of everything! Say **'give me a fitness challenge'** to dive in!"

        if any(w in msg for w in ["code", "coding", "program", "develop", "algorithm", "debug", "build"]):
            return "💻 Coding challenges will level up your mind AND career! Say **'give me a coding challenge'** to get started!"

        if any(w in msg for w in ["mindful", "meditat", "calm", "relax", "stress", "breathe", "anxiety"]):
            return "🧘 Mindfulness is the whale's secret superpower. Ask for a **mindfulness challenge** to find your calm!"

        if any(w in msg for w in ["learn", "study", "read", "book", "skill", "knowledge"]):
            return "📚 Learning challenges accelerate your growth exponentially! Ask for a **learning challenge** to expand your knowledge!"

        if any(w in msg for w in ["creative", "art", "draw", "write", "design", "music", "create"]):
            return "🎨 Creativity challenges unlock the artist within you! Ask for a **creativity challenge** to let your imagination swim free!"

        if any(w in msg for w in ["product", "focus", "work", "task", "efficient", "organiz"]):
            return "⚡ Productivity challenges transform your output! Ask for a **productivity challenge** to supercharge your efficiency!"

        if any(w in msg for w in ["complete", "done", "finish", "proof", "submit"]):
            return "🎉 Ready to submit your proof? Upload an image in the **Challenges** tab to claim your XP! 🏆"

        if any(w in msg for w in ["thank", "thanks", "appreciate", "great", "awesome", "amazing"]):
            return f"🐋 You're the one doing the hard work — I'm just your ocean guide! Level {level} and counting... What's your next challenge? 🌊"

        return random.choice(MOCK_DEFAULTS)

    # ──────────────────────────── HELPERS ─────────────────────────

    def _wants_challenge(self, message: str) -> bool:
        keywords = [
            "challenge", "task", "mission", "give me", "next", "suggest",
            "what should", "want to do", "find me", "assign", "new challenge",
            "ready", "let's go", "let me try",
        ]
        msg = message.lower()
        return any(kw in msg for kw in keywords)

    def _detect_category(self, message: str) -> Optional[str]:
        categories = {
            "fitness": ["fitness", "workout", "exercise", "gym", "run", "push-up", "strength", "yoga", "hiit", "cardio"],
            "productivity": ["productivity", "work", "focus", "pomodoro", "task", "schedule", "organize", "inbox", "plan"],
            "learning": ["learn", "study", "read", "book", "course", "skill", "knowledge", "research", "lecture"],
            "coding": ["code", "coding", "program", "develop", "algorithm", "debug", "api", "software", "hack"],
            "creativity": ["creative", "art", "draw", "write", "music", "design", "film", "photo", "craft"],
            "mindfulness": ["mindful", "meditat", "calm", "relax", "breathe", "stress", "anxiety", "journal"],
        }
        msg_lower = message.lower()
        for cat, keywords in categories.items():
            if any(kw in msg_lower for kw in keywords):
                return cat
        return None

    # ──────────────────────────── PROOF ───────────────────────────

    def verify_proof(self, image_data: bytes, challenge: dict, user_id: str) -> dict:
        if len(image_data) < 500:
            return {
                "accepted": False,
                "message": "🔍 Image appears empty or corrupted. Please upload a clear photo showing your completed challenge.",
            }

        if self.use_ai:
            result = self._groq_verify_proof(image_data, challenge)
            if result is not None:
                return result

        return self._mock_verify_proof(challenge)

    def _groq_verify_proof(self, image_data: bytes, challenge: dict) -> Optional[dict]:
        try:
            image_b64 = base64.standard_b64encode(image_data).decode()

            from PIL import Image
            import io
            img = Image.open(io.BytesIO(image_data))
            fmt = (img.format or "JPEG").upper()
            media_map = {"JPEG": "image/jpeg", "PNG": "image/png", "GIF": "image/gif", "WEBP": "image/webp"}
            media_type = media_map.get(fmt, "image/jpeg")

            title       = challenge.get("title", "Unknown challenge")
            description = challenge.get("description", "")
            category    = challenge.get("category", "")
            difficulty  = challenge.get("difficulty", "")

            prompt = (
                f"A user is submitting image proof for the following self-improvement challenge:\n\n"
                f"Challenge: {title}\n"
                f"Category: {category} | Difficulty: {difficulty}\n"
                f"What they had to do: {description}\n\n"
                f"Carefully examine the image and decide whether it provides credible visual evidence "
                f"that this SPECIFIC challenge was completed. Be strict — the image must clearly relate "
                f"to this exact challenge, not just any activity. For example:\n"
                f"- A push-up challenge needs to show someone exercising, not just a gym selfie.\n"
                f"- A coding challenge needs to show code on a screen.\n"
                f"- A meditation challenge needs to show someone in a calm/meditative setting.\n"
                f"- A reading challenge needs to show a book or reading material.\n\n"
                f"If the image is unrelated, a random photo, a meme, or clearly does not match the "
                f"challenge, reject it with a clear explanation.\n\n"
                f"Respond ONLY with valid JSON (no markdown, no explanation outside the JSON):\n"
                f"{{\"accepted\": true or false, \"message\": \"1-2 sentence feedback explaining your decision\"}}"
            )

            completion = self.client.chat.completions.create(
                model=VISION_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:{media_type};base64,{image_b64}"},
                            },
                            {
                                "type": "text",
                                "text": prompt,
                            },
                        ],
                    }
                ],
                max_tokens=200,
                temperature=0.1,
            )

            result_text = completion.choices[0].message.content.strip()
            # Strip markdown code fences if model wraps in ```json ... ```
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
            result = json.loads(result_text.strip())

            # Add emoji flair to the message
            if result.get("accepted"):
                result["message"] = "✅ " + result["message"]
            else:
                result["message"] = "🔍 " + result["message"]

            return result

        except Exception as e:
            logger.error(f"Groq vision verification failed: {e}")
            return None

    def _mock_verify_proof(self, challenge: dict) -> dict:
        """
        Mock fallback used when no API key is set.
        Still references the challenge name so the feedback feels specific.
        Always rejects — forces users to use the real AI for XP in mock mode.
        """
        title = challenge.get("title", "this challenge")
        return {
            "accepted": False,
            "message": (
                f"🔍 No AI key configured — automatic verification is disabled. "
                f"Add a GROQ_API_KEY to your .env to enable real image verification for \"{title}\"."
            ),
        }
