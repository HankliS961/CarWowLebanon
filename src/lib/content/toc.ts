/**
 * Extract table of contents headings from HTML content.
 * Used for blog posts and guides to generate a sticky sidebar TOC.
 */

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** Extract h2 and h3 headings from HTML content. */
export function extractTableOfContents(html: string): TocItem[] {
  const headingRegex = /<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const existingId = match[2];
    const text = match[3].replace(/<[^>]*>/g, "").trim();
    const id = existingId || slugifyHeading(text);

    items.push({ id, text, level });
  }

  return items;
}

/** Create a URL-safe ID from heading text. */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Inject IDs into headings that don't have them. */
export function injectHeadingIds(html: string): string {
  return html.replace(
    /<h([23])([^>]*)>(.*?)<\/h([23])>/gi,
    (fullMatch, level, attrs, content, closeLevel) => {
      if (/id="/.test(attrs)) return fullMatch;
      const text = content.replace(/<[^>]*>/g, "").trim();
      const id = slugifyHeading(text);
      return `<h${level}${attrs} id="${id}">${content}</h${closeLevel}>`;
    }
  );
}
