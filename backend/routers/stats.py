from fastapi import APIRouter, Request, HTTPException
from models.schemas import UserStatsResponse

router = APIRouter()


@router.get("/user-stats/{user_id}", response_model=UserStatsResponse)
async def get_user_stats(user_id: str, req: Request):
    user_service = req.app.state.user_service
    try:
        stats = user_service.get_user_stats(user_id)
        return UserStatsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leaderboard")
async def get_leaderboard(req: Request):
    user_service = req.app.state.user_service
    board = user_service.get_leaderboard()
    return {"leaderboard": board[:20]}


@router.patch("/user-stats/{user_id}/username")
async def update_username(user_id: str, body: dict, req: Request):
    user_service = req.app.state.user_service
    username = body.get("username", "").strip()
    if not username or len(username) > 30:
        raise HTTPException(status_code=400, detail="Username must be 1-30 characters.")
    user = user_service.set_username(user_id, username)
    return {"message": "Username updated!", "username": user["username"]}
