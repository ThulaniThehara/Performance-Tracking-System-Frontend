import React from "react";
import {
  FaCheckCircle,
  FaCircleNotch,
  FaPlusCircle,
  FaRegClock,
  FaTimesCircle,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { humanise } from "../../utils/projectUtils";

/**
 * Modern Task Status Badge Palette & Visual Identity:
 * - TODO / NEW_TASK: Lavender Purple with Plus icon
 * - IN_PROGRESS: Azure Sky Blue with Progress ring icon
 * - COMPLETED: Emerald Mint Green with Check Circle icon
 * - PENDING: Warm Golden Amber with Clock icon
 * - FAILED / OVERDUE: Coral Rose Red with Cancel / Times Circle icon
 */
const CONFIG = {
  TODO: { cls: "is-todo", icon: <FaPlusCircle /> },
  NEW_TASK: { cls: "is-todo", icon: <FaPlusCircle /> },
  IN_PROGRESS: { cls: "is-progress", icon: <FaCircleNotch className="spin-slow" /> },
  ONGOING: { cls: "is-progress", icon: <FaCircleNotch className="spin-slow" /> },
  COMPLETED: { cls: "is-done", icon: <FaCheckCircle /> },
  COMPLETE: { cls: "is-done", icon: <FaCheckCircle /> },
  DONE: { cls: "is-done", icon: <FaCheckCircle /> },
  PENDING: { cls: "is-pending", icon: <FaRegClock /> },
  OVERDUE: { cls: "is-overdue", icon: <FaTimesCircle /> },
  FAILED: { cls: "is-failed", icon: <FaTimesCircle /> },
};

const TaskStatusBadge = ({ status, compact = false }) => {
  const { t } = useTranslation();
  const rawKey = String(status || "TODO").toUpperCase().replace(/\s+/g, "_");
  const cfg = CONFIG[rawKey] || { cls: "is-todo", icon: <FaPlusCircle /> };
  const label = t(`enums.taskStatus.${rawKey}`, { defaultValue: humanise(rawKey) });

  return (
    <span className={`pm-status-badge ${cfg.cls} ${compact ? "is-compact" : ""}`}>
      <span className="badge-icon" aria-hidden="true">{cfg.icon}</span>
      <span className="badge-label">{label}</span>
    </span>
  );
};

export default TaskStatusBadge;
