/** Shared formatting + derivation helpers for the Projects module. */

export const PROJECT_STATUS = ["UPCOMING", "ACTIVE", "COMPLETED"];
export const TASK_STATUS = ["TODO", "IN_PROGRESS", "COMPLETED"];
export const TASK_PRIORITY = ["LOW", "MEDIUM", "HIGH"];
export const PROJECT_ROLES = ["CHAIRPERSON", "COMMITTEE_LEAD", "MEMBER"];

/** "IN_PROGRESS" -> "In Progress" */
export const humanise = (v) =>
  String(v || "")
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const initials = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const formatShort = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" })
    : "—";

/** "14:30" -> "2:30 PM"; empty stays empty so the UI can omit it. */
export const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = String(t).split(":").map(Number);
  if (Number.isNaN(h)) return "";
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m || 0).padStart(2, "0")} ${period}`;
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/**
 * Whole days between today and a due date. Negative means overdue.
 * Compared at day granularity so "due today" is 0 regardless of clock time.
 */
export const daysUntil = (due) => {
  if (!due) return null;
  const ms = startOfDay(due) - startOfDay(new Date());
  return Math.round(ms / 86400000);
};

/** Human deadline countdown for task cards. */
export const countdownLabel = (due, status) => {
  if (status === "COMPLETED") return "Completed";
  const d = daysUntil(due);
  if (d === null) return "";
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  if (d === -1) return "1 day overdue";
  if (d < 0) return `${Math.abs(d)} days overdue`;
  return `${d} days left`;
};

/** The value badges switch on — folds the derived OVERDUE state in. */
export const displayStatusOf = (task) => {
  if (!task) return "TODO";
  if (task.displayStatus) return task.displayStatus;
  if (task.status === "COMPLETED") return "COMPLETED";
  if (task.dueDate && new Date(task.dueDate).getTime() < Date.now()) return "OVERDUE";
  return task.status || "TODO";
};

/** Nearest deadline first — the sort every task list uses. */
export const byDeadline = (a, b) =>
  new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
