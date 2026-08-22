import React from "react";
import { FaSearch, FaSortAmountDown, FaFolder } from "react-icons/fa";

const ProjectHeader = ({
  totalCount = 0,
  searchQuery = "",
  onSearchChange = () => {},
  sortBy = "latest",
  onSortChange = () => {},
}) => {
  return (
    <div
      className="saas-projects-header"
      style={{
        backgroundColor: "#ffffff",
        padding: "28px 36px",
        borderRadius: 24,
        border: "1px solid rgba(234, 226, 248, 0.9)",
        boxShadow: "0 8px 24px rgba(107, 82, 209, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Top Title & Search Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Title Area */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: "#eae2f8",
              color: "#6b52d1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
            }}
          >
            <FaFolder />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "#1d1545",
                  letterSpacing: "-0.02em",
                }}
              >
                Projects
              </h1>
              <span
                style={{
                  background: "linear-gradient(135deg, #6b52d1 0%, #9d7bf0 100%)",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  padding: "3px 12px",
                  borderRadius: 999,
                  boxShadow: "0 4px 12px rgba(107, 82, 209, 0.25)",
                }}
              >
                {totalCount}
              </span>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: "0.9rem", color: "#5b5575" }}>
              Explore and manage projects you lead or contribute to.
            </p>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Search Input */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              width: 280,
            }}
          >
            <FaSearch
              style={{
                position: "absolute",
                left: 14,
                color: "#6b52d1",
                fontSize: "0.9rem",
              }}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 40px",
                borderRadius: 999,
                border: "1px solid #eae2f8",
                backgroundColor: "#f4effa",
                color: "#1d1545",
                fontSize: "0.88rem",
                fontWeight: 600,
                outline: "none",
                transition: "all 0.2s ease",
              }}
            />
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FaSortAmountDown style={{ color: "#6b52d1", fontSize: "0.88rem" }} />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid #eae2f8",
                backgroundColor: "#ffffff",
                color: "#1d1545",
                fontSize: "0.88rem",
                fontWeight: 700,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="latest">Sort by: Latest</option>
              <option value="name">Sort by: Name</option>
              <option value="progress">Sort by: Progress</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
