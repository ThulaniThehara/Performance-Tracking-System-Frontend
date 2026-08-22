import React from "react";

const ProgressRing = ({ progress = 0, size = 64, strokeWidth = 6, color = "#6b52d1" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

  return (
    <div className="progress-ring-container" style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background circle */}
        <circle
          stroke="#eae2f8"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress arc */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease" }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div
        className="progress-ring-text"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.78rem",
          fontWeight: 800,
          color: "#1d1545",
        }}
      >
        {safeProgress}%
      </div>
    </div>
  );
};

export default ProgressRing;
