# 🐋 Blue Whale AI

A full-stack gamified AI chatbot for self-improvement, powered by RAG (Retrieval-Augmented Generation), ChromaDB, and **Llama 3.3 via Groq**.

---

## 🌊 Features

| Feature | Details |
|---|---|
| **AI Chatbot** | Motivational, personalized responses via Llama 3.3 (Groq) or intelligent mock mode |
| **RAG System** | ChromaDB + sentence-transformers for semantic challenge retrieval |
| **Challenge System** | 36 curated challenges across 6 categories, scaled by user level |
| **XP & Leveling** | Dynamic XP system, automatic level-ups, streak bonuses |
| **Image Proof** | Upload image proof of challenge completion, verified by AI vision |
| **Achievements** | 11 unlockable achievement badges |
| **Leaderboard** | Global ranking by XP |
| **Ocean UI** | Futuristic deep-ocean aesthetic with Framer Motion animations |

---

## 🗂️ Project Structure

```
blue-whale-ai/
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # App entry point + lifespan
│   ├── requirements.txt
│   ├── .env.example
│   ├── data/
│   │   └── challenges.json     # 36 challenge templates
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   ├── services/
│   │   ├── rag_service.py      # ChromaDB + sentence-transformers RAG
│   │   ├── user_service.py     # XP, levels, streaks, achievements
│   │   └── ai_service.py       # Claude AI + intelligent mock fallback
│   └── routers/
│       ├── chat.py             # POST /chat
│       ├── challenge.py        # POST /challenge, GET /challenge/categories
│       ├── proof.py            # POST /submit-proof
│       └── stats.py            # GET /user-stats, GET /leaderboard
│
└── frontend/                   # Next.js 14 frontend
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx            # Main app (tabs: Chat/Challenges/Stats/Leaderboard)
    │   └── globals.css         # Ocean theme, animations, glass UI
    ├── components/
    │   ├── ChatInterface.tsx   # Real-time chat with message history
    │   ├── ChallengeCard.tsx   # Challenge display + accept + proof upload
    │   ├── ChallengesPanel.tsx # Category filter + challenge grid
    │   ├── ImageUpload.tsx     # Drag & drop proof submission
    │   ├── UserStats.tsx       # Profile, XP bar, achievements, history
    │   ├── Leaderboard.tsx     # Global rankings
    │   ├── WhaleMascot.tsx     # Animated whale SVG component
    │   └── XPBar.tsx           # Animated XP progress bar
    ├── lib/
    │   ├── api.ts              # All API calls to backend
    │   └── types.ts            # TypeScript interfaces
    └── public/
        └── whale.svg           # Custom whale SVG mascot
```

---

## ⚙️ Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- ~**1GB disk space** (for ML embedding model `all-MiniLM-L6-v2` ~80MB)
- Optional: **Anthropic API key** for real Claude AI responses

---

### 1. Backend Setup

```bash
cd blue-whale-ai/backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (optional)
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY if you have one

# Start the backend
python main.py
# OR with auto-reload:
uvicorn main:app --reload --port 8000
```

**First run note:** The sentence-transformer model (`all-MiniLM-L6-v2`) will be downloaded automatically (~80MB). This only happens once.

The backend will be available at: `http://localhost:8000`

---

### 2. Frontend Setup

```bash
cd blue-whale-ai/frontend

# Install dependencies
npm install

# Create environment file (optional)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the dev server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

---

## 🚀 Usage

1. Open `http://localhost:3000`
2. Chat with Blue Whale AI — ask for challenges, motivation, or your progress
3. Accept a challenge from the **Challenges** tab
4. Complete the challenge in real life
5. Upload photo proof in the challenge card
6. Earn XP and level up!

---

## 🔌 API Reference

### POST `/chat`
Send a message to the AI chatbot.

```json
// Request
{
  "message": "Give me a coding challenge",
  "user_id": "user_abc123",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Welcome, Whale Rider!" }
  ]
}

// Response
{
  "message": "🌊 Here's a coding challenge matched to your level...",
  "suggested_challenge": {
    "id": "code_001",
    "title": "Bug Squasher",
    "category": "coding",
    "difficulty": "easy",
    "xp_reward": 60,
    ...
  }
}
```

### POST `/challenge`
Retrieve challenges via RAG.

```json
// Request
{
  "user_id": "user_abc123",
  "category": "fitness",   // optional
  "query": "strength training beginner"  // optional semantic query
}

// Response
{
  "challenges": [...],
  "user_level": 3
}
```

