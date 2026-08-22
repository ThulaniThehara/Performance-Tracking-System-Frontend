import React from "react";

const ProjectStatusBadge = ({ status = "Active" }) => {
  const norm = (status || "Active").toLowerCase();

  let bg = "#E6F4EA";
  let color = "#137333";
  let dotColor = "#10B981";
  let label = "Active";

  if (norm === "completed" || norm === "done") {
    bg = "#eae2f8";
    color = "#6b52d1";
    dotColor = "#9d7bf0";
    label = "Completed";
  } else if (norm === "upcoming" || norm === "planned" || norm === "draft") {
    bg = "#FEF7E0";
    color = "#B06000";
    dotColor = "#F59E0B";
    label = "Upcoming";
  } else if (norm === "ongoing" || norm === "in progress" || norm === "active") {
    bg = "#E6F4EA";
    color = "#137333";
    dotColor = "#10B981";
    label = "Active";
  }

  return (
    <span
      className="project-status-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 999,
        backgroundColor: bg,
        color: color,
        fontSize: "0.75rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        backdropFilter: "blur(6px)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: dotColor,
        }}
      />
      {label}
    </span>
  );
};

export default ProjectStatusBadge;
