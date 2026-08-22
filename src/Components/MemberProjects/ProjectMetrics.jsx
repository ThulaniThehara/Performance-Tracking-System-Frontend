import React from "react";
import ProgressRing from "./ProgressRing";
import MemberAvatarGroup from "./MemberAvatarGroup";
import { FaTasks, FaSitemap, FaCalendarAlt } from "react-icons/fa";

const ProjectMetrics = ({ project }) => {
  const progress = Number(project.progress) || 65;
  const completedTasks = project.completedTasksCount || project.tasksCount?.completed || 8;
  const totalTasks = project.totalTasksCount || project.tasksCount?.total || 12;
  const committeeCount = project.committeeCount || (Array.isArray(project.committees) ? project.committees.length : 3);
  const memberCount = project.memberCount || (Array.isArray(project.members) ? project.members.length : 14);

  const prettyDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const endDateFormatted = prettyDate(project.endDate) || "Dec 31, 2026";

  return (
    <div className="project-metrics-widget" style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      {/* Progress Ring */}
      <div className="metric-box progress-box" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ProgressRing progress={progress} size={58} strokeWidth={6} color="#6b52d1" />
        <div className="metric-info">
          <span style={{ fontSize: "0.72rem", color: "#6b52d1", fontWeight: 700, textTransform: "uppercase" }}>
            Overall Progress
          </span>
          <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#1d1545" }}>
            {completedTasks}/{totalTasks} Tasks Done
          </p>
        </div>
      </div>

      {/* Stats Divider */}
      <div style={{ width: 1, height: 36, backgroundColor: "#eae2f8" }} />

      {/* Committees & Tasks Pill */}
      <div className="metric-box details-box" style={{ display: "flex", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.84rem", fontWeight: 700, color: "#1d1545" }}>
          <FaSitemap style={{ color: "#6b52d1" }} />
          <span>{committeeCount} Committees</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.84rem", fontWeight: 700, color: "#1d1545" }}>
          <FaTasks style={{ color: "#6b52d1" }} />
          <span>{totalTasks} Tasks</span>
        </div>
      </div>

      {/* Stats Divider */}
      <div style={{ width: 1, height: 36, backgroundColor: "#eae2f8" }} />

      {/* Member Avatar Group & Date */}
      <div className="metric-box team-box" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <span style={{ display: "block", fontSize: "0.72rem", color: "#6b52d1", fontWeight: 700, textTransform: "uppercase" }}>
            Team Members ({memberCount})
          </span>
          <MemberAvatarGroup members={project.members || []} max={4} />
        </div>

        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1d1545", display: "flex", alignItems: "center", gap: 6 }}>
          <FaCalendarAlt style={{ color: "#6b52d1" }} />
          <span>{endDateFormatted}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectMetrics;
