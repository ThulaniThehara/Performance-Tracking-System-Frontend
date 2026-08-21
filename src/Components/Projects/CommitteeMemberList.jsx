import React from "react";
import { FaEnvelope, FaTimes, FaTasks, FaStar } from "react-icons/fa";
import Avatar from "./Avatar";
import { humanise } from "../../utils/projectUtils";

/**
 * The people inside one committee (or the project's unassigned pool).
 * Management controls only render when the server said the viewer may manage.
 */
const CommitteeMemberList = ({
  members = [],
  leadId = null,
  canManage = false,
  onRemove,
  onMakeLead,
  emptyText = "No members yet.",
}) => {
  if (!members.length) {
    return <p className="pm-empty-inline">{emptyText}</p>;
  }

  return (
    <ul className="pm-member-list">
      {members.map((m) => {
        const user = m.user || {};
        const isLead = leadId && String(leadId) === String(user._id);
        const isChair = m.role === "CHAIRPERSON";

        return (
          <li key={m._id} className={isLead ? "is-lead" : ""}>
            <Avatar name={user.name} size="sm" highlight={isChair} />

            <div className="member-body">
              <p className="member-name">
                {user.name}
                {isLead && (
                  <span className="lead-tag">
                    <FaStar aria-hidden="true" /> Lead
                  </span>
                )}
              </p>
              <p className="member-sub">
                {m.position || humanise(m.role)}
                {user.email && (
                  <>
                    {" · "}
                    <FaEnvelope aria-hidden="true" /> {user.email}
                  </>
                )}
              </p>
            </div>

            <span className="member-tasks" title={`${m.taskCount || 0} assigned tasks`}>
              <FaTasks aria-hidden="true" /> {m.taskCount || 0}
            </span>

            {canManage && !isChair && (
              <div className="member-actions">
                {onMakeLead && !isLead && (
                  <button
                    className="pm-btn pm-btn-ghost pm-btn-xs"
                    onClick={() => onMakeLead(user._id)}
                  >
                    Make lead
                  </button>
                )}
                {onRemove && (
                  <button
                    className="pm-icon-btn is-danger"
                    onClick={() => onRemove(m)}
                    aria-label={`Remove ${user.name}`}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default CommitteeMemberList;
