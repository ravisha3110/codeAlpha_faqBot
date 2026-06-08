/**
 * ThemeToggle.jsx
 * ---------------
 * Dark / Light mode toggle button with smooth icon transition.
 *
 * Props:
 *   isDark:   boolean            — current theme state
 *   onToggle: () => void         — called when user clicks the toggle
 */

import React from "react";

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      id="theme-toggle"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-icon" aria-hidden="true">
        {isDark ? "☀️" : "🌙"}
      </span>
      <span className="theme-label">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
