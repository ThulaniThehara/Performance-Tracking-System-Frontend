import React, { useState, useEffect } from 'react';
import { FaCog, FaBell, FaLock, FaUser, FaPalette, FaDatabase, FaToggleOn, FaToggleOff, FaSave, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from '../../i18n';
import '../../SCSS/componentStyle/Settings.scss';

const SettingComponent = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    // Language lives in i18next (persisted to localStorage); mirror it here so the
    // dropdown shows the language that is actually active.
    language: localStorage.getItem(LANGUAGE_STORAGE_KEY) || i18n.resolvedLanguage || i18n.language || 'en',

    // Notification Settings
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

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Switching the language applies immediately (no "Save" needed) and is
  // remembered across reloads by the i18next language detector and localStorage.
  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    handleSelectChange('language', languageCode);
  };

  const handleSave = () => {
    // Simulate save
    console.log('Settings saved:', settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    // Reset to defaults
    i18n.changeLanguage('en');
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    setSettings({
      language: 'en',
      emailNotifications: true,
      taskReminders: true,
      committeeMeetings: true,
      projectUpdates: true,
      performanceAlerts: true,
    });
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <div className="header-content">
            <FaCog className="header-icon" />
            <div>
              <h1>{t('settings.title')}</h1>
              <p>{t('settings.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FaUser /> {t('settings.tabs.general')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> {t('settings.tabs.notifications')}
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* General Tab */}
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

          {/* Notifications Tab */}
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
                      <button
                        className={`toggle-btn ${settings.taskReminders ? 'active' : ''}`}
                        onClick={() => handleToggle('taskReminders')}
                      >
                        {settings.taskReminders ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>

                    <div className="setting-item">
                      <div className="setting-label">
                        <label>{t('settings.notifications.projectUpdates.label')}</label>
                        <p>{t('settings.notifications.projectUpdates.description')}</p>
                      </div>
                      <button
                        className={`toggle-btn ${settings.projectUpdates ? 'active' : ''}`}
                        onClick={() => handleToggle('projectUpdates')}
                      >
                        {settings.projectUpdates ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>

                    <div className="setting-item">
                      <div className="setting-label">
                        <label>{t('settings.notifications.performanceAlerts.label')}</label>
                        <p>{t('settings.notifications.performanceAlerts.description')}</p>
                      </div>
                      <button
                        className={`toggle-btn ${settings.performanceAlerts ? 'active' : ''}`}
                        onClick={() => handleToggle('performanceAlerts')}
                      >
                        {settings.performanceAlerts ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )};
        </div>
      </div>
    </div>
  )
}
export default SettingComponent;
