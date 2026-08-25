import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaBell, FaChevronDown, FaChartLine, FaUserCog } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import "../../SCSS/MemberStyles/MemberDashboard.scss";

const MemberTopHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getUser());
  const defaultName = t('shell.memberHeader.defaultName', { defaultValue: 'Member' });
  const firstName = (currentUser?.name || defaultName).split(" ")[0];
  const [showDropdown, setShowDropdown] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const prevPadding = document.body.style.paddingTop;
    document.body.style.paddingTop = "0px";
    return () => {
      document.body.style.paddingTop = prevPadding;
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setCurrentUser(getUser());
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleProfileSettings = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowDropdown(false);
    navigate("/member/dashboard");
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
          <input type="text" placeholder={t('shell.memberHeader.searchPlaceholder', { defaultValue: 'Search tasks, projects, announcements...' })} />
        </div>
      </div>

      {/* Right actions: notification + profile */}
      <div className="top-header-right">
        <button className="notif-btn" aria-label={t('shell.header.notifications', { defaultValue: 'Notifications' })}>
          <FaBell />
          <span className="notif-count">3</span>
        </button>

        <div
          className="user-profile-dropdown"
          ref={profileRef}
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ position: "relative", cursor: "pointer" }}
        >
          <div className="avatar-circle">
            {currentUser?.profileImage ? (
              <img
                src={currentUser.profileImage}
                alt={currentUser?.name || "Member"}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              firstName.substring(0, 2).toUpperCase()
            )}
          </div>
          <span className="user-display-name">{currentUser?.name || defaultName}</span>
          <FaChevronDown className="dropdown-chevron" />

          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                backgroundColor: "#ffffff",
                borderRadius: 16,
                border: "1px solid #eae2f8",
                boxShadow: "0 10px 28px rgba(107, 82, 209, 0.15)",
                padding: "6px",
                zIndex: 1100,
                minWidth: 165,
              }}
            >
              <button
                onClick={handleProfileSettings}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "none",
                  color: "#1d1545",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease, color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f0ff";
                  e.currentTarget.style.color = "#6b52d1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#1d1545";
                }}
              >
                <FaUserCog style={{ fontSize: "1rem", color: "#6b52d1" }} />
                <span>Profile Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MemberTopHeader;
