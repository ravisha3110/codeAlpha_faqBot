/**
 * FAQSearch.jsx
 * -------------
 * Searchable FAQ browser sidebar.
 *
 * Features:
 *   - Search bar filtering questions and answers in real time
 *   - Category filter tabs
 *   - Click any FAQ to send it as a chat message
 *
 * Props:
 *   faqs:     Array<{id, question, answer, category}>
 *   onSelect: (question: string) => void
 */

import React, { useState, useMemo } from "react";

export default function FAQSearch({ faqs, onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Build unique sorted category list
  const categories = useMemo(() => {
    if (!faqs) return ["All"];
    const cats = [...new Set(faqs.map((f) => f.category))].sort();
    return ["All", ...cats];
  }, [faqs]);

  // Filter FAQs by search term and active category
  const filteredFAQs = useMemo(() => {
    if (!faqs) return [];
    const term = searchTerm.toLowerCase();
    return faqs.filter((faq) => {
      const matchesSearch =
        !term ||
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term);
      const matchesCategory =
        activeCategory === "All" || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchTerm, activeCategory]);

  return (
    <aside className="faq-search-panel" aria-label="FAQ browser">
      {/* Panel header */}
      <div className="faq-panel-header">
        <h2 className="faq-panel-title">📚 FAQ Browser</h2>
        <span className="faq-count">{filteredFAQs.length} results</span>
      </div>

      {/* Search bar */}
      <div className="faq-search-bar">
        <span className="faq-search-icon" aria-hidden="true">🔍</span>
        <input
          id="faq-search-input"
          type="search"
          className="faq-search-input"
          placeholder="Search FAQs…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search FAQs"
        />
        {searchTerm && (
          <button
            className="faq-search-clear"
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      <div className="faq-category-tabs" role="tablist" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`cat-tab-${cat.toLowerCase().replace(/\s+/g, "-")}`}
            className={`faq-category-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
            role="tab"
            aria-selected={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="faq-list" role="list">
        {filteredFAQs.length === 0 ? (
          <p className="faq-no-results">No FAQs found for your search.</p>
        ) : (
          filteredFAQs.map((faq) => (
            <button
              key={faq.id}
              id={`faq-item-${faq.id}`}
              className="faq-list-item"
              onClick={() => onSelect(faq.question)}
              title="Click to ask this question"
              role="listitem"
              aria-label={`Ask: ${faq.question}`}
            >
              <div className="faq-item-header">
                <span className="faq-item-category">{faq.category}</span>
              </div>
              <p className="faq-item-question">{faq.question}</p>
              <p className="faq-item-preview">
                {faq.answer.length > 80
                  ? faq.answer.slice(0, 80) + "…"
                  : faq.answer}
              </p>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
