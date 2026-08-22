import React from "react";
import { FaFolderOpen, FaUndo } from "react-icons/fa";

const EmptyProjectsState = ({ onResetFilters }) => {
  return (
    <div
      className="empty-projects-state"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 24,
        border: "2px dashed #eae2f8",
        padding: "64px 32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: "#eae2f8",
          color: "#6b52d1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.4rem",
          boxShadow: "0 8px 24px rgba(107, 82, 209, 0.12)",
        }}
      >
        <FaFolderOpen />
      </div>

      <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#1d1545" }}>
        No Projects Found
      </h3>

      <p style={{ margin: 0, maxWidth: 440, fontSize: "0.92rem", color: "#5b5575", lineHeight: 1.5 }}>
        We couldn't find any projects matching your selected filter or search criteria. Try clearing your filters to explore all assigned projects.
      </p>

      {onResetFilters && (
        <button
          onClick={onResetFilters}
          style={{
            marginTop: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 24px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #6b52d1 0%, #9d7bf0 100%)",
            color: "#ffffff",
            fontSize: "0.88rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(107, 82, 209, 0.3)",
            transition: "all 0.2s ease",
          }}
        >
          <FaUndo /> Reset Filters
        </button>
      )}
    </div>
  );
};

export default EmptyProjectsState;
