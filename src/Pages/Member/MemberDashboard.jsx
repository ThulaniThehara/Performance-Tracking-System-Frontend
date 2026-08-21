import React, { useCallback, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../SCSS/MemberStyles/MemberDashboard.scss";
import { Link } from "react-router-dom";

import { apiFetch } from "../../utils/api";
import { getUser } from "../../utils/auth";

import {
  FaHome,
  FaFolder,
  FaCrown,
  FaMapMarkerAlt,
  FaSearch,
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
  FaBell,
  FaChevronDown,
} from "react-icons/fa";

const EVENT_TYPES = [
  { value: "EVENT", label: "Event", color: "#6b52d1" },
  { value: "SPECIAL_TASK", label: "Special Task", color: "#f59e0b" },
  { value: "MEETING", label: "Meeting", color: "#3b82f6" },
  { value: "DEADLINE", label: "Deadline", color: "#ef4444" },
];

const typeLabel = (t) => EVENT_TYPES.find((x) => x.value === t)?.label || "Event";

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const coversDay = (event, day) => {
  const target = startOfDay(day).getTime();
  const start = startOfDay(event.startDate).getTime();
  const end = event.endDate ? startOfDay(event.endDate).getTime() : start;
  return target >= start && target <= end;
};

const prettyDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const shortDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });

