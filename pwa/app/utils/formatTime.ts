/**
 * Format transaction timestamp as relative time
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string (e.g., "2m ago", "Today, 2:30 PM", "Yesterday")
 */
export function formatTransactionTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const date = new Date(timestamp);

  // Less than 1 minute
  if (diff < 60000) return 'Just now';

  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }

  // Today
  if (diff < 86400000) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Yesterday
  if (diff < 172800000) {
    return 'Yesterday';
  }

  // Older than 2 days
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
