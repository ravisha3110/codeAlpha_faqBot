/**
 * SuggestedQuestions.jsx
 * ----------------------
 * Displays a horizontal row of clickable suggested question chips.
 * Clicking a chip auto-fills it into the chat and sends it.
 *
 * Props:
 *   faqs:    Array<{question, category}>  — FAQ list to pick suggestions from
 *   onSelect: (question: string) => void  — called when user clicks a chip
 */

import React, { useMemo } from "react";

// Categories to feature as suggestions (one per category)
const FEATURED_CATEGORIES = [
  "Returns",
  "Shipping",
  "Account",
  "Payments",
  "Orders",
  "Products",
  "Support",
  "Technical",
  "Privacy",
];

export default function SuggestedQuestions({ faqs, onSelect }) {
  // Pick the first FAQ from each featured category as a suggestion chip
  const suggestions = useMemo(() => {
    if (!faqs || faqs.length === 0) return [];
    const seen = new Set();
    const result = [];
    for (const cat of FEATURED_CATEGORIES) {
      const faq = faqs.find((f) => f.category === cat && !seen.has(f.id));
      if (faq) {
        seen.add(faq.id);
        result.push(faq);
      }
    }
    return result.slice(0, 6); // Show at most 6 chips
  }, [faqs]);

  if (suggestions.length === 0) return null;

  return (
    <div className="suggested-questions" aria-label="Suggested questions">
      <p className="suggested-label">💡 Try asking:</p>
      <div className="suggestions-scroll">
        {suggestions.map((faq) => (
          <button
            key={faq.id}
            id={`suggestion-${faq.id}`}
            className="suggestion-chip"
            onClick={() => onSelect(faq.question)}
            title={`Category: ${faq.category}`}
            aria-label={`Ask: ${faq.question}`}
          >
            {faq.question}
          </button>
        ))}
      </div>
    </div>
  );
}
