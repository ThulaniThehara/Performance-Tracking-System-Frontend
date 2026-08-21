
import React from 'react'
import { FaSearch, FaBell, FaChevronDown } from 'react-icons/fa'
import '../../SCSS/Header.scss'

function Header() {
  return (
    <header className="app-header">
      <div className="header-search">
        <div className="search-input-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search projects, members..."
            aria-label="Search projects, members"
          />
        </div>
      </div>

      <div className="header-right">
        <button className="notif-btn" aria-label="Notifications">
          <FaBell />
          <span className="notif-badge" />
        </button>

        <div className="header-divider" />

        <div className="user-profile-menu">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
            alt="Thulani M."
            className="user-avatar"
          />
          <span className="user-name">Thulani M.</span>
          <FaChevronDown className="dropdown-arrow" />
        </div>
      </div>
    </header>
  )
}

export default Header
