from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def analytics():
    return {"message": "Analytics route working"}
