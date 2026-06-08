/**
 * ChatWindow.jsx
 * --------------
 * Scrollable container that renders all chat messages.
 * Auto-scrolls to the newest message whenever messages change.
 *
 * Props:
 *   messages: Array<MessageObject>   — list of all messages
 *   isTyping: boolean                — whether the bot typing indicator shows
 */

import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, isTyping }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="chat-window" id="chat-window" role="log" aria-live="polite" aria-label="Chat messages">
      {/* Welcome screen shown when no messages yet */}
      {messages.length === 0 && (
        <div className="chat-empty-state">
          <div className="empty-icon">💬</div>
          <h2>Hello! How can I help you today?</h2>
          <p>Ask me anything, or pick a suggested question below.</p>
        </div>
      )}

      {/* Render all messages */}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Typing animation shown while waiting for bot response */}
      {isTyping && (
        <MessageBubble
          message={{ id: "typing", type: "typing", timestamp: new Date() }}
        />
      )}

      {/* Invisible anchor element for auto-scroll */}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
