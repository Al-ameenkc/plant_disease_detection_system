/**
 * Parses structured detection notes saved as "Heading:\nbody" blocks separated by blank lines.
 */
export function parseAnalysisSections(
  blob: string | null | undefined
): { heading: string; body: string }[] {
  if (!blob?.trim()) return [];
  const chunks = blob.trim().split(/\n\n+/);
  return chunks.map((block) => {
    const nl = block.indexOf("\n");
    if (nl === -1) {
      return { heading: "Details", body: block.trim() };
    }
    const heading = block.slice(0, nl).trim().replace(/:\s*$/, "");
    const body = block.slice(nl + 1).trim();
    return { heading: heading || "Details", body };
  });
}
