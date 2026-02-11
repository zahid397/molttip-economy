from typing import Any, Dict, Optional

class Response:
    """Standard API response formatter"""
    
    @staticmethod
    def success(message: str = "Success", data: Any = None) -> Dict[str, Any]:
        """Success response"""
        response = {
            "success": True,
            "message": message
        }
        if data is not None:
            response["data"] = data
        return response
    
    @staticmethod
    def error(error: str = "An error occurred", code: str = "ERROR", 
              details: Optional[Dict] = None) -> Dict[str, Any]:
        """Error response"""
        response = {
            "success": False,
            "error": error,
            "code": code
        }
        if details:
            response["details"] = details
        return response
    
    @staticmethod
    def paginated(items: list, total: int, page: int, limit: int) -> Dict[str, Any]:
        """Paginated response"""
        pages = (total + limit - 1) // limit
        return {
            "success": True,
            "data": {
                "items": items,
                "total": total,
                "page": page,
                "limit": limit,
                "pages": pages,
                "has_next": page < pages,
                "has_prev": page > 1
            }
        }
