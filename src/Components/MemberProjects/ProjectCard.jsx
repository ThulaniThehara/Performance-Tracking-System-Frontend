import React from "react";
import { Link } from "react-router-dom";
import ProjectStatusBadge from "./ProjectStatusBadge";
import ChairpersonBadge from "./ChairpersonBadge";
import ProgressRing from "./ProgressRing";
import MemberAvatarGroup from "./MemberAvatarGroup";
import {
  FaBuilding,
  FaCrown,
  FaUserCheck,
  FaCalendarAlt,
  FaTasks,
  FaSitemap,
  FaPlus,
  FaUserPlus,
  FaArrowRight,
  FaUsers,
} from "react-icons/fa";

const ProjectCard = ({ project }) => {
  const isChair = Boolean(project.isChairperson);
  const projectId = project._id || project.id;

  const defaultImage =
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000";
  const imageSrc = project.image || defaultImage;

  const societyName = project.society || project.department || "MPTS Society";
  const description = project.description || "Project activity and task coordination.";

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

  const progress = Number(project.progress) || 0;
  const completedTasks = project.completedTasksCount || project.tasksCount?.completed || 0;
  const totalTasks = project.totalTasksCount || project.tasksCount?.total || 0;
  const committeeCount = project.committeeCount || (Array.isArray(project.committees) ? project.committees.length : 0);
  const memberCount = project.memberCount || (Array.isArray(project.members) ? project.members.length : 0);

  return (
    <div
      className={`saas-project-card ${isChair ? "chairperson-card" : "member-card"}`}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 20,
        border: isChair ? "2px solid #6b52d1" : "1px solid #eae2f8",
        boxShadow: isChair
          ? "0 12px 32px rgba(107, 82, 209, 0.12)"
          : "0 6px 20px rgba(107, 82, 209, 0.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Chairperson Top Banner */}
      {isChair && (
        <div
          style={{
            background: "linear-gradient(90deg, #4b2f61 0%, #6b52d1 50%, #9d7bf0 100%)",
            color: "#ffffff",
            padding: "7px 20px",
            fontSize: "0.78rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FaCrown style={{ color: "#FFD700", fontSize: "0.85rem" }} />
          <span>You are the Chairperson — Full management access</span>
        </div>
      )}

      {/* Card Body — clickable to navigate */}
      <Link
        to={`/projects/${projectId}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Top: Image + Info */}
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            {/* Cover Image */}
            <div
              style={{
                position: "relative",
                width: 130,
                height: 90,
                borderRadius: 14,
                overflow: "hidden",
                flexShrink: 0,
                backgroundColor: "#1d1545",
              }}
            >
              <img
                src={imageSrc}
                alt={project.PName || "Project"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(29,21,69,0.5) 100%)",
                }}
              />
              <div style={{ position: "absolute", top: 6, right: 6 }}>
                <ProjectStatusBadge status={project.status} />
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#6b52d1",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: "#eae2f8",
                    padding: "2px 8px",
                    borderRadius: 999,
                  }}
                >
                  <FaBuilding style={{ fontSize: "0.68rem" }} /> {societyName}
                </span>
                {startDateFormatted && endDateFormatted && (
                  <span style={{ fontSize: "0.72rem", color: "#5b5575", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                    <FaCalendarAlt style={{ fontSize: "0.65rem" }} /> {startDateFormatted} – {endDateFormatted}
                  </span>
                )}
              </div>

              <h3 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 800, color: "#1d1545", letterSpacing: "-0.01em" }}>
                {project.PName || "Untitled Project"}
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: "0.82rem",
                  color: "#5b5575",
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {description}
              </p>
            </div>
          </div>

          {/* Metrics Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 16px",
              backgroundColor: "#faf9fc",
              borderRadius: 14,
              flexWrap: "wrap",
            }}
          >
            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ProgressRing progress={progress} size={42} strokeWidth={5} color="#6b52d1" />
              <div>
                <span style={{ fontSize: "0.68rem", color: "#6b52d1", fontWeight: 700, textTransform: "uppercase" }}>
                  Progress
                </span>
                <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 800, color: "#1d1545" }}>
                  {completedTasks}/{totalTasks} Done
                </p>
              </div>
            </div>

            <div style={{ width: 1, height: 28, backgroundColor: "#eae2f8" }} />

            {/* Committees */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", fontWeight: 700, color: "#1d1545" }}>
              <FaSitemap style={{ color: "#6b52d1", fontSize: "0.78rem" }} />
              <span>{committeeCount} Committees</span>
            </div>

            <div style={{ width: 1, height: 28, backgroundColor: "#eae2f8" }} />

            {/* Members */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaUsers style={{ color: "#6b52d1", fontSize: "0.82rem" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1d1545" }}>
                {memberCount} Members
              </span>
            </div>

            {/* Team Avatars */}
            {memberCount > 0 && (
              <>
                <div style={{ width: 1, height: 28, backgroundColor: "#eae2f8" }} />
                <MemberAvatarGroup members={project.members || []} max={3} />
              </>
            )}
          </div>

          {/* Role Indicator for Member */}
          {!isChair && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#1d1545",
                backgroundColor: "#f4effa",
                padding: "8px 14px",
                borderRadius: 12,
              }}
            >
              <FaCrown style={{ color: "#f59e0b", fontSize: "0.82rem" }} />
              <span>Chair: {project.chairpersonName || project.chairPerson || "—"}</span>
              <span style={{ color: "#eae2f8" }}>·</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <FaUserCheck style={{ color: "#6b52d1" }} /> You are a Contributor
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Action Buttons */}
      <div
        style={{
          borderTop: "1px solid #f4effa",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {isChair ? (
          <>
            <Link
              to={`/projects/${projectId}`}
              className="btn-action primary-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 999,
                background: "linear-gradient(135deg, #6b52d1 0%, #9d7bf0 100%)",
                color: "#ffffff",
                fontSize: "0.82rem",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(107, 82, 209, 0.25)",
                transition: "all 0.2s ease",
              }}
            >
              <FaCrown style={{ fontSize: "0.75rem" }} /> Manage
            </Link>
            <Link
              to={`/projects/${projectId}?action=add-committee`}
              className="btn-action secondary-btn"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid #eae2f8",
                backgroundColor: "#ffffff",
                color: "#1d1545",
                fontSize: "0.8rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <FaPlus style={{ fontSize: "0.7rem" }} /> Committee
            </Link>
            <Link
              to={`/projects/${projectId}?action=add-members`}
              className="btn-action secondary-btn"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid #eae2f8",
                backgroundColor: "#ffffff",
                color: "#1d1545",
                fontSize: "0.8rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <FaUserPlus style={{ fontSize: "0.7rem" }} /> Members
            </Link>
            <Link
              to={`/projects/${projectId}?action=assign-tasks`}
              className="btn-action secondary-btn"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid #eae2f8",
                backgroundColor: "#ffffff",
                color: "#1d1545",
                fontSize: "0.8rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <FaTasks style={{ fontSize: "0.7rem" }} /> Tasks
            </Link>
          </>
        ) : (
          <Link
            to={`/projects/${projectId}`}
            className="btn-action primary-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 22px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #6b52d1 0%, #9d7bf0 100%)",
              color: "#ffffff",
              fontSize: "0.84rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(107, 82, 209, 0.25)",
              transition: "all 0.2s ease",
              marginLeft: "auto",
            }}
          >
            View Project Details <FaArrowRight style={{ fontSize: "0.72rem" }} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
