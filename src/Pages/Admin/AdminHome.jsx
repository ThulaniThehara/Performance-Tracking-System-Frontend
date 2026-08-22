import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

const EVENT_TYPES = [
  { value: "EVENT", label: "Event" },
  { value: "SPECIAL_TASK", label: "Special Task" },
  { value: "MEETING", label: "Meeting" },
  { value: "DEADLINE", label: "Deadline" },
];

const typeLabel = (t) => EVENT_TYPES.find((x) => x.value === t)?.label || "Event";

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

const QUICK_ACTIONS = [
  { to: "/AdminAddProjects", label: "New Project", icon: <FaPlus /> },
  { to: "/AdminAddMember", label: "Add Member", icon: <FaUserPlus /> },
  { to: "/AdminCommittees", label: "Committees", icon: <FaLayerGroup /> },
  { to: "/Reports", label: "Reports", icon: <FaChartLine /> },
];

const AdminHome = () => {
  const user = getUser();
  const firstName = (user?.name || "Admin").split(" ")[0];

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
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

      const [statsRes, eventsRes] = await Promise.all([
        apiFetch("/admin/stats"),
        apiFetch("/event/get"),
      ]);

      // apiFetch returns undefined after it force-logs-out on a 401.
      if (!statsRes || !eventsRes) return;

      setStats(statsRes.data);
      setEvents(eventsRes.data || []);
    } catch (e) {
      setError(e.message || "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const eventsOnSelected = useMemo(
    () => events.filter((e) => coversDay(e, selectedDate)),
    [events, selectedDate]
  );

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    return events
      .filter((e) => startOfDay(e.endDate || e.startDate).getTime() >= today)
      .slice(0, 4);
  }, [events]);

  const onFormChange = (e) => {
    setFormError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitEvent = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setFormError("Please give the event a title.");
      return;
    }
    if (!form.startDate) {
      setFormError("Please pick a start date.");
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
      setFormError(err.message || "Could not save the event.");
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
      setError(err.message || "Could not remove the event.");
    }
  };

  // Marks days that carry at least one calendar entry.
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const hits = events.filter((e) => coversDay(e, date));
    if (!hits.length) return null;

    return (
      <>
        <span className="tile-dots" aria-hidden="true">
          {hits.slice(0, 3).map((h) => (
            <i key={h._id} className={`dot ${h.type.toLowerCase()}`} />
          ))}
        </span>
        {/* The markers are visual only, so name them for screen readers. */}
        <span className="sr-only">
          {hits.length} {hits.length === 1 ? "entry" : "entries"}
        </span>
      </>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    return events.some((e) => coversDay(e, date)) ? "has-event" : null;
  };

  const ongoingPct =
    stats && stats.totalProjects > 0
      ? Math.round((stats.ongoingProjects / stats.totalProjects) * 100)
      : 0;

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
                <h1>Welcome back, {firstName}</h1>
                <p>Hi {firstName}, this is your performance tracking dashboard.</p>
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
                  <FaPlus /> New Event
                </button>
              </div>
            </div>

            {/* ---------------- floating stat cards grid ---------------- */}
            <div className="hero-cards-grid">
              {/* Card 1: Daily Activity */}
              <article className="stat-widget-card">
                <div className="widget-head">
                  <span className="widget-title">Daily Activity</span>
                  <span className="widget-dots">•••</span>
                </div>
                <div className="widget-body">
                  <div className="widget-info">
                    <span className="trend-badge positive">↗ +3.49%</span>
                    <h3 className="widget-value">
                      {loading ? <span className="skeleton" /> : (stats?.totalProjects ?? 0)}
                    </h3>
                    <p className="widget-sub">Total Projects ({stats?.completedProjects ?? 0} completed)</p>
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

              {/* Card 2: Completion Statistics Donut */}
              <article className="stat-widget-card Donut-card">
                <div className="widget-head">
                  <span className="widget-title">Statistics</span>
                  <span className="widget-dots">•••</span>
                </div>
                <div className="donut-widget-content">
                  <div className="donut-legend-row">
                    <span><i className="dot-swatch primary" /> Ongoing</span>
                    <span><i className="dot-swatch secondary" /> Active</span>
                    <span><i className="dot-swatch tertiary" /> Done</span>
                  </div>
                  <div className="donut-ring-box">
                    <svg viewBox="0 0 130 130" className="donut-svg">
                      <circle cx="65" cy="65" r="50" stroke="#F3EFF8" strokeWidth="8" fill="none" />
                      <circle cx="65" cy="65" r="50" stroke="#4B2F61" strokeWidth="8" fill="none" strokeDasharray="314" strokeDashoffset="75" strokeLinecap="round" transform="rotate(-90 65 65)" />

                      <circle cx="65" cy="65" r="38" stroke="#F3EFF8" strokeWidth="8" fill="none" />
                      <circle cx="65" cy="65" r="38" stroke="#744B93" strokeWidth="8" fill="none" strokeDasharray="238" strokeDashoffset="60" strokeLinecap="round" transform="rotate(-90 65 65)" />

                      <circle cx="65" cy="65" r="26" stroke="#F3EFF8" strokeWidth="8" fill="none" />
                      <circle cx="65" cy="65" r="26" stroke="#9A6EBE" strokeWidth="8" fill="none" strokeDasharray="163" strokeDashoffset="35" strokeLinecap="round" transform="rotate(-90 65 65)" />
                    </svg>
                  </div>
                </div>
              </article>

              {/* Card 3: Performance Rate Sparkline */}
              <article className="stat-widget-card">
                <div className="widget-head">
                  <span className="widget-title">Performance Rate</span>
                  <span className="widget-dots">•••</span>
                </div>
                <div className="widget-body">
                  <div className="widget-info">
                    <span className="trend-badge positive">↗ +3.49%</span>
                    <h3 className="widget-value">
                      {loading ? <span className="skeleton" /> : (stats?.ongoingProjects ?? 0)}
                    </h3>
                    <p className="widget-sub">Ongoing Projects ({stats?.activeMembers ?? 0} members active)</p>
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
                  <h2>Project Progress</h2>
                  {stats?.totalProjects > 0 && (
                    <span className="panel-figure">{ongoingPct}%</span>
                  )}
                </div>

                {stats && stats.totalProjects > 0 ? (
                  <div className="progress-block">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${ongoingPct}%` }}
                      />
                    </div>
                    <div className="progress-legend">
                      <span>
                        <i className="swatch ongoing" aria-hidden="true" />
                        Ongoing <strong>{stats.ongoingProjects}</strong>
                      </span>
                      <span>
                        <i className="swatch done" aria-hidden="true" />
                        Completed <strong>{stats.completedProjects}</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No projects yet</p>
                    <span>
                      Create your first project and these figures update
                      automatically.
                    </span>
                    <Link to="/AdminAddProjects" className="empty-link">
                      Add a project <FaArrowRight />
                    </Link>
                  </div>
                )}
              </article>

              <article className="panel">
                <div className="panel-head">
                  <h2>Quick Actions</h2>
                </div>
                <nav className="action-grid">
                  {QUICK_ACTIONS.map((a) => (
                    <Link key={a.to} to={a.to} className="action-tile">
                      <span className="action-icon">{a.icon}</span>
                      <span className="action-label">{a.label}</span>
                    </Link>
                  ))}
                </nav>
              </article>

              <article className="panel">
                <div className="panel-head">
                  <h2>Upcoming</h2>
                  <span className="pill">{upcoming.length}</span>
                </div>

                {upcoming.length === 0 ? (
                  <div className="empty-state">
                    <p>Nothing scheduled</p>
                    <span>Add an event and it will appear here and on the calendar.</span>
                  </div>
                ) : (
                  <ul className="upcoming-list">
                    {upcoming.map((ev) => (
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
                            <i className={`dot ${ev.type.toLowerCase()}`} />
                            {typeLabel(ev.type)}
                            {ev.location && <> · {ev.location}</>}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </section>

            {/* ---- RIGHT : calendar ---- */}
            <section className="home-right">
              <article className="panel calendar-panel">
                <div className="panel-head">
                  <h2>Organization Calendar</h2>
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
                    <FaPlus /> Add
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
                  {EVENT_TYPES.map((t) => (
                    <span key={t.value}>
                      <i className={`dot ${t.value.toLowerCase()}`} aria-hidden="true" />
                      {t.label}
                    </span>
                  ))}
                </div>

                <div className="day-detail">
                  <p className="day-detail-head">
                    {isSameDay(selectedDate, new Date())
                      ? "Today"
                      : shortDate(selectedDate)}
                    <span>
                      {eventsOnSelected.length}{" "}
                      {eventsOnSelected.length === 1 ? "entry" : "entries"}
                    </span>
                  </p>

                  {eventsOnSelected.length === 0 ? (
                    <p className="day-empty">No entries for this day.</p>
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
                            title="Remove"
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
              <h3>Add to Calendar</h3>
              <button className="btn-icon" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={submitEvent} className="modal-form">
              <label>
                Title
                <input
                  name="title"
                  value={form.title}
                  onChange={onFormChange}
                  placeholder="e.g. Annual General Meeting"
                />
              </label>

              <label>
                Type
                <select name="type" value={form.type} onChange={onFormChange}>
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="row-2">
                <label>
                  <span>Start date</span>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={onFormChange}
                  />
                </label>
                <label>
                  <span>End date <span className="opt">optional</span></span>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={onFormChange}
                  />
                </label>
              </div>

              <label>
                Location <span className="opt">optional</span>
                <input
                  name="location"
                  value={form.location}
                  onChange={onFormChange}
                  placeholder="e.g. Sumanadasa Auditorium"
                />
              </label>

              <label>
                Description <span className="opt">optional</span>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={onFormChange}
                  placeholder="Any details members should know"
                />
              </label>

              {formError && <p className="form-error">{formError}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Add Event"}
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
