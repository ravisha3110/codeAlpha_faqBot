/**
 * EvaluationDashboard.jsx
 * -----------------------
 * Collapsible panel showing detailed evaluation metrics for the last bot response.
 *
 * Displays:
 *   - User query that triggered the response
 *   - Matched FAQ question from knowledge base
 *   - Similarity score (percentage + visual bar)
 *   - Response time in milliseconds
 *   - Matching mode used
 *
 * Props:
 *   lastResult: {
 *     query: string,
 *     matched_question: string,
 *     confidence_pct: number,
 *     response_time_ms: number,
 *     mode: string,
 *     category: string,
 *   } | null
 */

import React, { useState } from "react";

export default function EvaluationDashboard({ lastResult }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!lastResult) return null;

  function getBarColor(pct) {
    if (pct >= 80) return "#22c55e";  // green
    if (pct >= 60) return "#f59e0b";  // amber
    return "#ef4444";                  // red
  }

  return (
    <div className="eval-dashboard" id="eval-dashboard">
      {/* Toggle header */}
      <button
        className="eval-toggle"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-controls="eval-content"
        id="eval-toggle-btn"
      >
        <span className="eval-toggle-icon">📊</span>
        <span>Evaluation Metrics</span>
        <span className={`eval-chevron ${isOpen ? "open" : ""}`}>▾</span>
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="eval-content" id="eval-content" role="region" aria-label="Evaluation metrics">
          {/* Query */}
          <div className="eval-row">
            <span className="eval-label">Your Query</span>
            <span className="eval-value query-value">"{lastResult.query}"</span>
          </div>

          {/* Matched FAQ */}
          <div className="eval-row">
            <span className="eval-label">Matched FAQ</span>
            <span className="eval-value">
              {lastResult.matched_question || "No match found"}
            </span>
          </div>

          {/* Similarity Score */}
          <div className="eval-row">
            <span className="eval-label">Similarity Score</span>
            <div className="eval-score-wrapper">
              <div className="eval-score-bar-bg">
                <div
                  className="eval-score-bar-fill"
                  style={{
                    width: `${lastResult.confidence_pct}%`,
                    background: getBarColor(lastResult.confidence_pct),
                  }}
                />
              </div>
              <span
                className="eval-score-pct"
                style={{ color: getBarColor(lastResult.confidence_pct) }}
              >
                {lastResult.confidence_pct}%
              </span>
            </div>
          </div>

          {/* Response time */}
          <div className="eval-row">
            <span className="eval-label">Response Time</span>
            <span className="eval-value">{lastResult.response_time_ms.toFixed(1)} ms</span>
          </div>

          {/* Mode */}
          <div className="eval-row">
            <span className="eval-label">Mode</span>
            <span className="eval-value">
              {lastResult.mode === "semantic" ? "🧠 Semantic (Sentence Transformers)" : "📊 TF-IDF + Cosine Similarity"}
            </span>
          </div>

          {/* Category */}
          {lastResult.category && (
            <div className="eval-row">
              <span className="eval-label">Category</span>
              <span className="eval-value category-tag">{lastResult.category}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
