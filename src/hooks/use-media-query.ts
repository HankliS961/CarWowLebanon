"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to track CSS media query matches.
 * @param query - The media query string (e.g., "(min-width: 768px)")
 * @returns Whether the media query currently matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
