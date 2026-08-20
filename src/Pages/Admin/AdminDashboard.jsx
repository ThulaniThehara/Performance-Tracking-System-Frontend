import React, { useState } from "react";
import "react-calendar/dist/Calendar.css";
import "../../SCSS/AdminStyles/AdminDashboard/AdminDashboard.scss";
import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCheckCircle, FaPlus, FaCode, FaUsers, FaFire } from "react-icons/fa";

const AdminDashboard = () => {
  const projects = [
    { name: "Wanakkam", year: "2025", status: "Active" },
    { name: "Sabandi", year: "2024", status: "Completed" },
    { name: "Binara Padura", year: "2024", status: "Completed" },
    { name: "Cricket Fiesta", year: "2023", status: "Completed" },
    { name: "Grama Prabodya", year: "2023", status: "Completed" },
    { name: "Web3 Ceylon", year: "2022", status: "Completed" },
  ];

  const committees = [
    { name: "Flyer Design", members: 5 },
    { name: "Content Creator", members: 8 },
  ];

  return (
    <>
      <Header />
      <LeftNavigationBar />

      <div className="admin-dashboard-page">
        <div className="dashboard-wrapper">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <h1>Welcome back, Jenny! 👋</h1>
            <p>Here's your performance overview and project insights</p>
          </div>

          {/* Top Statistics */}
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-label">
                <FaFire style={{ marginRight: "8px" }} />
                Total Projects
              </div>
              <div className="stat-value">12</div>
              <div className="stat-change positive">↑ 2 new this month</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                {/* <FaTrendingUp style={{ marginRight: "8px" }} /> */}
                Active Committees
              </div>
              <div className="stat-value">5</div>
              <div className="stat-change positive">All running smoothly</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Overall Performance</div>
              <div className="stat-value">87%</div>
              <div className="stat-change positive">↑ 5% improvement</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Left Column: Profile and Committees */}
            <div>
              {/* Profile Card */}
              <div className="card" style={{ marginBottom: "24px" }}>
                <div className="profile-section">
                  <img
                    src="https://placekitten.com/240/240"
                    alt="Jenny Sherman"
                    className="avatar-large"
                  />
                  <div className="profile-name">
                    <h3>Jenny Sherman</h3>
                  </div>
                  <p className="profile-title">Project Administrator</p>

                  <div className="btn-group">
                    <button className="btn btn-secondary">Edit Profile</button>
                    <button className="btn btn-primary">View More</button>
                  </div>

                  <div className="profile-info">
                    <div className="info-item">
                      <FaPhoneAlt />
                      <span>+94 77 2315 897</span>
                    </div>
                    <div className="info-item">
                      <FaEnvelope />
                      <span>jenny33@gmail.com</span>
                    </div>
                    <div className="info-item">
                      <FaMapMarkerAlt />
                      <span>University of Moratuwa</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Committees Card */}
              <div className="card">
                <div className="card-header">
                  <h2>Committees</h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {committees.map((committee, idx) => (
                    <div
                      key={idx}
                      className="info-item"
                      style={{
                        padding: "14px",
                        background: "var(--card-hover)",
                        borderRadius: "8px",
                        margin: 0,
                      }}
                    >
                      <FaCheckCircle style={{ color: "var(--success)" }} />
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>
                          {committee.name}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          {committee.members} members
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Performance and Quick Actions */}
            <div>
              {/* Performance Card */}
              <div className="card" style={{ marginBottom: "24px" }}>
                <div className="card-header">
                  <h2>2025 Performance</h2>
                </div>

                <div className="performance-body">
                  <div className="chart-container">
                    <svg viewBox="0 0 36 36" width="160" height="160">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#6c5ce7"
                        strokeWidth="3"
                        strokeDasharray="88.96"
                        strokeDashoffset="4"
                        strokeLinecap="round"
                        style={{
                          transform: "rotate(-90deg)",
                          transformOrigin: "50% 50%",
                        }}
                      />
                      <text
                        x="18"
                        y="21"
                        textAnchor="middle"
                        fontSize="8"
                        fill="#1a202c"
                        fontWeight="700"
                      >
                        87%
                      </text>
                    </svg>
                  </div>
                  <div className="chart-info">
                    <h4>Overall Rating</h4>
                    <div className="chart-info-value">Excellent</div>
                    <div className="chart-info-detail">
                      Keep up the great work on your projects and committees!
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="card">
                <div className="card-header">
                  <h2>Quick Actions</h2>
                </div>

                <div className="contribution-grid">
                  <div className="contribution-box">
                    <div
                      className="contribution-icon"
                      style={{
                        background: "rgba(108, 92, 231, 0.15)",
                        color: "#6c5ce7",
                      }}
                    >
                      <FaPlus />
                    </div>
                    <div className="contribution-label">Add Project</div>
                  </div>

                  <div className="contribution-box">
                    <div
                      className="contribution-icon"
                      style={{
                        background: "rgba(240, 106, 180, 0.15)",
                        color: "#f06ab4",
                      }}
                    >
                      <FaUsers />
                    </div>
                    <div className="contribution-label">Manage Team</div>
                  </div>

                  <div className="contribution-box">
                    <div
                      className="contribution-icon"
                      style={{
                        background: "rgba(95, 179, 211, 0.15)",
                        color: "#5fb3d3",
                      }}
                    >
                      <FaCode />
                    </div>
                    <div className="contribution-label">View Reports</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects Table */}
          <div className="card">
            <div className="card-header">
              <h2>Recent Projects</h2>
              <button className="card-header-action">View All Projects</button>
            </div>

            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Year</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, i) => (
                  <tr key={i}>
                    <td>{project.name}</td>
                    <td>{project.year}</td>
                    <td>
                      <span
                        style={{
                          color:
                            project.status === "Active"
                              ? "#00b894"
                              : "var(--text-secondary)",
                          fontWeight: "600",
                        }}
                      >
                        {project.status === "Active" ? "🔵" : "✓"} {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;