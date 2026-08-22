import React from "react";
import { Link } from "react-router-dom";
import {
  FaCrown,
  FaCalendarAlt,
  FaUsers,
  FaSitemap,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";

const ProjectCard = ({ project }) => {
  const isChair = Boolean(project.isChairperson);
  const projectId = project._id || project.id;

  const societyName = project.society || project.department || "DD";
  const description = project.description || project.PName || "";

  const startDateFormatted = project.startDate
    ? new Date(project.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : project.StartDate
      ? new Date(project.StartDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
      : null;

  const endDateFormatted = project.endDate
    ? new Date(project.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : project.EndDate
      ? new Date(project.EndDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
      : null;

  let dateRangeText = "";
  if (startDateFormatted && endDateFormatted) {
    dateRangeText = `${startDateFormatted} – ${endDateFormatted}`;
  } else if (startDateFormatted) {
    dateRangeText = startDateFormatted;
  }

  const progress = Number(project.progress) || 0;
  const committeeCount = project.committeeCount || (Array.isArray(project.committees) ? project.committees.length : 1);
  const memberCount = project.memberCount || (Array.isArray(project.members) ? project.members.length : 2);
  const pendingCount = project.pendingTasksCount || project.pendingTasks || 0;

  // Status mapping matching reference image
  const statusStr = (project.status || "Upcoming").toLowerCase();
  const isCompleted = statusStr === "completed" || progress === 100;
  const statusLabel = isCompleted ? "Active" : (statusStr === "active" ? "Active" : "Upcoming");
  
  const statusStyle = statusLabel === "Active"
    ? { bg: "#e6f9f0", color: "#10b981" }
    : { bg: "#eef2ff", color: "#3563e9" };

  const chairName = project.chairpersonName || project.chairPerson || "asiri hariss";
  const chairInitials = chairName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "AH";

  return (
    <div
      className="modern-ref-project-card"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 20,
        border: "1px solid #eae2f8",
        borderTop: "3.5px solid #6b52d1",
        boxShadow: "0 4px 20px rgba(107, 82, 209, 0.05)",
        padding: "20px 20px 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.24s ease",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div>
        {/* Top Header Row: Title & Subtitle vs Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#6b7280",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 2,
              }}
            >
              {societyName}
            </span>
            <h3
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.25,
              }}
            >
              {project.PName || "Untitled Project"}
            </h3>

            {/* Role Badge if Chair */}
            {isChair && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "#f3edff",
                  color: "#6b52d1",
                  padding: "3px 12px",
                  borderRadius: 999,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  marginTop: 8,
                }}
              >
                <FaCrown style={{ fontSize: "0.76rem" }} /> Chairperson
              </div>
            )}
          </div>

          {/* Status Pill */}
          <span
            style={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
              padding: "4px 14px",
              borderRadius: 999,
              fontSize: "0.8rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            margin: "12px 0 16px",
            fontSize: "0.88rem",
            color: "#6b7280",
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>

        {/* Progress Bar Section */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#6b7280" }}>
              Progress
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#111827" }}>
              {progress}%
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: 6,
              backgroundColor: "#e5e7eb",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #6b52d1 0%, #9d7bf0 100%)",
                borderRadius: 999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* 3 Metric Box Cards (MEMBERS | COMMITTEES | PENDING) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 18,
          }}
        >
          {/* Members */}
          <div
            style={{
              backgroundColor: "#f8f7fc",
              borderRadius: 14,
              padding: "10px 4px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <FaUsers style={{ color: "#6b7280", fontSize: "0.9rem" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>
              {memberCount}
            </span>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#6b7280", letterSpacing: "0.03em" }}>
              MEMBERS
            </span>
          </div>

          {/* Committees */}
          <div
            style={{
              backgroundColor: "#f8f7fc",
              borderRadius: 14,
              padding: "10px 4px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <FaSitemap style={{ color: "#6b7280", fontSize: "0.9rem" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>
              {committeeCount}
            </span>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#6b7280", letterSpacing: "0.03em" }}>
              COMMITTEES
            </span>
          </div>

          {/* Pending */}
          <div
            style={{
              backgroundColor: "#f8f7fc",
              borderRadius: 14,
              padding: "10px 4px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <FaClock style={{ color: "#6b7280", fontSize: "0.9rem" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>
              {pendingCount}
            </span>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#6b7280", letterSpacing: "0.03em" }}>
              PENDING
            </span>
          </div>
        </div>
      </div>

      {/* Footer Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 14,
          borderTop: "1px solid #f3f4f6",
        }}
      >
        {/* Left Footer Content */}
        {isChair ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: "0.82rem", fontWeight: 500 }}>
            <FaCalendarAlt style={{ fontSize: "0.85rem", color: "#9ca3af" }} />
            <span>{dateRangeText || "Aug 21, 2026"}</span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6b52d1 0%, #9d7bf0 100%)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.78rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {chairInitials}
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                {chairName}
              </span>
              <span style={{ fontSize: "0.74rem", color: "#6b7280", fontWeight: 500 }}>
                Chairperson
              </span>
            </div>
          </div>
        )}

        {/* Right Footer Action Button */}
        <Link
          to={`/projects/${projectId}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            color: "#111827",
            fontSize: "0.85rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.2s ease",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#6b52d1";
            e.currentTarget.style.color = "#6b52d1";
            e.currentTarget.style.backgroundColor = "#f9f5ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.color = "#111827";
            e.currentTarget.style.backgroundColor = "#ffffff";
          }}
        >
          <span>{isChair ? "Manage" : "View"}</span>
          <FaArrowRight style={{ fontSize: "0.75rem" }} />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
