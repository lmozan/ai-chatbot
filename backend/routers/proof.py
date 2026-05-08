from fastapi import APIRouter, File, Form, UploadFile, HTTPException, Request
from models.schemas import ProofResponse

router = APIRouter()


@router.post("/submit-proof", response_model=ProofResponse)
async def submit_proof(
    req: Request,
    user_id: str = Form(default="default_user"),
    challenge_id: str = Form(...),
    image: UploadFile = File(...),
):
    ai_service = req.app.state.ai_service
    user_service = req.app.state.user_service
    rag_service = req.app.state.rag_service

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    image_data = await image.read()

    challenge = rag_service.get_challenge_by_id(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail=f"Challenge '{challenge_id}' not found.")

    verification = ai_service.verify_proof(image_data, challenge, user_id)

    if verification["accepted"]:
        xp_reward = challenge["xp_reward"]
        update_result = user_service.add_xp(user_id, xp_reward, challenge_id)
        return ProofResponse(
            accepted=True,
            message=verification["message"],
            xp_awarded=xp_reward,
            old_level=update_result["old_level"],
            new_level=update_result["new_level"],
            level_up=update_result["level_up"],
            achievement_unlocked=update_result.get("achievement"),
        )

    return ProofResponse(
        accepted=False,
        message=verification["message"],
        xp_awarded=0,
    )
