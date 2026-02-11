from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, List
from fastapi.responses import JSONResponse

T = TypeVar("T")


# -------------------------
# Standard API Response Model
# -------------------------

class APIResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    errors: Optional[List[str]] = None


# -------------------------
# Success Response Helper
# -------------------------

def success_response(data=None, message: str = "Success", status_code: int = 200):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data,
            "errors": None,
        },
    )


# -------------------------
# Error Response Helper
# -------------------------

def error_response(
    message: str = "Error",
    errors: Optional[List[str]] = None,
    status_code: int = 400,
):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "data": None,
            "errors": errors or [],
        },
    )
