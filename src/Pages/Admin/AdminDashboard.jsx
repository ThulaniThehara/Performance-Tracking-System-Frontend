import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "../../SCSS/AdminStyles/AdminDashboard/AdminDashboard.scss";
import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import { getUser, getToken } from "../../utils/auth";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaEdit,
  FaUserShield,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaCamera,
  FaUser,
  FaIdCard,
  FaLayerGroup,
  FaVenusMars,
  FaBirthdayCake,
} from "react-icons/fa";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FACULTIES = [
  "Faculty of Engineering",
  "Faculty of Medicine",
  "Faculty of IT",
  "Faculty of Business",
  "Faculty of Architecture",
];

const BATCHES = ["21", "22", "23", "24", "25"];

const GENDERS = ["Male", "Female", "Other"];

const AdminDashboard = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  // Helper to format date cleanly
  const formatJoinedDate = (createdVal, idVal) => {
    try {
      if (createdVal) {
        return new Date(createdVal).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
      if (idVal && typeof idVal === "string" && idVal.length === 24) {
        const timestamp = parseInt(idVal.substring(0, 8), 16) * 1000;
        return new Date(timestamp).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    } catch (e) {
      console.warn("Error parsing joined date:", e);
    }
    return new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  // Profile State initialized cleanly from logged-in session user
  const [profile, setProfile] = useState(() => {
    const localUser = getUser() || {};
    return {
      name: localUser.name || localUser.username || "",
      role: localUser.userRole || localUser.role || "ADMIN",
      indexNo: localUser.indexNo || "",
      email: localUser.email || "",
      phone: localUser.contactNO || localUser.phone || "",
      gender: localUser.gender || "",
      dob: localUser.dob || "",
      location: localUser.faculy || localUser.faculty || "",
      batch: localUser.batch ? String(localUser.batch).replace("Batch ", "") : "",
      joinedDate: "",
      profileImage: localUser.profileImage || localUser.avatar || null,
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch logged-in user details dynamically
  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const localUser = getUser();

        if (localUser) {
          const formattedDate = formatJoinedDate(localUser.createdAt || localUser.created_at, localUser._id || localUser.id);
          const initialData = {
            name: localUser.name || localUser.username || "",
            email: localUser.email || "",
            role: localUser.userRole || localUser.role || "ADMIN",
            indexNo: localUser.indexNo || "",
            phone: localUser.contactNO || localUser.phone || "",
            gender: localUser.gender || "",
            dob: localUser.dob || "",
            location: localUser.faculy || localUser.faculty || "",
            batch: localUser.batch ? String(localUser.batch).replace("Batch ", "") : "",
            joinedDate: formattedDate,
            profileImage: localUser.profileImage || localUser.avatar || null,
          };
          setProfile(initialData);
          setFormData(initialData);
        }

        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const endpoint = localUser?.email
          ? `${baseURL}/user/email/${encodeURIComponent(localUser.email)}`
          : `${baseURL}/user/role/ADMIN`;

        const res = await fetch(endpoint, { headers });
        if (res.ok) {
          const data = await res.json();
          const adminData = Array.isArray(data) ? (data.find((u) => (u.userRole || u.role) === "ADMIN") || data[0]) : data;

          if (adminData) {
            const formattedDate = formatJoinedDate(adminData.createdAt || adminData.created_at, adminData._id || adminData.id);
            const fetchedData = {
              name: adminData.name || localUser?.name || "",
              role: adminData.userRole || adminData.role || localUser?.userRole || "ADMIN",
              indexNo: adminData.indexNo || localUser?.indexNo || "",
              email: adminData.email || localUser?.email || "",
              phone: adminData.contactNO || adminData.phone || localUser?.contactNO || "",
              gender: adminData.gender || localUser?.gender || "",
              dob: adminData.dob ? adminData.dob.split("T")[0] : localUser?.dob || "",
              location: adminData.faculy || adminData.faculty || localUser?.faculy || "",
              batch: adminData.batch ? String(adminData.batch).replace("Batch ", "") : localUser?.batch || "",
              joinedDate: formattedDate,
              profileImage: adminData.profileImage || adminData.avatar || localUser?.profileImage || null,
            };
            setProfile(fetchedData);
            setFormData(fetchedData);
          }
        }
      } catch (err) {
        console.warn("Could not fetch latest admin details:", err);
      }
    };

    fetchAdminDetails();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setProfile((prev) => ({ ...prev, profileImage: base64Data }));
      setFormData((prev) => ({ ...prev, profileImage: base64Data }));

      const localUser = getUser() || {};
      const updatedUser = { ...localUser, profileImage: base64Data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userProfileUpdated"));
    };
    reader.readAsDataURL(file);
  };

  const handleStartEditing = () => {
    setFormData({ ...profile });
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleCancelEditing = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    setProfile({ ...formData });

    const localUser = getUser() || {};
    const updatedUser = {
      ...localUser,
      name: formData.name,
      email: formData.email,
      contactNO: formData.phone,
      phone: formData.phone,
      gender: formData.gender,
      dob: formData.dob,
      faculty: formData.location,
      faculy: formData.location,
      batch: formData.batch,
      profileImage: formData.profileImage,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("userProfileUpdated"));

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="admin-dashboard-page">
      <Header />
      <LeftNavigationBar />

      <main className="admin-dashboard-main">
        <div className="dashboard-content-container">

          {/* Page Hero Header with Title and Edit Action */}
          <header className="pm-hero">
            <div>
              <p className="pm-eyebrow">ACCOUNT &amp; PROFILE</p>
              <h1>{t('admin.profile.title', { defaultValue: 'Personal Profile' })}</h1>
              <p className="pm-hero-sub">
                {t('admin.profile.subtitle', { defaultValue: 'View and manage your personal administrator profile & account details' })}
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
          </header>

          {/* Form Card Layout */}
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
                  style={{ display: "none" }}
                  onChange={handlePhotoUpload}
                />
              </div>

              <div className="header-user-info">
                <h2 className="user-name">{profile.name || "Admin Profile"}</h2>
                <div className="user-pills-row">
                  {profile.role && <span className="role-badge"><FaUserShield /> {profile.role}</span>}
                  {profile.indexNo && <span className="id-badge">ID: {profile.indexNo}</span>}
                  {profile.batch && <span className="batch-badge">Batch {profile.batch}</span>}
                </div>
              </div>
            </div>

            {/* Registered Member Personal Details Form */}
            <form onSubmit={handleSaveProfile} className="profile-form-body">
              <div className="form-section-header">
                <h3>Member Profile Details</h3>
                <span className={`status-tag ${isEditing ? "editing" : "viewing"}`}>
                  {isEditing ? "Edit Mode" : "View Mode"}
                </span>
              </div>

              <div className="form-grid-layout">

                {/* 1. Full Name */}
                <div className="form-field-group">
                  <label htmlFor="name"><FaUser className="field-icon" /> Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={isEditing ? formData.name : profile.name}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`form-control ${!isEditing ? "read-only" : "editable"}`}
                    required
                  />
                </div>

                {/* 2. Email Address */}
                <div className="form-field-group">
                  <label htmlFor="email"><FaEnvelope className="field-icon" /> Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={isEditing ? formData.email : profile.email}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`form-control ${!isEditing ? "read-only" : "editable"}`}
                    required
                  />
                </div>

                {/* 3. Contact Number */}
                <div className="form-field-group">
                  <label htmlFor="phone"><FaPhoneAlt className="field-icon" /> Contact Number</label>
                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={isEditing ? formData.phone : profile.phone}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`form-control ${!isEditing ? "read-only" : "editable"}`}
                  />
                </div>

                {/* 4. Student ID / Registration No (System Managed) */}
                <div className="form-field-group">
                  <label><FaIdCard className="field-icon" /> Student ID / Reg No</label>
                  <input
                    type="text"
                    value={profile.indexNo}
                    readOnly
                    className="form-control read-only system-field"
                  />
                </div>

                {/* 5. Gender */}
                <div className="form-field-group">
                  <label htmlFor="gender"><FaVenusMars className="field-icon" /> Gender</label>
                  {isEditing ? (
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-control editable select-control"
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
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
                  <label htmlFor="dob"><FaBirthdayCake className="field-icon" /> Date of Birth</label>
                  <input
                    id="dob"
                    type={isEditing ? "date" : "text"}
                    name="dob"
                    value={isEditing ? formData.dob : profile.dob}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`form-control ${!isEditing ? "read-only" : "editable"}`}
                  />
                </div>

                {/* 7. Faculty (System Managed) */}
                <div className="form-field-group">
                  <label><FaMapMarkerAlt className="field-icon" /> Faculty</label>
                  <input
                    type="text"
                    value={profile.location}
                    readOnly
                    className="form-control read-only system-field"
                  />
                </div>

                {/* 8. Batch (System Managed) */}
                <div className="form-field-group">
                  <label><FaLayerGroup className="field-icon" /> Batch</label>
                  <input
                    type="text"
                    value={profile.batch ? `Batch ${profile.batch}` : ""}
                    readOnly
                    className="form-control read-only system-field"
                  />
                </div>

                {/* 9. Account Role (System Managed) */}
                <div className="form-field-group">
                  <label><FaUserShield className="field-icon" /> Account Role</label>
                  <input
                    type="text"
                    value={profile.role}
                    readOnly
                    className="form-control read-only system-field"
                  />
                </div>

                {/* 10. Member Since (System Managed) */}
                <div className="form-field-group">
                  <label><FaCalendarAlt className="field-icon" /> Member Since</label>
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
      </main>
    </div>
  );
};

export default AdminDashboard;