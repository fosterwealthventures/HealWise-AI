// Accepts full YouTube URLs or bare IDs and returns a normalized 11-char ID.
export function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;

  const trimmed = input.trim();
  const urlPattern = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const match = trimmed.match(urlPattern);

  if (match?.[1]) {
    return match[1];
  }

  return /^[A-Za-z0-9_-]{11}$/.test(trimmed) ? trimmed : null;
}
