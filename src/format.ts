export function formatAge(timestamp: string | undefined): string {
  if (timestamp === undefined) {
    return '';
  }

  const seconds = Math.max(0, Math.round((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (seconds < 60) {
    return 'updated just now';
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `updated ${minutes} min ago`;
  }

  return `updated ${Math.round(minutes / 60)} h ago`;
}
