from fastapi import APIRouter, HTTPException, Request
from models.schemas import ChallengeRequest
from services.user_service import get_level

router = APIRouter()


@router.post("/challenge")
async def get_challenge(request: ChallengeRequest, req: Request):
    rag_service = req.app.state.rag_service
    user_service = req.app.state.user_service

    user = user_service.get_user(request.user_id)
    level = get_level(user["xp"])

    query = request.query or f"motivating challenge for level {level} user"
    challenges = rag_service.retrieve_challenges(
        query=query,
        user_level=level,
        category=request.category,
        n=3,
    )

    if not challenges:
        raise HTTPException(status_code=404, detail="No challenges found for your level and category.")

    return {
        "challenges": challenges,
        "user_level": level,
        "category": request.category,
    }


@router.get("/challenge/categories")
async def get_categories():
    return {
        "categories": [
            {"id": "fitness", "label": "Fitness", "icon": "💪", "color": "#ef4444"},
            {"id": "productivity", "label": "Productivity", "icon": "⚡", "color": "#f59e0b"},
            {"id": "learning", "label": "Learning", "icon": "📚", "color": "#8b5cf6"},
            {"id": "coding", "label": "Coding", "icon": "💻", "color": "#10b981"},
            {"id": "creativity", "label": "Creativity", "icon": "🎨", "color": "#ec4899"},
            {"id": "mindfulness", "label": "Mindfulness", "icon": "🧘", "color": "#06b6d4"},
        ]
    }


@router.post("/challenge/accept")
async def accept_challenge(body: dict, req: Request):
    user_service = req.app.state.user_service
    rag_service = req.app.state.rag_service

    user_id = body.get("user_id", "default_user")
    challenge_id = body.get("challenge_id")

    if not challenge_id:
        raise HTTPException(status_code=400, detail="challenge_id is required")

    challenge = rag_service.get_challenge_by_id(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    user = user_service.set_active_challenge(user_id, challenge_id)
    return {"message": "Challenge accepted! Upload proof when complete.", "challenge": challenge}
