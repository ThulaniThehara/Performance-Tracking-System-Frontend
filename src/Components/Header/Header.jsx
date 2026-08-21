import React, { useState, useEffect } from "react";
import { FaSearch, FaBell, FaChevronDown } from "react-icons/fa";
import { getUser } from "../../utils/auth";
import "../../SCSS/Header.scss";

function Header() {
  const [currentUser, setCurrentUser] = useState(null);

  const loadUserData = () => {
    const user = getUser();
    setCurrentUser(user);
  };

  useEffect(() => {
    loadUserData();

    // Listen for custom profile update events and storage events
    window.addEventListener("userProfileUpdated", loadUserData);
    window.addEventListener("storage", loadUserData);

    return () => {
      window.removeEventListener("userProfileUpdated", loadUserData);
      window.removeEventListener("storage", loadUserData);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = currentUser?.name || "Admin User";
  const userAvatar = currentUser?.profileImage || currentUser?.avatar || null;

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
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={displayName}
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar-initials">
              {getInitials(displayName)}
            </div>
          )}
          <span className="user-name">{displayName}</span>
          <FaChevronDown className="dropdown-arrow" />
        </div>
      </div>
    </header>
  );
}

export default Header;
