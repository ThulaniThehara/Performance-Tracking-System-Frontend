import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../utils/api";
import {
  FaRegCalendarCheck,
  FaExclamationTriangle,
  FaClock,
  FaCalendarDay,
  FaCalendarAlt,
  FaCheckCircle,
  FaCheck,
  FaPlay,
  FaCircleNotch,
  FaFolder,
} from "react-icons/fa";

/**
 * Left-side task sidebar for the Projects dashboard.
 * Displays pending tasks with a 3-step progression workflow:
 * Step 1: To Do -> Step 2: In Progress -> Step 3: Complete.
 * When marked Completed, task is completed and removed from the pending list.
 */
const TaskSidebar = () => {
  const { t } = useTranslation();
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
      setError(e.message || t('projects.tasksWidget.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
    const handleRefresh = () => load();
    window.addEventListener("taskStatusChanged", handleRefresh);
    return () => window.removeEventListener("taskStatusChanged", handleRefresh);
  }, [load]);

  const updateTaskStatus = async (task, newStatus) => {
    try {
      setBusyId(task._id);
      await apiFetch(`/pm/my-tasks/${task._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await load();
      window.dispatchEvent(new Event("taskStatusChanged"));
    } catch (e) {
      setError(e.message || t('projects.tasksWidget.updateError'));
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
      return { label: t('memberProjects.taskSidebar.priority.high', { defaultValue: 'High' }), color: "#e11d48", bg: "#fff1f2", border: "rgba(225, 29, 72, 0.2)" };
    }
    if (priority === "MEDIUM") {
      return { label: t('memberProjects.taskSidebar.priority.medium', { defaultValue: 'Med' }), color: "#d97706", bg: "#fffbeb", border: "rgba(217, 119, 6, 0.2)" };
    }
    return { label: t('memberProjects.taskSidebar.priority.low', { defaultValue: 'Low' }), color: "#16a34a", bg: "#f0fdf4", border: "rgba(22, 163, 74, 0.2)" };
  };

  const renderTaskItem = (task) => {
    const isBusy = busyId === task._id;
    const priority = getPriorityBadge(task.priority);
    const rawStatus = (task.status || "TODO").toUpperCase();
    const isInProgress = rawStatus === "IN_PROGRESS";

    return (
      <div
        key={task._id}
        className="pending-task-card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "16px 18px",
          borderRadius: 18,
          backgroundColor: isInProgress ? "#f8fbff" : "#ffffff",
          border: isInProgress ? "1.5px solid #bae6fd" : "1px solid #f0e9fa",
          boxShadow: isInProgress
            ? "0 4px 16px rgba(2, 132, 199, 0.08)"
            : "0 2px 8px rgba(107, 82, 209, 0.04)",
          transition: "all 0.24s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isBusy ? 0.65 : 1,
        }}
      >
        {/* Top Header: Title, Tags & Priority */}
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <h4
              style={{
                margin: 0,
                fontSize: "0.92rem",
                fontWeight: 700,
                color: "#1d1545",
                lineHeight: 1.35,
                wordBreak: "break-word",
                flex: 1,
              }}
            >
              {task.title}
            </h4>

            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                color: priority.color,
                backgroundColor: priority.bg,
                border: `1px solid ${priority.border}`,
                padding: "2px 8px",
                borderRadius: 999,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                flexShrink: 0,
              }}
            >
              {priority.label}
            </span>
          </div>

          {/* Meta Info Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
              flexWrap: "wrap",
            }}
          >
            {task.dueDate && (
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#6b52d1",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: "#faf5ff",
                  border: "1px solid rgba(147, 51, 234, 0.2)",
                  padding: "3px 9px",
                  borderRadius: 8,
                }}
              >
                <FaClock style={{ fontSize: "0.7rem", color: "#9333ea" }} />
                {formatDate(task.dueDate)}
              </span>
            )}

            {task.projectName && (
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#5b45b0",
                  backgroundColor: "#f4effa",
                  padding: "3px 9px",
                  borderRadius: 8,
                  maxWidth: 150,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <FaFolder style={{ fontSize: "0.68rem", opacity: 0.8 }} />
                {task.projectName}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Step Progress Stepper (Inspired by UI Reference) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(234, 226, 248, 0.75)",
          }}
        >
          {/* Stepper Track */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            {/* Step 1: To Do */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isBusy && rawStatus !== "TODO") updateTaskStatus(task, "TODO");
              }}
              title="Set to To Do"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                cursor: isBusy ? "not-allowed" : "pointer",
                padding: 0,
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: rawStatus === "TODO" ? "#9333ea" : "#ecfdf5",
                  border: rawStatus === "TODO" ? "2.5px solid #faf5ff" : "2px solid #86efac",
                  boxShadow: rawStatus === "TODO" ? "0 0 0 3px rgba(147, 51, 234, 0.25)" : "none",
                  color: rawStatus === "TODO" ? "#ffffff" : "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  transition: "all 0.2s ease",
                }}
              >
                {rawStatus === "TODO" ? "1" : <FaCheck style={{ fontSize: "0.68rem" }} />}
              </div>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: rawStatus === "TODO" ? 800 : 600,
                  color: rawStatus === "TODO" ? "#9333ea" : "#64748b",
                }}
              >
                To Do
              </span>
            </button>

            {/* Line 1 -> 2 */}
            <div
              style={{
                flex: 1,
                height: 3,
                backgroundColor: isInProgress ? "#0284c7" : "#e2e8f0",
                margin: "0 6px",
                marginBottom: 16,
                borderRadius: 2,
                transition: "background-color 0.25s ease",
              }}
            />

            {/* Step 2: In Progress */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isBusy && !isInProgress) updateTaskStatus(task, "IN_PROGRESS");
              }}
              title="Set to In Progress"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                cursor: isBusy ? "not-allowed" : "pointer",
                padding: 0,
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: isInProgress ? "#0284c7" : "#f1f5f9",
                  border: isInProgress ? "2.5px solid #f0f9ff" : "2px solid #cbd5e1",
                  boxShadow: isInProgress ? "0 0 0 3px rgba(2, 132, 199, 0.25)" : "none",
                  color: isInProgress ? "#ffffff" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  transition: "all 0.2s ease",
                }}
              >
                {isInProgress ? (
                  <FaCircleNotch style={{ fontSize: "0.72rem", animation: "spin 2s linear infinite" }} />
                ) : (
                  "2"
                )}
              </div>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: isInProgress ? 800 : 600,
                  color: isInProgress ? "#0284c7" : "#64748b",
                }}
              >
                In Progress
              </span>
            </button>

            {/* Line 2 -> 3 */}
            <div
              style={{
                flex: 1,
                height: 3,
                backgroundColor: "#e2e8f0",
                margin: "0 6px",
                marginBottom: 16,
                borderRadius: 2,
                transition: "background-color 0.25s ease",
              }}
            />

            {/* Step 3: Complete */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isBusy) updateTaskStatus(task, "COMPLETED");
              }}
              title="Complete and remove from pending tasks"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                cursor: isBusy ? "not-allowed" : "pointer",
                padding: 0,
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: "#f1f5f9",
                  border: "2px solid #cbd5e1",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  transition: "all 0.2s ease",
                }}
              >
                3
              </div>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Complete
              </span>
            </button>
          </div>

          {/* Quick Action Button for Seamless Step Progression */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            {rawStatus === "TODO" ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isBusy) updateTaskStatus(task, "IN_PROGRESS");
                }}
                disabled={isBusy}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: "#f0f9ff",
                  color: "#0284c7",
                  border: "1px solid rgba(2, 132, 199, 0.28)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: isBusy ? "not-allowed" : "pointer",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0284c7";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f9ff";
                  e.currentTarget.style.color = "#0284c7";
                }}
              >
                {isBusy ? (
                  <FaCircleNotch style={{ animation: "spin 0.8s linear infinite" }} />
                ) : (
                  <>
                    <FaPlay style={{ fontSize: "0.65rem" }} />
                    <span>Start ➔ In Progress</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isBusy) updateTaskStatus(task, "COMPLETED");
                }}
                disabled={isBusy}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: "#f0fdf4",
                  color: "#16a34a",
                  border: "1px solid rgba(22, 163, 74, 0.3)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: isBusy ? "not-allowed" : "pointer",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#16a34a";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0fdf4";
                  e.currentTarget.style.color = "#16a34a";
                }}
              >
                {isBusy ? (
                  <FaCircleNotch style={{ animation: "spin 0.8s linear infinite" }} />
                ) : (
                  <>
                    <FaCheckCircle style={{ fontSize: "0.85rem" }} />
                    <span>Complete Task (Finish)</span>
                  </>
                )}
              </button>
            )}
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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
        borderRadius: 20,
        padding: "22px 28px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 8px 24px rgba(107, 82, 209, 0.05)",
        boxSizing: "border-box",
        alignSelf: "stretch",
      }}
    >
      {/* Pending Tasks Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 16,
          borderBottom: "1px solid #f4effa",
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
                {t('projects.tasksWidget.title')}
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
              {t('memberProjects.taskSidebar.tasksToComplete', { count: pendingTasksCount })}
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
                height: 90,
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
            t('projects.details.taskFilters.overdue'),
            data?.overdue,
            "#ef4444"
          )}
          {renderSection(
            <FaCalendarDay />,
            t('memberProjects.taskSidebar.dueToday'),
            data?.today,
            "#f59e0b"
          )}
          {renderSection(
            <FaCalendarAlt />,
            t('admin.home.panels.upcoming'),
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
                {t('memberProjects.taskSidebar.allCaughtUp')}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#5b5575" }}>
                {t('memberProjects.taskSidebar.noPendingTasks')}
              </p>
            </div>
          )}
        </>
      )}
    </aside>
  );
};

export default TaskSidebar;
