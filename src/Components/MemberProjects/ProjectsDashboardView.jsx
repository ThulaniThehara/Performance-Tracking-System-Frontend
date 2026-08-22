import React, { useState, useMemo, useEffect } from "react";
import TaskSidebar from "./TaskSidebar";
import ProjectCard from "./ProjectCard";
import EmptyProjectsState from "./EmptyProjectsState";
import {
  FaFolder,
  FaSearch,
  FaCrown,
  FaUserCheck,
  FaLayerGroup,
  FaUsers,
} from "react-icons/fa";

const ProjectsDashboardView = ({
  allWorkedProjects = [],
  ledProjects = [],
  contributingProjects = [],
  initialFilter = "all",
}) => {
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  const filters = [
    { key: "all", label: "All Projects", count: allWorkedProjects.length, icon: FaLayerGroup },
    { key: "chaired", label: "Chaired", count: ledProjects.length, icon: FaCrown },
    { key: "member", label: "Member", count: contributingProjects.length, icon: FaUserCheck },
  ];

  const filteredProjects = useMemo(() => {
    let result = [...allWorkedProjects];

    if (activeFilter === "chaired") {
      result = result.filter((p) => p.isChairperson);
    } else if (activeFilter === "member") {
      result = result.filter((p) => !p.isChairperson);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.PName || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.society || p.department || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [allWorkedProjects, activeFilter, searchQuery]);

  const handleResetFilters = () => {
    setActiveFilter("all");
    setSearchQuery("");
  };

  return (
    <div
      className="saas-projects-page-wrapper"
      style={{
        display: "flex",
        gap: 24,
        width: "100%",
        alignItems: "flex-start",
      }}
    >
      {/* LEFT PANEL: Task Sidebar */}
      <TaskSidebar />

      {/* RIGHT PANEL: Projects */}
      <div
        className="projects-main-panel"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          minWidth: 0,
        }}
      >
        {/* Header Row: Title + Search */}
        <div
          className="saas-projects-header"
          style={{
            backgroundColor: "#ffffff",
            padding: "22px 28px",
            borderRadius: 20,
            border: "1px solid rgba(234, 226, 248, 0.85)",
            boxShadow: "0 8px 24px rgba(107, 82, 209, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#eae2f8",
                color: "#6b52d1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
              }}
            >
              <FaFolder />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#1d1545" }}>
                  My Projects
                </h2>
                <span
                  style={{
                    background: "linear-gradient(135deg, #6b52d1 0%, #9d7bf0 100%)",
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    padding: "2px 10px",
                    borderRadius: 999,
                  }}
                >
                  {allWorkedProjects.length}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#5b5575" }}>
                Projects you lead or contribute to
              </p>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", width: 240 }}>
            <FaSearch
              style={{ position: "absolute", left: 12, color: "#6b52d1", fontSize: "0.82rem" }}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                borderRadius: 999,
                border: "1px solid #eae2f8",
                backgroundColor: "#faf9fc",
                color: "#1d1545",
                fontSize: "0.84rem",
                fontWeight: 600,
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div
          className="project-filter-segmented-bar"
          style={{
            display: "flex",
            gap: 8,
            backgroundColor: "#ffffff",
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(234, 226, 248, 0.85)",
            boxShadow: "0 4px 16px rgba(107, 82, 209, 0.04)",
          }}
        >
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 16px",
                  borderRadius: 999,
                  border: isActive ? "1px solid #6b52d1" : "1px solid transparent",
                  background: isActive
                    ? "linear-gradient(135deg, #6b52d1 0%, #9d7bf0 100%)"
                    : "#f4effa",
                  color: isActive ? "#ffffff" : "#5b5575",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.22s ease",
                  boxShadow: isActive ? "0 4px 14px rgba(107, 82, 209, 0.25)" : "none",
                }}
              >
                <Icon style={{ fontSize: "0.82rem" }} />
                <span>{f.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#eae2f8",
                    color: isActive ? "#ffffff" : "#1d1545",
                    padding: "1px 7px",
                    borderRadius: 999,
                    fontSize: "0.72rem",
                    fontWeight: 800,
                  }}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Project Cards Grid — 3 Cards Per Row */}
        {filteredProjects.length === 0 ? (
          <EmptyProjectsState onResetFilters={handleResetFilters} />
        ) : (
          <div
            className="saas-projects-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            {filteredProjects.map((p) => (
              <ProjectCard key={p._id || p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsDashboardView;
