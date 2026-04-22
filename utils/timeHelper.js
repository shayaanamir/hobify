/**
 * timeAgo — relative time formatter
 * @param {string|number|Date} dateStr 
 * @returns {string} e.g. "5m ago", "2h ago", "1d ago"
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  
  if (mins < 1) return 'just now';
  if (mins < 60) return `${Math.max(0, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}
