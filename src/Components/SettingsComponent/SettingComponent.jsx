import React, { useState, useEffect } from 'react';
import {
  FaCog,
  FaBell,
  FaLock,
  FaUser,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
  FaInbox,
  FaSpinner,
  FaTrashAlt,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from '../../i18n';
import { getUser } from '../../utils/auth';
import '../../SCSS/componentStyle/Settings.scss';

const SettingComponent = ({ isEmbedded = false }) => {
  const { t, i18n } = useTranslation();
  const user = getUser();
  const userRole = (user?.role || user?.userRole || 'MEMBER').toUpperCase();
  const isAdmin = userRole === 'ADMIN';

  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    language: localStorage.getItem(LANGUAGE_STORAGE_KEY) || i18n.resolvedLanguage || i18n.language || 'en',
    emailNotifications: true,
    taskReminders: true,
    committeeMeetings: true,
    projectUpdates: true,
    performanceAlerts: true,
  });

  useEffect(() => {
    const currentLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || i18n.resolvedLanguage || i18n.language || 'en';
    setSettings(prev => ({ ...prev, language: currentLang }));
  }, [i18n.language, i18n.resolvedLanguage]);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  // Admin Inbox State (Admin Only)
  const [adminFeedbacks, setAdminFeedbacks] = useState([]);
  const [adminComplaints, setAdminComplaints] = useState([]);
  const [adminFilter, setAdminFilter] = useState('all');
  const [isLoadingAdminInbox, setIsLoadingAdminInbox] = useState(false);

  const loadAdminSubmissions = async () => {
    try {
      setIsLoadingAdminInbox(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/feedback/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAdminFeedbacks(data.feedbacks || []);
        setAdminComplaints(data.complaints || []);
      }
    } catch (e) {
      console.warn('Could not load admin inbox:', e);
    } finally {
      setIsLoadingAdminInbox(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin_inbox' && isAdmin) {
      loadAdminSubmissions();
    }
  }, [activeTab, isAdmin]);

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    setSettings(prev => ({ ...prev, language: languageCode }));
  };

  // Password Change Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirmation password do not match.');
      return;
    }

    try {
      setIsSubmittingPwd(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setPwdSuccess(data.message || 'Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdSuccess(''), 5000);
    } catch (err) {
      setPwdError(err.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setIsSubmittingPwd(false);
    }
  };

  // Admin: Update Complaint Status
  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/feedback/admin/complaint/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadAdminSubmissions();
      }
    } catch (e) {
      console.warn('Error updating status:', e);
    }
  };

  // Admin: Delete Submission
  const handleDeleteSubmission = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/feedback/admin/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadAdminSubmissions();
      }
    } catch (e) {
      console.warn('Error deleting:', e);
    }
  };

  return (
    <div className={`settings-page ${isEmbedded ? 'is-embedded' : ''}`}>
      <div className="settings-container">
        {/* Header */}
        {!isEmbedded && (
          <div className="settings-header">
            <div className="header-content">
              <FaCog className="header-icon" />
              <div>
                <h1>{t('settings.title')}</h1>
                <p>{t('settings.subtitle')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FaUser /> {t('settings.tabs.general')}
          </button>

          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FaLock /> Security & Password
          </button>

          {/* Admin-Only Tab to Review Member Feedbacks & Complaints */}
          {isAdmin && (
            <button
              className={`tab-btn ${activeTab === 'admin_inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin_inbox')}
            >
              <FaInbox /> Member Submissions ({adminComplaints.filter(c => c.status === 'Open').length} Open)
            </button>
          )}

          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> {t('settings.tabs.notifications')}
          </button>
        </div>

        {/* Content Area */}
        <div className="settings-content">
          {/* 1. General Tab */}
          {activeTab === 'general' && (
            <div className="tab-pane general-settings">
              <h2>{t('settings.general.title')}</h2>

              <div className="settings-group">
                <h3>{t('settings.general.systemPreferences')}</h3>

                <div className="setting-item">
                  <div className="setting-label">
                    <label htmlFor="language">{t('settings.general.language.label')}</label>
                    <p>{t('settings.general.language.description')}</p>
                  </div>
                  <select
                    id="language"
                    value={settings.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="setting-select"
                  >
                    {SUPPORTED_LANGUAGES.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.nativeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 2. Security & Password Tab */}
          {activeTab === 'security' && (
            <div className="tab-pane security-settings">
              <h2>Security & Password</h2>
              <p className="tab-subtitle">
                Update your account password. You must enter your current password to confirm your identity.
              </p>

              {pwdSuccess && (
                <div className="alert alert-success">
                  <FaCheckCircle style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              {pwdError && (
                <div className="alert alert-error">
                  <FaExclamationCircle style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                  <span>{pwdError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="settings-group">
                <h3>Change Password</h3>

                <div className="setting-item">
                  <div className="setting-label">
                    <label htmlFor="currentPassword">Current Password</label>
                    <p>Enter your existing password</p>
                  </div>
                  <div className="password-input-wrapper">
                    <input
                      id="currentPassword"
                      type={showCurrentPwd ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      className="setting-input"
                      required
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowCurrentPwd(prev => !prev)}
                      tabIndex="-1"
                      aria-label="Toggle current password visibility"
                    >
                      {showCurrentPwd ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <label htmlFor="newPassword">New Password</label>
                    <p>Enter a new password (min. 6 characters)</p>
                  </div>
                  <div className="password-input-wrapper">
                    <input
                      id="newPassword"
                      type={showNewPwd ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="setting-input"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowNewPwd(prev => !prev)}
                      tabIndex="-1"
                      aria-label="Toggle new password visibility"
                    >
                      {showNewPwd ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <p>Re-enter the new password to confirm</p>
                  </div>
                  <div className="password-input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPwd ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="setting-input"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowConfirmPwd(prev => !prev)}
                      tabIndex="-1"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPwd ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="settings-actions" style={{ marginTop: '24px' }}>
                  <button type="submit" className="btn btn-primary" disabled={isSubmittingPwd}>
                    <FaSave /> {isSubmittingPwd ? 'Updating Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. Admin Inbox Tab (Admin Only) */}
          {isAdmin && activeTab === 'admin_inbox' && (
            <div className="tab-pane admin-inbox-settings">
              <h2>Member Feedbacks & Complaints</h2>
              <p className="tab-subtitle">
                Review and resolve feedback, suggestions, and issue reports submitted by members.
              </p>

              {/* Stats Overview */}
              <div className="inbox-stats-grid">
                <div className="inbox-stat-card">
                  <span className="stat-num">{adminFeedbacks.length}</span>
                  <span className="stat-name">Total Feedbacks</span>
                </div>
                <div className="inbox-stat-card">
                  <span className="stat-num">{adminComplaints.length}</span>
                  <span className="stat-name">Total Issues Reported</span>
                </div>
                <div className="inbox-stat-card highlight-open">
                  <span className="stat-num">{adminComplaints.filter(c => c.status === 'Open').length}</span>
                  <span className="stat-name">Pending / Open Issues</span>
                </div>
                <div className="inbox-stat-card highlight-resolved">
                  <span className="stat-num">{adminComplaints.filter(c => c.status === 'Resolved').length}</span>
                  <span className="stat-name">Resolved Issues</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="inbox-filter-tabs">
                <button
                  className={`filter-tab-btn ${adminFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setAdminFilter('all')}
                >
                  All Submissions ({adminFeedbacks.length + adminComplaints.length})
                </button>
                <button
                  className={`filter-tab-btn ${adminFilter === 'complaints' ? 'active' : ''}`}
                  onClick={() => setAdminFilter('complaints')}
                >
                  Complaints & Issues ({adminComplaints.length})
                </button>
                <button
                  className={`filter-tab-btn ${adminFilter === 'feedbacks' ? 'active' : ''}`}
                  onClick={() => setAdminFilter('feedbacks')}
                >
                  Feedbacks & Suggestions ({adminFeedbacks.length})
                </button>
              </div>

              {isLoadingAdminInbox ? (
                <div className="loading-state-box" style={{ padding: '30px', textAlign: 'center' }}>
                  <FaSpinner className="fa-spin" style={{ fontSize: '1.8rem', color: '#6b52d1' }} />
                  <p style={{ marginTop: '10px', color: '#64748b' }}>Loading member submissions...</p>
                </div>
              ) : (
                <div className="admin-submissions-feed">
                  {/* Complaints List */}
                  {(adminFilter === 'all' || adminFilter === 'complaints') && (
                    <div className="inbox-section">
                      <h3 style={{ margin: '20px 0 12px 0', fontSize: '1.1rem', color: '#1d1545' }}>
                        Reported Complaints & Issues
                      </h3>
                      {adminComplaints.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>No member complaints recorded.</p>
                      ) : (
                        <div className="submissions-list">
                          {adminComplaints.map((c) => (
                            <div key={c._id} className="submission-card admin-complaint-card">
                              <div className="submission-card-head">
                                <span className="author-pill">👤 {c.userId?.name || c.from || 'Member'}</span>
                                {c.projectName && (
                                  <span className="project-badge" style={{ background: '#ede9fe', color: '#6b52d1', padding: '3px 10px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>
                                    📁 {c.projectName}
                                  </span>
                                )}
                                {c.targetMember && (
                                  <span className="target-member-badge" style={{ background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>
                                    Target: {c.targetMember}
                                  </span>
                                )}
                                <span className="badge-tag">{c.category}</span>
                                <span className={`priority-tag ${c.priority.toLowerCase()}`}>{c.priority} Priority</span>
                                <span className="submission-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                                <button
                                  className="delete-sub-btn"
                                  onClick={() => handleDeleteSubmission('complaint', c._id)}
                                  title="Delete complaint"
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                              <h4 className="complaint-title">{c.title}</h4>
                              <p className="submission-text">{c.description}</p>
                              <div className="admin-action-row">
                                <span className="status-label">Status:</span>
                                <select
                                  value={c.status || 'Open'}
                                  onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                                  className={`status-select status-${(c.status || 'open').toLowerCase().replace(' ', '-')}`}
                                >
                                  <option value="Open">🟡 Open (Pending)</option>
                                  <option value="In Progress">🔵 In Progress</option>
                                  <option value="Resolved">🟢 Resolved</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedbacks List */}
                  {(adminFilter === 'all' || adminFilter === 'feedbacks') && (
                    <div className="inbox-section" style={{ marginTop: '28px' }}>
                      <h3 style={{ margin: '20px 0 12px 0', fontSize: '1.1rem', color: '#1d1545' }}>
                        Member Feedbacks & Suggestions
                      </h3>
                      {adminFeedbacks.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>No member feedbacks recorded.</p>
                      ) : (
                        <div className="submissions-list">
                          {adminFeedbacks.map((fb) => (
                            <div key={fb._id} className="submission-card admin-feedback-card">
                              <div className="submission-card-head">
                                <span className="author-pill">👤 {fb.userId?.name || fb.author || 'Member'}</span>
                                {fb.projectName && (
                                  <span className="project-badge" style={{ background: '#ede9fe', color: '#6b52d1', padding: '3px 10px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>
                                    📁 {fb.projectName}
                                  </span>
                                )}
                                {fb.targetMember && (
                                  <span className="target-member-badge" style={{ background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>
                                    Target: {fb.targetMember}
                                  </span>
                                )}
                                <span className="badge-tag">{fb.type}</span>
                                <span className="star-rating-pill">⭐ {fb.rating}/5</span>
                                <span className="submission-date">{new Date(fb.createdAt).toLocaleDateString()}</span>
                                <button
                                  className="delete-sub-btn"
                                  onClick={() => handleDeleteSubmission('feedback', fb._id)}
                                  title="Delete feedback"
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                              <p className="submission-text">{fb.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 4. Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="tab-pane notifications-settings">
              <h2>{t('settings.notifications.title')}</h2>

              <div className="settings-group">
                <h3>{t('settings.notifications.emailGroup')}</h3>
                {settings.emailNotifications && (
                  <>
                    <div className="setting-item">
                      <div className="setting-label">
                        <label>{t('settings.notifications.taskReminders.label')}</label>
                        <p>{t('settings.notifications.taskReminders.description')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.taskReminders}
                        onChange={() => setSettings(p => ({ ...p, taskReminders: !p.taskReminders }))}
                        className="setting-checkbox"
                      />
                    </div>

                    <div className="setting-item">
                      <div className="setting-label">
                        <label>{t('settings.notifications.projectUpdates.label')}</label>
                        <p>{t('settings.notifications.projectUpdates.description')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.projectUpdates}
                        onChange={() => setSettings(p => ({ ...p, projectUpdates: !p.projectUpdates }))}
                        className="setting-checkbox"
                      />
                    </div>

                    <div className="setting-item">
                      <div className="setting-label">
                        <label>{t('settings.notifications.performanceAlerts.label')}</label>
                        <p>{t('settings.notifications.performanceAlerts.description')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.performanceAlerts}
                        onChange={() => setSettings(p => ({ ...p, performanceAlerts: !p.performanceAlerts }))}
                        className="setting-checkbox"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingComponent;
