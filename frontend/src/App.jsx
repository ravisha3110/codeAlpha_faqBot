/**
 * App.jsx
 * -------
 * Root component of the FAQ Chatbot application.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────┐
 *   │  Header (logo, theme toggle, clear chat)                 │
 *   ├─────────────────────────┬────────────────────────────────┤
 *   │  FAQ Search Sidebar     │  Chat Window                   │
 *   │  (collapsible on mobile)│  Suggested Questions           │
 *   │                         │  Evaluation Dashboard          │
 *   │                         │  Chat Input                    │
 *   └─────────────────────────┴────────────────────────────────┘
 *
 * State:
 *   messages    — Array of all chat message objects
 *   isTyping    — Boolean: bot is processing a response
 *   mode        — 'tfidf' | 'semantic'
 *   isDark      — Boolean: dark/light theme
 *   faqs        — Array of all FAQ entries from backend
 *   lastResult  — Metrics for the last bot response (evaluation dashboard)
 *   sidebarOpen — Boolean: sidebar visibility on mobile
 *   backendOk   — Boolean: whether backend is reachable
 */

import React, { useState, useEffect, useCallback } from "react";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import SuggestedQuestions from "./components/SuggestedQuestions";
import ThemeToggle from "./components/ThemeToggle";
import EvaluationDashboard from "./components/EvaluationDashboard";
import FAQSearch from "./components/FAQSearch";
import { sendMessage, fetchFAQs, checkHealth } from "./services/api";
import "./App.css";

// Simple ID generator (avoids uuid dependency)
function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState("tfidf");
  const [isDark, setIsDark] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendOk, setBackendOk] = useState(true);

  // ─── Apply theme ──────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // ─── Load FAQs on mount ───────────────────────────────────────────────────
  useEffect(() => {
    fetchFAQs()
      .then((data) => setFaqs(data.faqs || []))
      .catch(() => setFaqs([]));

    checkHealth()
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  // ─── Send a message ───────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (text, currentMode) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Add user message to chat
      const userMsg = {
        id: genId(),
        type: "user",
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        // Call backend
        const result = await sendMessage(trimmed, currentMode);

        // Build bot message
        const botMsg = {
          id: genId(),
          type: "bot",
          text: result.answer,
          timestamp: new Date(),
          confidence_pct: result.confidence_pct,
          matched_question: result.matched_question,
          category: result.category,
          is_fallback: result.is_fallback,
          mode: result.mode,
          response_time_ms: result.response_time_ms,
        };
        setMessages((prev) => [...prev, botMsg]);

        // Update evaluation dashboard
        setLastResult({
          query: trimmed,
          matched_question: result.matched_question || "",
          confidence_pct: result.confidence_pct,
          response_time_ms: result.response_time_ms,
          mode: result.mode,
          category: result.category,
        });
      } catch (err) {
        // Network or server error message
        const errorMsg = {
          id: genId(),
          type: "bot",
          text: "⚠️ Unable to connect to the backend. Please make sure the Python server is running on http://localhost:8000.",
          timestamp: new Date(),
          is_fallback: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
        setBackendOk(false);
      } finally {
        setIsTyping(false);
      }
    },
    []
  );

  // ─── Select a suggested question ─────────────────────────────────────────
  function handleSuggestionSelect(question) {
    handleSend(question, mode);
    setSidebarOpen(false); // Close mobile sidebar after selection
  }

  // ─── Clear chat ───────────────────────────────────────────────────────────
  function handleClearChat() {
    setMessages([]);
    setLastResult(null);
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="app-container" id="app">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="app-header" id="app-header">
        <div className="header-left">
          {/* Mobile sidebar toggle */}
          <button
            id="sidebar-toggle"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? "Close FAQ browser" : "Open FAQ browser"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>

          <div className="logo" aria-label="FAQ Chatbot">
            <span className="logo-icon" aria-hidden="true">🤖</span>
            <div className="logo-text">
              <span className="logo-title">FAQ Chatbot</span>
              <span className="logo-subtitle">Powered by NLP + ML</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          {/* Backend status indicator */}
          <div
            className={`status-indicator ${backendOk ? "online" : "offline"}`}
            title={backendOk ? "Backend connected" : "Backend offline"}
            aria-label={backendOk ? "Backend connected" : "Backend offline"}
          >
            <span className="status-dot" aria-hidden="true" />
            <span className="status-text">{backendOk ? "Online" : "Offline"}</span>
          </div>

          {/* Clear chat button */}
          <button
            id="clear-chat-btn"
            className="clear-chat-btn"
            onClick={handleClearChat}
            disabled={messages.length === 0}
            aria-label="Clear chat history"
            title="Clear all messages"
          >
            🗑 Clear
          </button>

          {/* Theme toggle */}
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <main className="app-main" id="app-main">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* FAQ Search Sidebar */}
        <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="faq-sidebar">
          <FAQSearch faqs={faqs} onSelect={handleSuggestionSelect} />
        </div>

        {/* Chat Area */}
        <section className="chat-area" id="chat-area" aria-label="Chat interface">
          {/* Messages */}
          <ChatWindow messages={messages} isTyping={isTyping} />

          {/* Suggested questions (shown when no messages yet) */}
          {messages.length === 0 && (
            <SuggestedQuestions faqs={faqs} onSelect={(q) => handleSend(q, mode)} />
          )}

          {/* Evaluation dashboard (shown after first response) */}
          <EvaluationDashboard lastResult={lastResult} />

          {/* Input bar */}
          <ChatInput
            onSend={handleSend}
            isTyping={isTyping}
            mode={mode}
            onModeChange={setMode}
          />
        </section>
      </main>
    </div>
  );
}
