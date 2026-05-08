from fastapi import APIRouter, HTTPException, Request
from models.schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    ai_service = req.app.state.ai_service
    try:
        result = ai_service.chat(
            message=request.message,
            user_id=request.user_id,
            history=[h.model_dump() for h in request.history],
        )
        return ChatResponse(
            message=result["message"],
            suggested_challenge=result.get("suggested_challenge"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
