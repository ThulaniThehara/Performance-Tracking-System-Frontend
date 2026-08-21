import React from "react";
import { FaCheck, FaSpinner, FaRegCircle, FaExclamationTriangle } from "react-icons/fa";
import { humanise } from "../../utils/projectUtils";

/**
 * The only place green / orange / red appear in this module.
 *
 * Each state also carries its own icon and its label in text, so the state is
 * never communicated by colour alone.
 */
const CONFIG = {
  TODO: { cls: "is-todo", icon: <FaRegCircle />, label: "To Do" },
  IN_PROGRESS: { cls: "is-progress", icon: <FaSpinner />, label: "In Progress" },
  COMPLETED: { cls: "is-done", icon: <FaCheck />, label: "Completed" },
  OVERDUE: { cls: "is-overdue", icon: <FaExclamationTriangle />, label: "Overdue" },
};

const TaskStatusBadge = ({ status, compact = false }) => {
  const key = String(status || "TODO").toUpperCase();
  const cfg = CONFIG[key] || { cls: "is-todo", icon: <FaRegCircle />, label: humanise(key) };

  return (
    <span className={`pm-status-badge ${cfg.cls} ${compact ? "is-compact" : ""}`}>
      <span className="badge-icon" aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
};

export default TaskStatusBadge;
