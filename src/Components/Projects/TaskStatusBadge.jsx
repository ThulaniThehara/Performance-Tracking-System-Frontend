import React from "react";
import { FaCheck, FaSpinner, FaRegCircle, FaExclamationTriangle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { humanise } from "../../utils/projectUtils";

/**
 * The only place green / orange / red appear in this module.
 *
 * Each state also carries its own icon and its label in text, so the state is
 * never communicated by colour alone.
 */
const CONFIG = {
  TODO: { cls: "is-todo", icon: <FaRegCircle /> },
  IN_PROGRESS: { cls: "is-progress", icon: <FaSpinner /> },
  COMPLETED: { cls: "is-done", icon: <FaCheck /> },
  OVERDUE: { cls: "is-overdue", icon: <FaExclamationTriangle /> },
};

const TaskStatusBadge = ({ status, compact = false }) => {
  const { t } = useTranslation();
  const key = String(status || "TODO").toUpperCase();
  const cfg = CONFIG[key] || { cls: "is-todo", icon: <FaRegCircle /> };
  const label = t(`enums.taskStatus.${key}`, { defaultValue: humanise(key) });

  return (
    <span className={`pm-status-badge ${cfg.cls} ${compact ? "is-compact" : ""}`}>
      <span className="badge-icon" aria-hidden="true">{cfg.icon}</span>
      {label}
    </span>
  );
};

export default TaskStatusBadge;
