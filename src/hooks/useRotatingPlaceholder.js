import { useEffect, useState } from "react";

export function useRotatingPlaceholder(options, intervalMs = 2600) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!options || options.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % options.length), intervalMs);
    return () => clearInterval(id);
  }, [options, intervalMs]);

  return options?.[index] || "";
}

export const SEARCH_SUGGESTIONS = [
  'try "senior data engineer"',
  'try "H-1B sponsorship"',
  'try "Beacon Hill"',
  'try "remote, contract"',
  'try "Austin, Texas"',
  'try "OPT / CPT candidates"',
  'try "AI/ML Engineer"',
  'try "green card holders"',
];
