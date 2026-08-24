import React from "react";
import { useRouteError, Link } from "react-router-dom";

const RouteErrorBoundary = () => {
  const error = useRouteError();
  console.error("Route Error:", error);

  return (
    <div style={{ padding: 40, fontFamily: "system-ui, sans-serif", maxWidth: 600, margin: "40px auto" }}>
      <h2 style={{ color: "#1d1545", marginBottom: 12 }}>Page Navigation Notice</h2>
      <p style={{ color: "#666", marginBottom: 16 }}>
        {error?.status === 404
          ? "The requested project or page could not be found."
          : error?.message || "An unexpected error occurred while loading this page."}
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link
          to="/projects"
          style={{
            padding: "8px 16px",
            backgroundColor: "#6b52d1",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Go to Projects
        </Link>
        <Link
          to="/admin/dashboard"
          style={{
            padding: "8px 16px",
            border: "1px solid #d1d5db",
            color: "#374151",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
