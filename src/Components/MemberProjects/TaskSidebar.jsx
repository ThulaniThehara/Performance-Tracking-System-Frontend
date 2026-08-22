import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import {
  FaRegCalendarCheck,
  FaExclamationTriangle,
  FaClock,
  FaCalendarDay,
  FaCalendarAlt,
  FaCheckCircle,
  FaCheck,
} from "react-icons/fa";

/**
 * Left-side task sidebar for the Projects dashboard.
 * Displays ONLY pending tasks (Overdue → Due Today → Upcoming).
 * Excludes completed tasks for a clean pending-focused workspace.
 */
const TaskSidebar = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFetch("/pm/my-tasks");
      if (!res) return;
      setData(res.data);
    } catch (e) {
      setError(e.message || "Could not load your tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markCompleted = async (task) => {
    try {
      setBusyId(task._id);
      await apiFetch(`/pm/my-tasks/${task._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      await load();
    } catch (e) {
      setError(e.message || "Could not update the task.");
    } finally {
      setBusyId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getPriorityBadge = (p) => {
    const priority = (p || "").toUpperCase();
    if (priority === "HIGH" || priority === "URGENT") {
      return { label: "High", color: "#ef4444", bg: "#fef2f2" };
    }
    if (priority === "MEDIUM") {
      return { label: "Med", color: "#f59e0b", bg: "#fffbeb" };
    }
    return { label: "Low", color: "#10b981", bg: "#ecfdf5" };
  };

  const renderTaskItem = (task) => {
    const isBusy = busyId === task._id;
    const priority = getPriorityBadge(task.priority);

    return (
      <div
        key={task._id}
        className="pending-task-card"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "14px 16px",
          borderRadius: 16,
          backgroundColor: "#ffffff",
          border: "1px solid #f0e9fa",
          boxShadow: "0 2px 8px rgba(107, 82, 209, 0.04)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isBusy ? 0.6 : 1,
        }}
      >
        {/* Checkbox action to mark complete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isBusy) {
              markCompleted(task);
            }
          }}
          title="Mark as completed"
          style={{
            marginTop: 2,
            width: 22,
            height: 22,
            borderRadius: 7,
            border: "2px solid #c9b9f3",
            backgroundColor: "#fcfaff",
            color: "#6b52d1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}
        >
          {isBusy ? (
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "2px solid #6b52d1",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
          ) : null}
        </button>

        {/* Task Title and Context */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#1d1545",
              lineHeight: 1.35,
              wordBreak: "break-word",
            }}
          >
            {task.title}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
              flexWrap: "wrap",
            }}
          >
            {task.dueDate && (
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#5b5575",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#f4effa",
                  padding: "2px 8px",
                  borderRadius: 6,
                }}
              >
                <FaClock style={{ fontSize: "0.68rem", color: "#6b52d1" }} />
                {formatDate(task.dueDate)}
              </span>
            )}

            {task.projectName && (
              <span
                style={{
                  fontSize: "0.71rem",
                  fontWeight: 700,
                  color: "#6b52d1",
                  backgroundColor: "rgba(107, 82, 209, 0.1)",
                  padding: "2px 8px",
                  borderRadius: 6,
                  maxWidth: 130,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {task.projectName}
              </span>
            )}

            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: priority.color,
                backgroundColor: priority.bg,
                padding: "2px 7px",
                borderRadius: 6,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                marginLeft: "auto",
              }}
            >
              {priority.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (icon, label, tasks, accentColor) => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <div className="task-sidebar-section" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            padding: "0 4px",
          }}
        >
          {React.cloneElement(icon, {
            style: { fontSize: "0.85rem", color: accentColor },
          })}
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              color: "#1d1545",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              color: accentColor,
              backgroundColor: `${accentColor}15`,
              padding: "2px 9px",
              borderRadius: 999,
              marginLeft: "auto",
            }}
          >
            {tasks.length}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.map(renderTaskItem)}
        </div>
      </div>
    );
  };

  // Compute ONLY pending tasks count
  const pendingTasksCount =
    (data?.overdue?.length || 0) +
    (data?.today?.length || 0) +
    (data?.upcoming?.length || 0);

  return (
    <aside
      className="task-sidebar"
      style={{
        width: 420,
        minWidth: 420,
        backgroundColor: "#ffffff",
        border: "1px solid rgba(234, 226, 248, 0.85)",
        borderRadius: 24,
        padding: "0 20px 24px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        boxShadow: "0 8px 24px rgba(107, 82, 209, 0.05)",
      }}
    >
      {/* Sidebar Header (Aligned with My Projects Header) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 4px",
          marginBottom: 16,
          borderBottom: "1px solid #f4effa",
          minHeight: 88,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#eae2f8",
              color: "#6b52d1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
            }}
          >
            <FaRegCalendarCheck />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#1d1545" }}>
                Pending Tasks
              </h3>
              <span
                style={{
                  background: "linear-gradient(135deg, #6b52d1 0%, #9d7bf0 100%)",
                  color: "#ffffff",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  padding: "2px 10px",
                  borderRadius: 999,
                }}
              >
                {pendingTasksCount}
              </span>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#5b5575" }}>
              {pendingTasksCount} task{pendingTasksCount === 1 ? "" : "s"} to complete
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.82rem", padding: "0 4px" }}>{error}</p>
      )}

      {loading ? (
        <div style={{ padding: "16px 4px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 64,
                borderRadius: 16,
                backgroundColor: "#f4effa",
                marginBottom: 12,
              }}
            />
          ))}
        </div>
      ) : (
        <>
          {renderSection(
            <FaExclamationTriangle />,
            "Overdue",
            data?.overdue,
            "#ef4444"
          )}
          {renderSection(
            <FaCalendarDay />,
            "Due Today",
            data?.today,
            "#f59e0b"
          )}
          {renderSection(
            <FaCalendarAlt />,
            "Upcoming",
            data?.upcoming,
            "#6b52d1"
          )}

          {pendingTasksCount === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "44px 20px",
                backgroundColor: "#faf9fc",
                borderRadius: 20,
                border: "1px solid #f0e9fa",
                marginTop: 8,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: "#eae2f8",
                  color: "#6b52d1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  margin: "0 auto 14px",
                }}
              >
                <FaCheckCircle />
              </div>
              <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1d1545" }}>
                All caught up! 🎉
              </p>
              <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#5b5575" }}>
                No pending tasks assigned to you right now.
              </p>
            </div>
          )}
        </>
      )}
    </aside>
  );
};

export default TaskSidebar;
