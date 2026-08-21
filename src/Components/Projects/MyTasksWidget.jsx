import React, { useCallback, useEffect, useState } from "react";
import { FaRegCalendarCheck } from "react-icons/fa";
import TaskCard from "./TaskCard";
import { apiFetch } from "../../utils/api";

/**
 * The dashboard "My Tasks" widget.
 *
 * Self-contained — it fetches its own data — so it can be dropped onto any
 * dashboard without that page knowing about the Projects API. The server
 * returns the buckets already sorted by nearest deadline.
 */
const TABS = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
];

const MyTasksWidget = ({ title = "My Tasks" }) => {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFetch("/pm/my-tasks");
      if (!res) return; // apiFetch already redirected on 401
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

  // Land on the tab that actually needs attention.
  useEffect(() => {
    if (!data) return;
    if (data.counts.overdue > 0) setTab("overdue");
    else if (data.counts.today > 0) setTab("today");
    else if (data.counts.upcoming > 0) setTab("upcoming");
  }, [data]);

  const changeStatus = async (task, status) => {
    try {
      setBusyId(task._id);
      const res = await apiFetch(`/pm/my-tasks/${task._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res) return;
      await load(); // re-bucket: the task has probably moved tabs
    } catch (e) {
      setError(e.message || "Could not update the task.");
    } finally {
      setBusyId(null);
    }
  };

  const list = data?.[tab] || [];

  return (
    <section className="pm-panel pm-tasks-widget">
      <header className="pm-panel-head">
        <h2>
          <FaRegCalendarCheck aria-hidden="true" /> {title}
        </h2>
      </header>

      <div className="pm-tabs" role="tablist">
        {TABS.map((t) => {
          const n = data?.counts?.[t.key] ?? 0;
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
            : tab === "completed"
            ? "No completed tasks yet."
            : "Nothing here right now."}
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
