import React from 'react'
import { NavLink } from 'react-router-dom'
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
import '../../SCSS/componentStyle/LeftNavigationBar.scss'

function LeftNavigationBar() {
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

        <NavLink to="/AdminProjects" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
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

        <NavLink to="/AdminProjects" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
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

      {/* Bottom sidebar user profile card with status indicator */}
      <div className="sidebar-footer-user">
        <div className="avatar-wrapper">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
            alt="Thulani M."
            className="user-avatar-mini"
          />
          <span className="online-indicator" title="Online" />
        </div>

        <div className="user-info-mini">
          <span className="user-name-mini">Thulani M.</span>
          <span className="user-role-badge">Administrator</span>
        </div>

        <button className="user-action-btn" title="Logout">
          <FaSignOutAlt />
        </button>
      </div>
    </aside>
  )
}

export default LeftNavigationBar
