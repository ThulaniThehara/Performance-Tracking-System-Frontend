
import React from 'react'
import { Link } from 'react-router-dom'
import { FaCalendar, FaSignOutAlt, FaEnvelope } from 'react-icons/fa'
import '../../SCSS/Header.scss'

function Header() {
  return (
    <header className="app-header">
      <div className="header-actions">
        <Link to="/calendar" className="icon-btn" aria-label="Calendar"><FaCalendar/></Link>
        <Link to="/signout" className="icon-btn" aria-label="Sign out"><FaSignOutAlt/></Link>
      </div>
    </header>
  )
}

export default Header
