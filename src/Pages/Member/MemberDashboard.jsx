import React, { useCallback, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../SCSS/MemberStyles/MemberDashboard.scss";
import { Link } from "react-router-dom";
import ProjectsDashboardView from "../../Components/MemberProjects/ProjectsDashboardView";

import { apiFetch } from "../../utils/api";
import { getUser, logout } from "../../utils/auth";

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
  FaChartLine,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUsers,
  FaFileAlt,
  FaCog,
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    logout();
    window.location.href = "/";
  };

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "projects") {
      setActiveTab("projects");
    }
  }, []);

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
      {/* 1. LEFT VERTICAL SIDEBAR (Matching Layout & Alignment) */}
      <aside className="member-vertical-sidebar">
        {/* Top Logo */}
        <div className="sidebar-top-logo">
          <div className="logo-circle">P/T</div>
        </div>

        {/* Navigation Items (Stacked Vertically) */}
        <nav className="sidebar-nav-menu">
          <button
            className={`sidebar-nav-btn ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            <FaTachometerAlt className="nav-btn-icon" />
            <span className="nav-btn-label">Dashboard</span>
          </button>

          <button
            className={`sidebar-nav-btn ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("projects");
              setProjectFilter("all");
            }}
          >
            <FaFolder className="nav-btn-icon" />
            <span className="nav-btn-label">My Projects</span>
          </button>

          <button className="sidebar-nav-btn">
            <FaUsers className="nav-btn-icon" />
            <span className="nav-btn-label">Teams</span>
          </button>

          <button className="sidebar-nav-btn">
            <FaFileAlt className="nav-btn-icon" />
            <span className="nav-btn-label">Reports</span>
          </button>

          <button className="sidebar-nav-btn">
            <FaCalendarAlt className="nav-btn-icon" />
            <span className="nav-btn-label">Calendar</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="sidebar-bottom-menu">
          <button className="sidebar-nav-btn">
            <FaCog className="nav-btn-icon" />
            <span className="nav-btn-label">Settings</span>
          </button>
        </div>
      </aside>

      {/* 2. RIGHT MAIN CONTAINER */}
      <div className="member-main-container">
        {/* TOP HEADER BAR */}
        <header className="member-top-header">
          <div className="top-header-left">
            <div className="brand-badge">
              <FaChartLine style={{ fontSize: "1.1rem" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1d1545", letterSpacing: "-0.01em" }}>
                PTS
              </span>
              <span style={{ fontSize: "0.66rem", color: "#6b52d1", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Performance Tracker
              </span>
            </div>
          </div>

          {/* Search bar in center */}
          <div className="top-header-center">
            <div className="header-search-wrapper">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search activities, projects, and members..." />
            </div>
          </div>

          {/* Right actions: notification + profile */}
          <div className="top-header-right">
            <button className="notif-btn" aria-label="Notifications">
              <FaBell />
              <span className="notif-count">3</span>
            </button>

            <div
              className="user-profile-dropdown"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <div className="avatar-circle">
                {firstName.substring(0, 2).toUpperCase()}
              </div>
              <span className="user-display-name">{user?.name || "Member"}</span>
              <FaChevronDown className="dropdown-chevron" />

              {showUserDropdown && (
                <div
                  className="dropdown-menu-box"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    backgroundColor: "#ffffff",
                    borderRadius: 16,
                    border: "1px solid #eae2f8",
                    boxShadow: "0 10px 28px rgba(107, 82, 209, 0.15)",
                    padding: "8px",
                    zIndex: 1100,
                    minWidth: 160,
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "none",
                      backgroundColor: "#fff0f0",
                      color: "#ef4444",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="member-page-body">
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
             TAB 2: REDESIGNED PROJECTS DASHBOARD VIEW
             ========================================================================= */}
          {activeTab === "projects" && (
            <ProjectsDashboardView
              allWorkedProjects={allWorkedProjects}
              ledProjects={ledProjects}
              contributingProjects={contributingProjects}
              initialFilter={projectFilter}
            />
          )}

        </div>
      </main>
    </div>
  </div>
  );
};

export default MemberDashboard;