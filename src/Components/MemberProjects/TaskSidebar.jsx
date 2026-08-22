import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import {
  FaRegCalendarCheck,
  FaExclamationTriangle,
  FaClock,
  FaCalendarDay,
  FaCalendarAlt,
  FaCheckCircle,
  FaCircle,
  FaArrowRight,
} from "react-icons/fa";

/**
 * Left-side task sidebar for the Projects dashboard.
 * Fetches from /pm/my-tasks and groups tasks by deadline buckets:
 * Overdue → Today → This Week (upcoming) → Completed
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

  const changeStatus = async (task, status) => {
    try {
      setBusyId(task._id);
      await apiFetch(`/pm/my-tasks/${task._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
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

  const getPriorityColor = (p) => {
    const priority = (p || "").toUpperCase();
    if (priority === "HIGH" || priority === "URGENT") return "#ef4444";
    if (priority === "MEDIUM") return "#f59e0b";
    return "#10b981";
  };

  const renderTaskItem = (task) => {
    const isCompleted =
      (task.status || "").toUpperCase() === "COMPLETED" ||
      (task.status || "").toUpperCase() === "DONE";
    const isBusy = busyId === task._id;

    return (
      <div
        key={task._id}
        className="task-sidebar-item"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "12px 16px",
          borderRadius: 14,
          backgroundColor: "#ffffff",
          border: "1px solid #eae2f8",
          transition: "all 0.2s ease",
          opacity: isBusy ? 0.6 : 1,
          cursor: "pointer",
        }}
      >
        {/* Status Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isBusy) {
              changeStatus(task, isCompleted ? "TODO" : "COMPLETED");
            }
          }}
          style={{
            marginTop: 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: isCompleted ? "none" : "2px solid #6b52d1",
            backgroundColor: isCompleted ? "#6b52d1" : "transparent",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            fontSize: "0.65rem",
            transition: "all 0.2s ease",
          }}
        >
          {isCompleted && <FaCheckCircle style={{ fontSize: "0.7rem" }} />}
        </button>

        {/* Task Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.84rem",
              fontWeight: 700,
              color: isCompleted ? "#9b93b0" : "#1d1545",
              textDecoration: isCompleted ? "line-through" : "none",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.title}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
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
                  gap: 3,
                }}
              >
                <FaClock style={{ fontSize: "0.65rem" }} />
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.projectName && (
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#6b52d1",
                  backgroundColor: "#eae2f8",
                  padding: "1px 8px",
                  borderRadius: 999,
                }}
              >
                {task.projectName}
              </span>
            )}
          </div>
        </div>

        {/* Priority Dot */}
        <FaCircle
          style={{
            fontSize: "0.45rem",
            color: getPriorityColor(task.priority),
            marginTop: 6,
            flexShrink: 0,
          }}
        />
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
            style: { fontSize: "0.82rem", color: accentColor },
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
              padding: "2px 8px",
              borderRadius: 999,
              marginLeft: "auto",
            }}
          >
            {tasks.length}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map(renderTaskItem)}
        </div>
      </div>
    );
  };

  const totalTasks =
    (data?.counts?.overdue || 0) +
    (data?.counts?.today || 0) +
    (data?.counts?.upcoming || 0) +
    (data?.counts?.completed || 0);

  return (
    <aside
      className="task-sidebar"
      style={{
        width: 320,
        minWidth: 320,
        backgroundColor: "#faf9fc",
        borderRight: "1px solid #eae2f8",
        borderRadius: 24,
        padding: "24px 16px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        boxShadow: "0 8px 24px rgba(107, 82, 209, 0.06)",
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 4px",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "#eae2f8",
              color: "#6b52d1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            <FaRegCalendarCheck />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#1d1545" }}>
              My Tasks
            </h3>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#5b5575" }}>
              {totalTasks} total tasks
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.82rem", padding: "0 4px" }}>{error}</p>
      )}

      {loading ? (
        <div style={{ padding: "20px 4px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 60,
                borderRadius: 12,
                backgroundColor: "#eae2f8",
                marginBottom: 10,
                animation: "pulse 1.5s infinite",
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
          {renderSection(
            <FaCheckCircle />,
            "Completed",
            data?.completed?.slice(0, 5),
            "#10b981"
          )}

          {totalTasks === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#5b5575",
              }}
            >
              <FaRegCalendarCheck
                style={{ fontSize: "2rem", color: "#eae2f8", marginBottom: 12 }}
              />
              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#1d1545" }}>
                All clear!
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "0.82rem" }}>
                No tasks assigned to you yet.
              </p>
            </div>
          )}
        </>
      )}
    </aside>
  );
};

export default TaskSidebar;
