import React from "react";
import { FaEnvelope, FaTimes, FaTasks, FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
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
  emptyText,
}) => {
  const { t } = useTranslation();
  const resolvedEmptyText = emptyText ?? t('projects.memberList.noMembersYet');
  if (!members.length) {
    return <p className="pm-empty-inline">{resolvedEmptyText}</p>;
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
                    <FaStar aria-hidden="true" /> {t('projects.memberList.lead')}
                  </span>
                )}
              </p>
              <p className="member-sub">
                {m.position || t(`enums.role.${String(m.role || '').toUpperCase()}`, { defaultValue: humanise(m.role) })}
                {user.email && (
                  <>
                    {" · "}
                    <FaEnvelope aria-hidden="true" /> {user.email}
                  </>
                )}
              </p>
            </div>

            <span className="member-tasks" title={t('projects.memberList.assignedTasksTitle', { count: m.taskCount || 0 })}>
              <FaTasks aria-hidden="true" /> {m.taskCount || 0}
            </span>

            {canManage && !isChair && (
              <div className="member-actions">
                {onMakeLead && !isLead && (
                  <button
                    className="pm-btn pm-btn-ghost pm-btn-xs"
                    onClick={() => onMakeLead(user._id)}
                  >
                    {t('projects.memberList.makeLead')}
                  </button>
                )}
                {onRemove && (
                  <button
                    className="pm-icon-btn is-danger"
                    onClick={() => onRemove(m)}
                    aria-label={t('projects.details.aria.removeMember', { name: user.name })}
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
