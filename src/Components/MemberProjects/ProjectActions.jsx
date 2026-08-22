import React from "react";
import { Link } from "react-router-dom";
import { FaCrown, FaPlus, FaUserPlus, FaTasks, FaArrowRight } from "react-icons/fa";

const ProjectActions = ({ project }) => {
  const isChair = Boolean(project.isChairperson);
  const projectId = project._id || project.id;

  if (isChair) {
    return (
      <div className="project-actions-bar" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {/* Primary Chairperson Manage Link */}
        <Link
          to={`/projects/${projectId}`}
          className="btn-action primary-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 20px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #6b52d1 0%, #9d7bf0 100%)",
            color: "#ffffff",
            fontSize: "0.84rem",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(107, 82, 209, 0.3)",
            transition: "all 0.2s ease",
          }}
        >
          <FaCrown /> Manage Project
        </Link>

        {/* Quick Action: Add Committee */}
        <Link
          to={`/projects/${projectId}?action=add-committee`}
          className="btn-action secondary-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid #eae2f8",
            backgroundColor: "#ffffff",
            color: "#1d1545",
            fontSize: "0.84rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          <FaPlus /> Add Committee
        </Link>

        {/* Quick Action: Add Members */}
        <Link
          to={`/projects/${projectId}?action=add-members`}
          className="btn-action secondary-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid #eae2f8",
            backgroundColor: "#ffffff",
            color: "#1d1545",
            fontSize: "0.84rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          <FaUserPlus /> Add Members
        </Link>

        {/* Quick Action: Assign Tasks */}
        <Link
          to={`/projects/${projectId}?action=assign-tasks`}
          className="btn-action secondary-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid #eae2f8",
            backgroundColor: "#ffffff",
            color: "#1d1545",
            fontSize: "0.84rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          <FaTasks /> Assign Tasks
        </Link>
      </div>
    );
  }

  // Contributor Action: View Project
  return (
    <div className="project-actions-bar" style={{ display: "flex", justifyContent: "flex-end" }}>
      <Link
        to={`/projects/${projectId}`}
        className="btn-action primary-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 22px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #6b52d1 0%, #9d7bf0 100%)",
          color: "#ffffff",
          fontSize: "0.88rem",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(107, 82, 209, 0.3)",
          transition: "all 0.2s ease",
        }}
      >
        View Project <FaArrowRight />
      </Link>
    </div>
  );
};

export default ProjectActions;
