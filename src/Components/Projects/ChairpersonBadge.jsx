import React from "react";
import { FaCrown } from "react-icons/fa";
import { useTranslation } from "react-i18next";

/**
 * Marks the project owner. Purple is reserved for this meaning across the
 * module — task status is the only thing allowed to use green/orange/red.
 */
const ChairpersonBadge = ({ label, compact = false }) => {
  const { t } = useTranslation();
  return (
    <span className={`pm-chair-badge ${compact ? "is-compact" : ""}`}>
      <FaCrown aria-hidden="true" />
      {label ?? t('enums.role.CHAIRPERSON')}
    </span>
  );
};

export default ChairpersonBadge;
