import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaHome, FaUser, FaProjectDiagram, FaChevronRight, FaChartLine } from 'react-icons/fa'
import { FaCodeCommit, FaUsers } from 'react-icons/fa6'
import '../../SCSS/componentStyle/LeftNavigationBar.scss'

function LeftNavigationBar() {
  return (
    <div className="LeftNavigationBar">
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

      <div className="nav-menu">
        <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <FaHome className="row-icon" />
          <span>Dashboard</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <NavLink to="/AdminProjects" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <FaProjectDiagram className="row-icon" />
          <span>My Projects</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <NavLink to="/AdminDashboard" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <FaUser className="row-icon" />
          <span>Profile</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <div className="row-divider">MANAGE</div>

        <NavLink to="/AdminProjects" className={({ isActive }) => (isActive ? 'row submenu active' : 'row submenu')}>
          <span>Projects</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <NavLink to="/AdminCommittees" className={({ isActive }) => (isActive ? 'row submenu active' : 'row submenu')}>
          <span>Committees</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <NavLink to="/AdminAddMember" className={({ isActive }) => (isActive ? 'row submenu active' : 'row submenu')}>
          <FaUsers className="row-icon" />
          <span>Member</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <NavLink to="/Reports" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <FaCodeCommit className="row-icon" />
          <span>Reports</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>

        <NavLink to="/Settings" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
          <span>Settings</span>
          <FaChevronRight className="nav-arrow" />
        </NavLink>
      </div>

      {/* Bottom sidebar user profile card as seen in reference image */}
      <div className="sidebar-footer-user">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
          alt="Thulani M."
          className="user-avatar-mini"
        />
        <div className="user-info-mini">
          <span className="user-name-mini">Thulani M.</span>
          <span className="user-role-mini">Administrator</span>
        </div>
        <span className="footer-dots">•••</span>
      </div>
    </div>
  )
}

export default LeftNavigationBar
