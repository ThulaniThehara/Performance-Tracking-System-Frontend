import React, { useState, useEffect } from "react";
import {
  FaCommentDots,
  FaExclamationTriangle,
  FaStar,
  FaFilter,
  FaTrashAlt,
  FaSpinner,
  FaFolder,
  FaUser,
  FaSearch,
  FaCheckCircle,
} from "react-icons/fa";
import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import "../../SCSS/AdminStyles/AdminFeedbackPage.scss";

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // 2 main tabs: 'feedbacks' | 'complaints'
  const [activeMainTab, setActiveMainTab] = useState("feedbacks");

  // Right-side filters
  const [scopeFilter, setScopeFilter] = useState("ALL"); // 'ALL' | 'PROJECT' | 'GENERAL'
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("ALL_PROJECTS");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/feedback/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbacks(data.feedbacks || []);
        setComplaints(data.complaints || []);
        setStats(data.stats || {});
      }
    } catch (e) {
      console.warn("Error fetching admin feedback data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/feedback/admin/complaint/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.warn("Error updating status:", e);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/feedback/admin/${type}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.warn("Error deleting submission:", e);
    }
  };

  // Unique projects list
  const projectNames = Array.from(
    new Set(
      [...feedbacks, ...complaints]
        .map((item) => item.projectName)
        .filter(Boolean)
    )
  );

  // Filtered lists
  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (scopeFilter === "PROJECT" && !fb.projectName) return false;
    if (scopeFilter === "GENERAL" && fb.projectName) return false;
    if (selectedProjectFilter !== "ALL_PROJECTS" && fb.projectName !== selectedProjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = fb.message?.toLowerCase().includes(q);
      const matchAuthor = (fb.userId?.name || fb.author)?.toLowerCase().includes(q);
      const matchProj = fb.projectName?.toLowerCase().includes(q);
      if (!matchMsg && !matchAuthor && !matchProj) return false;
    }
    return true;
  });

  const filteredComplaints = complaints.filter((c) => {
    if (scopeFilter === "PROJECT" && !c.projectName) return false;
    if (scopeFilter === "GENERAL" && c.projectName) return false;
    if (selectedProjectFilter !== "ALL_PROJECTS" && c.projectName !== selectedProjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      const matchAuthor = (c.userId?.name || c.from)?.toLowerCase().includes(q);
      const matchProj = c.projectName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAuthor && !matchProj) return false;
    }
    return true;
  });

  return (
    <div className="admin-feedback-page-layout">
      <Header />
      <LeftNavigationBar />

      <main className="admin-feedback-main">
        <div className="feedback-page-wrapper">
          {/* 1. Header (Matching Reference Style) */}
          <div className="clean-admin-header">
            <span className="eyebrow-tag">ADMINISTRATION</span>
            <h1 className="main-title">Member Feedbacks & Issues</h1>
            <p className="subtitle-text">
              Review and manage all project-specific and platform-wide feedback, suggestions, and reported issues from members.
            </p>
          </div>

          {/* 2. Premium Metric Stats Cards */}
          <div className="stats-cards-grid">
            <div className="stat-card">
              <span className="stat-val val-purple">{feedbacks.length}</span>
              <span className="stat-lbl">Total Feedbacks</span>
            </div>
            <div className="stat-card">
              <span className="stat-val val-rose">{complaints.length}</span>
              <span className="stat-lbl">Reported Issues</span>
            </div>
            <div className="stat-card">
              <span className="stat-val val-amber">{complaints.filter((c) => c.status === "Open").length}</span>
              <span className="stat-lbl">Pending / Open</span>
            </div>
            <div className="stat-card">
              <span className="stat-val val-green">{complaints.filter((c) => c.status === "Resolved").length}</span>
              <span className="stat-lbl">Resolved Issues</span>
            </div>
          </div>

          {/* 3. Horizontal Tab Bar with Right-side Filters (Matching Image 4) */}
          <div className="admin-tab-and-filters-bar">
            {/* Left: 2 Tabs */}
            <div className="admin-tabs-nav">
              <button
                className={`admin-tab-btn ${activeMainTab === "feedbacks" ? "active" : ""}`}
                onClick={() => setActiveMainTab("feedbacks")}
              >
                <FaCommentDots /> Feedbacks
                <span className="tab-count-badge">{feedbacks.length}</span>
              </button>

              <button
                className={`admin-tab-btn ${activeMainTab === "complaints" ? "active" : ""}`}
                onClick={() => setActiveMainTab("complaints")}
              >
                <FaExclamationTriangle /> Issues & Complaints
                <span className="tab-count-badge">{complaints.length}</span>
              </button>
            </div>

            {/* Right: Filters & Search */}
            <div className="admin-tab-right-filters">
              {/* Scope filter */}
              <div className="scope-select-wrap">
                <select
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">All Submissions</option>
                  <option value="PROJECT">Project-Specific</option>
                  <option value="GENERAL">General Platform</option>
                </select>
              </div>

              {/* Project filter (when projects exist) */}
              {projectNames.length > 0 && scopeFilter !== "GENERAL" && (
                <div className="project-select-wrap">
                  <select
                    value={selectedProjectFilter}
                    onChange={(e) => setSelectedProjectFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL_PROJECTS">All Projects</option>
                    {projectNames.map((name) => (
                      <option key={name} value={name}>
                        📁 {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search Bar */}
              <div className="search-wrap">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>

          {/* 4. Tab Content */}
          {loading ? (
            <div className="loading-box">
              <FaSpinner className="fa-spin" />
              <p>Loading member submissions...</p>
            </div>
          ) : (
            <div className="tab-content-area">
              {/* Feedbacks Tab */}
              {activeMainTab === "feedbacks" && (
                <div className="submissions-stack">
                  {filteredFeedbacks.length === 0 ? (
                    <div className="empty-state-card">
                      No feedbacks found matching your selected filters.
                    </div>
                  ) : (
                    filteredFeedbacks.map((fb) => (
                      <div key={fb._id} className="admin-submission-card feedback-item">
                        <div className="card-top-row">
                          <span className="author-pill">
                            <FaUser /> {fb.userId?.name || fb.author || "Member"}
                          </span>
                          {fb.projectName && (
                            <span className="project-pill">
                              <FaFolder /> {fb.projectName}
                            </span>
                          )}
                          {fb.targetMember && (
                            <span className="target-pill">
                              Target: {fb.targetMember}
                            </span>
                          )}
                          <span className="category-pill">{fb.type}</span>
                          <span className="stars-pill">⭐ {fb.rating}/5</span>
                          <span className="date-pill">{new Date(fb.createdAt).toLocaleDateString()}</span>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete("feedback", fb._id)}
                            title="Delete feedback"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>

                        <p className="card-body-text">{fb.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Complaints & Issues Tab */}
              {activeMainTab === "complaints" && (
                <div className="submissions-stack">
                  {filteredComplaints.length === 0 ? (
                    <div className="empty-state-card">
                      No complaints or issues found matching your selected filters.
                    </div>
                  ) : (
                    filteredComplaints.map((c) => (
                      <div key={c._id} className="admin-submission-card complaint-item">
                        <div className="card-top-row">
                          <span className="author-pill">
                            <FaUser /> {c.userId?.name || c.from || "Member"}
                          </span>
                          {c.projectName && (
                            <span className="project-pill">
                              <FaFolder /> {c.projectName}
                            </span>
                          )}
                          {c.targetMember && (
                            <span className="target-pill">
                              Target: {c.targetMember}
                            </span>
                          )}
                          <span className="category-pill">{c.category}</span>
                          <span className={`priority-pill ${(c.priority || "medium").toLowerCase()}`}>
                            {c.priority} Priority
                          </span>
                          <span className={`status-pill status-${(c.status || "open").toLowerCase().replace(" ", "-")}`}>
                            {c.status || "Open"}
                          </span>
                          <span className="date-pill">{new Date(c.createdAt).toLocaleDateString()}</span>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete("complaint", c._id)}
                            title="Delete issue"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>

                        <h3 className="card-title-text">{c.title}</h3>
                        <p className="card-body-text">{c.description}</p>

                        <div className="card-actions-row">
                          <span className="status-label">Update Status:</span>
                          <select
                            value={c.status || "Open"}
                            onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                            className={`status-select-dropdown status-${(c.status || "open").toLowerCase().replace(" ", "-")}`}
                          >
                            <option value="Open">🟡 Open (Pending)</option>
                            <option value="In Progress">🔵 In Progress</option>
                            <option value="Resolved">🟢 Resolved</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminFeedbackPage;
