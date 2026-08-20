// ...existing code...
import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaHome, FaUser, FaProjectDiagram } from 'react-icons/fa'
import { FaCodeCommit } from 'react-icons/fa6'
import '../../SCSS/componentStyle/LeftNavigationBar.scss'

function LeftNavigationBar() {
  return (
    <div className="LeftNavigationBar">
      <div className="brand">
        <img
          src="https://rcunialumni.home.blog/wp-content/uploads/2023/05/racualu-full-black-logo.png?w=1080"
          alt="Rotaract logo"
          className="logo"
        />
      </div>

      <NavLink to="/" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
        <FaHome />
        <span>Home</span>
      </NavLink>

      <NavLink to="/AdminProjects" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
        <FaProjectDiagram />
        <span>My Projects</span>
      </NavLink>

      <NavLink to="/AdminDashboard" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
        <FaUser />
        <span>Profile</span>
      </NavLink>

      <a
        href="https://rotaractalumnimora.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="row"
      >
        <span>Rotaract</span>
      </a>

      <div className="row-divider">Manage</div>

      <NavLink to="/AdminProjects" className={({ isActive }) => (isActive ? 'row submenu active' : 'row submenu')}>
        <span>Projects</span>
      </NavLink>

      <NavLink to="/AdminCommittees" className={({ isActive }) => (isActive ? 'row submenu active' : 'row submenu')}>
        <span>Committees</span>
      </NavLink>

      <NavLink to="/AdminAddMember" className={({ isActive }) => (isActive ? 'row submenu active' : 'row submenu')}>
        <span>Member</span>
      </NavLink>

      <NavLink to="/Reports" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
        <FaCodeCommit />
        <span>Reports</span>
      </NavLink>

      <NavLink to="/Settings" className={({ isActive }) => (isActive ? 'row active' : 'row')}>
        <span>Settings</span>
      </NavLink>
    </div>
  )
}

export default LeftNavigationBar
