"""
similarity_engine.py
--------------------
Similarity Matching Engine for the FAQ Chatbot.

Implements two matching strategies:
  1. TF-IDF + Cosine Similarity  (fast, no GPU required)
  2. Semantic Search via Sentence Transformers (deep learning, more accurate)

Both engines expose a unified `match(query) -> MatchResult` interface.
"""

import time
import json
import numpy as np
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

# TF-IDF imports
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Local preprocessing pipeline
from preprocessing import preprocess, preprocess_batch

# ─── Configuration ────────────────────────────────────────────────────────────
FAQ_FILE = Path(__file__).parent / "faq_data.json"
CONFIDENCE_THRESHOLD = 0.50  # Minimum similarity to return a valid answer
FALLBACK_MESSAGE = (
    "Sorry, I couldn't find a relevant answer to your question. "
    "Please contact our support team at support@example.com or call 1-800-123-4567."
)


# ─── Data Models ─────────────────────────────────────────────────────────────
@dataclass
class MatchResult:
    """Result returned by any similarity engine."""
    answer: str
    matched_question: str
    category: str
    confidence: float          # 0.0 – 1.0 similarity score
    confidence_pct: int        # Percentage (0–100)
    response_time_ms: float    # Processing time in milliseconds
    is_fallback: bool          # True if below confidence threshold
    mode: str                  # 'tfidf' or 'semantic'


# ─── FAQ Loader ───────────────────────────────────────────────────────────────
def load_faqs() -> list[dict]:
    """Load the FAQ dataset from JSON file."""
    with open(FAQ_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# ─── TF-IDF Engine ───────────────────────────────────────────────────────────
class TFIDFEngine:
    """
    TF-IDF + Cosine Similarity matching engine.

    Workflow:
      1. Load all FAQs and preprocess their questions
      2. Build a TF-IDF matrix from preprocessed FAQ questions
      3. For each user query:
         a. Preprocess the query
         b. Transform to TF-IDF vector using the fitted vectorizer
         c. Compute cosine similarity against all FAQ vectors
         d. Return the FAQ with highest similarity score
    """

    def __init__(self):
        self.faqs: list[dict] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.faq_matrix = None          # Shape: (n_faqs, n_features)
        self._is_ready = False

    def build_index(self):
        """Load FAQs, preprocess, and fit TF-IDF vectorizer."""
        print("[TFIDFEngine] Building TF-IDF index...")
        self.faqs = load_faqs()

        # Preprocess all FAQ questions
        raw_questions = [faq["question"] for faq in self.faqs]
        processed_questions = preprocess_batch(raw_questions)

        # Fit TF-IDF vectorizer and transform FAQ questions
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),     # Unigrams + bigrams for better matching
            min_df=1,
            max_df=0.95,
            sublinear_tf=True,      # Apply log normalization to TF
        )
        self.faq_matrix = self.vectorizer.fit_transform(processed_questions)
        self._is_ready = True
        print(f"[TFIDFEngine] Index built: {len(self.faqs)} FAQs, "
              f"{self.faq_matrix.shape[1]} features.")

    def match(self, query: str) -> MatchResult:
        """
        Find the most similar FAQ for a user query.

        Args:
            query: Raw user input text

        Returns:
            MatchResult with the best matching FAQ and confidence score
        """
        if not self._is_ready:
            self.build_index()

        start_time = time.perf_counter()

        # Step 1: Preprocess user query
        processed_query = preprocess(query)

        # Step 2: Transform to TF-IDF vector
        query_vector = self.vectorizer.transform([processed_query])

        # Step 3: Compute cosine similarity against all FAQ vectors
        similarities = cosine_similarity(query_vector, self.faq_matrix).flatten()

        # Step 4: Find the highest similarity score
        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])

        elapsed_ms = (time.perf_counter() - start_time) * 1000

        # Step 5: Check confidence threshold
        if best_score < CONFIDENCE_THRESHOLD:
            return MatchResult(
                answer=FALLBACK_MESSAGE,
                matched_question="",
                category="",
                confidence=best_score,
                confidence_pct=int(best_score * 100),
                response_time_ms=round(elapsed_ms, 2),
                is_fallback=True,
                mode="tfidf",
            )

        best_faq = self.faqs[best_idx]
        return MatchResult(
            answer=best_faq["answer"],
            matched_question=best_faq["question"],
            category=best_faq["category"],
            confidence=best_score,
            confidence_pct=int(best_score * 100),
            response_time_ms=round(elapsed_ms, 2),
            is_fallback=False,
            mode="tfidf",
        )


