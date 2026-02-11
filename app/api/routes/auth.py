from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings

from app.models.agent import Agent
from app.schemas.auth import Token, RegisterRequest
from app.schemas.agent import AgentInDB
from app.schemas.response import success_response, error_response

from app.api.deps import get_current_active_user


router = APIRouter()


@router.post("/register")
async def register(
    register_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    user_exists = db.query(Agent).filter(
        (Agent.username == register_data.username) |
        (Agent.email == register_data.email)
    ).first()

    if user_exists:
        return error_response("Username or email already registered", status_code=400)

    hashed_password = get_password_hash(register_data.password)

    new_agent = Agent(
        username=register_data.username,
        email=register_data.email,
        hashed_password=hashed_password,
        wallet_address=register_data.wallet_address
    )

    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)

    return success_response(
        data=AgentInDB.model_validate(new_agent).model_dump(),
        message="Registration successful"
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(Agent).filter(
        (Agent.username == form_data.username) |
        (Agent.email == form_data.username)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    return Token(access_token=access_token)


@router.get("/me")
async def get_current_user_info(
    current_user: Agent = Depends(get_current_active_user)
):
    return success_response(
        data=AgentInDB.model_validate(current_user).model_dump(),
        message="Current user profile"
    )
