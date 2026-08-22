import React from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaSitemap,
  FaRegClock,
  FaArrowRight,
  FaRegCalendarAlt,
} from "react-icons/fa";
import ChairpersonBadge from "./ChairpersonBadge";
import Avatar from "./Avatar";
import { formatDate, formatDateRange, humanise } from "../../utils/projectUtils";

/**
 * One project on the dashboard. `variant="led"` is the highlighted treatment
 * used in "Projects You Lead"; "contributing" is the quieter one.
 */
const ProjectCard = ({ project, variant = "contributing" }) => {
  const led = variant === "led";
  const chair = project.chairpersonId;

  return (
    <article className={`pm-project-card ${led ? "is-led" : ""}`}>
      <header className="card-top">
        <div className="card-titles">
          {project.societyName && (
            <span className="society">{project.societyName}</span>
          )}
          <h3>{project.PName}</h3>
        </div>

        <span className={`pm-project-status is-${String(project.status || "").toLowerCase()}`}>
          {humanise(project.status)}
        </span>
      </header>

      {led && (
        <div className="card-badge-row">
          <ChairpersonBadge compact />
        </div>
      )}

      {project.description && <p className="card-desc">{project.description}</p>}

      {/* Progress is derived from completed vs total tasks on the server. */}
      <div className="card-progress">
        <div className="progress-meta">
          <span>Progress</span>
          <strong>{project.progress ?? 0}%</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${project.progress ?? 0}%` }} />
        </div>
      </div>

      <div className="card-stats">
        <span title="Members">
          <FaUsers aria-hidden="true" /> {project.memberCount ?? 0}
          <em>Members</em>
        </span>
        <span title="Committees">
          <FaSitemap aria-hidden="true" /> {project.committeeCount ?? 0}
          <em>Committees</em>
        </span>
        <span title="Pending tasks" className={project.pendingTasks > 0 ? "is-flagged" : ""}>
          <FaRegClock aria-hidden="true" /> {project.pendingTasks ?? 0}
          <em>Pending</em>
        </span>
      </div>

      <footer className="card-foot">
        {!led && chair ? (
          <div className="chair-mini">
            <Avatar name={chair.name} size="xs" highlight />
            <div>
              <span className="chair-name">{chair.name}</span>
              <span className="chair-role">Chairperson</span>
            </div>
          </div>
        ) : (
          <div className="date-mini">
            <FaRegCalendarAlt aria-hidden="true" />
            <span>
              {formatDateRange(project.StartDate, project.EndDate)}
            </span>
          </div>
        )}

        <Link to={`/projects/${project._id}`} className="pm-btn pm-btn-ghost pm-btn-sm">
          {led ? "Manage" : "View"} <FaArrowRight aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
};

export default ProjectCard;
