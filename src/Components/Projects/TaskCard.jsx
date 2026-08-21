import React from "react";
import { FaRegCalendarAlt, FaRegClock, FaTrashAlt, FaSitemap, FaFolder } from "react-icons/fa";
import TaskStatusBadge from "./TaskStatusBadge";
import PriorityBadge from "./PriorityBadge";
import Avatar from "./Avatar";
import {
  formatShort,
  formatTime,
  countdownLabel,
  displayStatusOf,
  daysUntil,
} from "../../utils/projectUtils";

/**
 * A single task.
 *
 * `canEditStatus` and `canManage` are passed down from the server's permission
 * payload — the card never decides for itself what the viewer may do.
 */
const TaskCard = ({
  task,
  canEditStatus = false,
  canManage = false,
  onStatusChange,
  onDelete,
  showAssignee = false,
  showContext = false,
  busy = false,
}) => {
  const status = displayStatusOf(task);
  const remaining = daysUntil(task.dueDate);
  const urgent = status !== "COMPLETED" && remaining !== null && remaining <= 1;

  return (
    <article className={`pm-task-card ${status === "OVERDUE" ? "is-overdue" : ""}`}>
      <div className="task-main">
        <div className="task-head">
          <h4>{task.title}</h4>
          {canManage && onDelete && (
            <button
              className="pm-icon-btn is-danger"
              onClick={() => onDelete(task)}
              aria-label={`Delete ${task.title}`}
              disabled={busy}
            >
              <FaTrashAlt />
            </button>
          )}
        </div>

        {task.description && <p className="task-desc">{task.description}</p>}

        {showContext && (task.projectName || task.committeeName) && (
          <div className="task-context">
            {task.projectName && (
              <span><FaFolder aria-hidden="true" /> {task.projectName}</span>
            )}
            {task.committeeName && (
              <span><FaSitemap aria-hidden="true" /> {task.committeeName}</span>
            )}
          </div>
        )}

        <div className="task-meta">
          <span className={`due ${urgent ? "is-urgent" : ""}`}>
            <FaRegCalendarAlt aria-hidden="true" /> {formatShort(task.dueDate)}
          </span>
          {task.dueTime && (
            <span className="due">
              <FaRegClock aria-hidden="true" /> {formatTime(task.dueTime)}
            </span>
          )}
          <span className={`countdown ${status === "OVERDUE" ? "is-late" : ""}`}>
            {countdownLabel(task.dueDate, task.status)}
          </span>
        </div>

        {showAssignee && task.assignedTo && (
          <div className="task-assignee">
            <Avatar name={task.assignedTo.name} size="xs" />
            <span>{task.assignedTo.name}</span>
          </div>
        )}
      </div>

      <div className="task-side">
        <PriorityBadge priority={task.priority} compact />
        <TaskStatusBadge status={status} compact />

        {canEditStatus && onStatusChange && (
          <select
            className="pm-mini-select"
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value)}
            disabled={busy}
            aria-label={`Change status of ${task.title}`}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        )}
      </div>
    </article>
  );
};

export default TaskCard;
