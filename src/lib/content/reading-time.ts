/**
 * Estimate reading time from HTML or plain text content.
 * Average reading speed: 200 words per minute.
 */

const WORDS_PER_MINUTE = 200;

/** Strip HTML tags and return plain text word count. */
function countWords(text: string): number {
  const plain = text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return 0;
  return plain.split(/\s+/).length;
}

/** Returns estimated reading time in minutes (minimum 1). */
export function estimateReadingTime(content: string): number {
  const words = countWords(content);
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** Returns a formatted reading time string. */
export function formatReadingTime(minutes: number, locale: string): string {
  if (locale === "ar") {
    return `${minutes} دقائق قراءة`;
  }
  return `${minutes} min read`;
}
