import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../SCSS/AdminStyles/AdminHome/AdminHome.scss";

import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import { apiFetch } from "../../utils/api";
import { getUser } from "../../utils/auth";

import {
  FaProjectDiagram,
  FaSpinner,
  FaUsers,
  FaPlus,
  FaTimes,
  FaMapMarkerAlt,
  FaTrashAlt,
  FaUserPlus,
  FaLayerGroup,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";

const EVENT_TYPE_VALUES = ["EVENT", "SPECIAL_TASK", "MEETING", "DEADLINE"];

/** Calendar comparisons must ignore the time component. */
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const isSameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

/** True when `day` falls inside an event, including multi-day ranges. */
const coversDay = (event, day) => {
  const target = startOfDay(day).getTime();
  const start = startOfDay(event.startDate).getTime();
  const end = event.endDate ? startOfDay(event.endDate).getTime() : start;
  return target >= start && target <= end;
};

const toInputDate = (d) => {
  const x = new Date(d);
  // toISOString() would shift the date for anyone east/west of UTC, so build it locally.
  const pad = (n) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};

const prettyDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const shortDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });

const emptyForm = () => ({
  title: "",
  type: "EVENT",
  startDate: toInputDate(new Date()),
  endDate: "",
  location: "",
  description: "",
});

const QUICK_ACTION_DEFS = [
  { to: "/AdminAddProjects", labelKey: "admin.home.quickActions.newProject", icon: <FaPlus /> },
  { to: "/AdminAddMember", labelKey: "admin.home.quickActions.addMember", icon: <FaUserPlus /> },
  { to: "/AdminCommittees", labelKey: "shell.nav.committees", icon: <FaLayerGroup /> },
  { to: "/Reports", labelKey: "shell.nav.reports", icon: <FaChartLine /> },
];

