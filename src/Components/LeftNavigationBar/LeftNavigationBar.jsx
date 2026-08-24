import React, { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaHome,
  FaUser,
  FaProjectDiagram,
  FaChevronRight,
  FaChartLine,
  FaFolder,
  FaSitemap,
  FaUsers,
  FaChartPie,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaCommentDots,
} from 'react-icons/fa'
import { logout } from '../../utils/auth'
import '../../SCSS/componentStyle/LeftNavigationBar.scss'

function LeftNavigationBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    logout();
    window.location.href = '/';
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside className={`LeftNavigationBar ${isOpen ? 'is-open' : ''}`}>
        {/* Brand logo container */}
        <div className="brand">
          <div className="brand-badge">
            <FaChartLine className="brand-icon" />
          </div>
          <div className="brand-text-box">
            <span className="brand-title">PTS</span>
            <span className="brand-subtitle">Performance Tracker</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="nav-menu">
          <div className="nav-group-label">{t('shell.nav.overview')}</div>

          <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
            <div className="icon-wrapper">
              <FaHome className="row-icon" />
            </div>
            <span>{t('shell.nav.dashboard')}</span>
            <FaChevronRight className="nav-arrow" />
          </NavLink>

          {/* Society project management: what you lead and contribute to. */}
          <NavLink to="/projects" end className={({ isActive }) => (isActive ? 'row active' : 'row')}>
            <div className="icon-wrapper">
              <FaProjectDiagram className="row-icon" />
            </div>
            <span>{t('shell.nav.myProjects')}</span>
            <FaChevronRight className="nav-arrow" />
          </NavLink>

          <NavLink to="/AdminDashboard" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
            <div className="icon-wrapper">
              <FaUser className="row-icon" />
            </div>
            <span>{t('shell.nav.profile')}</span>
            <FaChevronRight className="nav-arrow" />
          </NavLink>

          <div className="nav-group-label">{t('shell.nav.management')}</div>

          <NavLink
            to="/AdminProjects"
            className={({ isActive }) => (isActive || location.pathname.startsWith('/projects/')) ? 'row active' : 'row'}
          >
            <div className="icon-wrapper">
              <FaFolder className="row-icon" />
            </div>
            <span>{t('shell.nav.projects')}</span>
            <FaChevronRight className="nav-arrow" />
          </NavLink>

          <NavLink to="/AdminCommittees" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
            <div className="icon-wrapper">
              <FaSitemap className="row-icon" />
            </div>
            <span>{t('shell.nav.committees')}</span>
            <FaChevronRight className="nav-arrow" />
          </NavLink>

          <NavLink to="/AdminAddMember" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
            <div className="icon-wrapper">
              <FaUsers className="row-icon" />
            </div>
            <span>{t('shell.nav.members')}</span>
            <FaChevronRight className="nav-arrow" />
          </NavLink>

          <NavLink to="/AdminFeedback" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
            <div className="icon-wrapper">
              <FaCommentDots className="row-icon" />
            </div>
            <span>Feedback & Issues</span>
            <FaChevronRight className="nav-arrow" />
          </NavLink>

          <NavLink to="/Reports" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
            <div className="icon-wrapper">
              <FaChartPie className="row-icon" />
            </div>
            <span>{t('shell.nav.reports')}</span>
            <FaChevronRight className="nav-arrow" />
          </NavLink>

          <NavLink to="/Settings" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
            <div className="icon-wrapper">
              <FaCog className="row-icon" />
            </div>
            <span>{t('shell.nav.settings')}</span>
            <FaChevronRight className="nav-arrow" />
          </NavLink>
        </nav>

        {/* Bottom sidebar logout button */}
        <button
          className="sidebar-logout-btn"
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '12px',
            borderRadius: '14px',
            border: '1px solid #fee2e2',
            backgroundColor: '#fef2f2',
            color: '#ef4444',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: 'auto',
          }}
        >
          <FaSignOutAlt style={{ fontSize: '1rem' }} />
          <span>{t('shell.logout')}</span>
        </button>
      </aside>
    </>
  )
}

export default LeftNavigationBar
