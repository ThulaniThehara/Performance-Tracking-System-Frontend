import React from "react";
import { useTranslation } from "react-i18next";
import { humanise } from "../../utils/projectUtils";

/**
 * Priority uses the purple ramp plus a bar count, NOT green/orange/red —
 * those are reserved for task status, so the two badges never get confused
 * for one another when they sit side by side on a card.
 */
const LEVELS = { LOW: 1, MEDIUM: 2, HIGH: 3 };

const PriorityBadge = ({ priority, compact = false }) => {
  const { t } = useTranslation();
  const key = String(priority || "MEDIUM").toUpperCase();
  const level = LEVELS[key] || 2;
  const label = t(`enums.priority.${key}`, { defaultValue: humanise(key) });

  return (
    <span
      className={`pm-priority-badge level-${level} ${compact ? "is-compact" : ""}`}
      title={t('projects.details.priorityTitle', { priority: label })}
    >
      <span className="bars" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <i key={i} className={i <= level ? "on" : ""} />
        ))}
      </span>
      {label}
    </span>
  );
};

export default PriorityBadge;
