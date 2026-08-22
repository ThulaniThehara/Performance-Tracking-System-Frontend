import React, { useCallback, useEffect, useState, useMemo } from "react";
import { FaRegCalendarCheck } from "react-icons/fa";
import TaskCard from "./TaskCard";
import { apiFetch } from "../../utils/api";

/**
 * The dashboard "Pending Tasks" widget.
 * Only displays active, pending, and overdue tasks that require action.
 */
const TABS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "overdue", label: "Overdue" },
];

const MyTasksWidget = ({ title = "Pending Tasks" }) => {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("all");
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

  // If there are overdue tasks, focus on all or overdue
  const counts = useMemo(() => {
    const today = data?.counts?.today || 0;
    const upcoming = data?.counts?.upcoming || 0;
    const overdue = data?.counts?.overdue || 0;
    const all = today + upcoming + overdue;
    return { all, today, upcoming, overdue };
  }, [data]);

  const changeStatus = async (task, status) => {
    try {
      setBusyId(task._id);
      const res = await apiFetch(`/pm/my-tasks/${task._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res) return;
      await load();
    } catch (e) {
      setError(e.message || "Could not update the task.");
    } finally {
      setBusyId(null);
    }
  };

  const list = useMemo(() => {
    if (!data) return [];
    if (tab === "all") {
      return [...(data.overdue || []), ...(data.today || []), ...(data.upcoming || [])];
    }
    return data[tab] || [];
  }, [data, tab]);

  return (
    <section className="pm-panel pm-tasks-widget">
      <header className="pm-panel-head">
        <h2>
          <FaRegCalendarCheck aria-hidden="true" /> {title}
        </h2>
        <span className="pm-count-pill">{counts.all}</span>
      </header>

      <div className="pm-tabs" role="tablist">
        {TABS.map((t) => {
          const n = counts[t.key] ?? 0;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`pm-tab ${tab === t.key ? "is-active" : ""} ${
                t.key === "overdue" && n > 0 ? "has-alert" : ""
              }`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="tab-count">{n}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="pm-error">{error}</p>}

      {loading ? (
        <div className="pm-skeleton-list">
          {[1, 2].map((i) => <div key={i} className="pm-skeleton-row" />)}
        </div>
      ) : list.length === 0 ? (
        <p className="pm-empty-inline">
          {tab === "overdue"
            ? "Nothing overdue — nicely done."
            : tab === "today"
            ? "No tasks due today."
            : tab === "upcoming"
            ? "No upcoming tasks scheduled."
            : "No pending tasks — all caught up!"}
        </p>
      ) : (
        <div className="pm-task-list">
          {list.map((t) => (
            <TaskCard
              key={t._id}
              task={t}
              canEditStatus
              showContext
              busy={busyId === t._id}
              onStatusChange={changeStatus}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MyTasksWidget;
