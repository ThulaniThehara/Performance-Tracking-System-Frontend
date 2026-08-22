import React, { useState } from 'react'
import { FaSearch, FaBell, FaChevronDown, FaSignOutAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { getUser, logout } from '../../utils/auth'
import '../../SCSS/Header.scss'

function Header() {
  const navigate = useNavigate();
  const user = getUser();
  const [showDropdown, setShowDropdown] = useState(false);

  const userName = user?.name || user?.username || user?.userRole || "User";
  const userAvatar =
    user?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6b52d1&color=fff`;

  const handleLogout = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    logout();
    window.location.href = '/';
  };

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

        <div
          className="user-profile-menu"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <img
            src={userAvatar}
            alt={userName}
            className="user-avatar"
          />
          <span className="user-name">{userName}</span>
          <FaChevronDown className="dropdown-arrow" />

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                backgroundColor: '#ffffff',
                border: '1px solid #eae2f8',
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(107, 82, 209, 0.15)',
                padding: '8px 0',
                minWidth: 140,
                zIndex: 1000,
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  border: 'none',
                  background: 'none',
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
