import React, { useState, useEffect, useRef } from 'react';
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
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaEdit,
  FaUserShield,
  FaCalendarAlt,
  FaCheck,
  FaCamera,
  FaIdCard,
  FaLayerGroup,
  FaVenusMars,
  FaBirthdayCake,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from '../../i18n';
import { getUser, getToken } from '../../utils/auth';
import '../../SCSS/componentStyle/Settings.scss';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GENDERS = ['Male', 'Female', 'Other'];

const SettingComponent = ({ isEmbedded = false }) => {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef(null);

  // Tab State: default to 'profile' (1st tab)
  const [activeTab, setActiveTab] = useState('profile');

  // Helper to format date cleanly
  const formatJoinedDate = (createdVal, idVal) => {
    try {
      if (createdVal) {
        return new Date(createdVal).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      if (idVal && typeof idVal === 'string' && idVal.length === 24) {
        const timestamp = parseInt(idVal.substring(0, 8), 16) * 1000;
        return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    } catch (e) {
      console.warn('Error parsing joined date:', e);
    }
    return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Profile State initialized cleanly from logged-in session user
  const [profile, setProfile] = useState(() => {
    const localUser = getUser() || {};
    return {
      name: localUser.name || localUser.username || '',
      role: localUser.userRole || localUser.role || 'MEMBER',
      indexNo: localUser.indexNo || '',
      email: localUser.email || '',
      phone: localUser.contactNO || localUser.phone || '',
      gender: localUser.gender || '',
      dob: localUser.dob || '',
      location: localUser.faculy || localUser.faculty || '',
      batch: localUser.batch ? String(localUser.batch).replace('Batch ', '') : '',
      joinedDate: '',
      profileImage: localUser.profileImage || localUser.avatar || null,
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ ...profile });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // General & Notifications Settings State
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
    setSettings((prev) => ({ ...prev, language: currentLang }));
  }, [i18n.language, i18n.resolvedLanguage]);

  // Fetch logged-in user profile details dynamically
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const localUser = getUser();
        if (localUser) {
          const formattedDate = formatJoinedDate(localUser.createdAt || localUser.created_at, localUser._id || localUser.id);
          const initialData = {
            name: localUser.name || localUser.username || '',
            email: localUser.email || '',
            role: localUser.userRole || localUser.role || 'MEMBER',
            indexNo: localUser.indexNo || '',
            phone: localUser.contactNO || localUser.phone || '',
            gender: localUser.gender || '',
            dob: localUser.dob || '',
            location: localUser.faculy || localUser.faculty || '',
            batch: localUser.batch ? String(localUser.batch).replace('Batch ', '') : '',
            joinedDate: formattedDate,
            profileImage: localUser.profileImage || localUser.avatar || null,
          };
          setProfile(initialData);
          setProfileFormData(initialData);
        }

        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        if (localUser?.email) {
          const res = await fetch(`${baseURL}/user/email/${encodeURIComponent(localUser.email)}`, { headers });
          if (res.ok) {
            const data = await res.json();
            const userData = Array.isArray(data) ? data[0] : data;
            if (userData) {
              const formattedDate = formatJoinedDate(userData.createdAt || userData.created_at, userData._id || userData.id);
              const fetchedData = {
                name: userData.name || localUser?.name || '',
                role: userData.userRole || userData.role || localUser?.userRole || 'MEMBER',
                indexNo: userData.indexNo || localUser?.indexNo || '',
                email: userData.email || localUser?.email || '',
                phone: userData.contactNO || userData.phone || localUser?.contactNO || '',
                gender: userData.gender || localUser?.gender || '',
                dob: userData.dob ? userData.dob.split('T')[0] : localUser?.dob || '',
                location: userData.faculy || userData.faculty || localUser?.faculy || '',
                batch: userData.batch ? String(userData.batch).replace('Batch ', '') : localUser?.batch || '',
                joinedDate: formattedDate,
                profileImage: userData.profileImage || userData.avatar || localUser?.profileImage || null,
              };
              setProfile(fetchedData);
              setProfileFormData(fetchedData);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch latest user details:', err);
      }
    };

    fetchUserDetails();
  }, []);

  // Handle Input Changes for Profile
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setProfile((prev) => ({ ...prev, profileImage: base64Data }));
      setProfileFormData((prev) => ({ ...prev, profileImage: base64Data }));

      const localUser = getUser() || {};
      const updatedUser = { ...localUser, profileImage: base64Data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userProfileUpdated'));
    };
    reader.readAsDataURL(file);
  };

  const handleStartEditing = () => {
    setProfileFormData({ ...profile });
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleCancelEditing = () => {
    setProfileFormData({ ...profile });
    setIsEditing(false);
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    setProfile({ ...profileFormData });

    const localUser = getUser() || {};
    const updatedUser = {
      ...localUser,
      name: profileFormData.name,
      email: profileFormData.email,
      contactNO: profileFormData.phone,
      phone: profileFormData.phone,
      gender: profileFormData.gender,
      dob: profileFormData.dob,
      faculty: profileFormData.location,
      faculy: profileFormData.location,
      batch: profileFormData.batch,
      profileImage: profileFormData.profileImage,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('userProfileUpdated'));

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getInitials = (name) => {
    if (!name) return 'MB';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

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
    setSettings((prev) => ({ ...prev, language: languageCode }));
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
        {/* Header (Matching Project Page Style) */}
        {!isEmbedded && (
          <header className="settings-hero">
            <div>
              <p className="settings-eyebrow">PREFERENCES</p>
              <h1>{t('settings.title', { defaultValue: 'Settings & Profile' })}</h1>
              <p className="settings-hero-sub">{t('settings.subtitle', { defaultValue: 'Manage your profile and platform settings' })}</p>
            </div>
          </header>
        )}

        {/* Tabs: Profile Settings is 1st and default */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile Settings
          </button>

          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FaCog /> {t('settings.tabs.general', { defaultValue: 'General' })}
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
            <FaBell /> {t('settings.tabs.notifications', { defaultValue: 'Notifications' })}
          </button>
        </div>

        {/* Content Area */}
        <div className="settings-content">
          {/* =========================================================================
             1. PROFILE SETTINGS TAB (Matching Admin Profile Design & Features)
             ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="tab-pane profile-settings-pane">
              <div className="profile-pane-header">
                <div>
                  <h2>Personal Profile</h2>
                  <p className="tab-subtitle">
                    View and manage your personal member profile &amp; account details
                  </p>
                </div>

                <div className="header-actions">
                  {saveSuccess && (
                    <span className="save-toast-badge">
                      <FaCheck /> Profile Updated!
                    </span>
                  )}

                  {!isEditing ? (
                    <button
                      type="button"
                      className="btn-header-edit"
                      onClick={handleStartEditing}
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="edit-action-group">
                      <button
                        type="button"
                        className="btn-header-cancel"
                        onClick={handleCancelEditing}
                      >
                        <FaTimes />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="button"
                        className="btn-header-save"
                        onClick={handleSaveProfile}
                      >
                        <FaCheck />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details Form Card Layout */}
              <div className="personal-details-form-card">
                {/* Profile Avatar Header Strip */}
                <div className="form-card-header">
                  <div className="avatar-container">
                    <div className="avatar-circle">
                      {profile.profileImage ? (
                        <img src={profile.profileImage} alt={profile.name} className="avatar-img" />
                      ) : (
                        getInitials(profile.name)
                      )}
                    </div>

                    <button
                      type="button"
                      className="avatar-camera-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload Photo"
                    >
                      <FaCamera />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                  </div>

                  <div className="header-user-info">
                    <h2 className="user-name">{profile.name || 'Member Profile'}</h2>
                    <div className="user-pills-row">
                      {profile.role && (
                        <span className="role-badge">
                          <FaUserShield /> {profile.role}
                        </span>
                      )}
                      {profile.indexNo && <span className="id-badge">ID: {profile.indexNo}</span>}
                      {profile.batch && <span className="batch-badge">Batch {profile.batch}</span>}
                    </div>
                  </div>
                </div>

                {/* Registered Member Personal Details Form */}
                <form onSubmit={handleSaveProfile} className="profile-form-body">
                  <div className="form-section-header">
                    <h3>Member Profile Details</h3>
                    <span className={`status-tag ${isEditing ? 'editing' : 'viewing'}`}>
                      {isEditing ? 'Edit Mode' : 'View Mode'}
                    </span>
                  </div>

                  <div className="form-grid-layout">
                    {/* 1. Full Name */}
                    <div className="form-field-group">
                      <label htmlFor="name">
                        <FaUser className="field-icon" /> Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={isEditing ? profileFormData.name : profile.name}
                        onChange={handleProfileInputChange}
                        readOnly={!isEditing}
                        className={`form-control ${!isEditing ? 'read-only' : 'editable'}`}
                        required
                      />
                    </div>

                    {/* 2. Email Address */}
                    <div className="form-field-group">
                      <label htmlFor="email">
                        <FaEnvelope className="field-icon" /> Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={isEditing ? profileFormData.email : profile.email}
                        onChange={handleProfileInputChange}
                        readOnly={!isEditing}
                        className={`form-control ${!isEditing ? 'read-only' : 'editable'}`}
                        required
                      />
                    </div>

                    {/* 3. Contact Number */}
                    <div className="form-field-group">
                      <label htmlFor="phone">
                        <FaPhoneAlt className="field-icon" /> Contact Number
                      </label>
                      <input
                        id="phone"
                        type="text"
                        name="phone"
                        value={isEditing ? profileFormData.phone : profile.phone}
                        onChange={handleProfileInputChange}
                        readOnly={!isEditing}
                        className={`form-control ${!isEditing ? 'read-only' : 'editable'}`}
                      />
                    </div>

                    {/* 4. Student ID / Registration No (System Managed) */}
                    <div className="form-field-group">
                      <label>
                        <FaIdCard className="field-icon" /> Student ID / Reg No
                      </label>
                      <input
                        type="text"
                        value={profile.indexNo}
                        readOnly
                        className="form-control read-only system-field"
                      />
                    </div>

                    {/* 5. Gender */}
                    <div className="form-field-group">
                      <label htmlFor="gender">
                        <FaVenusMars className="field-icon" /> Gender
                      </label>
                      {isEditing ? (
                        <select
                          id="gender"
                          name="gender"
                          value={profileFormData.gender}
                          onChange={handleProfileInputChange}
                          className="form-control editable select-control"
                        >
                          {GENDERS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={profile.gender}
                          readOnly
                          className="form-control read-only"
                        />
                      )}
                    </div>

                    {/* 6. Date of Birth */}
                    <div className="form-field-group">
                      <label htmlFor="dob">
                        <FaBirthdayCake className="field-icon" /> Date of Birth
                      </label>
                      <input
                        id="dob"
                        type={isEditing ? 'date' : 'text'}
                        name="dob"
                        value={isEditing ? profileFormData.dob : profile.dob}
                        onChange={handleProfileInputChange}
                        readOnly={!isEditing}
                        className={`form-control ${!isEditing ? 'read-only' : 'editable'}`}
                      />
                    </div>

                    {/* 7. Faculty (System Managed) */}
                    <div className="form-field-group">
                      <label>
                        <FaMapMarkerAlt className="field-icon" /> Faculty
                      </label>
                      <input
                        type="text"
                        value={profile.location}
                        readOnly
                        className="form-control read-only system-field"
                      />
                    </div>

                    {/* 8. Batch (System Managed) */}
                    <div className="form-field-group">
                      <label>
                        <FaLayerGroup className="field-icon" /> Batch
                      </label>
                      <input
                        type="text"
                        value={profile.batch ? `Batch ${profile.batch}` : ''}
                        readOnly
                        className="form-control read-only system-field"
                      />
                    </div>

                    {/* 9. Account Role (System Managed) */}
                    <div className="form-field-group">
                      <label>
                        <FaUserShield className="field-icon" /> Account Role
                      </label>
                      <input
                        type="text"
                        value={profile.role}
                        readOnly
                        className="form-control read-only system-field"
                      />
                    </div>

                    {/* 10. Member Since (System Managed) */}
                    <div className="form-field-group">
                      <label>
                        <FaCalendarAlt className="field-icon" /> Member Since
                      </label>
                      <input
                        type="text"
                        value={profile.joinedDate}
                        readOnly
                        className="form-control read-only system-field"
                      />
                    </div>
                  </div>

                  {/* Bottom Actions Row when in Editing Mode */}
                  {isEditing && (
                    <div className="form-bottom-bar">
                      <button type="button" className="btn-bottom-cancel" onClick={handleCancelEditing}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-bottom-save">
                        <FaCheck /> Save Member Profile
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* =========================================================================
             2. GENERAL SETTINGS TAB
             ========================================================================= */}
          {activeTab === 'general' && (
            <div className="tab-pane general-settings">
              <div className="tab-header-block">
                <h2>{t('settings.general.title', { defaultValue: 'General Preferences' })}</h2>
                <p className="tab-subtitle">
                  Customize your platform language and interface localization preferences.
                </p>
              </div>

              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-label">
                    <label htmlFor="language">{t('settings.general.language.label', { defaultValue: 'Platform Language' })}</label>
                    <p>{t('settings.general.language.description', { defaultValue: 'Select your preferred interface language' })}</p>
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

          {/* =========================================================================
             3. SECURITY & PASSWORD TAB
             ========================================================================= */}
          {activeTab === 'security' && (
            <div className="tab-pane security-settings">
              <div className="tab-header-block">
                <h2>Security &amp; Password</h2>
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
                      type={showCurrentPwd ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      className="setting-input"
                      required
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowCurrentPwd((prev) => !prev)}
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
                      type={showNewPwd ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="setting-input"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowNewPwd((prev) => !prev)}
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
                      type={showConfirmPwd ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="setting-input"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowConfirmPwd((prev) => !prev)}
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

          {/* =========================================================================
             4. NOTIFICATIONS TAB
             ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="tab-pane notifications-settings">
              <div className="tab-header-block">
                <h2>{t('settings.notifications.title', { defaultValue: 'Notification Preferences' })}</h2>
                <p className="tab-subtitle">
                  Configure your email notifications and automated platform alerts.
                </p>
              </div>

              <div className="settings-group">
                <h3>{t('settings.notifications.emailGroup', { defaultValue: 'Email & Alerts' })}</h3>
                {settings.emailNotifications && (
                  <>
                    <div className="setting-item">
                      <div className="setting-label">
                        <label>{t('settings.notifications.taskReminders.label', { defaultValue: 'Task Reminders' })}</label>
                        <p>{t('settings.notifications.taskReminders.description', { defaultValue: 'Receive email alerts for approaching task deadlines' })}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.taskReminders}
                        onChange={() => setSettings((p) => ({ ...p, taskReminders: !p.taskReminders }))}
                        className="setting-checkbox"
                      />
                    </div>

                    <div className="setting-item">
                      <div className="setting-label">
                        <label>{t('settings.notifications.projectUpdates.label', { defaultValue: 'Project Updates' })}</label>
                        <p>{t('settings.notifications.projectUpdates.description', { defaultValue: 'Get notified when tasks or projects are modified' })}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.projectUpdates}
                        onChange={() => setSettings((p) => ({ ...p, projectUpdates: !p.projectUpdates }))}
                        className="setting-checkbox"
                      />
                    </div>

                    <div className="setting-item">
                      <div className="setting-label">
                        <label>{t('settings.notifications.performanceAlerts.label', { defaultValue: 'Performance Alerts' })}</label>
                        <p>{t('settings.notifications.performanceAlerts.description', { defaultValue: 'Weekly summary of contributions and progress' })}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.performanceAlerts}
                        onChange={() => setSettings((p) => ({ ...p, performanceAlerts: !p.performanceAlerts }))}
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
