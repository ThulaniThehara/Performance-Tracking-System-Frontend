import React from "react";
import {
  FaUsers,
  FaSitemap,
  FaTasks,
  FaRegCalendarAlt,
  FaEnvelope,
  FaPen,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Avatar from "./Avatar";
import ChairpersonBadge from "./ChairpersonBadge";
import { formatDate, formatDateRange, humanise } from "../../utils/projectUtils";

/**
 * The header block of the details page: identity, timeline, progress, and the
 * chairperson card.
 */
const ProjectOverviewCard = ({ project, chairperson, stats, canEdit, onEdit }) => {
  const { t } = useTranslation();
  const statusKey = String(project.status || "").toUpperCase();

  return (
  <section className="pm-overview">
    <div className="overview-main">
      <div className="overview-head">
        <div>
          {project.societyName && <span className="society">{project.societyName}</span>}
          <h1>{project.PName}</h1>
        </div>

        <div className="overview-head-right">
          <span className={`pm-project-status is-${statusKey.toLowerCase()}`}>
            {t(`enums.projectStatus.${statusKey}`, { defaultValue: humanise(project.status) })}
          </span>
          {canEdit && (
            <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={onEdit}>
              <FaPen aria-hidden="true" /> {t('projects.overview.edit')}
            </button>
          )}
        </div>
      </div>

      {project.description && <p className="overview-desc">{project.description}</p>}

      <div className="overview-timeline">
        <FaRegCalendarAlt aria-hidden="true" />
        <span>
          {formatDateRange(project.StartDate, project.EndDate)}
        </span>
      </div>

      <div className="overview-progress">
        <div className="progress-meta">
          <span>
            {t('projects.overview.progressLabel', { completed: stats.completedTasks, total: stats.totalTasks })}
          </span>
          <strong>{stats.progress}%</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${stats.progress}%` }} />
        </div>
      </div>

      <div className="overview-stats">
        <div>
          <span className="stat-icon" aria-hidden="true"><FaUsers /></span>
          <b>{stats.memberCount}</b>
          <em>{t('shell.nav.members')}</em>
        </div>
        <div>
          <span className="stat-icon" aria-hidden="true"><FaSitemap /></span>
          <b>{stats.committeeCount}</b>
          <em>{t('shell.nav.committees')}</em>
        </div>
        <div>
          <span className="stat-icon" aria-hidden="true"><FaTasks /></span>
          <b>{stats.pendingTasks}</b>
          <em>{t('projects.card.pendingTasks')}</em>
        </div>
      </div>
    </div>

    {/* Chairperson card — the module's one saturated purple surface. */}
    <aside className="pm-chair-card">
      <ChairpersonBadge />
      <Avatar name={chairperson?.name} size="xl" highlight />
      <h3>{chairperson?.name || t('projects.overview.unassigned')}</h3>
      <p className="chair-position">{t('enums.role.CHAIRPERSON')}</p>
      {chairperson?.email && (
        <p className="chair-email">
          <FaEnvelope aria-hidden="true" /> {chairperson.email}
        </p>
      )}
      {chairperson?.indexNo && <p className="chair-index">{chairperson.indexNo}</p>}
    </aside>
  </section>
  );
};

export default ProjectOverviewCard;
