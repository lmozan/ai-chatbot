import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🐋 Blue Whale AI starting up...")

    from services.rag_service import RAGService
    from services.user_service import UserService
    from services.ai_service import AIService

    os.makedirs("./storage", exist_ok=True)
    os.makedirs("./chroma_db", exist_ok=True)

    rag_service = RAGService()
    user_service = UserService()
    ai_service = AIService(rag_service=rag_service, user_service=user_service)

    app.state.rag_service = rag_service
    app.state.user_service = user_service
    app.state.ai_service = ai_service

    logger.info("🌊 Blue Whale AI is ready to make waves!")
    yield
    logger.info("🐋 Blue Whale AI shutting down...")


app = FastAPI(
    title="Blue Whale AI",
    description="A gamified AI self-improvement chatbot with RAG-powered challenge recommendations.",
    version="1.0.0",
    lifespan=lifespan,
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import chat, challenge, proof, stats

app.include_router(chat.router, tags=["Chat"])
app.include_router(challenge.router, tags=["Challenges"])
app.include_router(proof.router, tags=["Proof"])
app.include_router(stats.router, tags=["Stats"])


@app.get("/")
async def root():
    return {
        "name": "Blue Whale AI",
        "version": "1.0.0",
        "status": "swimming 🐋",
        "endpoints": ["/chat", "/challenge", "/submit-proof", "/user-stats/{user_id}", "/leaderboard"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "message": "The whale is alive 🐳"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
