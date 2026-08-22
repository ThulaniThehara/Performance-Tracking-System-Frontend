import React, { useState, useEffect, useRef } from "react";
import "../../SCSS/AdminStyles/AdminDashboard/AdminDashboard.scss";
import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import { getUser, getToken } from "../../utils/auth";
import { apiFetch } from "../../utils/api";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaEdit,
  FaUserShield,
  FaCalendarAlt,
  FaProjectDiagram,
  FaUsers,
  FaTasks,
  FaAward,
  FaTimes,
  FaCheck,
  FaClock,
  FaExternalLinkAlt,
  FaCalendarCheck,
  FaCamera,
  FaUpload,
  FaTrashAlt,
} from "react-icons/fa";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ROLE_LABELS = {
  CHAIRPERSON: "Chairperson",
  COMMITTEE_LEAD: "Committee Lead",
  MEMBER: "Member",
};

const AdminDashboard = () => {
  const fileInputRef = useRef(null);

  // Helper to format date cleanly
  const formatJoinedDate = (createdVal, idVal) => {
    try {
      if (createdVal) {
        return new Date(createdVal).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
      if (idVal && typeof idVal === "string" && idVal.length === 24) {
        // Extract timestamp from MongoDB ObjectId
        const timestamp = parseInt(idVal.substring(0, 8), 16) * 1000;
        return new Date(timestamp).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    } catch (e) {
      console.warn("Error parsing joined date:", e);
    }
    return new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  // Admin Personal Profile State (Dynamically fetched)
  const [profile, setProfile] = useState({
    name: "Admin User",
    role: "System Administrator",
    indexNo: "ADM001",
    email: "admin@gmail.com",
    phone: "+94 77 123 4567",
    location: "Faculty of Information Technology",
    batch: "Batch 21",
    joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    profileImage: null,
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...profile });

  // Fetch logged-in Admin details
  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        setLoadingProfile(true);
        const localUser = getUser();

        // 1. If stored in localStorage, initialize with local user
        if (localUser) {
          const formattedDate = formatJoinedDate(localUser.createdAt || localUser.created_at, localUser._id || localUser.id);
          setProfile((prev) => ({
            ...prev,
            name: localUser.name || localUser.username || "Admin",
            email: localUser.email || prev.email,
            role: localUser.userRole || localUser.role || "System Administrator",
            indexNo: localUser.indexNo || prev.indexNo,
            phone: localUser.contactNO || localUser.phone || prev.phone,
            location: localUser.faculy || localUser.faculty || prev.location,
            batch: localUser.batch ? `Batch ${localUser.batch}` : prev.batch,
            joinedDate: formattedDate,
            profileImage: localUser.profileImage || localUser.avatar || null,
          }));
        }

        // 2. Fetch from backend to ensure freshest admin details
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const endpoint = localUser?.email
          ? `${baseURL}/user/email/${encodeURIComponent(localUser.email)}`
          : `${baseURL}/user/role/ADMIN`;

        const res = await fetch(endpoint, { headers });
        if (res.ok) {
          const data = await res.json();
          const adminData = Array.isArray(data) ? (data.find((u) => (u.userRole || u.role) === "ADMIN") || data[0]) : data;

          if (adminData && adminData.name) {
            const formattedDate = formatJoinedDate(adminData.createdAt || adminData.created_at, adminData._id || adminData.id);
            const updatedProfile = {
              name: adminData.name,
              role: adminData.userRole === "ADMIN" ? "System Administrator & Lead" : (adminData.userRole || "Administrator"),
              indexNo: adminData.indexNo || "ADM001",
              email: adminData.email || "admin@gmail.com",
              phone: adminData.contactNO || "+94 77 123 4567",
              location: adminData.faculy || adminData.faculty || "Faculty of IT, University of Moratuwa",
              batch: adminData.batch ? `Batch ${adminData.batch}` : "Batch 21",
              joinedDate: formattedDate,
              profileImage: adminData.profileImage || adminData.avatar || localUser?.profileImage || null,
            };
            setProfile(updatedProfile);
            setEditFormData(updatedProfile);
          }
        }
      } catch (err) {
        console.warn("Could not fetch latest admin details from API, using fallback:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchAdminDetails();
  }, []);

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      
      // Update state
      setProfile((prev) => ({ ...prev, profileImage: base64Data }));
      setEditFormData((prev) => ({ ...prev, profileImage: base64Data }));

      // Update localStorage & notify Header
      const localUser = getUser() || {};
      const updatedUser = { ...localUser, profileImage: base64Data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userProfileUpdated"));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfile((prev) => ({ ...prev, profileImage: null }));
    setEditFormData((prev) => ({ ...prev, profileImage: null }));

    const localUser = getUser() || {};
    const updatedUser = { ...localUser, profileImage: null };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("userProfileUpdated"));
  };

  // Admin's own project/committee/activity data, computed from the database
  // via GET /pm/my-dashboard (no more hardcoded arrays).
  const [myProjects, setMyProjects] = useState([]);
  const [myCommittees, setMyCommittees] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalCommittees: 0,
    committeesLed: 0,
    totalTasksAssigned: 0,
    tasksCompleted: 0,
    contributionScore: 0,
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const formatRelativeTime = (dateVal) => {
    if (!dateVal) return "";
    const diffMs = Date.now() - new Date(dateVal).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(dateVal).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoadingDashboard(true);
        const res = await apiFetch("/pm/my-dashboard");
        const data = res?.data || {};

        setMyProjects(
          (data.projects || []).map((p) => ({
            id: p.id,
            name: p.name,
            role: p.position || ROLE_LABELS[p.role] || "Member",
            year: p.year,
            category: p.societyName || "",
            status: p.status ? p.status.charAt(0) + p.status.slice(1).toLowerCase() : "Active",
            contribution: p.contribution === null || p.contribution === undefined ? "—" : `${p.contribution}%`,
          }))
        );

        setMyCommittees(
          (data.committees || []).map((c) => ({
            id: c.id,
            name: c.name,
            role: c.role === "COMMITTEE_LEAD" ? "Committee Head" : (c.position || "Member"),
            year: c.year,
            membersCount: c.membersCount,
            status: c.status ? c.status.charAt(0) + c.status.slice(1).toLowerCase() : "Active",
          }))
        );

        setRecentActivities(
          (data.recentActivity || []).map((a, idx) => ({
            id: idx,
            type: a.type,
            title: a.title,
            detail: a.detail,
            time: formatRelativeTime(a.date),
          }))
        );

        if (data.stats) setDashboardStats(data.stats);
      } catch (err) {
        console.warn("Could not fetch admin dashboard data:", err);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboard();
  }, []);

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleEditModalSave = (e) => {
    e.preventDefault();
    setProfile({ ...editFormData });
    // Also update local storage if user is logged in
    const localUser = getUser();
    if (localUser) {
      localStorage.setItem("user", JSON.stringify({ ...localUser, ...editFormData }));
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="admin-dashboard-page">
      <Header />
      <LeftNavigationBar />

      <main className="admin-dashboard-main">
        <div className="dashboard-content-container">

          {/* 1. Sleek Admin Profile Banner (Matching Image 3 Reference) */}
          <section className="profile-banner-card">
            {/* Abstract curved wave background */}
            <div className="banner-wave-background">
              <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="wave-svg">
                <path
                  d="M0,0 L1200,0 L1200,90 Q950,160 680,105 Q400,50 0,130 Z"
                  fill="url(#bannerGradient)"
                />
                <defs>
                  <linearGradient id="bannerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#563eb5" />
                    <stop offset="50%" stopColor="#6b52d1" />
                    <stop offset="100%" stopColor="#9d7bf0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="banner-content-inner">
              {/* Avatar with Circular Framing & Photo Upload (Matching Image 3) */}
              <div className="avatar-curved-frame">
                <div className="avatar-circle-main">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt={profile.name} className="avatar-img-main" />
                  ) : (
                    getInitials(profile.name)
                  )}
                </div>
                <button
                  type="button"
                  className="avatar-camera-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload / Change Profile Picture"
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

              {/* Profile Details */}
              <div className="profile-text-content">
                <div className="profile-heading-row">
                  <div className="name-and-role">
                    <h1 className="profile-name">{profile.name}</h1>
                    <span className="profile-badge">
                      <FaUserShield />
                      <span>{profile.role}</span>
                    </span>
                    <span className="index-pill">ID: {profile.indexNo}</span>
                  </div>

                  <button
                    type="button"
                    className="btn-edit-profile"
                    onClick={() => {
                      setEditFormData({ ...profile });
                      setIsEditModalOpen(true);
                    }}
                  >
                    <FaEdit />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="profile-info-strip">
                  <div className="info-chip">
                    <FaEnvelope className="chip-icon" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="info-chip">
                    <FaPhoneAlt className="chip-icon" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="info-chip">
                    <FaMapMarkerAlt className="chip-icon" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="info-chip">
                    <FaCalendarAlt className="chip-icon" />
                    <span>Member since {profile.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Modern 4-Card Stats Overview (Matching Image 1 Reference) */}
          {/* 2. Modern 4-Card Stats Overview (Matching Brand Palette) */}
          <section className="stats-overview-section">
            <div className="section-header-inline">
              <h2>Dashboard Overview</h2>
              <span className="period-badge">
                <FaCalendarCheck /> All Time Performance
              </span>
            </div>

            <div className="stats-cards-grid">
              {/* Card 1: My Projects */}
              <div className="stat-overview-card">
                <div className="card-top-row">
                  <div className="stat-icon-wrapper">
                    <FaProjectDiagram />
                  </div>
                </div>
                <div className="stat-body">
                  <span className="stat-title">Projects Done</span>
                  <span className="stat-number">
                    {loadingDashboard ? "…" : `${dashboardStats.completedProjects}/${dashboardStats.totalProjects}`}
                  </span>
                </div>
                <div
                  className="stat-progress-bar"
                  style={{
                    "--progress": `${dashboardStats.totalProjects
                      ? Math.round((dashboardStats.completedProjects / dashboardStats.totalProjects) * 100)
                      : 0}%`,
                  }}
                />
              </div>

              {/* Card 2: Committees Led */}
              <div className="stat-overview-card">
                <div className="card-top-row">
                  <div className="stat-icon-wrapper">
                    <FaUsers />
                  </div>
                </div>
                <div className="stat-body">
                  <span className="stat-title">Committees Headed</span>
                  <span className="stat-number">
                    {loadingDashboard ? "…" : `${dashboardStats.committeesLed}/${dashboardStats.totalCommittees}`}
                  </span>
                </div>
                <div
                  className="stat-progress-bar"
                  style={{
                    "--progress": `${dashboardStats.totalCommittees
                      ? Math.round((dashboardStats.committeesLed / dashboardStats.totalCommittees) * 100)
                      : 0}%`,
                  }}
                />
              </div>

              {/* Card 3: Tasks Completed */}
              <div className="stat-overview-card">
                <div className="card-top-row">
                  <div className="stat-icon-wrapper">
                    <FaTasks />
                  </div>
                </div>
                <div className="stat-body">
                  <span className="stat-title">Tasks Completed</span>
                  <span className="stat-number">
                    {loadingDashboard ? "…" : dashboardStats.tasksCompleted}
                  </span>
                </div>
                <div
                  className="stat-progress-bar"
                  style={{
                    "--progress": `${dashboardStats.totalTasksAssigned
                      ? Math.round((dashboardStats.tasksCompleted / dashboardStats.totalTasksAssigned) * 100)
                      : 0}%`,
                  }}
                />
              </div>

              {/* Card 4: Contribution Score */}
              <div className="stat-overview-card">
                <div className="card-top-row">
                  <div className="stat-icon-wrapper">
                    <FaAward />
                  </div>
                </div>
                <div className="stat-body">
                  <span className="stat-title">Contribution Score</span>
                  <span className="stat-number">
                    {loadingDashboard ? "…" : `${dashboardStats.contributionScore}%`}
                  </span>
                </div>
                <div className="stat-progress-bar" style={{ "--progress": `${dashboardStats.contributionScore}%` }} />
              </div>
            </div>
          </section>

          {/* 3. Main Split Grid: Admin's Projects & Activity (Matching Image 2 Reference) */}
          <div className="content-split-grid">
            
            {/* Left Column: Admin's Own Projects (Event Card Style - Image 2) */}
            <div className="grid-card-block">
              <div className="card-header-row">
                <div className="title-group">
                  <h3>My Projects & Contributions</h3>
                  <p>Society projects spearheaded or contributed by me</p>
                </div>
              </div>

              <div className="event-cards-list">
                {!loadingDashboard && myProjects.length === 0 && (
                  <p className="empty-state-text">No projects yet — you haven't been added to any project.</p>
                )}
                {myProjects.map((p) => (
                  <div key={p.id} className="event-card-item">
                    <div className="event-date-box">
                      <span className="date-label">YEAR</span>
                      <span className="date-year">{p.year}</span>
                    </div>

                    <div className="event-details">
                      <div className="event-title-row">
                        <h4 className="event-title">{p.name}</h4>
                        {p.category && <span className="event-category-tag">{p.category}</span>}
                      </div>
                      <p className="event-subtitle">
                        <span>{p.role}</span>
                        <span className="bullet-sep">·</span>
                        <span>{p.contribution} Contribution</span>
                      </p>
                    </div>

                    <div className="event-right-action">
                      <span className={`event-status-pill ${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Committees Participated & Recent Activity */}
            <div className="grid-stack-column">
              
              {/* Committees Card (Image 2 style) */}
              <div className="grid-card-block">
                <div className="card-header-row">
                  <div className="title-group">
                    <h3>Committees & Leadership</h3>
                    <p>Leadership and member assignments</p>
                  </div>
                </div>

                <div className="committees-mini-list">
                  {!loadingDashboard && myCommittees.length === 0 && (
                    <p className="empty-state-text">No committee assignments yet.</p>
                  )}
                  {myCommittees.map((c) => (
                    <div key={c.id} className="committee-mini-item">
                      <div className="committee-year-badge">
                        <span>{c.year}</span>
                      </div>
                      <div className="committee-info">
                        <span className="c-name">{c.name}</span>
                        <span className="c-role-text">{c.role} · {c.membersCount} Members</span>
                      </div>
                      <span className={`c-status-tag ${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Card */}
              <div className="grid-card-block">
                <div className="card-header-row">
                  <div className="title-group">
                    <h3>Recent Activity</h3>
                    <p>Latest milestones & contributions</p>
                  </div>
                </div>

                <div className="recent-activity-feed">
                  {!loadingDashboard && recentActivities.length === 0 && (
                    <p className="empty-state-text">No recent activity yet.</p>
                  )}
                  {recentActivities.map((a) => (
                    <div key={a.id} className="activity-feed-row">
                      <div className="activity-icon-bubble">
                        {a.type === "project" && <FaProjectDiagram />}
                        {a.type === "committee" && <FaUsers />}
                        {a.type === "task" && <FaTasks />}
                      </div>
                      <div className="activity-details">
                        <span className="activity-headline">{a.title}</span>
                        <span className="activity-sub">{a.detail}</span>
                      </div>
                      <span className="activity-timestamp">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content admin-edit-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile Information</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsEditModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditModalSave}>
              <div className="modal-body">
                {/* Profile Photo Uploader */}
                <div className="modal-photo-uploader">
                  <div className="uploader-avatar-preview">
                    {editFormData.profileImage ? (
                      <img src={editFormData.profileImage} alt="Avatar" className="preview-img" />
                    ) : (
                      <div className="preview-initials">{getInitials(editFormData.name)}</div>
                    )}
                  </div>
                  <div className="uploader-actions">
                    <button
                      type="button"
                      className="btn-uploader-upload"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FaCamera />
                      <span>{editFormData.profileImage ? "Change Photo" : "Upload Photo"}</span>
                    </button>
                    {editFormData.profileImage && (
                      <button
                        type="button"
                        className="btn-uploader-remove"
                        onClick={handleRemovePhoto}
                      >
                        <FaTrashAlt />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="modal-form-grid">
                  <div className="modal-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="modern-input"
                      required
                    />
                  </div>

                  <div className="modal-field">
                    <label>Designation / Role Title</label>
                    <input
                      type="text"
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="modern-input"
                      required
                    />
                  </div>

                  <div className="modal-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="modern-input"
                      required
                    />
                  </div>

                  <div className="modal-field">
                    <label>Contact Number</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="modern-input"
                    />
                  </div>

                  <div className="modal-field full-width">
                    <label>Faculty / Institution</label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      className="modern-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal primary">
                  <FaCheck /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;