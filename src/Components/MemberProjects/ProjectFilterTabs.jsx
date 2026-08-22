import React from "react";
import { FaCrown, FaUserCheck, FaLayerGroup, FaCheckCircle, FaClock, FaCalendarAlt } from "react-icons/fa";

const ProjectFilterTabs = ({ activeFilter = "all", onSelectFilter = () => {}, counts = {} }) => {
  const filters = [
    { key: "all", label: "All Projects", count: counts.all || 0, icon: FaLayerGroup },
    { key: "chaired", label: "Chaired", count: counts.chaired || 0, icon: FaCrown },
    { key: "contributed", label: "Contributed", count: counts.contributed || 0, icon: FaUserCheck },
    { key: "active", label: "Active", count: counts.active || 0, icon: FaClock },
    { key: "upcoming", label: "Upcoming", count: counts.upcoming || 0, icon: FaCalendarAlt },
    { key: "completed", label: "Completed", count: counts.completed || 0, icon: FaCheckCircle },
  ];

  return (
    <div
      className="project-filter-segmented-bar"
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        backgroundColor: "#ffffff",
        padding: "10px 14px",
        borderRadius: 999,
        border: "1px solid rgba(234, 226, 248, 0.9)",
        boxShadow: "0 4px 16px rgba(107, 82, 209, 0.04)",
      }}
    >
      {filters.map((f) => {
        const Icon = f.icon;
        const isActive = activeFilter === f.key;

        return (
          <button
            key={f.key}
            onClick={() => onSelectFilter(f.key)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 999,
              border: isActive ? "1px solid #6b52d1" : "1px solid transparent",
              background: isActive
                ? "linear-gradient(135deg, #6b52d1 0%, #9d7bf0 100%)"
                : "#f4effa",
              color: isActive ? "#ffffff" : "#5b5575",
              fontSize: "0.86rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.22s ease",
              boxShadow: isActive ? "0 4px 14px rgba(107, 82, 209, 0.3)" : "none",
            }}
          >
            <Icon style={{ fontSize: "0.85rem" }} />
            <span>{f.label}</span>
            <span
              style={{
                backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#eae2f8",
                color: isActive ? "#ffffff" : "#1d1545",
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: "0.74rem",
                fontWeight: 800,
              }}
            >
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ProjectFilterTabs;
