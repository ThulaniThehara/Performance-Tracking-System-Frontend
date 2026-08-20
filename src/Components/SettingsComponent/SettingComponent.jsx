import React, { useState } from 'react';
import { FaCog, FaBell, FaLock, FaUser, FaPalette, FaDatabase, FaToggleOn, FaToggleOff, FaSave, FaTimes } from 'react-icons/fa';
import '../../SCSS/componentStyle/Settings.scss';

const SettingComponent = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Colombo',
    
    // Notification Settings
    emailNotifications: true,
    taskReminders: true,
    committeeMeetings: true,
    projectUpdates: true,
    performanceAlerts: true,
    
    // Privacy & Security
    twoFactorAuth: false,
    activityLog: true,
    dataBackup: true,
    sessionTimeout: 30,
    
    // Display Settings
    itemsPerPage: 10,
    showCompletedTasks: true,
    autoRefresh: false,
    compactMode: false,
  });

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

  const handleSave = () => {
    // Simulate save
    console.log('Settings saved:', settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    // Reset to defaults
    setSettings({
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Colombo',
      emailNotifications: true,
      taskReminders: true,
      committeeMeetings: true,
      projectUpdates: true,
      performanceAlerts: true,
      twoFactorAuth: false,
      activityLog: true,
      dataBackup: true,
      sessionTimeout: 30,
      itemsPerPage: 10,
      showCompletedTasks: true,
      autoRefresh: false,
      compactMode: false,
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
              <h1>Settings</h1>
              <p>Manage your preferences and account settings</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FaUser /> General
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> Notifications
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FaLock /> Security
          </button>
          <button
            className={`tab-btn ${activeTab === 'display' ? 'active' : ''}`}
            onClick={() => setActiveTab('display')}
          >
            <FaPalette /> Display
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="tab-pane general-settings">
              <h2>General Settings</h2>

              <div className="settings-group">
                <h3>System Preferences</h3>

                <div className="setting-item">
                  <div className="setting-label">
                    <label htmlFor="theme">Theme</label>
                    <p>Choose your preferred color theme</p>
                  </div>
                  <select
                    id="theme"
                    value={settings.theme}
                    onChange={(e) => handleSelectChange('theme', e.target.value)}
                    className="setting-select"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <label htmlFor="language">Language</label>
                    <p>Select your preferred language</p>
                  </div>
                  <select
                    id="language"
                    value={settings.language}
                    onChange={(e) => handleSelectChange('language', e.target.value)}
                    className="setting-select"
                  >
                    <option value="en">English</option>
                    <option value="si">Sinhala</option>
                    <option value="ta">Tamil</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <label htmlFor="timezone">Timezone</label>
                    <p>Set your timezone for events and notifications</p>
                  </div>
                  <select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => handleSelectChange('timezone', e.target.value)}
                    className="setting-select"
                  >
                    <option value="Asia/Colombo">Asia/Colombo (UTC+5:30)</option>
                    <option value="UTC">UTC</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
                    <option value="Asia/Bangkok">Asia/Bangkok (UTC+7:00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="tab-pane notifications-settings">
              <h2>Notification Settings</h2>

              <div className="settings-group">
                <h3>Email Notifications</h3>

                <div className="setting-item">
                  <div className="setting-label">
                    <label>Email Notifications</label>
                    <p>Receive email notifications for important events</p>
                  </div>
                  <button
                    className={`toggle-btn ${settings.emailNotifications ? 'active' : ''}`}
                    onClick={() => handleToggle('emailNotifications')}
                  >
                    {settings.emailNotifications ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>

                {settings.emailNotifications && (
                  <>
                    <div className="setting-item">
                      <div className="setting-label">
                        <label>Task Reminders</label>
                        <p>Get notified about upcoming tasks and deadlines</p>
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
                        <label>Committee Meetings</label>
                        <p>Notifications for committee meetings and announcements</p>
                      </div>
                      <button
                        className={`toggle-btn ${settings.committeeMeetings ? 'active' : ''}`}
                        onClick={() => handleToggle('committeeMeetings')}
                      >
                        {settings.committeeMeetings ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>

                    <div className="setting-item">
                      <div className="setting-label">
                        <label>Project Updates</label>
                        <p>Stay updated with project progress and milestones</p>
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
                        <label>Performance Alerts</label>
                        <p>Receive alerts about your performance metrics</p>
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
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-pane security-settings">
              <h2>Security & Privacy</h2>

              <div className="settings-group">
                <h3>Account Security</h3>

                <div className="setting-item">
                  <div className="setting-label">
                    <label>Two-Factor Authentication</label>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button
                    className={`toggle-btn ${settings.twoFactorAuth ? 'active' : ''}`}
                    onClick={() => handleToggle('twoFactorAuth')}
                  >
                    {settings.twoFactorAuth ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                    <p>Auto-logout after inactivity period</p>
                  </div>
                  <input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="120"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                    className="setting-input"
                  />
                </div>
              </div>

              <div className="settings-group">
                <h3>Privacy Settings</h3>

                <div className="setting-item">
                  <div className="setting-label">
                    <label>Activity Log</label>
                    <p>Keep a record of your account activity</p>
                  </div>
                  <button
                    className={`toggle-btn ${settings.activityLog ? 'active' : ''}`}
                    onClick={() => handleToggle('activityLog')}
                  >
                    {settings.activityLog ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <label>Data Backup</label>
                    <p>Automatically backup your data</p>
                  </div>
                  <button
                    className={`toggle-btn ${settings.dataBackup ? 'active' : ''}`}
                    onClick={() => handleToggle('dataBackup')}
                  >
                    {settings.dataBackup ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <div className="tab-pane display-settings">
              <h2>Display Settings</h2>

              <div className="settings-group">
                <h3>Layout & View</h3>

                <div className="setting-item">
                  <div className="setting-label">
                    <label htmlFor="itemsPerPage">Items Per Page</label>
                    <p>Set the number of items displayed per page</p>
                  </div>
                  <select
                    id="itemsPerPage"
                    value={settings.itemsPerPage}
                    onChange={(e) => handleSelectChange('itemsPerPage', parseInt(e.target.value))}
                    className="setting-select"
                  >
                    <option value="5">5 items</option>
                    <option value="10">10 items</option>
                    <option value="25">25 items</option>
                    <option value="50">50 items</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <label>Compact Mode</label>
                    <p>Use a more compact layout with less spacing</p>
                  </div>
                  <button
                    className={`toggle-btn ${settings.compactMode ? 'active' : ''}`}
                    onClick={() => handleToggle('compactMode')}
                  >
                    {settings.compactMode ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <label>Auto-Refresh</label>
                    <p>Automatically refresh data at regular intervals</p>
                  </div>
                  <button
                    className={`toggle-btn ${settings.autoRefresh ? 'active' : ''}`}
                    onClick={() => handleToggle('autoRefresh')}
                  >
                    {settings.autoRefresh ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <label>Show Completed Tasks</label>
                    <p>Display completed tasks in your task list</p>
                  </div>
                  <button
                    className={`toggle-btn ${settings.showCompletedTasks ? 'active' : ''}`}
                    onClick={() => handleToggle('showCompletedTasks')}
                  >
                    {settings.showCompletedTasks ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="settings-actions">
          {saveSuccess && (
            <div className="success-message">
              ✓ Settings saved successfully
            </div>
          )}
          <button className="btn btn-primary" onClick={handleSave}>
            <FaSave /> Save Changes
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            <FaTimes /> Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingComponent;
