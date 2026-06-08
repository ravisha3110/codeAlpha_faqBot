/**
 * api.js
 * -------
 * Axios-based API service layer for the FAQ Chatbot.
 *
 * Wraps backend endpoints:
 *   POST /chat  — Send user message, get matched FAQ answer + confidence
 *   GET  /faqs  — Fetch all FAQ entries for the sidebar browser
 */

import axios from "axios";

// Base URL for the FastAPI backend
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create a shared Axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 seconds timeout for semantic search (model loading)
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Send a user message to the chatbot and receive the matched answer.
 *
 * @param {string} message   - The user's question
 * @param {string} mode      - Matching mode: "tfidf" | "semantic"
 * @returns {Promise<{
 *   answer: string,
 *   confidence: number,
 *   confidence_pct: number,
 *   matched_question: string|null,
 *   category: string|null,
 *   response_time_ms: number,
 *   is_fallback: boolean,
 *   mode: string
 * }>}
 */
export async function sendMessage(message, mode = "tfidf") {
  const response = await api.post("/chat", { message, mode });
  return response.data;
}

/**
 * Fetch the complete FAQ knowledge base for the sidebar.
 *
 * @returns {Promise<{ count: number, faqs: Array<{id, question, answer, category}> }>}
 */
export async function fetchFAQs() {
  const response = await api.get("/faqs");
  return response.data;
}

/**
 * Ping the backend health endpoint.
 *
 * @returns {Promise<{ status: string, timestamp: number }>}
 */
export async function checkHealth() {
  const response = await api.get("/health");
  return response.data;
}

export default api;
