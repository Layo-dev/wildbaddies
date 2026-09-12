export const SITE_URL = "https://wildbaddies.com";

export const formatDurationIso = (seconds: number | null | undefined): string | undefined => {
  if (!seconds || seconds <= 0) return undefined;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `PT${m}M${s}S`;
};
