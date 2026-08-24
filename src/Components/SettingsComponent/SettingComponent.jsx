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
  FaSpinner,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from '../../i18n';
import { getUser } from '../../utils/auth';
import '../../SCSS/componentStyle/Settings.scss';

const SettingComponent = ({ isEmbedded = false }) => {
  const { t, i18n } = useTranslation();
  const user = getUser();

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

  return (
    <div className={`settings-page ${isEmbedded ? 'is-embedded' : ''}`}>
      <div className="settings-container">
        {/* Header */}
        {/* Header (Matching Project Page Style) */}
        {!isEmbedded && (
          <header className="settings-hero">
            <div>
              <p className="settings-eyebrow">PREFERENCES</p>
              <h1>{t('settings.title')}</h1>
              <p className="settings-hero-sub">{t('settings.subtitle')}</p>
            </div>
          </header>
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
              <div className="tab-header-block">
                <h2>{t('settings.general.title')}</h2>
                <p className="tab-subtitle">
                  Customize your platform language and interface localization preferences.
                </p>
              </div>

              <div className="settings-group">
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
              <div className="tab-header-block">
                <h2>Security & Password</h2>
                <p className="tab-subtitle">
                  Update your account password. You must enter your current password to confirm your identity.
                </p>
              </div>

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

                <div className="settings-actions">
                  <button type="submit" className="btn btn-primary" disabled={isSubmittingPwd}>
                    <FaSave /> {isSubmittingPwd ? 'Updating Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="tab-pane notifications-settings">
              <div className="tab-header-block">
                <h2>{t('settings.notifications.title')}</h2>
                <p className="tab-subtitle">
                  Configure your email notifications and automated platform alerts.
                </p>
              </div>

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
