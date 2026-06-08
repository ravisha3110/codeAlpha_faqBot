"""
app.py
------
FastAPI Backend for the FAQ Chatbot.

Endpoints:
  POST /chat   — Match a user query against the FAQ knowledge base
  GET  /faqs   — Return all FAQs
  GET  /health — Health check

Run with:
  uvicorn app:app --reload --host 0.0.0.0 --port 8000
"""

import json
import time
from pathlib import Path
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from similarity_engine import match_query, load_faqs

# ─── App Setup ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="FAQ Chatbot API",
    description="Intelligent FAQ Chatbot powered by TF-IDF and Sentence Transformers",
    version="1.0.0",
)

# CORS — allow the React frontend (running on any localhost port) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # In production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request / Response Models ───────────────────────────────────────────────
class ChatRequest(BaseModel):
    """Request body for the /chat endpoint."""
    message: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="User's question or query",
        example="How can I reset my password?",
    )
    mode: Literal["tfidf", "semantic"] = Field(
        default="tfidf",
        description="Matching mode: 'tfidf' for TF-IDF + Cosine, 'semantic' for Sentence Transformers",
    )


class ChatResponse(BaseModel):
    """Response body from the /chat endpoint."""
    answer: str
    confidence: float           # Raw similarity score (0.0 – 1.0)
    confidence_pct: int         # Percentage (0 – 100)
    matched_question: Optional[str]
    category: Optional[str]
    response_time_ms: float
    is_fallback: bool
    mode: str


class FAQItem(BaseModel):
    """A single FAQ entry."""
    id: int
    question: str
    answer: str
    category: str


class FAQsResponse(BaseModel):
    """Response body from the /faqs endpoint."""
    count: int
    faqs: list[FAQItem]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: float


# ─── Routes ──────────────────────────────────────────────────────────────────
@app.post(
    "/chat",
    response_model=ChatResponse,
    summary="Match a user query to the best FAQ answer",
    tags=["Chat"],
)
async def chat(request: ChatRequest):
    """
    Accept a user message and return the most similar FAQ answer.

    - Preprocesses the query using the NLP pipeline
    - Runs TF-IDF or Semantic similarity matching
    - Returns the answer with a confidence score
    - Falls back to a support contact message if confidence < 50%
    """
    try:
        result = match_query(request.message, mode=request.mode)
    except ImportError as e:
        # Sentence transformers not installed — fallback to TF-IDF
        if request.mode == "semantic":
            result = match_query(request.message, mode="tfidf")
            result.mode = "tfidf (semantic unavailable)"
        else:
            raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching error: {str(e)}")

    return ChatResponse(
        answer=result.answer,
        confidence=round(result.confidence, 4),
        confidence_pct=result.confidence_pct,
        matched_question=result.matched_question or None,
        category=result.category or None,
        response_time_ms=result.response_time_ms,
        is_fallback=result.is_fallback,
        mode=result.mode,
    )


@app.get(
    "/faqs",
    response_model=FAQsResponse,
    summary="Get all FAQs",
    tags=["FAQs"],
)
async def get_faqs():
    """
    Return the complete FAQ knowledge base.
    Used by the frontend to display the FAQ browser and suggested questions.
    """
    try:
        faqs = load_faqs()
        return FAQsResponse(count=len(faqs), faqs=faqs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load FAQs: {str(e)}")


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    tags=["System"],
)
async def health():
    """Return server health status and current timestamp."""
    return HealthResponse(status="healthy", timestamp=time.time())


# ─── Entry Point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
