import React, { useCallback, useEffect, useState, useMemo } from "react";
import { FaRegCalendarCheck } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import TaskCard from "./TaskCard";
import { apiFetch } from "../../utils/api";

/**
 * The dashboard "Pending Tasks" widget.
 * Only displays active, pending, and overdue tasks that require action.
 */
const TAB_KEYS = [
  { key: "all", labelKey: "all" },
  { key: "today", labelKey: "today" },
  { key: "upcoming", labelKey: "upcoming" },
  { key: "overdue", labelKey: "overdue" },
];

const MyTasksWidget = ({ title }) => {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('projects.tasksWidget.title');
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
      setError(e.message || t('projects.tasksWidget.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      setError(e.message || t('projects.tasksWidget.updateError'));
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
          <FaRegCalendarCheck aria-hidden="true" /> {resolvedTitle}
        </h2>
        <span className="pm-count-pill">{counts.all}</span>
      </header>

      <div className="pm-tabs" role="tablist">
        {TAB_KEYS.map((tabInfo) => {
          const n = counts[tabInfo.key] ?? 0;
          return (
            <button
              key={tabInfo.key}
              role="tab"
              aria-selected={tab === tabInfo.key}
              className={`pm-tab ${tab === tabInfo.key ? "is-active" : ""} ${
                tabInfo.key === "overdue" && n > 0 ? "has-alert" : ""
              }`}
              onClick={() => setTab(tabInfo.key)}
            >
              {t(`projects.tasksWidget.tabs.${tabInfo.labelKey}`)}
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
            ? t('projects.tasksWidget.emptyOverdue')
            : tab === "today"
            ? t('projects.tasksWidget.emptyToday')
            : tab === "upcoming"
            ? t('projects.tasksWidget.emptyUpcoming')
            : t('projects.tasksWidget.emptyAll')}
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
