import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
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
} from 'react-icons/fa'
import { logout } from '../../utils/auth'
import '../../SCSS/componentStyle/LeftNavigationBar.scss'

function LeftNavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    logout();
    window.location.href = '/';
  };

  return (
    <aside className="LeftNavigationBar">
      {/* Brand logo container */}
      <div className="brand">
        <div className="brand-badge">
          <FaChartLine className="brand-icon" />
        </div>
        <div className="brand-text-box">
          <span className="brand-title">PTS</span>
          <span className="brand-subtitle">Performance Tracker</span>
        </div>
      </div>

      <nav className="nav-menu">
        <div className="nav-group-label">OVERVIEW</div>

        <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <div className="icon-wrapper">
            <FaHome className="row-icon" />
          </div>
          <span>Dashboard</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        {/* Society project management: what you lead and contribute to. */}
        <NavLink to="/projects" end className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <div className="icon-wrapper">
            <FaProjectDiagram className="row-icon" />
          </div>
          <span>My Projects</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <NavLink to="/AdminDashboard" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <div className="icon-wrapper">
            <FaUser className="row-icon" />
          </div>
          <span>Profile</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <div className="nav-group-label">MANAGEMENT</div>

        <NavLink
          to="/AdminProjects"
          className={({ isActive }) => (isActive || location.pathname.startsWith('/projects/')) ? 'row active' : 'row'}
        >
          <div className="icon-wrapper">
            <FaFolder className="row-icon" />
          </div>
          <span>Projects</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <NavLink to="/AdminCommittees" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <div className="icon-wrapper">
            <FaSitemap className="row-icon" />
          </div>
          <span>Committees</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <NavLink to="/AdminAddMember" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <div className="icon-wrapper">
            <FaUsers className="row-icon" />
          </div>
          <span>Members</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <NavLink to="/Reports" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <div className="icon-wrapper">
            <FaChartPie className="row-icon" />
          </div>
          <span>Reports</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <NavLink to="/Settings" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <div className="icon-wrapper">
            <FaCog className="row-icon" />
          </div>
          <span>Settings</span>
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
        <span>Logout</span>
      </button>
    </aside>
  )
}

export default LeftNavigationBar
