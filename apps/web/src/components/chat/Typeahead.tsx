"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Typeahead / autosuggestions
//
// v1: Static suggestions filtered client-side as the user types.
//     The suggestion list is kept in this file for simplicity.
//
// v2 upgrade path:
//   Replace STATIC_SUGGESTIONS with an API call to /api/suggestions?q=...
//   which can use semantic search against tool manifests + common queries.
// ─────────────────────────────────────────────────────────────────────────────

import styles from "./Typeahead.module.css";

const STATIC_SUGGESTIONS = [
  "Find courses about machine learning",
  "Help me cite a source in APA format",
  "What dining halls are open now?",
  "Show me the Penn academic calendar",
  "Help me write a cover letter",
  "/tool course-finder { \"query\": \"intro computer science\" }",
];

interface TypeaheadProps {
  query: string;
  onSelect: (value: string) => void;
}

export function Typeahead({ query, onSelect }: TypeaheadProps) {
  if (!query || query.length < 2) return null;

  const lower = query.toLowerCase();
  const matches = STATIC_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(lower)
  ).slice(0, 4);

  if (matches.length === 0) return null;

  return (
    <ul className={styles.list} role="listbox">
      {matches.map((s) => (
        <li key={s} role="option">
          <button
            className={styles.item}
            onMouseDown={(e) => {
              // Use mousedown so blur on textarea fires after.
              e.preventDefault();
              onSelect(s);
            }}
          >
            {s}
          </button>
        </li>
      ))}
    </ul>
  );
}
