import React from "react";
import { FaCrown } from "react-icons/fa";

const ChairpersonBadge = () => {
  return (
    <div
      className="chairperson-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 14px",
        borderRadius: 999,
        background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
        color: "#1d1545",
        fontSize: "0.78rem",
        fontWeight: 800,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        boxShadow: "0 4px 14px rgba(255, 165, 0, 0.4)",
      }}
    >
      <FaCrown style={{ fontSize: "0.88rem", color: "#1d1545" }} />
      CHAIR PERSON
    </div>
  );
};

export default ChairpersonBadge;
