import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../SCSS/MemberStyles/MemberDashboard.scss";
import { Link } from "react-router-dom";
import ProjectsDashboardView from "../../Components/MemberProjects/ProjectsDashboardView";
import SettingComponent from "../../Components/SettingsComponent/SettingComponent";
import MemberFeedback from "../../Components/MemberFeedback/MemberFeedback";

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
  FaCalendarCheck,
  FaPlus,
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
  FaCommentDots,
} from "react-icons/fa";

const EVENT_TYPE_VALUES = ["EVENT", "SPECIAL_TASK", "MEETING", "DEADLINE"];

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
  const { t } = useTranslation();
  const typeLabel = (type) => t(`admin.home.eventTypes.${type}`, { defaultValue: t('admin.home.eventTypes.EVENT') });
  const user = getUser();
  const firstName = (user?.name || t('shell.memberHeader.defaultName')).split(" ")[0];

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
      setError(t('member.dashboard.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "projects" || tab === "settings" || tab === "home" || tab === "feedback") {
      setActiveTab(tab);
    }
  }, []);

  // Combine all projects user works on
  const allWorkedProjects = useMemo(() => {
    const ledMapped = ledProjects.map((p) => ({
      ...p,
      isChairperson: true,
      role: t('member.dashboard.roles.chairPerson'),
    }));
    const contMapped = contributingProjects.map((p) => ({
      ...p,
      isChairperson: false,
      role: t('member.dashboard.roles.contributor'),
    }));
    return [...ledMapped, ...contMapped];
  }, [ledProjects, contributingProjects, t]);

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

  // Combine society events + project deadlines automatically
  const allCalendarEntries = useMemo(() => {
    const projectDeadlines = [];
    const seen = new Set();

    allWorkedProjects.forEach((p) => {
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
          location: p.society || p.department || (p.isChairperson ? t('member.dashboard.deadline.chairedLocation') : t('member.dashboard.deadline.memberLocation')),
          isProjectDeadline: true,
          projectName: p.PName,
        });
      }
    });

    return [...events, ...projectDeadlines].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
  }, [events, allWorkedProjects, t]);

  const eventsOnSelected = useMemo(
    () => allCalendarEntries.filter((e) => coversDay(e, selectedDate)),
    [allCalendarEntries, selectedDate]
  );

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    return allCalendarEntries
      .filter((e) => startOfDay(e.endDate || e.startDate).getTime() >= today)
      .slice(0, 5);
  }, [allCalendarEntries]);

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const hits = allCalendarEntries.filter((e) => coversDay(e, date));
    const nonDeadlineHits = hits.filter((e) => (e.type || "").toUpperCase() !== "DEADLINE");
    if (!nonDeadlineHits.length) return null;

    return (
      <span className="tile-dots">
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
            <span className="nav-btn-label">{t('shell.nav.dashboard')}</span>
          </button>

          <button
            className={`sidebar-nav-btn ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("projects");
              setProjectFilter("all");
            }}
          >
            <FaFolder className="nav-btn-icon" />
            <span className="nav-btn-label">{t('shell.nav.myProjects')}</span>
          </button>

          <button
            className={`sidebar-nav-btn ${activeTab === "feedback" ? "active" : ""}`}
            onClick={() => setActiveTab("feedback")}
          >
            <FaCommentDots className="nav-btn-icon" />
            <span className="nav-btn-label">Feedback / Issues</span>
          </button>

          <button
            className={`sidebar-nav-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <FaCog className="nav-btn-icon" />
            <span className="nav-btn-label">{t('shell.nav.settings')}</span>
          </button>
        </nav>
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
              <input type="text" placeholder={t('shell.memberHeader.searchPlaceholder')} />
            </div>
          </div>

          {/* Right actions: notification + profile */}
          <div className="top-header-right">
            <button className="notif-btn" aria-label={t('shell.header.notifications')}>
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
              <span className="user-display-name">{user?.name || t('shell.memberHeader.defaultName')}</span>
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
                    <FaSignOutAlt /> {t('shell.logout')}
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
                    <span className="hero-eyebrow">{t('member.dashboard.hero.eyebrow')}</span>
                    <h1>{t('member.dashboard.hero.welcome', { name: firstName })}</h1>
                    <p>{t('member.dashboard.hero.subtitle')}</p>
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
                      <span className="widget-title">{t('member.dashboard.stats.totalWorkedTitle')}</span>
                      <span className="widget-icon-bg purple">
                        <FaFolder />
                      </span>
                    </div>
                    <div className="widget-body">
                      <div className="widget-info">
                        <span className="trend-badge positive">{t('member.dashboard.stats.allParticipated')}</span>
                        <h3 className="widget-value">{stats.totalWorked}</h3>
                        <p className="widget-sub">
                          {t('member.dashboard.stats.contributingSub', { count: stats.contributingCount })}
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
                      <span className="widget-title">{t('member.dashboard.stats.chairedTitle')}</span>
                      <span className="widget-icon-bg gold">
                        <FaCrown />
                      </span>
                    </div>
                    <div className="widget-body">
                      <div className="widget-info">
                        <span className="trend-badge gold">{t('member.dashboard.stats.chairpersonBadge')}</span>
                        <h3 className="widget-value">{stats.chairedCount}</h3>
                        <p className="widget-sub">{t('member.dashboard.stats.chairedSub')}</p>
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
                      <span className="widget-title">{t('member.dashboard.stats.ongoingTitle')}</span>
                      <span className="widget-icon-bg green">
                        <FaClock />
                      </span>
                    </div>
                    <div className="widget-body">
                      <div className="widget-info">
                        <span className="trend-badge positive">{t('member.dashboard.stats.currentlyActive')}</span>
                        <h3 className="widget-value">{stats.ongoingCount}</h3>
                        <p className="widget-sub">{t('member.dashboard.stats.completedSub', { count: stats.completedCount })}</p>
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
                        <h2>{t('member.dashboard.progressPanel.title')}</h2>
                        <p className="panel-sub">{t('member.dashboard.progressPanel.subtitle')}</p>
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
                          {t('admin.home.progressLegend.ongoing')} <strong>{stats.ongoingCount}</strong>
                        </span>
                        <span className="legend-item">
                          <i className="swatch done" />
                          {t('admin.home.progressLegend.completed')} <strong>{stats.completedCount}</strong>
                        </span>
                      </div>
                    </div>
                  </article>

                  {/* Upcoming Events & Deadlines */}
                  <article className="glass-panel upcoming-panel-card">
                    <div className="panel-header">
                      <div className="header-title-wrapper">
                        <div className="widget-icon-circle purple">
                          <FaCalendarAlt />
                        </div>
                        <div>
                          <h2>{t('member.dashboard.upcomingPanel.title')}</h2>
                          <p className="panel-sub">{t('member.dashboard.upcomingPanel.subtitle')}</p>
                        </div>
                      </div>
                      <span className="badge-count">{upcoming.length}</span>
                    </div>

                    {upcoming.length === 0 ? (
                      <div className="modern-empty-state">
                        <div className="empty-icon-badge">
                          <FaCalendarCheck />
                        </div>
                        <h4>{t('member.dashboard.upcomingPanel.emptyTitle')}</h4>
                        <p>{t('member.dashboard.upcomingPanel.emptyBody')}</p>
                      </div>
                    ) : (
                      <div className="upcoming-events-grid">
                        {upcoming.map((ev) => {
                          const evDate = new Date(ev.startDate);
                          const dayNum = evDate.getDate();
                          const monthShort = evDate.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
                          return (
                            <div key={ev._id} className="modern-event-card">
                              <div className="event-date-pill">
                                <span className="date-num">{dayNum}</span>
                                <span className="date-month">{monthShort}</span>
                              </div>
                              <div className="event-info">
                                <h4 className="event-name">{ev.title}</h4>
                                <div className="event-tags-row">
                                  <span className={`event-type-pill ${(ev.type || "event").toLowerCase()}`}>
                                    <i className={`dot ${(ev.type || "event").toLowerCase()}`} />
                                    {typeLabel(ev.type)}
                                  </span>
                                  {ev.location && (
                                    <span className="event-location-pill">
                                      <FaMapMarkerAlt /> {ev.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                </div>

                {/* Right Column: Organization Calendar */}
                <div className="grid-col-right">
                  <article className="glass-panel calendar-panel modern-cal-panel">
                    {/* Top Display matching Image 3 */}
                    <div className="cal-header-card">
                      <div className="cal-date-display">
                        <span className="cal-big-day">{selectedDate.getDate()}</span>
                        <div className="cal-month-year-group">
                          <span className="cal-month-name">
                            {selectedDate.toLocaleDateString(undefined, { month: "long" })}
                          </span>
                          <span className="cal-year-num">{selectedDate.getFullYear()}</span>
                        </div>
                      </div>
                      <div className="cal-icon-badge">
                        <FaCalendarAlt />
                      </div>
                    </div>

                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      tileContent={tileContent}
                      tileClassName={tileClassName}
                      prev2Label={null}
                      next2Label={null}
                    />

                    <div className="cal-legend">
                      {EVENT_TYPE_VALUES.map((typeValue) => (
                        <span key={typeValue} className="legend-chip">
                          <i className={`dot ${typeValue.toLowerCase()}`} />
                          {typeLabel(typeValue)}
                        </span>
                      ))}
                    </div>

                    <div className="day-detail">
                      <div className="day-detail-head">
                        <span className="selected-date-text">{shortDate(selectedDate)}</span>
                        <span className="entries-count">
                          {t('admin.home.entries', { count: eventsOnSelected.length })}
                        </span>
                      </div>

                      {eventsOnSelected.length === 0 ? (
                        <p className="day-empty">{t('member.dashboard.calendar.noEventsForDate')}</p>
                      ) : (
                        <ul className="day-list">
                          {eventsOnSelected.map((ev) => (
                            <li key={ev._id} className="day-event-card">
                              <i className={`bar ${(ev.type || "event").toLowerCase()}`} />
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

          {/* =========================================================================
             TAB 3: SETTINGS VIEW
             ========================================================================= */}
          {activeTab === "settings" && (
            <div className="member-settings-view" style={{ width: '100%', marginTop: '8px' }}>
              <SettingComponent isEmbedded={true} />
            </div>
          )}

          {/* =========================================================================
             TAB 4: FEEDBACK & COMPLAINTS VIEW
             ========================================================================= */}
          {activeTab === "feedback" && (
            <div className="member-feedback-view" style={{ width: '100%', marginTop: '8px' }}>
              <MemberFeedback allWorkedProjects={allWorkedProjects} />
            </div>
          )}

        </div>
      </main>
    </div>
  </div>
  );
};

export default MemberDashboard;