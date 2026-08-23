import React, { useEffect, useRef, useState } from 'react'
import { FaSearch, FaBell, FaChevronDown, FaSignOutAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getUser, logout } from '../../utils/auth'
import useNotifications from '../../hooks/useNotifications'
import { NOTIF_ICON, timeAgo } from '../../utils/notificationDisplay'
import '../../SCSS/Header.scss'

function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = getUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const { items, unreadCount, markRead, markAllRead } = useNotifications();

  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleNotifClick = (n) => {
    if (!n.isRead) markRead(n.id);
    setShowNotifs(false);
    if (n.link) navigate(n.link);
  };

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
            placeholder={t('shell.header.searchPlaceholder')}
            aria-label={t('shell.header.searchPlaceholder')}
          />
        </div>
      </div>

      <div className="header-right">
        <div className="notif-menu" ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="notif-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifs((v) => !v)}
          >
            <FaBell />
            {unreadCount > 0 && <span className="notif-badge" />}
          </button>

          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {items.length === 0 && (
                  <div className="notif-empty">You're all caught up</div>
                )}
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item${n.isRead ? '' : ' is-unread'}${n.type.startsWith('DEADLINE') ? ` is-${n.type.toLowerCase().replace('_', '-')}` : ''}`}
                    onClick={() => handleNotifClick(n)}
                  >
                    <span className="notif-icon">{NOTIF_ICON[n.type] || '🔔'}</span>
                    <div className="notif-body">
                      <p className="notif-message">{n.message}</p>
                      <span className="notif-time">{timeAgo(n.createdAt)}</span>
                    </div>
                    {!n.isRead && <span className="notif-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
                <FaSignOutAlt /> {t('shell.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
