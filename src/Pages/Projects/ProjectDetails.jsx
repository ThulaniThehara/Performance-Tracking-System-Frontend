import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaSitemap, FaTasks, FaUsers } from "react-icons/fa";

import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import ProjectOverviewCard from "../../Components/Projects/ProjectOverviewCard";
import CommitteeCard from "../../Components/Projects/CommitteeCard";
import CommitteeMemberList from "../../Components/Projects/CommitteeMemberList";
import TaskCard from "../../Components/Projects/TaskCard";
import Modal from "../../Components/Projects/Modal";

import { apiFetch } from "../../utils/api";
import { getUser } from "../../utils/auth";
import { byDeadline, displayStatusOf } from "../../utils/projectUtils";
import "../../SCSS/Projects/Projects.scss";

const TASK_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "COMPLETED", label: "Completed" },
];

const emptyTask = () => ({
  title: "",
  description: "",
  assignedTo: "",
  committeeId: "",
  priority: "MEDIUM",
  dueDate: "",
  dueTime: "",
});

const ProjectDetails = () => {
  const { projectId } = useParams();
  const viewerId = getUser()?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [taskFilter, setTaskFilter] = useState("ALL");

  // modal state
  const [committeeModal, setCommitteeModal] = useState(null); // {mode, committee}
  const [committeeForm, setCommitteeForm] = useState({ name: "", description: "" });
  const [memberModal, setMemberModal] = useState(null); // {committee}
  const [assignable, setAssignable] = useState([]);
  const [memberForm, setMemberForm] = useState({ userId: "", position: "" });
  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFetch(`/pm/projects/${projectId}`);
      if (!res) return;
      setData(res.data);
    } catch (e) {
      setError(e.message || "Could not load this project.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const perms = data?.permissions || {};
  const members = data?.members || [];
  const committees = data?.committees || [];
  const tasks = data?.tasks || [];

  const membersByCommittee = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      const key = m.committeeId ? String(m.committeeId) : "none";
      (map[key] ||= []).push(m);
    });
    return map;
  }, [members]);

  const visibleTasks = useMemo(() => {
    const list = [...tasks].sort(byDeadline);
    if (taskFilter === "ALL") return list;
    return list.filter((t) => displayStatusOf(t) === taskFilter);
  }, [tasks, taskFilter]);

  /** May the current viewer move this particular task's status? */
  const canEditTaskStatus = (task) => {
    if (perms.canUpdateAnyTaskStatus) return true;
    if (String(task.assignedTo?._id) === String(viewerId)) return true;
    if (perms.isCommitteeLead && task.committeeId && data?.myCommitteeId) {
      return String(task.committeeId) === String(data.myCommitteeId);
    }
    return false;
  };

  /* ------------------------- mutations ------------------------- */

  const call = async (path, options, onDone) => {
    try {
      setSaving(true);
      setModalError("");
      const res = await apiFetch(path, options);
      if (!res) return;
      onDone?.();
      await load();
    } catch (e) {
      setModalError(e.message || "Something went wrong.");
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const submitCommittee = async (e) => {
    e.preventDefault();
    if (!committeeForm.name.trim()) return setModalError("Committee name is required.");

    const editing = committeeModal?.mode === "edit";
    try {
      await call(
        editing
          ? `/pm/projects/${projectId}/committees/${committeeModal.committee._id}`
          : `/pm/projects/${projectId}/committees`,
        {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify({
            name: committeeForm.name.trim(),
            description: committeeForm.description.trim(),
          }),
        },
        () => setCommitteeModal(null)
      );
    } catch { /* message already surfaced */ }
  };

  const deleteCommittee = async (committee) => {
    if (!window.confirm(`Delete "${committee.name}"? Its members stay on the project.`)) return;
    setBusyId(committee._id);
    try {
      await call(`/pm/projects/${projectId}/committees/${committee._id}`, { method: "DELETE" });
    } catch { /* surfaced */ } finally { setBusyId(null); }
  };

  const openMemberModal = async (committee) => {
    setMemberModal({ committee });
    setMemberForm({ userId: "", position: "" });
    setModalError("");
    try {
      const res = await apiFetch(`/pm/projects/${projectId}/assignable`);
      if (res) setAssignable(res.data || []);
    } catch (e) {
      setModalError(e.message || "Could not load the member list.");
    }
  };

  const submitMember = async (e) => {
    e.preventDefault();
    if (!memberForm.userId) return setModalError("Pick someone to add.");
    try {
      await call(
        `/pm/projects/${projectId}/members`,
        {
          method: "POST",
          body: JSON.stringify({
            userId: memberForm.userId,
            committeeId: memberModal?.committee?._id || undefined,
            position: memberForm.position.trim(),
          }),
        },
        () => setMemberModal(null)
      );
    } catch { /* surfaced */ }
  };

  const removeMember = async (m) => {
    if (!window.confirm(`Remove ${m.user?.name} from this project?`)) return;
    try {
      await call(`/pm/projects/${projectId}/members/${m.user._id}`, { method: "DELETE" });
    } catch { /* surfaced */ }
  };

  const makeLead = async (committeeId, userId) => {
    try {
      await call(`/pm/projects/${projectId}/committees/${committeeId}`, {
        method: "PATCH",
        body: JSON.stringify({ leadId: userId }),
      });
    } catch { /* surfaced */ }
  };

  const submitTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return setModalError("Task title is required.");
    if (!taskForm.assignedTo) return setModalError("Assign the task to someone.");
    if (!taskForm.dueDate) return setModalError("Pick a due date.");

    try {
      await call(
        `/pm/projects/${projectId}/tasks`,
        {
          method: "POST",
          body: JSON.stringify({
            title: taskForm.title.trim(),
            description: taskForm.description.trim(),
            assignedTo: taskForm.assignedTo,
            committeeId: taskForm.committeeId || undefined,
            priority: taskForm.priority,
            dueDate: taskForm.dueDate,
            dueTime: taskForm.dueTime,
          }),
        },
        () => { setTaskModal(false); setTaskForm(emptyTask()); }
      );
    } catch { /* surfaced */ }
  };

  const changeTaskStatus = async (task, status) => {
    setBusyId(task._id);
    try {
      await call(`/pm/projects/${projectId}/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch { /* surfaced */ } finally { setBusyId(null); }
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setBusyId(task._id);
    try {
      await call(`/pm/projects/${projectId}/tasks/${task._id}`, { method: "DELETE" });
    } catch { /* surfaced */ } finally { setBusyId(null); }
  };

  const submitProjectEdit = async (e) => {
    e.preventDefault();
    try {
      await call(
        `/pm/projects/${projectId}`,
        { method: "PATCH", body: JSON.stringify(editForm) },
        () => setEditModal(false)
      );
    } catch { /* surfaced */ }
  };

  /* ------------------------- render ------------------------- */

  if (loading) {
    return (
      <>
        <Header />
        <LeftNavigationBar />
        <div className="pm-page">
          <div className="pm-wrapper">
            <div className="pm-skeleton-card is-tall" />
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <LeftNavigationBar />
        <div className="pm-page">
          <div className="pm-wrapper">
            <Link to="/projects" className="pm-back">
              <FaArrowLeft aria-hidden="true" /> Back to projects
            </Link>
            <div className="pm-empty-state">
              <h3>Project unavailable</h3>
              <p>{error || "This project could not be found, or you are not a member of it."}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const unassigned = membersByCommittee.none || [];

  return (
    <>
      <Header />
      <LeftNavigationBar />

      <div className="pm-page">
        <div className="pm-wrapper">
          <Link to="/projects" className="pm-back">
            <FaArrowLeft aria-hidden="true" /> Back to projects
          </Link>

          <ProjectOverviewCard
            project={data.project}
            chairperson={data.chairperson}
            stats={data.stats}
            canEdit={perms.canEditProject}
            onEdit={() => {
              setEditForm({
                title: data.project.PName,
                societyName: data.project.societyName || "",
                description: data.project.description || "",
                status: data.project.status,
                startDate: data.project.StartDate?.slice(0, 10) || "",
                endDate: data.project.EndDate?.slice(0, 10) || "",
              });
              setModalError("");
              setEditModal(true);
            }}
          />

          <div className="pm-detail-grid">
            {/* ---------------- committees ---------------- */}
            <section className="pm-panel">
              <header className="pm-panel-head">
                <h2><FaSitemap aria-hidden="true" /> Committees</h2>
                {perms.canManageCommittees && (
                  <button
                    className="pm-btn pm-btn-ghost pm-btn-sm"
                    onClick={() => {
                      setCommitteeForm({ name: "", description: "" });
                      setModalError("");
                      setCommitteeModal({ mode: "create" });
                    }}
                  >
                    <FaPlus aria-hidden="true" /> Add committee
                  </button>
                )}
              </header>

              {committees.length === 0 ? (
                <p className="pm-empty-inline">
                  No committees yet
                  {perms.canManageCommittees ? " — add one to start grouping members." : "."}
                </p>
              ) : (
                <div className="pm-committee-list">
                  {committees.map((c) => (
                    <CommitteeCard
                      key={c._id}
                      committee={c}
                      members={membersByCommittee[String(c._id)] || []}
                      canManage={perms.canManageMembers}
                      onEdit={(committee) => {
                        setCommitteeForm({
                          name: committee.name,
                          description: committee.description || "",
                        });
                        setModalError("");
                        setCommitteeModal({ mode: "edit", committee });
                      }}
                      onDelete={deleteCommittee}
                      onAddMember={openMemberModal}
                      onRemoveMember={removeMember}
                      onMakeLead={(userId) => makeLead(c._id, userId)}
                    />
                  ))}
                </div>
              )}

              {unassigned.length > 0 && (
                <div className="pm-unassigned">
                  <h4><FaUsers aria-hidden="true" /> Not on a committee</h4>
                  <CommitteeMemberList
                    members={unassigned}
                    canManage={perms.canManageMembers}
                    onRemove={removeMember}
                  />
                </div>
              )}

              {perms.canManageMembers && (
                <button
                  className="pm-btn pm-btn-ghost pm-btn-sm pm-add-member-btn"
                  onClick={() => openMemberModal(null)}
                >
                  <FaPlus aria-hidden="true" /> Add member to project
                </button>
              )}
            </section>

            {/* ---------------- tasks ---------------- */}
            <section className="pm-panel">
              <header className="pm-panel-head">
                <h2><FaTasks aria-hidden="true" /> Tasks</h2>
                {perms.canCreateTasks && (
                  <button
                    className="pm-btn pm-btn-primary pm-btn-sm"
                    onClick={() => {
                      setTaskForm(emptyTask());
                      setModalError("");
                      setTaskModal(true);
                    }}
                  >
                    <FaPlus aria-hidden="true" /> New task
                  </button>
                )}
              </header>

              <div className="pm-tabs">
                {TASK_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    className={`pm-tab ${taskFilter === f.key ? "is-active" : ""}`}
                    onClick={() => setTaskFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {visibleTasks.length === 0 ? (
                <p className="pm-empty-inline">No tasks in this view.</p>
              ) : (
                <div className="pm-task-list">
                  {visibleTasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      showAssignee
                      canEditStatus={canEditTaskStatus(t)}
                      canManage={perms.canDeleteTasks}
                      busy={busyId === t._id}
                      onStatusChange={changeTaskStatus}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* ---------------- committee modal ---------------- */}
      <Modal
        open={!!committeeModal}
        title={committeeModal?.mode === "edit" ? "Edit Committee" : "New Committee"}
        onClose={() => setCommitteeModal(null)}
        footer={
          <>
            <button className="pm-btn pm-btn-ghost" onClick={() => setCommitteeModal(null)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" onClick={submitCommittee} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <form className="pm-form" onSubmit={submitCommittee}>
          <label>
            Committee name
            <input
              value={committeeForm.name}
              onChange={(e) => setCommitteeForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Logistics"
            />
          </label>
          <label>
            Description <span className="opt">optional</span>
            <textarea
              rows={3}
              value={committeeForm.description}
              onChange={(e) => setCommitteeForm((p) => ({ ...p, description: e.target.value }))}
            />
          </label>
          {modalError && <p className="pm-form-error">{modalError}</p>}
        </form>
      </Modal>

      {/* ---------------- add member modal ---------------- */}
      <Modal
        open={!!memberModal}
        title={memberModal?.committee ? `Add to ${memberModal.committee.name}` : "Add Project Member"}
        onClose={() => setMemberModal(null)}
        footer={
          <>
            <button className="pm-btn pm-btn-ghost" onClick={() => setMemberModal(null)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" onClick={submitMember} disabled={saving}>
              {saving ? "Adding…" : "Add member"}
            </button>
          </>
        }
      >
        <form className="pm-form" onSubmit={submitMember}>
          <label>
            Person
            <select
              value={memberForm.userId}
              onChange={(e) => setMemberForm((p) => ({ ...p, userId: e.target.value }))}
            >
              <option value="">Select someone…</option>
              {assignable.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} — {u.indexNo}
                </option>
              ))}
            </select>
          </label>

          {assignable.length === 0 && (
            <p className="pm-empty-inline">Everyone available is already on this project.</p>
          )}

          <label>
            Position <span className="opt">optional</span>
            <input
              value={memberForm.position}
              onChange={(e) => setMemberForm((p) => ({ ...p, position: e.target.value }))}
              placeholder="e.g. Treasurer"
            />
          </label>
          {modalError && <p className="pm-form-error">{modalError}</p>}
        </form>
      </Modal>

      {/* ---------------- task modal ---------------- */}
      <Modal
        open={taskModal}
        title="New Task"
        onClose={() => setTaskModal(false)}
        width={540}
        footer={
          <>
            <button className="pm-btn pm-btn-ghost" onClick={() => setTaskModal(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" onClick={submitTask} disabled={saving}>
              {saving ? "Creating…" : "Create task"}
            </button>
          </>
        }
      >
        <form className="pm-form" onSubmit={submitTask}>
          <label>
            Title
            <input
              value={taskForm.title}
              onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Book the auditorium"
            />
          </label>

          <label>
            Description <span className="opt">optional</span>
            <textarea
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
            />
          </label>

          <div className="pm-form-row">
            <label>
              Assign to
              <select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm((p) => ({ ...p, assignedTo: e.target.value }))}
              >
                <option value="">Select member…</option>
                {members.map((m) => (
                  <option key={m._id} value={m.user?._id}>{m.user?.name}</option>
                ))}
              </select>
            </label>

            <label>
              Committee <span className="opt">optional</span>
              <select
                value={taskForm.committeeId}
                onChange={(e) => setTaskForm((p) => ({ ...p, committeeId: e.target.value }))}
              >
                <option value="">None</option>
                {committees.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="pm-form-row">
            <label>
              Due date
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </label>
            <label>
              Due time <span className="opt">optional</span>
              <input
                type="time"
                value={taskForm.dueTime}
                onChange={(e) => setTaskForm((p) => ({ ...p, dueTime: e.target.value }))}
              />
            </label>
          </div>

          <label>
            Priority
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>

          {modalError && <p className="pm-form-error">{modalError}</p>}
        </form>
      </Modal>

      {/* ---------------- edit project modal ---------------- */}
      <Modal
        open={editModal}
        title="Edit Project"
        onClose={() => setEditModal(false)}
        footer={
          <>
            <button className="pm-btn pm-btn-ghost" onClick={() => setEditModal(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" onClick={submitProjectEdit} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </>
        }
      >
        {editForm && (
          <form className="pm-form" onSubmit={submitProjectEdit}>
            <label>
              Project name
              <input
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              />
            </label>
            <label>
              Society
              <input
                value={editForm.societyName}
                onChange={(e) => setEditForm((p) => ({ ...p, societyName: e.target.value }))}
              />
            </label>
            <label>
              Description
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              />
            </label>
            <div className="pm-form-row">
              <label>
                Start date
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))}
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))}
                />
              </label>
            </div>
            <label>
              Status
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>
            {modalError && <p className="pm-form-error">{modalError}</p>}
          </form>
        )}
      </Modal>
    </>
  );
};

export default ProjectDetails;