const AdminHome = () => {
  const { t } = useTranslation();
  const typeLabel = (type) => t(`admin.home.eventTypes.${type}`, { defaultValue: t('admin.home.eventTypes.EVENT') });
  const user = getUser();
  const firstName = (user?.name || t('admin.home.defaultName')).split(" ")[0];

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [adminProjects, setAdminProjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, eventsRes, projectsRes] = await Promise.all([
        apiFetch("/admin/stats").catch(() => null),
        apiFetch("/event/get").catch(() => null),
        apiFetch("/pm/admin/projects").catch(() => null),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (eventsRes?.data) setEvents(eventsRes.data || []);
      if (projectsRes?.data) setAdminProjects(projectsRes.data || []);
    } catch (e) {
      setError(e.message || t('admin.home.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Combine society events + project deadlines for Admin
  const allCalendarEntries = useMemo(() => {
    const projectDeadlines = [];
    const seen = new Set();

    (adminProjects || []).forEach((p) => {
      const d = p.EndDate || p.endDate || p.StartDate || p.startDate;
      if (d && !seen.has(p._id || p.id)) {
        seen.add(p._id || p.id);
        const projectName = p.PName || t('admin.home.defaultProjectName');
        projectDeadlines.push({
          _id: `proj-dl-${p._id || p.id}`,
          title: `📌 ${t('admin.home.projectDeadlineTitle', { name: projectName })}`,
          type: "DEADLINE",
          startDate: d,
          endDate: d,
          location: p.society || p.department || t('admin.home.organizationProject'),
          description: t('admin.home.projectDeadlineDescription', { name: projectName }),
          isProjectDeadline: true,
          projectName: p.PName,
        });
      }
    });

    return [...events, ...projectDeadlines].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
  }, [events, adminProjects, t]);

  const eventsOnSelected = useMemo(
    () => allCalendarEntries.filter((e) => coversDay(e, selectedDate)),
    [allCalendarEntries, selectedDate]
  );

  const [activeScheduleTab, setActiveScheduleTab] = useState("ongoing");

  const ONGOING_STATUSES = useMemo(() => ["ongoing", "active", "inprogress", "progress", "started"], []);
  const normaliseStatus = (s) => String(s || "").toLowerCase().replace(/[\s_-]/g, "");

  const formatDateStr = (dateVal) => {
    if (!dateVal) return "N/A";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const ongoingProjectsList = useMemo(() => {
    return (adminProjects || []).filter((p) =>
      ONGOING_STATUSES.includes(normaliseStatus(p.status))
    );
  }, [adminProjects, ONGOING_STATUSES]);

  const upcomingItemsList = useMemo(() => {
    const today = startOfDay(new Date()).getTime();

    // 1. Projects with UPCOMING status or future start date (not yet active)
    const upcomingProjects = (adminProjects || [])
      .filter((p) => {
        const norm = normaliseStatus(p.status);
        if (norm === "upcoming" || norm === "pending" || norm === "planning") return true;
        if (!ONGOING_STATUSES.includes(norm) && p.status !== "COMPLETED") {
          const sDate = p.StartDate || p.startDate;
          return sDate && startOfDay(new Date(sDate)).getTime() > today;
        }
        return false;
      })
      .map((p) => ({
        _id: `proj-up-${p._id || p.id}`,
        title: p.PName,
        type: "PROJECT",
        startDate: p.StartDate || p.startDate,
        endDate: p.EndDate || p.endDate,
        location: p.societyName || p.society || t('admin.home.organizationProject'),
        status: "UPCOMING",
        isProject: true,
      }));

    // 2. Scheduled calendar events
    const upcomingEvents = (events || []).filter(
      (e) => startOfDay(e.endDate || e.startDate).getTime() >= today
    );

    return [...upcomingProjects, ...upcomingEvents].sort(
      (a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0)
    );
  }, [adminProjects, events, ONGOING_STATUSES, t]);

  const upcoming = upcomingItemsList.slice(0, 5);

  const onFormChange = (e) => {
    setFormError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitEvent = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setFormError(t('admin.home.errors.titleRequired'));
      return;
    }
    if (!form.startDate) {
      setFormError(t('admin.home.errors.startDateRequired'));
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const res = await apiFetch("/event/add", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          type: form.type,
          startDate: form.startDate,
          endDate: form.endDate || undefined,
          location: form.location.trim(),
          description: form.description.trim(),
        }),
      });

      if (!res) return;

      setEvents((prev) =>
        [...prev, res.data].sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        )
      );
      setSelectedDate(new Date(res.data.startDate));
      setForm(emptyForm());
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || t('admin.home.errors.saveEventFailed'));
    } finally {
      setSaving(false);
    }
  };

  const removeEvent = async (id) => {
    const previous = events;
    setEvents((prev) => prev.filter((e) => e._id !== id)); // optimistic
    try {
      await apiFetch(`/event/${id}`, { method: "DELETE" });
    } catch (err) {
      setEvents(previous); // put it back if the server refused
      setError(err.message || t('admin.home.errors.removeEventFailed'));
    }
  };

  // Marks days that carry at least one calendar entry.
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const hits = allCalendarEntries.filter((e) => coversDay(e, date));
    const nonDeadlineHits = hits.filter((e) => (e.type || "").toUpperCase() !== "DEADLINE");
    if (!nonDeadlineHits.length) return null;

    return (
      <span className="tile-dots" aria-hidden="true">
        {nonDeadlineHits.slice(0, 3).map((h) => (
          <i key={h._id} className={`dot ${(h.type || "event").toLowerCase()}`} />
        ))}
      </span>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const hits = allCalendarEntries.filter((e) => coversDay(e, date));
    const classes = [];
    if (hits.length) classes.push("has-event");
    if (hits.some((e) => (e.type || "").toUpperCase() === "DEADLINE")) {
      classes.push("has-deadline");
    }
    return classes.join(" ");
  };

  const overallProgress = useMemo(() => {
    if (stats?.overallProgress !== undefined && stats?.overallProgress !== null) {
      return stats.overallProgress;
    }
    if (!adminProjects || !adminProjects.length) return 0;

    let totalTasks = 0;
    let completedTasks = 0;
    let sumProgress = 0;

    adminProjects.forEach((p) => {
      totalTasks += p.totalTasks || 0;
      completedTasks += p.completedTasks || 0;
      sumProgress += Number(p.progress) || (p.status === "COMPLETED" ? 100 : 0);
    });

    if (totalTasks > 0) {
      return Math.round((completedTasks / totalTasks) * 100);
    }
    return Math.round(sumProgress / adminProjects.length);
  }, [stats, adminProjects]);

  const statCards = [
    {
      key: "total",
      label: "Total Projects",
      value: stats?.totalProjects ?? 0,
      foot: `${stats?.completedProjects ?? 0} completed`,
      icon: <FaProjectDiagram />,
    },
    {
      key: "ongoing",
      label: "Ongoing Projects",
      value: stats?.ongoingProjects ?? 0,
      foot: "Currently running",
      icon: <FaSpinner />,
    },
    {
      key: "members",
      label: "Society Members",
      value: stats?.totalMembers ?? 0,
      foot: `${stats?.activeMembers ?? 0} active`,
      icon: <FaUsers />,
    },
  ];

  return (
    <>
      <Header />
      <LeftNavigationBar />

      <div className="admin-home">
        <div className="home-wrapper">
          {/* ---------------- vibrant hero banner ---------------- */}
          <section className="hero-banner-card">
            <div className="hero-banner-content">
              <div className="hero-banner-text">
                <h1>{t('admin.home.hero.welcome', { name: firstName })}</h1>
                <p>{t('admin.home.hero.subtitle', { name: firstName })}</p>
              </div>

              <div className="hero-banner-actions">
                <span className="hero-banner-date">{prettyDate(new Date())}</span>
                <button
                  className="hero-banner-btn"
                  onClick={() => {
                    setForm({ ...emptyForm(), startDate: toInputDate(selectedDate) });
                    setShowForm(true);
                  }}
                >
                  <FaPlus /> {t('admin.home.hero.newEvent')}
                </button>
              </div>
            </div>

            {/* ---------------- floating stat cards grid ---------------- */}
            <div className="hero-cards-grid">
              {/* Card 1: Ongoing Projects */}
              <article className="stat-widget-card">
                <div className="widget-head">
                  <span className="widget-title">
                    {t('admin.home.widgets.ongoingProjects', { defaultValue: 'Ongoing Projects' })}
                  </span>
                  <span className="widget-dots">•••</span>
                </div>
                <div className="widget-body">
                  <div className="widget-info">
                    <span className="trend-badge positive">↗ In Progress</span>
                    <h3 className="widget-value">
                      {loading ? <span className="skeleton" /> : (stats?.ongoingProjects ?? 0)}
                    </h3>
                    <p className="widget-sub">
                      {t('admin.home.widgets.ongoingProjectsSub', { defaultValue: 'Active projects currently in progress' })}
                    </p>
                  </div>
                  <div className="widget-chart bar-chart">
                    <svg viewBox="0 0 100 40" className="chart-svg">
                      <rect x="4" y="14" width="6" height="26" rx="3" fill="#744B93" />
                      <rect x="15" y="8" width="6" height="32" rx="3" fill="#9A6EBE" />
                      <rect x="26" y="18" width="6" height="22" rx="3" fill="#744B93" />
                      <rect x="37" y="5" width="6" height="35" rx="3" fill="#4B2F61" />
                      <rect x="48" y="12" width="6" height="28" rx="3" fill="#744B93" />
                      <rect x="59" y="19" width="6" height="21" rx="3" fill="#9A6EBE" />
                      <rect x="70" y="4" width="6" height="36" rx="3" fill="#4B2F61" />
                      <rect x="81" y="10" width="6" height="30" rx="3" fill="#744B93" />
                    </svg>
                  </div>
                </div>
              </article>

              {/* Card 2: Total Projects Completed */}
              <article className="stat-widget-card">
                <div className="widget-head">
                  <span className="widget-title">
                    {t('admin.home.widgets.completedProjects', { defaultValue: 'Total Projects Completed' })}
                  </span>
                  <span className="widget-dots">•••</span>
                </div>
                <div className="widget-body">
                  <div className="widget-info">
                    <span className="trend-badge positive">✓ Finished</span>
                    <h3 className="widget-value">
                      {loading ? <span className="skeleton" /> : (stats?.completedProjects ?? 0)}
                    </h3>
                    <p className="widget-sub">
                      {t('admin.home.widgets.completedProjectsSub', {
                        pct: stats?.totalProjects ? Math.round(((stats.completedProjects ?? 0) / stats.totalProjects) * 100) : 0,
                        total: stats?.totalProjects ?? 0,
                        defaultValue: `${stats?.totalProjects ? Math.round(((stats.completedProjects ?? 0) / stats.totalProjects) * 100) : 0}% completion rate (${stats?.totalProjects ?? 0} total)`
                      })}
                    </p>
                  </div>
                  <div className="widget-chart bar-chart">
                    <svg viewBox="0 0 100 40" className="chart-svg">
                      <rect x="10" y="24" width="7" height="16" rx="3" fill="#EAE2F8" />
                      <rect x="25" y="18" width="7" height="22" rx="3" fill="#9A6EBE" />
                      <rect x="40" y="12" width="7" height="28" rx="3" fill="#744B93" />
                      <rect x="55" y="8" width="7" height="32" rx="3" fill="#6B52D1" />
                      <rect x="70" y="3" width="7" height="37" rx="3" fill="#4B2F61" />
                    </svg>
                  </div>
                </div>
              </article>

              {/* Card 3: Total Membership */}
              <article className="stat-widget-card">
                <div className="widget-head">
                  <span className="widget-title">
                    {t('admin.home.widgets.totalMembership', { defaultValue: 'Total Membership' })}
                  </span>
                  <span className="widget-dots">•••</span>
                </div>
                <div className="widget-body">
                  <div className="widget-info">
                    <span className="trend-badge positive">👥 Members</span>
                    <h3 className="widget-value">
                      {loading ? <span className="skeleton" /> : (stats?.totalMembers ?? 0)}
                    </h3>
                    <p className="widget-sub">
                      {t('admin.home.widgets.totalMembershipSub', {
                        count: stats?.activeMembers ?? 0,
                        defaultValue: `${stats?.activeMembers ?? 0} active members registered`
                      })}
                    </p>
                  </div>
                  <div className="widget-chart area-chart">
                    <svg viewBox="0 0 120 45" className="chart-svg">
                      <defs>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9A6EBE" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#9A6EBE" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 32 Q 15 12, 30 26 T 60 16 T 90 30 T 120 10 L 120 45 L 0 45 Z" fill="url(#purpleGradient)" />
                      <path d="M 0 32 Q 15 12, 30 26 T 60 16 T 90 30 T 120 10" fill="none" stroke="#744B93" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {error && <div className="home-error">{error}</div>}

          {/* ---------------- two-column body ---------------- */}
          <div className="home-grid">
            {/* ---- LEFT ---- */}
            <section className="home-left">
              <article className="panel">
                <div className="panel-head">
                  <h2>{t('admin.home.panels.projectProgress')}</h2>
                  {stats?.totalProjects > 0 && (
                    <span className="panel-figure">{overallProgress}%</span>
                  )}
                </div>

                {stats && stats.totalProjects > 0 ? (
                  <div className="progress-block">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                    <div className="progress-legend">
                      <span>
                        <i className="swatch ongoing" aria-hidden="true" />
                        {t('admin.home.progressLegend.ongoing')} <strong>{stats.ongoingProjects}</strong>
                      </span>
                      <span>
                        <i className="swatch done" aria-hidden="true" />
                        {t('admin.home.progressLegend.completed')} <strong>{stats.completedProjects}</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>{t('admin.home.emptyProjects.title')}</p>
                    <span>
                      {t('admin.home.emptyProjects.body')}
                    </span>
                    <Link to="/AdminAddProjects" className="empty-link">
                      {t('admin.home.emptyProjects.cta')} <FaArrowRight />
                    </Link>
                  </div>
                )}
              </article>

              <article className="panel">
                <div className="panel-head">
                  <h2>{t('admin.home.panels.quickActions')}</h2>
                </div>
                <nav className="action-grid">
                  {QUICK_ACTION_DEFS.map((a) => (
                    <Link key={a.to} to={a.to} className="action-tile">
                      <span className="action-icon">{a.icon}</span>
                      <span className="action-label">{t(a.labelKey)}</span>
                    </Link>
                  ))}
                </nav>
              </article>

              <article className="panel project-schedule-panel">
                <div className="schedule-panel-head">
                  <div className="schedule-tabs-bar">
                    <button
                      type="button"
                      className={`schedule-tab-btn ${activeScheduleTab === "ongoing" ? "active" : ""}`}
                      onClick={() => setActiveScheduleTab("ongoing")}
                    >
                      <span className="tab-dot active-dot" />
                      <span>Ongoing (Active)</span>
                      <span className="schedule-pill">{ongoingProjectsList.length}</span>
                    </button>
                    <button
                      type="button"
                      className={`schedule-tab-btn ${activeScheduleTab === "upcoming" ? "active" : ""}`}
                      onClick={() => setActiveScheduleTab("upcoming")}
                    >
                      <span className="tab-dot upcoming-dot" />
                      <span>Upcoming</span>
                      <span className="schedule-pill">{upcomingItemsList.length}</span>
                    </button>
                  </div>
                </div>

                {activeScheduleTab === "ongoing" ? (
                  ongoingProjectsList.length === 0 ? (
                    <div className="empty-state">
                      <p>No Active Projects</p>
                      <span>There are currently no projects marked as active or ongoing.</span>
                    </div>
                  ) : (
                    <ul className="ongoing-projects-list">
                      {ongoingProjectsList.map((p) => (
                        <li key={p._id || p.id} className="ongoing-project-item">
                          <div className="ongoing-proj-header">
                            <div className="ongoing-proj-info">
                              <h4 className="ongoing-proj-title">{p.PName}</h4>
                              <span className="ongoing-proj-society">{p.societyName || p.department || t('admin.home.organizationProject')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                              <span className="ongoing-status-badge">Active</span>
                              <Link to={`/projects/${p._id || p.id}`} className="pm-btn pm-btn-ghost pm-btn-xs" style={{ textDecoration: 'none' }}>
                                {t('projects.card.manage')} <FaArrowRight aria-hidden="true" />
                              </Link>
                            </div>
                          </div>

                          <div className="ongoing-dates-row">
                            <div className="date-block started-date">
                              <span className="date-label">📅 Started Date</span>
                              <span className="date-value">{formatDateStr(p.StartDate || p.startDate)}</span>
                            </div>
                            <div className="date-block end-date">
                              <span className="date-label">🎯 End Date</span>
                              <span className="date-value">{p.EndDate || p.endDate ? formatDateStr(p.EndDate || p.endDate) : 'No Deadline'}</span>
                            </div>
                          </div>

                          {p.progress !== undefined && (
                            <div className="ongoing-proj-progress">
                              <div className="progress-bar-sm">
                                <div className="progress-fill-sm" style={{ width: `${p.progress || 0}%` }} />
                              </div>
                              <span className="progress-text-sm">{p.progress || 0}%</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  upcomingItemsList.length === 0 ? (
                    <div className="empty-state">
                      <p>{t('admin.home.emptyUpcoming.title')}</p>
                      <span>{t('admin.home.emptyUpcoming.body')}</span>
                    </div>
                  ) : (
                    <ul className="upcoming-list">
                      {upcomingItemsList.map((ev) => (
                        <li key={ev._id}>
                          <span className="up-date">
                            <b>{new Date(ev.startDate).getDate()}</b>
                            {new Date(ev.startDate).toLocaleDateString(undefined, {
                              month: "short",
                            })}
                          </span>
                          <div className="up-body">
                            <p className="up-title">{ev.title}</p>
                            <p className="up-meta">
                              <i className={`dot ${(ev.type || "event").toLowerCase()}`} />
                              {typeLabel(ev.type || "event")}
                              {ev.location && <> · {ev.location}</>}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </article>
            </section>

            {/* ---- RIGHT : calendar ---- */}
            <section className="home-right">
              <article className="panel calendar-panel">
                <div className="panel-head">
                  <h2>{t('admin.home.panels.organizationCalendar')}</h2>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setForm({
                        ...emptyForm(),
                        startDate: toInputDate(selectedDate),
                      });
                      setShowForm(true);
                    }}
                  >
                    <FaPlus /> {t('admin.home.calendarAdd')}
                  </button>
                </div>

                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileContent={tileContent}
                  tileClassName={tileClassName}
                  prev2Label={null}
                  next2Label={null}
                />

                {/* Shapes carry the meaning; the legend makes them readable. */}
                <div className="cal-legend">
                  {EVENT_TYPE_VALUES.map((typeValue) => (
                    <span key={typeValue}>
                      <i className={`dot ${typeValue.toLowerCase()}`} aria-hidden="true" />
                      {typeLabel(typeValue)}
                    </span>
                  ))}
                </div>

                <div className="day-detail">
                  <p className="day-detail-head">
                    {isSameDay(selectedDate, new Date())
                      ? t('admin.home.today')
                      : shortDate(selectedDate)}
                    <span>
                      {t('admin.home.entries', { count: eventsOnSelected.length })}
                    </span>
                  </p>

                  {eventsOnSelected.length === 0 ? (
                    <p className="day-empty">{t('admin.home.noEntries')}</p>
                  ) : (
                    <ul className="day-list">
                      {eventsOnSelected.map((ev) => (
                        <li key={ev._id}>
                          <i className={`bar ${ev.type.toLowerCase()}`} />
                          <div className="day-body">
                            <p className="day-title">{ev.title}</p>
                            <p className="day-meta">
                              {typeLabel(ev.type)}
                              {ev.location && (
                                <>
                                  {" · "}
                                  <FaMapMarkerAlt /> {ev.location}
                                </>
                              )}
                            </p>
                            {ev.description && (
                              <p className="day-desc">{ev.description}</p>
                            )}
                          </div>
                          <button
                            className="btn-icon"
                            title={t('admin.home.remove')}
                            onClick={() => removeEvent(ev._id)}
                          >
                            <FaTrashAlt />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            </section>
          </div>
        </div>
      </div>

      {/* ---------------- add-event modal ---------------- */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{t('admin.home.modal.addTitle')}</h3>
              <button className="btn-icon" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={submitEvent} className="modal-form">
              <label>
                {t('admin.home.modal.titleLabel')}
                <input
                  name="title"
                  value={form.title}
                  onChange={onFormChange}
                  placeholder={t('admin.home.modal.titlePlaceholder')}
                />
              </label>

              <label>
                {t('admin.home.modal.typeLabel')}
                <select name="type" value={form.type} onChange={onFormChange}>
                  {EVENT_TYPE_VALUES.map((typeValue) => (
                    <option key={typeValue} value={typeValue}>
                      {typeLabel(typeValue)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="row-2">
                <label>
                  <span>{t('admin.home.modal.startDateLabel')}</span>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={onFormChange}
                  />
                </label>
                <label>
                  <span>{t('admin.home.modal.endDateLabel')} <span className="opt">{t('admin.home.modal.optional')}</span></span>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={onFormChange}
                  />
                </label>
              </div>

              <label>
                {t('admin.home.modal.locationLabel')} <span className="opt">{t('admin.home.modal.optional')}</span>
                <input
                  name="location"
                  value={form.location}
                  onChange={onFormChange}
                  placeholder={t('admin.home.modal.locationPlaceholder')}
                />
              </label>

              <label>
                {t('admin.home.modal.descriptionLabel')} <span className="opt">{t('admin.home.modal.optional')}</span>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={onFormChange}
                  placeholder={t('admin.home.modal.descriptionPlaceholder')}
                />
              </label>

              {formError && <p className="form-error">{formError}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowForm(false)}
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t('admin.home.modal.saving') : t('admin.home.modal.addEvent')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHome;
