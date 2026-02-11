from typing import Any, Dict, Optional, List
from fastapi.responses import JSONResponse
from fastapi import status


class ResponseHandler:
    @staticmethod
    def success(
        data: Any = None,
        message: str = "Success",
        status_code: int = status.HTTP_200_OK
    ) -> JSONResponse:
        """Standard success response"""
        return JSONResponse(
            status_code=status_code,
            content={
                "success": True,
                "message": message,
                "data": data
            }
        )

    @staticmethod
    def error(
        message: str = "Error",
        error_code: str = "UNKNOWN_ERROR",
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None
    ) -> JSONResponse:
        """Standard error response"""
        response_data = {
            "success": False,
            "message": message,
            "error": error_code
        }

        if details is not None:
            response_data["details"] = details

        return JSONResponse(status_code=status_code, content=response_data)

    @staticmethod
    def paginated(
        items: List[Any],
        total: int,
        page: int,
        page_size: int,
        message: str = "Success"
    ) -> JSONResponse:
        """Standard paginated response"""
        total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": message,
                "data": {
                    "items": items,
                    "total": total,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1
                }
            }
        )


# Shortcut helpers
def success_response(data: Any = None, message: str = "Success", status_code: int = status.HTTP_200_OK):
    return ResponseHandler.success(data=data, message=message, status_code=status_code)


def error_response(message: str = "Error", error_code: str = "UNKNOWN_ERROR",
                   status_code: int = status.HTTP_400_BAD_REQUEST, details: Optional[Dict[str, Any]] = None):
    return ResponseHandler.error(message=message, error_code=error_code, status_code=status_code, details=details)


def not_found_response(message: str = "Resource not found"):
    return ResponseHandler.error(message=message, error_code="NOT_FOUND", status_code=status.HTTP_404_NOT_FOUND)


def unauthorized_response(message: str = "Unauthorized"):
    return ResponseHandler.error(message=message, error_code="UNAUTHORIZED", status_code=status.HTTP_401_UNAUTHORIZED)


def forbidden_response(message: str = "Forbidden"):
    return ResponseHandler.error(message=message, error_code="FORBIDDEN", status_code=status.HTTP_403_FORBIDDEN)
