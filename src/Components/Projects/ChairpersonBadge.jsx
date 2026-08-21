import React from "react";
import { FaCrown } from "react-icons/fa";

/**
 * Marks the project owner. Purple is reserved for this meaning across the
 * module — task status is the only thing allowed to use green/orange/red.
 */
const ChairpersonBadge = ({ label = "Chairperson", compact = false }) => (
  <span className={`pm-chair-badge ${compact ? "is-compact" : ""}`}>
    <FaCrown aria-hidden="true" />
    {label}
  </span>
);

export default ChairpersonBadge;
