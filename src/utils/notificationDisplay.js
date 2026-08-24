export const NOTIF_ICON = {
  TASK_ASSIGNED: "📋",
  TASK_COMPLETED: "✅",
  PROJECT_MEMBER_ADDED: "👥",
  COMMITTEE_MEMBER_ADDED: "👥",
  DEADLINE_NEAR: "⏰",
  DEADLINE_OVERDUE: "⚠️",
};

export function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
