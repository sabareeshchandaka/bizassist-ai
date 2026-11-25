
const chunkText = (text, chunkSize = 1000, overlap = 150) => {
  const cleanedText = text
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedText) return [];

  const chunks = [];
  let start = 0;

  while (start < cleanedText.length) {
    let end = Math.min(start + chunkSize, cleanedText.length);

    // Prefer ending at a word boundary.
    if (end < cleanedText.length) {
      const lastSpace = cleanedText.lastIndexOf(" ", end);

      if (lastSpace > start) {
        end = lastSpace;
      }
    }

    const chunk = cleanedText.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= cleanedText.length) break;

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
};

export default chunkText;
