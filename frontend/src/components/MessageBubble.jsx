/**
 * MessageBubble.jsx
 * -----------------
 * Renders a single chat message bubble.
 *
 * Props:
 *   message: {
 *     id: string,
 *     type: 'user' | 'bot' | 'typing',
 *     text: string,
 *     timestamp: Date,
 *     confidence_pct?: number,
 *     matched_question?: string,
 *     category?: string,
 *     is_fallback?: boolean,
 *     mode?: string,
 *     response_time_ms?: number,
 *   }
 */

import React from "react";

// Format timestamp to HH:MM AM/PM
function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

// Confidence badge color based on score
function getConfidenceColor(pct) {
  if (pct >= 80) return "confidence-high";
  if (pct >= 60) return "confidence-medium";
  return "confidence-low";
}

// Typing animation dots
function TypingIndicator() {
  return (
    <div className="message-bubble bot typing-bubble" aria-label="Bot is typing">
      <div className="typing-avatar">🤖</div>
      <div className="typing-dots">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

export default function MessageBubble({ message }) {
  // Typing animation placeholder
  if (message.type === "typing") {
    return <TypingIndicator />;
  }

  const isUser = message.type === "user";

  return (
    <div className={`message-wrapper ${isUser ? "user-wrapper" : "bot-wrapper"}`}>
      {/* Bot avatar (left side) */}
      {!isUser && (
        <div className="bot-avatar" aria-hidden="true">🤖</div>
      )}

      <div className={`message-bubble ${isUser ? "user" : "bot"}`}>
        {/* Message text */}
        <p className="message-text">{message.text}</p>

        {/* Bot metadata: confidence + category */}
        {!isUser && !message.is_fallback && message.confidence_pct !== undefined && (
          <div className="message-meta">
            {/* Confidence badge */}
            <span className={`confidence-badge ${getConfidenceColor(message.confidence_pct)}`}>
              ✓ {message.confidence_pct}% match
            </span>

            {/* Category tag */}
            {message.category && (
              <span className="category-tag">{message.category}</span>
            )}

            {/* Mode indicator */}
            {message.mode && (
              <span className="mode-tag">
                {message.mode === "semantic" ? "🧠 Semantic" : "📊 TF-IDF"}
              </span>
            )}
          </div>
        )}

        {/* Fallback indicator */}
        {!isUser && message.is_fallback && (
          <div className="message-meta">
            <span className="fallback-badge">⚠ Low confidence</span>
          </div>
        )}

        {/* Timestamp */}
        <span className="message-time" aria-label={`Sent at ${formatTime(message.timestamp)}`}>
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* User avatar (right side) */}
      {isUser && (
        <div className="user-avatar" aria-hidden="true">👤</div>
      )}
    </div>
  );
}
