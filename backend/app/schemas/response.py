from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel, ConfigDict
from pydantic.generics import GenericModel

T = TypeVar("T")


class StandardResponse(GenericModel, Generic[T]):
    success: bool = True
    message: str = "Success"
    data: Optional[T] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True
    )


class PaginatedResponse(GenericModel, Generic[T]):
    success: bool = True
    message: str = "Success"
    data: List[T]
    total: int
    page: int
    per_page: int

    model_config = ConfigDict(
        arbitrary_types_allowed=True
    )