# ─── Semantic Engine (Sentence Transformers) ──────────────────────────────────
class SemanticEngine:
    """
    Sentence Transformer + Cosine Similarity matching engine.

    Uses the 'all-MiniLM-L6-v2' model to encode sentences into dense
    768-dimensional embeddings, then finds the nearest FAQ by cosine similarity.

    More accurate than TF-IDF for paraphrases and natural language variations.
    Requires 'sentence-transformers' package.
    """

    MODEL_NAME = "all-MiniLM-L6-v2"

    def __init__(self):
        self.faqs: list[dict] = []
        self.model = None
        self.faq_embeddings = None   # Shape: (n_faqs, embedding_dim)
        self._is_ready = False

    def build_index(self):
        """Load FAQs and encode all questions into embeddings."""
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            raise ImportError(
                "sentence-transformers is not installed. "
                "Run: pip install sentence-transformers"
            )

        print(f"[SemanticEngine] Loading model '{self.MODEL_NAME}'...")
        self.model = SentenceTransformer(self.MODEL_NAME)

        self.faqs = load_faqs()
        questions = [faq["question"] for faq in self.faqs]

        print(f"[SemanticEngine] Encoding {len(questions)} FAQ questions...")
        self.faq_embeddings = self.model.encode(
            questions,
            convert_to_numpy=True,
            normalize_embeddings=True,  # L2 normalize for cosine via dot product
            show_progress_bar=False,
        )
        self._is_ready = True
        print(f"[SemanticEngine] Embeddings shape: {self.faq_embeddings.shape}")

    def match(self, query: str) -> MatchResult:
        """
        Find the most semantically similar FAQ for a user query.

        Args:
            query: Raw user input text

        Returns:
            MatchResult with the best matching FAQ and confidence score
        """
        if not self._is_ready:
            self.build_index()

        start_time = time.perf_counter()

        # Encode the user query (normalized for cosine similarity via dot product)
        query_embedding = self.model.encode(
            [query],
            convert_to_numpy=True,
            normalize_embeddings=True,
        )

        # Compute cosine similarity (dot product of normalized vectors = cosine)
        similarities = np.dot(self.faq_embeddings, query_embedding.T).flatten()

        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])

        elapsed_ms = (time.perf_counter() - start_time) * 1000

        if best_score < CONFIDENCE_THRESHOLD:
            return MatchResult(
                answer=FALLBACK_MESSAGE,
                matched_question="",
                category="",
                confidence=best_score,
                confidence_pct=int(best_score * 100),
                response_time_ms=round(elapsed_ms, 2),
                is_fallback=True,
                mode="semantic",
            )

        best_faq = self.faqs[best_idx]
        return MatchResult(
            answer=best_faq["answer"],
            matched_question=best_faq["question"],
            category=best_faq["category"],
            confidence=best_score,
            confidence_pct=int(best_score * 100),
            response_time_ms=round(elapsed_ms, 2),
            is_fallback=False,
            mode="semantic",
        )


# ─── Engine Registry ──────────────────────────────────────────────────────────
# Singleton instances (lazy-loaded to avoid slow startup)
_tfidf_engine: Optional[TFIDFEngine] = None
_semantic_engine: Optional[SemanticEngine] = None


def get_tfidf_engine() -> TFIDFEngine:
    """Return the singleton TF-IDF engine, building its index on first call."""
    global _tfidf_engine
    if _tfidf_engine is None:
        _tfidf_engine = TFIDFEngine()
        _tfidf_engine.build_index()
    return _tfidf_engine


def get_semantic_engine() -> SemanticEngine:
    """Return the singleton Semantic engine, building its index on first call."""
    global _semantic_engine
    if _semantic_engine is None:
        _semantic_engine = SemanticEngine()
        _semantic_engine.build_index()
    return _semantic_engine


def match_query(query: str, mode: str = "tfidf") -> MatchResult:
    """
    Unified entry point for query matching.

    Args:
        query: User's raw question text
        mode: 'tfidf' or 'semantic'

    Returns:
        MatchResult from the selected engine
    """
    if mode == "semantic":
        return get_semantic_engine().match(query)
    return get_tfidf_engine().match(query)


if __name__ == "__main__":
    # Quick smoke test
    test_queries = [
        "How do I change my password?",
        "I want my money back",
        "When will my order arrive?",
        "Do you ship to other countries?",
        "What is the meaning of life?",  # Should trigger fallback
    ]

    engine = TFIDFEngine()
    engine.build_index()

    print("\n=== TF-IDF Similarity Engine Test ===\n")
    for query in test_queries:
        result = engine.match(query)
        print(f"Query     : {query}")
        print(f"Confidence: {result.confidence_pct}%")
        print(f"Matched   : {result.matched_question}")
        print(f"Answer    : {result.answer[:80]}...")
        print(f"Time      : {result.response_time_ms:.2f}ms")
        print(f"Fallback  : {result.is_fallback}")
        print("-" * 60)