const MemberDashboard = () => {
  const user = getUser();
  const firstName = (user?.name || "Member").split(" ")[0];

  // Navigation tab state: 'home' | 'projects'
  const [activeTab, setActiveTab] = useState("home");
  const [projectFilter, setProjectFilter] = useState("all"); // 'all' | 'chaired' | 'contributed'

  const [ledProjects, setLedProjects] = useState([]);
  const [contributingProjects, setContributingProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [myProjectsRes, eventsRes] = await Promise.all([
        apiFetch("/pm/my-projects").catch(() => null),
        apiFetch("/event/get").catch(() => null),
      ]);

      if (myProjectsRes?.data) {
        setLedProjects(myProjectsRes.data.led || []);
        setContributingProjects(myProjectsRes.data.contributing || []);
      }

      if (eventsRes?.data) {
        setEvents(eventsRes.data);
      }
    } catch (err) {
      console.error("Error loading employee dashboard:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Combine all projects user works on
  const allWorkedProjects = useMemo(() => {
    const ledMapped = ledProjects.map((p) => ({
      ...p,
      isChairperson: true,
      role: "Chair Person",
    }));
    const contMapped = contributingProjects.map((p) => ({
      ...p,
      isChairperson: false,
      role: "Contributor",
    }));
    return [...ledMapped, ...contMapped];
  }, [ledProjects, contributingProjects]);

  const filteredProjects = useMemo(() => {
    if (projectFilter === "chaired") return allWorkedProjects.filter((p) => p.isChairperson);
    if (projectFilter === "contributed") return allWorkedProjects.filter((p) => !p.isChairperson);
    return allWorkedProjects;
  }, [allWorkedProjects, projectFilter]);

  const stats = useMemo(() => {
    const totalWorked = allWorkedProjects.length;
    const chairedCount = ledProjects.length;
    const contributingCount = contributingProjects.length;

    const ongoingCount = allWorkedProjects.filter((p) => {
      const s = (p.status || "").toLowerCase();
      return s === "ongoing" || s === "active" || s === "in progress" || !p.status;
    }).length;

    const completedCount = allWorkedProjects.filter(
      (p) => (p.status || "").toLowerCase() === "completed"
    ).length;

    return {
      totalWorked,
      chairedCount,
      ongoingCount,
      completedCount,
      contributingCount,
    };
  }, [allWorkedProjects, ledProjects, contributingProjects]);

  const eventsOnSelected = useMemo(
    () => events.filter((e) => coversDay(e, selectedDate)),
    [events, selectedDate]
  );

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    return events
      .filter((e) => startOfDay(e.endDate || e.startDate).getTime() >= today)
      .slice(0, 5);
  }, [events]);

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const hits = events.filter((e) => coversDay(e, date));
    if (!hits.length) return null;

    return (
      <span className="tile-dots">
        {hits.slice(0, 3).map((h) => (
          <i key={h._id} className={`dot ${h.type.toLowerCase()}`} />
        ))}
      </span>
    );
  };

  const ongoingPct =
    stats.totalWorked > 0
      ? Math.round((stats.ongoingCount / stats.totalWorked) * 100)
      : 0;

  return (
    <div className="member-dashboard-layout">
      {/* Sleek Modern Top Navigation Bar (NO Sidebar) */}
      <header className="member-top-navbar">
        <div className="navbar-container">
          <div className="nav-brand-section">
            <Link to="/member/dashboard" className="brand-logo">
              <span className="brand-badge">MPTS</span>
              <span className="brand-title">Portal</span>
            </Link>

            <nav className="nav-tabs-container">
              <button
                className={`nav-tab-link ${activeTab === "home" ? "active" : ""}`}
                onClick={() => setActiveTab("home")}
              >
                <FaHome className="tab-icon" /> Home
              </button>
              <button
                className={`nav-tab-link ${activeTab === "projects" ? "active" : ""}`}
                onClick={() => setActiveTab("projects")}
              >
                <FaFolder className="tab-icon" /> Projects
                <span className="tab-pill-count">{stats.totalWorked}</span>
              </button>
            </nav>
          </div>

          <div className="nav-actions-section">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search activities & projects..." />
            </div>

            <button className="notif-btn" aria-label="Notifications">
              <FaBell />
              <span className="notif-dot" />
            </button>

            <div className="user-profile-dropdown">
              <div className="avatar-circle">
                {firstName.substring(0, 2).toUpperCase()}
              </div>
              <span className="user-display-name">{user?.name || "Member"}</span>
              <FaChevronDown className="dropdown-chevron" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="employee-home-content">
        <div className="main-content-container">

          {/* =========================================================================
             TAB 1: HOME VIEW
             ========================================================================= */}
          {activeTab === "home" && (
            <>
              {/* Premium Hero Banner Section */}
              <section className="hero-banner-card">
                <div className="hero-banner-glow-bg" />
                <div className="hero-banner-content">
                  <div className="hero-banner-text">
                    <span className="hero-eyebrow">MEMBER DASHBOARD</span>
                    <h1>Welcome back, {firstName} 👋</h1>
                    <p>Track your project contributions, society events, and progress in real time.</p>
                  </div>

                  <div className="hero-banner-meta">
                    <div className="date-glass-badge">
                      <FaCalendarAlt className="icon" />
                      <span>{prettyDate(new Date())}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stat Cards Grid (3 Cards Below Banner) */}
              <div className="hero-cards-grid">
                  {/* Card 1: Total Projects Worked */}
                  <article
                    className="stat-widget-card"
                    onClick={() => {
                      setActiveTab("projects");
                      setProjectFilter("all");
                    }}
                  >
                    <div className="widget-head">
                      <span className="widget-title">Total Projects Worked</span>
                      <span className="widget-icon-bg purple">
                        <FaFolder />
                      </span>
                    </div>
                    <div className="widget-body">
                      <div className="widget-info">
                        <span className="trend-badge positive">All Participated</span>
                        <h3 className="widget-value">{stats.totalWorked}</h3>
                        <p className="widget-sub">
                          {stats.contributingCount} contributing projects
                        </p>
                      </div>
                      <div className="widget-chart">
                        <svg viewBox="0 0 100 40" className="chart-svg">
                          <rect x="10" y="14" width="8" height="26" rx="4" fill="#6b52d1" />
                          <rect x="26" y="8" width="8" height="32" rx="4" fill="#9d7bf0" />
                          <rect x="42" y="18" width="8" height="22" rx="4" fill="#6b52d1" />
                          <rect x="58" y="5" width="8" height="35" rx="4" fill="#4B2F61" />
                          <rect x="74" y="12" width="8" height="28" rx="4" fill="#9d7bf0" />
                        </svg>
                      </div>
                    </div>
                  </article>

                  {/* Card 2: Chaired Projects */}
                  <article
                    className="stat-widget-card"
                    onClick={() => {
                      setActiveTab("projects");
                      setProjectFilter("chaired");
                    }}
                  >
                    <div className="widget-head">
                      <span className="widget-title">Chaired Projects</span>
                      <span className="widget-icon-bg gold">
                        <FaCrown />
                      </span>
                    </div>
                    <div className="widget-body">
                      <div className="widget-info">
                        <span className="trend-badge gold">👑 Chairperson</span>
                        <h3 className="widget-value">{stats.chairedCount}</h3>
                        <p className="widget-sub">Projects you lead as Chairperson</p>
                      </div>
                      <div className="widget-chart">
                        <svg viewBox="0 0 100 40" className="chart-svg">
                          <circle cx="50" cy="20" r="16" fill="none" stroke="#6b52d1" strokeWidth="6" />
                          <circle cx="50" cy="20" r="16" fill="none" stroke="#ffb703" strokeWidth="6" strokeDasharray="60 100" />
                        </svg>
                      </div>
                    </div>
                  </article>

                  {/* Card 3: Ongoing Projects */}
                  <article className="stat-widget-card">
                    <div className="widget-head">
                      <span className="widget-title">Ongoing Projects</span>
                      <span className="widget-icon-bg green">
                        <FaClock />
                      </span>
                    </div>
                    <div className="widget-body">
                      <div className="widget-info">
                        <span className="trend-badge positive">Currently Active</span>
                        <h3 className="widget-value">{stats.ongoingCount}</h3>
                        <p className="widget-sub">{stats.completedCount} projects completed</p>
                      </div>
                      <div className="widget-chart">
                        <svg viewBox="0 0 120 45" className="chart-svg">
                          <path d="M 0 30 Q 20 10, 40 25 T 80 15 T 120 5 L 120 45 L 0 45 Z" fill="rgba(157, 123, 240, 0.2)" />
                          <path d="M 0 30 Q 20 10, 40 25 T 80 15 T 120 5" fill="none" stroke="#6b52d1" strokeWidth="3" />
                        </svg>
                      </div>
                    </div>
                  </article>
                </div>

              {error && <div className="home-error">{error}</div>}

              {/* Main Content Layout Grid */}
              <div className="home-main-grid">
                {/* Left Column */}
                <div className="grid-col-left">
                  {/* Project Progress */}
                  <article className="glass-panel">
                    <div className="panel-header">
                      <div>
                        <h2>Project Progress</h2>
                        <p className="panel-sub">Overall completion ratio across assigned projects</p>
                      </div>
                      <span className="percentage-display">{ongoingPct}%</span>
                    </div>

                    <div className="progress-block">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${ongoingPct}%` }}
                        />
                      </div>
                      <div className="progress-legend">
                        <span className="legend-item">
                          <i className="swatch ongoing" />
                          Ongoing <strong>{stats.ongoingCount}</strong>
                        </span>
                        <span className="legend-item">
                          <i className="swatch done" />
                          Completed <strong>{stats.completedCount}</strong>
                        </span>
                      </div>
                    </div>
                  </article>

                  {/* Upcoming Events & Deadlines */}
                  <article className="glass-panel">
                    <div className="panel-header">
                      <div>
                        <h2>Upcoming Events & Deadlines</h2>
                        <p className="panel-sub">Scheduled society meetings and project task dates</p>
                      </div>
                      <span className="badge-count">{upcoming.length}</span>
                    </div>

                    {upcoming.length === 0 ? (
                      <div className="empty-state">
                        <p>No upcoming events</p>
                        <span>Check back later for society activities and project deadlines.</span>
                      </div>
                    ) : (
                      <ul className="upcoming-events-list">
                        {upcoming.map((ev) => (
                          <li key={ev._id} className="event-item">
                            <div className="event-date-box">
                              <span className="day-number">{new Date(ev.startDate).getDate()}</span>
                              <span className="month-name">
                                {new Date(ev.startDate).toLocaleDateString(undefined, {
                                  month: "short",
                                })}
                              </span>
                            </div>
                            <div className="event-details">
                              <p className="event-title">{ev.title}</p>
                              <div className="event-meta">
                                <span className={`type-tag ${ev.type.toLowerCase()}`}>
                                  <i className={`dot ${ev.type.toLowerCase()}`} />
                                  {typeLabel(ev.type)}
                                </span>
                                {ev.location && (
                                  <span className="location-tag">
                                    <FaMapMarkerAlt /> {ev.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </div>

                {/* Right Column: Organization Calendar */}
                <div className="grid-col-right">
                  <article className="glass-panel calendar-panel">
                    <div className="panel-header">
                      <div>
                        <h2>Organization Calendar</h2>
                        <p className="panel-sub">Society calendar & events schedule</p>
                      </div>
                    </div>

                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      tileContent={tileContent}
                      prev2Label={null}
                      next2Label={null}
                    />

                    <div className="cal-legend">
                      {EVENT_TYPES.map((t) => (
                        <span key={t.value} className="legend-chip">
                          <i className={`dot ${t.value.toLowerCase()}`} />
                          {t.label}
                        </span>
                      ))}
                    </div>

                    <div className="day-detail">
                      <div className="day-detail-head">
                        <span className="selected-date-text">{shortDate(selectedDate)}</span>
                        <span className="entries-count">
                          {eventsOnSelected.length}{" "}
                          {eventsOnSelected.length === 1 ? "entry" : "entries"}
                        </span>
                      </div>

                      {eventsOnSelected.length === 0 ? (
                        <p className="day-empty">No events scheduled for this date.</p>
                      ) : (
                        <ul className="day-list">
                          {eventsOnSelected.map((ev) => (
                            <li key={ev._id} className="day-event-card">
                              <i className={`bar ${ev.type.toLowerCase()}`} />
                              <div className="day-event-info">
                                <p className="day-title">{ev.title}</p>
                                <p className="day-meta">
                                  {typeLabel(ev.type)}
                                  {ev.location && ` · ${ev.location}`}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                </div>
              </div>
            </>
          )}

          {/* =========================================================================
             TAB 2: PROJECTS VIEW (Total Projects Worked + Highlighted Chairperson)
             ========================================================================= */}
          {activeTab === "projects" && (
            <div className="member-projects-view">
              {/* Header Bar */}
              <div className="projects-header-bar">
                <div className="title-area">
                  <h2>Total Projects Worked</h2>
                  <span className="count-pill">{stats.totalWorked}</span>
                </div>

                <div className="filter-tabs">
                  <button
                    className={`filter-btn ${projectFilter === "all" ? "active" : ""}`}
                    onClick={() => setProjectFilter("all")}
                  >
                    All Projects ({allWorkedProjects.length})
                  </button>
                  <button
                    className={`filter-btn ${projectFilter === "chaired" ? "active" : ""}`}
                    onClick={() => setProjectFilter("chaired")}
                  >
                    👑 Chaired ({stats.chairedCount})
                  </button>
                  <button
                    className={`filter-btn ${projectFilter === "contributed" ? "active" : ""}`}
                    onClick={() => setProjectFilter("contributed")}
                  >
                    Contributed ({stats.contributingCount})
                  </button>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="projects-grid">
                {filteredProjects.length === 0 ? (
                  <div className="empty-projects-state">
                    <FaFolder className="empty-icon" />
                    <h3>No projects found</h3>
                    <p>There are no projects matching the selected filter.</p>
                  </div>
                ) : (
                  filteredProjects.map((p) => (
                    <Link
                      to={`/projects/${p._id}`}
                      key={p._id}
                      className={`project-card ${
                        p.isChairperson ? "is-chairperson-card" : ""
                      }`}
                    >
                      <div className="card-media">
                        <img
                          src={
                            p.image ||
                            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                          }
                          alt={p.PName}
                        />
                        <span className="status-badge">{p.status || "Ongoing"}</span>

                        {/* PROMINENT CHAIRPERSON BADGE */}
                        {p.isChairperson && (
                          <div className="chairperson-glowing-badge">
                            <FaCrown className="crown-icon" /> CHAIR PERSON
                          </div>
                        )}
                      </div>

                      <div className="card-content">
                        <h3 className="card-title">{p.PName}</h3>
                        <p className="card-desc">
                          {p.description ||
                            "Society management project activity and committee task assignments."}
                        </p>
                        <div className="card-footer">
                          <span
                            className={`role-tag ${
                              p.isChairperson ? "chair" : "member"
                            }`}
                          >
                            {p.isChairperson ? (
                              <>
                                <FaCrown /> Chair Person
                              </>
                            ) : (
                              <>
                                <FaUserCheck /> Contributor
                              </>
                            )}
                          </span>
                          <span className="btn-view">
                            View <FaArrowRight />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;