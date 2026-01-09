"""
Assistant API Route - Chat endpoint for the FFXIV AI assistant.
"""

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.agent import query_assistant


router = APIRouter(prefix="/api/assistant", tags=["assistant"])


class MessageItem(BaseModel):
    """A single message in the conversation."""
    role: str  # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    message: str
    history: list[MessageItem] = []  # Previous messages for context


class ChatResponse(BaseModel):
    """Response from the assistant."""
    success: bool
    response: str
    error: str | None = None


@router.post("/chat", response_model=ChatResponse)
async def chat(request: Request, body: ChatRequest):
    """
    Send a message to the FFXIV assistant.
    
    Rate limited to 5 requests/minute and 50 requests/day per IP.
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Check for forwarded IP (behind proxy)
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    
    # Convert history to PydanticAI format
    # PydanticAI expects ModelMessage objects, but we can use dicts
    message_history = []
    for msg in body.history:
        if msg.role == "user":
            message_history.append({
                "kind": "request",
                "parts": [{"kind": "user-prompt", "content": msg.content}]
            })
        elif msg.role == "assistant":
            message_history.append({
                "kind": "response",
                "parts": [{"kind": "text", "content": msg.content}]
            })
    
    # Query the assistant
    success, result = await query_assistant(body.message, client_ip, message_history)
    
    if success:
        return ChatResponse(success=True, response=result)
    else:
        return ChatResponse(success=False, response="", error=result)


@router.get("/status")
async def status():
    """Check if the assistant is configured and available."""
    import os
    has_key = bool(os.getenv("GROQ_API_KEY"))
    return {
        "available": has_key,
        "message": "Assistant ready" if has_key else "GROQ_API_KEY not configured"
    }
