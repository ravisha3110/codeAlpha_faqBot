/**
 * ChatInput.jsx
 * -------------
 * Text input bar at the bottom of the chat window.
 *
 * Features:
 *   - Enter to send, Shift+Enter for new line
 *   - Disabled while bot is typing
 *   - Character counter
 *   - Mode selector (TF-IDF / Semantic)
 *
 * Props:
 *   onSend:    (message: string, mode: string) => void
 *   isTyping:  boolean
 *   mode:      'tfidf' | 'semantic'
 *   onModeChange: (mode: string) => void
 */

import React, { useState, useRef } from "react";

const MAX_LENGTH = 500;

export default function ChatInput({ onSend, isTyping, mode, onModeChange }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  // Handle Enter key: send on Enter, newline on Shift+Enter
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    onSend(trimmed, mode);
    setInput("");
    textareaRef.current?.focus();
  }

  const charCount = input.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const canSend = input.trim().length > 0 && !isTyping && !isOverLimit;

  return (
    <div className="chat-input-container">
      {/* Mode selector pills */}
      <div className="mode-selector" role="group" aria-label="Matching mode">
        <button
          id="mode-tfidf"
          className={`mode-pill ${mode === "tfidf" ? "active" : ""}`}
          onClick={() => onModeChange("tfidf")}
          title="TF-IDF + Cosine Similarity (fast)"
          aria-pressed={mode === "tfidf"}
        >
          📊 TF-IDF
        </button>
        <button
          id="mode-semantic"
          className={`mode-pill ${mode === "semantic" ? "active" : ""}`}
          onClick={() => onModeChange("semantic")}
          title="Sentence Transformers – Semantic Search (more accurate)"
          aria-pressed={mode === "semantic"}
        >
          🧠 Semantic
        </button>
      </div>

      {/* Input row */}
      <div className="chat-input-row">
        <textarea
          ref={textareaRef}
          id="chat-input"
          className={`chat-textarea ${isOverLimit ? "over-limit" : ""}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything… (Enter to send)"
          disabled={isTyping}
          rows={1}
          aria-label="Type your message"
          aria-describedby="char-counter"
          maxLength={MAX_LENGTH + 50}
        />

        {/* Character counter */}
        <span
          id="char-counter"
          className={`char-counter ${isOverLimit ? "over-limit" : ""}`}
          aria-live="polite"
        >
          {charCount}/{MAX_LENGTH}
        </span>

        {/* Send button */}
        <button
          id="send-button"
          className="send-button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          title="Send message (Enter)"
        >
          {isTyping ? (
            <span className="send-spinner" aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
