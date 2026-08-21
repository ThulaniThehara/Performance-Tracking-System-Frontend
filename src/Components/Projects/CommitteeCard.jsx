import React, { useState } from "react";
import {
  FaSitemap,
  FaUsers,
  FaPen,
  FaTrashAlt,
  FaChevronDown,
  FaUserPlus,
} from "react-icons/fa";
import Avatar from "./Avatar";
import CommitteeMemberList from "./CommitteeMemberList";

/**
 * One committee, expandable to reveal its roster.
 * Edit/delete/add controls appear only when `canManage` is true.
 */
const CommitteeCard = ({
  committee,
  members = [],
  canManage = false,
  onEdit,
  onDelete,
  onAddMember,
  onRemoveMember,
  onMakeLead,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const lead = committee.lead;

  return (
    <article className={`pm-committee-card ${open ? "is-open" : ""}`}>
      <header className="committee-head">
        <span className="committee-icon" aria-hidden="true">
          <FaSitemap />
        </span>

        <div className="committee-titles">
          <h4>{committee.name}</h4>
          <p className="committee-sub">
            {lead ? (
              <>
                Led by <strong>{lead.name}</strong>
              </>
            ) : (
              <em>No lead assigned</em>
            )}
          </p>
        </div>

        <span className="committee-count" title="Members">
          <FaUsers aria-hidden="true" /> {committee.memberCount ?? members.length}
        </span>

        {canManage && (
          <div className="committee-actions">
            <button className="pm-icon-btn" onClick={() => onEdit?.(committee)} aria-label="Edit committee">
              <FaPen />
            </button>
            <button
              className="pm-icon-btn is-danger"
              onClick={() => onDelete?.(committee)}
              aria-label="Delete committee"
            >
              <FaTrashAlt />
            </button>
          </div>
        )}

        <button
          className={`pm-icon-btn toggle ${open ? "is-open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Hide members" : "Show members"}
        >
          <FaChevronDown />
        </button>
      </header>

      {lead && (
        <div className="committee-lead-row">
          <Avatar name={lead.name} size="xs" />
          <span>{lead.email}</span>
        </div>
      )}

      {open && (
        <div className="committee-body">
          <CommitteeMemberList
            members={members}
            leadId={lead?._id}
            canManage={canManage}
            onRemove={onRemoveMember}
            onMakeLead={onMakeLead}
            emptyText="Nobody has been added to this committee yet."
          />

          {canManage && (
            <button
              className="pm-btn pm-btn-ghost pm-btn-sm add-to-committee"
              onClick={() => onAddMember?.(committee)}
            >
              <FaUserPlus aria-hidden="true" /> Add member
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default CommitteeCard;
