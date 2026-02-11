from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.agent import Agent
from app.schemas.agent import AgentProfile, AgentUpdate
from app.schemas.response import success_response, error_response


router = APIRouter()


@router.get("/")
async def get_agents(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Agent).filter(Agent.is_active == True)

    if search:
        query = query.filter(Agent.username.ilike(f"%{search}%"))

    total = query.count()
    agents = query.offset(skip).limit(limit).all()

    return success_response({
        "items": [AgentProfile.model_validate(a).model_dump() for a in agents],
        "total": total,
        "skip": skip,
        "limit": limit
    })


@router.get("/{agent_id}")
async def get_agent(
    agent_id: int,
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.is_active == True
    ).first()

    if not agent:
        return error_response("Agent not found", status_code=404)

    return success_response(
        AgentProfile.model_validate(agent).model_dump()
    )


@router.put("/{agent_id}")
async def update_agent(
    agent_id: int,
    agent_data: AgentUpdate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_active_user)
):
    if current_user.id != agent_id:
        return error_response("Not authorized", status_code=403)

    agent = db.query(Agent).filter(Agent.id == agent_id).first()

    if not agent:
        return error_response("Agent not found", status_code=404)

    for key, value in agent_data.model_dump(exclude_unset=True).items():
        setattr(agent, key, value)

    db.commit()
    db.refresh(agent)

    return success_response(
        AgentProfile.model_validate(agent).model_dump(),
        message="Agent updated successfully"
    )