### POST `/submit-proof`
Submit image proof of challenge completion (multipart/form-data).

```
Fields:
  user_id: string
  challenge_id: string
  image: File (image/*)

Response:
{
  "accepted": true,
  "message": "🎉 Proof verified!",
  "xp_awarded": 60,
  "new_level": 4,
  "level_up": true,
  "achievement_unlocked": "First Steps 🌊"
}
```

### GET `/user-stats/{user_id}`
Get user profile and statistics.

```json
{
  "user_id": "user_abc123",
  "username": "Whale Rider #ABC123",
  "level": 4,
  "xp": 620,
  "xp_to_next_level": 180,
  "xp_progress": 0.775,
  "streak": 3,
  "completed_challenges": 8,
  "achievements": ["First Steps 🌊", "Dedicated Diver 🐠"],
  "challenge_history": [...]
}
```

### GET `/leaderboard`
Get top 20 users by XP.

---

## 🧠 RAG Architecture

```
User message
     │
     ▼
[Sentence Transformer]  ←─ all-MiniLM-L6-v2 (local, no API needed)
     │ embedding
     ▼
[ChromaDB Vector Store] ←─ 36 challenge templates indexed at startup
     │ top-k similar challenges (filtered by user level + category)
     ▼
[AI Service]            ←─ Claude claude-sonnet-4-6 or intelligent mock
     │ personalized response + challenge recommendation
     ▼
User
```

---

## 📊 Level System

| Formula | Description |
|---|---|
| `level = 1 + floor(sqrt(xp / 100))` | Level from XP |
| `xp_for_level(n) = (n-1)² × 100` | XP threshold for level n |

| Level | XP Required | Title |
|---|---|---|
| 1 | 0 | Ocean Hatchling 🥚 |
| 2 | 100 | Tide Walker 🚶 |
| 3 | 400 | Current Rider 🌀 |
| 4 | 900 | Wave Surfer 🏄 |
| 5 | 1,600 | Rising Tide 🌊 |
| 8 | 4,900 | Ocean Master 🌊 |
| 10 | 8,100 | Blue Whale Lord 🐳 |

---

## 🏆 Achievements

| Badge | Condition |
|---|---|
| First Steps 🌊 | Complete 1 challenge |
| Dedicated Diver 🐠 | Complete 5 challenges |
| Ocean Explorer 🐋 | Complete 20 challenges |
| Whale Legend 🔱 | Complete 50 challenges |
| Week Warrior ⚡ | 7-day streak |
| Month Master 🏆 | 30-day streak |
| Rising Tide 🌊 | Reach Level 5 |
| Deep Diver 🤿 | Reach Level 10 |
| Whale Master 🐳 | Reach Level 15 |
| XP Hunter 💎 | Earn 1,000 XP |
| XP Legend 🌟 | Earn 5,000 XP |

---

## 🎨 UI Theme

| Element | Value |
|---|---|
| Background | `#020b18` → `#040f1e` → `#0a1e30` (deep ocean gradient) |
| Primary accent | `#00d4ff` (neon cyan) |
| Secondary | `#7c3aed` (electric purple) |
| Glass cards | `rgba(255,255,255,0.05)` + `backdrop-blur(16px)` |
| Animations | Framer Motion (float, fade, slide, scale) |
| Font | Space Grotesk (headers) + Inter (body) |

---

## 🔧 Configuration

### Backend `.env`
```env
GROQ_API_KEY=gsk_...            # Required for Llama AI — get free at console.groq.com
FRONTEND_URL=http://localhost:3000
CHROMA_DB_PATH=./chroma_db
USERS_FILE=./storage/users.json
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🐳 Running Without an API Key

The app works fully in **mock mode** without a Groq key:
- AI responses use intelligent pattern matching for natural conversations
- Image proof uses 85% acceptance rate simulation
- All XP, leveling, achievements, and RAG retrieval work identically

## 🦙 Groq / Llama Models Used

| Task | Model |
|---|---|
| Chat | `llama-3.3-70b-versatile` |
| Image proof verification | `meta-llama/llama-4-maverick-17b-128e-instruct` |

Get a free Groq API key at [console.groq.com](https://console.groq.com).

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Python, FastAPI, Uvicorn |
| AI/LLM | Llama 3.3 70B / Llama 4 Maverick (via Groq API) |
| RAG | ChromaDB, sentence-transformers (`all-MiniLM-L6-v2`) |
| Storage | JSON files (users), ChromaDB (vectors) |
| Images | Pillow |
