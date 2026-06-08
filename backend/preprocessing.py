"""
preprocessing.py
----------------
NLP Preprocessing Pipeline for the FAQ Chatbot.

This module handles all text preprocessing steps:
  1. Lowercasing
  2. Punctuation removal
  3. Tokenization
  4. Stop-word removal
  5. Lemmatization
  6. Text normalization

Uses NLTK library for all NLP operations.
"""

import re
import string
import nltk

# ─── Download required NLTK resources (runs only on first use) ───────────────
def download_nltk_resources():
    """Download all required NLTK corpora silently."""
    resources = [
        ("tokenizers/punkt", "punkt"),
        ("tokenizers/punkt_tab", "punkt_tab"),
        ("corpora/stopwords", "stopwords"),
        ("corpora/wordnet", "wordnet"),
        ("corpora/omw-1.4", "omw-1.4"),
    ]
    for path, name in resources:
        try:
            nltk.data.find(path)
        except LookupError:
            nltk.download(name, quiet=True)

download_nltk_resources()

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# ─── Initialize NLP tools ────────────────────────────────────────────────────
_lemmatizer = WordNetLemmatizer()
_stop_words = set(stopwords.words("english"))

# Keep some question words that carry meaning in FAQ context
_KEEP_WORDS = {"how", "what", "when", "where", "why", "which", "who", "can", "do", "does"}
_FILTERED_STOPS = _stop_words - _KEEP_WORDS


def remove_punctuation(text: str) -> str:
    """Remove all punctuation characters from text."""
    return text.translate(str.maketrans("", "", string.punctuation))


def normalize_text(text: str) -> str:
    """
    Normalize text by:
    - Expanding common contractions
    - Removing extra whitespace
    - Stripping leading/trailing whitespace
    """
    # Expand common contractions
    contractions = {
        r"can't": "cannot",
        r"won't": "will not",
        r"n't": " not",
        r"'re": " are",
        r"'s": " is",
        r"'d": " would",
        r"'ll": " will",
        r"'ve": " have",
        r"'m": " am",
    }
    for pattern, replacement in contractions.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def preprocess(text: str) -> str:
    """
    Full NLP preprocessing pipeline.

    Steps:
      1. Lowercase the input text
      2. Normalize (expand contractions, remove extra spaces)
      3. Remove punctuation
      4. Tokenize into individual words
      5. Remove stop words (keeping question words)
      6. Lemmatize each token
      7. Rejoin tokens into a clean string

    Args:
        text: Raw input text (FAQ question or user query)

    Returns:
        Preprocessed, normalized string ready for vectorization
    """
    if not text or not isinstance(text, str):
        return ""

    # Step 1: Lowercase
    text = text.lower()

    # Step 2: Normalize (contractions, whitespace)
    text = normalize_text(text)

    # Step 3: Remove punctuation
    text = remove_punctuation(text)

    # Step 4: Tokenize
    tokens = word_tokenize(text)

    # Step 5: Remove stop words (keep meaningful question words)
    tokens = [t for t in tokens if t not in _FILTERED_STOPS]

    # Step 6: Lemmatize
    tokens = [_lemmatizer.lemmatize(t) for t in tokens]

    # Step 7: Remove empty strings and single characters (noise)
    tokens = [t for t in tokens if len(t) > 1]

    # Step 8: Rejoin
    return " ".join(tokens)


def preprocess_batch(texts: list[str]) -> list[str]:
    """
    Preprocess a list of texts using the full pipeline.

    Args:
        texts: List of raw text strings

    Returns:
        List of preprocessed text strings
    """
    return [preprocess(t) for t in texts]


if __name__ == "__main__":
    # Quick test of the preprocessing pipeline
    test_queries = [
        "How do I reset my password?",
        "What's your return policy?",
        "I want my money back!!!",
        "When will my order arrive?",
        "Can't login to my account",
    ]
    print("=== Preprocessing Pipeline Test ===\n")
    for query in test_queries:
        processed = preprocess(query)
        print(f"Original : {query}")
        print(f"Processed: {processed}")
        print()
