import React from "react";
import { initials } from "../../utils/projectUtils";

/**
 * Initials-based avatar. There is no avatar upload in the system yet, so this
 * derives a stable tint from the name rather than showing a broken image.
 */
const TINTS = 5;

const Avatar = ({ name, size = "md", highlight = false, className = "" }) => {
  // Deterministic per name, so a person keeps the same colour everywhere.
  const tint =
    String(name || "?")
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS;

  return (
    <span
      className={`pm-avatar pm-avatar--${size} ${
        highlight ? "is-highlight" : `tint-${tint}`
      } ${className}`}
      title={name || undefined}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
};

export default Avatar;
