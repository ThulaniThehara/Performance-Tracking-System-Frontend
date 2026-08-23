import React, { useState, useEffect } from "react";
import { FaSearch, FaBell, FaChevronDown, FaSignOutAlt, FaChartLine } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getUser, logout } from "../../utils/auth";
import "../../SCSS/MemberStyles/MemberDashboard.scss";

const MemberTopHeader = () => {
  const { t } = useTranslation();
  const user = getUser();
  const defaultName = t('shell.memberHeader.defaultName');
  const firstName = (user?.name || defaultName).split(" ")[0];
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const prevPadding = document.body.style.paddingTop;
    document.body.style.paddingTop = "0px";
    return () => {
      document.body.style.paddingTop = prevPadding;
    };
  }, []);

  const handleLogout = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    logout();
    window.location.href = "/";
  };

  return (
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
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ position: "relative", cursor: "pointer" }}
        >
          <div className="avatar-circle">
            {firstName.substring(0, 2).toUpperCase()}
          </div>
          <span className="user-display-name">{user?.name || defaultName}</span>
          <FaChevronDown className="dropdown-chevron" />

          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 8,
                backgroundColor: "#ffffff",
                border: "1px solid #eae2f8",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(107, 82, 209, 0.15)",
                padding: "8px 0",
                minWidth: 140,
                zIndex: 1000,
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  border: "none",
                  background: "none",
                  color: "#ef4444",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                <FaSignOutAlt /> {t('shell.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MemberTopHeader;
