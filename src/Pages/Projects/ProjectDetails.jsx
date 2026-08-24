import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaSitemap, FaTasks, FaUsers, FaPen, FaTrashAlt, FaUserPlus } from "react-icons/fa";
import {
  FaArrowLeft,
  FaPlus,
  FaSitemap,
  FaTasks,
  FaUsers,
  FaCommentDots,
  FaExclamationTriangle,
  FaStar,
  FaProjectDiagram,
  FaTrashAlt,
  FaSpinner,
  FaUser,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import MemberTopHeader from "../../Components/Header/MemberTopHeader";
import ProjectOverviewCard from "../../Components/Projects/ProjectOverviewCard";
import CommitteeCard from "../../Components/Projects/CommitteeCard";
import CommitteeMemberList from "../../Components/Projects/CommitteeMemberList";
import TaskCard from "../../Components/Projects/TaskCard";
import Modal from "../../Components/Projects/Modal";

import { apiFetch } from "../../utils/api";
import { getUser, getRole } from "../../utils/auth";
import { byDeadline, displayStatusOf } from "../../utils/projectUtils";
import "../../SCSS/Projects/Projects.scss";

const TASK_FILTER_KEYS = [
  { key: "ALL", labelKey: "all" },
  { key: "TODO", labelKey: "todo" },
  { key: "IN_PROGRESS", labelKey: "inProgress" },
  { key: "OVERDUE", labelKey: "overdue" },
  { key: "COMPLETED", labelKey: "completed" },
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
  const { t } = useTranslation();
  const params = useParams();
  const rawId = params.projectId || params["*"] || "";
  const projectId = (rawId.split("/")[0] || "").trim();
  const viewerId = getUser()?.id;
  const isAdmin = getRole() === "ADMIN";
  const backLink = isAdmin ? "/AdminProjects" : "/member/dashboard?tab=projects";

  const renderNavigation = () => {
    if (isAdmin) {
      return (
        <>
          <Header />
          <LeftNavigationBar />
        </>
      );
    }
    return <MemberTopHeader />;
  };

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

  // Project Tabs (Image 2 style: Project Details, Feedbacks, Issues/Complaints)
  const [projectDetailTab, setProjectDetailTab] = useState("details"); // 'details' | 'feedbacks' | 'complaints'
  const [projectFeedbacks, setProjectFeedbacks] = useState([]);
  const [projectComplaints, setProjectComplaints] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const fetchProjectSubmissions = useCallback(async (projName) => {
    try {
      setLoadingSubmissions(true);
      const token = localStorage.getItem("token");
      const url = `http://localhost:5000/api/feedback/project/${projectId}${projName ? `?projectName=${encodeURIComponent(projName)}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) {
        setProjectFeedbacks(result.feedbacks || []);
        setProjectComplaints(result.complaints || []);
      }
    } catch (e) {
      console.warn("Error loading project submissions:", e);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [projectId]);

  const handleUpdateComplaintStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/feedback/admin/complaint/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchProjectSubmissions(data?.project?.PName);
      }
    } catch (e) {
      console.warn("Error updating complaint status:", e);
    }
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFetch(`/pm/projects/${projectId}`);
      if (!res) return;
      setData(res.data);
      if (res.data?.project?.PName) {
        fetchProjectSubmissions(res.data.project.PName);
      }
    } catch (e) {
      setError(e.message || t('projects.details.loadError'));
    } finally {
      setLoading(false);
    }
  }, [projectId, t, fetchProjectSubmissions]);

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

  const myRole = data?.myRole || 'MEMBER';
  const myCommitteeId = data?.myCommitteeId || null;

  const visibleCommittees = useMemo(() => {
    if (myRole === 'CHAIRPERSON') return committees;
    if (!myCommitteeId) return [];
    return committees.filter((c) => String(c._id) === String(myCommitteeId));
  }, [committees, myRole, myCommitteeId]);

  const [activeCommitteeId, setActiveCommitteeId] = useState(null);

  const activeCommittee = useMemo(() => {
    if (!visibleCommittees.length) return null;
    return visibleCommittees.find((c) => String(c._id) === String(activeCommitteeId)) || visibleCommittees[0];
  }, [visibleCommittees, activeCommitteeId]);

  useEffect(() => {
    if (visibleCommittees.length > 0 && (!activeCommitteeId || !visibleCommittees.some((c) => String(c._id) === String(activeCommitteeId)))) {
      setActiveCommitteeId(visibleCommittees[0]._id);
    }
  }, [visibleCommittees, activeCommitteeId]);

  const visibleTasks = useMemo(() => {
    let list = [...tasks].sort(byDeadline);
    if (myRole !== 'CHAIRPERSON') {
      list = list.filter((t) => String(t.assignedTo?._id || t.assignedTo) === String(viewerId));
    }
    if (taskFilter === "ALL") return list;
    return list.filter((t) => displayStatusOf(t) === taskFilter);
  }, [tasks, taskFilter, myRole, viewerId]);

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
      setModalError(e.message || t('projects.details.errors.somethingWrong'));
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const submitCommittee = async (e) => {
    e.preventDefault();
    if (!committeeForm.name.trim()) return setModalError(t('projects.details.errors.committeeNameRequired'));

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
    if (!window.confirm(t('projects.details.confirm.deleteCommittee', { name: committee.name }))) return;
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
      setModalError(e.message || t('projects.details.errors.loadMembersFailed'));
    }
  };

  const submitMember = async (e) => {
    e.preventDefault();
    if (!memberForm.userId) return setModalError(t('projects.details.errors.pickSomeone'));
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
    if (!window.confirm(t('projects.details.confirm.removeMember', { name: m.user?.name }))) return;
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
    if (!taskForm.title.trim()) return setModalError(t('projects.details.errors.taskTitleRequired'));
    if (!taskForm.assignedTo) return setModalError(t('projects.details.errors.assignTask'));
    if (!taskForm.dueDate) return setModalError(t('projects.details.errors.pickDueDate'));

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
    if (!window.confirm(t('projects.details.confirm.deleteTask', { title: task.title }))) return;
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
        {renderNavigation()}
        <div className="pm-page" style={!isAdmin ? { marginLeft: 0 } : undefined}>
          <div className="pm-wrapper">
            <div className="pm-page-header-block">
              <Link to={backLink} className="pm-back-pill">
                <FaArrowLeft className="back-arrow-icon" aria-hidden="true" />
                <span>{t('projects.details.backToProjects')}</span>
              </Link>
              <h1 className="pm-page-heading">{t('projects.details.pageTitle')}</h1>
            </div>
            <div className="pm-skeleton-card is-tall" />
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        {renderNavigation()}
        <div className="pm-page" style={!isAdmin ? { marginLeft: 0 } : undefined}>
          <div className="pm-wrapper">
            <div className="pm-page-header-block">
              <Link to={backLink} className="pm-back-pill">
                <FaArrowLeft className="back-arrow-icon" aria-hidden="true" />
                <span>{t('projects.details.backToProjects')}</span>
              </Link>
              <h1 className="pm-page-heading">{t('projects.details.pageTitle')}</h1>
            </div>
            <div className="pm-empty-state">
              <h3>{t('projects.details.unavailableTitle')}</h3>
              <p>{error || t('projects.details.unavailableBody')}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const unassigned = membersByCommittee.none || [];

  return (
    <>
      {renderNavigation()}

      <div className="pm-page" style={!isAdmin ? { marginLeft: 0 } : undefined}>
        <div className="pm-wrapper">
          <div className="pm-page-header-block">
            <Link to={backLink} className="pm-back-pill">
              <FaArrowLeft className="back-arrow-icon" aria-hidden="true" />
              <span>Back to Projects</span>
            </Link>
            <h1 className="pm-page-heading">Project Details</h1>
          </div>

          {/* 3 Horizontal Tabs (Matching Image 2 Reference) */}
          <div className="project-detail-tabs-bar">
            <button
              className={`project-tab-btn ${projectDetailTab === 'details' ? 'active' : ''}`}
              onClick={() => setProjectDetailTab('details')}
            >
              <FaProjectDiagram /> Project Details
            </button>

            <button
              className={`project-tab-btn ${projectDetailTab === 'feedbacks' ? 'active' : ''}`}
              onClick={() => setProjectDetailTab('feedbacks')}
            >
              <FaCommentDots /> Feedbacks
              {projectFeedbacks.length > 0 && (
                <span className="tab-badge-pill">{projectFeedbacks.length}</span>
              )}
            </button>

            <button
              className={`project-tab-btn ${projectDetailTab === 'complaints' ? 'active' : ''}`}
              onClick={() => setProjectDetailTab('complaints')}
            >
              <FaExclamationTriangle /> Issues & Complaints
              {projectComplaints.length > 0 && (
                <span className="tab-badge-pill">{projectComplaints.length}</span>
              )}
            </button>
          </div>

          {/* =========================================================================
             TAB 1: PROJECT DETAILS VIEW (Overview Card + Committees & Tasks Grid)
             ========================================================================= */}
          {projectDetailTab === 'details' && (
            <>
              <ProjectOverviewCard
                project={data.project}
                chairperson={data.chairperson}
                stats={data.stats}
                canEdit={myRole === 'CHAIRPERSON' && perms.canEditProject}
                onEdit={() => {
                  setEditForm({
                    title: data.project.PName,
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
            {/* ---------------- committees ---------------- */}
            <section className="pm-panel pm-committees-panel">
              <header className="pm-panel-head">
                <h2><FaSitemap aria-hidden="true" /> {t('projects.details.committeesHeading')}</h2>
              </header>

              {visibleCommittees.length === 0 ? (
                <div className="pm-empty-committee-box">
                  <p className="pm-empty-inline">
                    {myRole !== 'CHAIRPERSON' && !myCommitteeId
                      ? t('projects.details.noCommitteeAssigned')
                      : t('projects.details.noCommitteesYet')}
                  </p>
                  {myRole === 'CHAIRPERSON' && perms.canManageCommittees && (
                    <button
                      className="pm-btn pm-btn-primary pm-btn-sm"
                      onClick={() => {
                        setCommitteeForm({ name: "", description: "" });
                        setModalError("");
                        setCommitteeModal({ mode: "create" });
                      }}
                    >
                      <FaPlus aria-hidden="true" /> {t('projects.details.addCommittee')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="pm-committee-tabs-wrapper">
                  {/* Upper Committee Tabs Bar */}
                  <div className="pm-committee-tabs-bar">
                    <div className="pm-tabs-scroll">
                      {visibleCommittees.map((c) => {
                        const count = (membersByCommittee[String(c._id)] || []).length;
                        const isActive = activeCommittee && String(c._id) === String(activeCommittee._id);
                        return (
                          <button
                            key={c._id}
                            type="button"
                            className={`pm-committee-tab ${isActive ? "is-active" : ""}`}
                            onClick={() => setActiveCommitteeId(c._id)}
                          >
                            <FaSitemap className="tab-icon" />
                            <span className="tab-name">{c.name}</span>
                            <span className="tab-pill">{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {myRole === 'CHAIRPERSON' && perms.canManageCommittees && (
                      <button
                        type="button"
                        className="pm-add-committee-tab-btn"
                        onClick={() => {
                          setCommitteeForm({ name: "", description: "" });
                          setModalError("");
                          setCommitteeModal({ mode: "create" });
                        }}
                        title={t('projects.details.addCommittee')}
                      >
                        <FaPlus aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* Active Committee Details Below */}
                  {activeCommittee && (
                    <div className="pm-committee-details-box">
                      <div className="committee-details-header">
                        <div className="committee-main-info">
                          <div className="committee-title-row">
                            <h3>{activeCommittee.name}</h3>
                            <span className="committee-members-badge">
                              <FaUsers /> {(membersByCommittee[String(activeCommittee._id)] || []).length} {t('shell.nav.members')}
                            </span>
                          </div>

                          <p className="committee-lead-text">
                            {activeCommittee.lead ? (
                              <>
                                {t('projects.committeeCard.ledByPrefix')} <strong>{activeCommittee.lead.name}</strong>
                              </>
                            ) : (
                              <em>{t('projects.committeeCard.noLead')}</em>
                            )}
                          </p>

                          {activeCommittee.description && (
                            <p className="committee-description-text">{activeCommittee.description}</p>
                          )}
                        </div>

                        {myRole === 'CHAIRPERSON' && perms.canManageCommittees && (
                          <div className="committee-header-actions">
                            <button
                              className="pm-icon-btn"
                              onClick={() => {
                                setCommitteeForm({
                                  name: activeCommittee.name,
                                  description: activeCommittee.description || "",
                                });
                                setModalError("");
                                setCommitteeModal({ mode: "edit", committee: activeCommittee });
                              }}
                              aria-label={t('projects.details.aria.editCommittee')}
                              title={t('projects.details.aria.editCommittee')}
                            >
                              <FaPen />
                            </button>
                            <button
                              className="pm-icon-btn is-danger"
                              onClick={() => deleteCommittee(activeCommittee)}
                              aria-label={t('projects.details.aria.deleteCommittee')}
                              title={t('projects.details.aria.deleteCommittee')}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Committee Roster */}
                      <div className="committee-roster-body">
                        <CommitteeMemberList
                          members={membersByCommittee[String(activeCommittee._id)] || []}
                          leadId={activeCommittee.lead?._id}
                          canManage={myRole === 'CHAIRPERSON' && perms.canManageMembers}
                          onRemove={removeMember}
                          onMakeLead={(userId) => makeLead(activeCommittee._id, userId)}
                          emptyText={t('projects.committeeCard.emptyMembers')}
                        />
                      </div>

                      {myRole === 'CHAIRPERSON' && perms.canManageMembers && (
                        <div className="committee-roster-footer">
                          <button
                            className="pm-btn pm-btn-ghost pm-btn-sm add-to-committee-btn"
                            onClick={() => openMemberModal(activeCommittee)}
                          >
                            <FaUserPlus aria-hidden="true" /> {t('projects.committeeCard.addMember')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ---------------- tasks ---------------- */}
            <section className="pm-panel">
              <header className="pm-panel-head">
                <h2><FaTasks aria-hidden="true" /> {t('projects.details.tasksHeading')}</h2>
                {myRole === 'CHAIRPERSON' && perms.canCreateTasks && (
                  <button
                    className="pm-btn pm-btn-primary pm-btn-sm"
                    onClick={() => {
                      setTaskForm(emptyTask());
                      setModalError("");
                      setTaskModal(true);
                    }}
                  >
                    <FaPlus aria-hidden="true" /> {t('projects.details.newTask')}
                  </button>
                )}
              </header>

              <div className="pm-tabs">
                {TASK_FILTER_KEYS.map((f) => (
                  <button
                    key={f.key}
                    className={`pm-tab ${taskFilter === f.key ? "is-active" : ""}`}
                    onClick={() => setTaskFilter(f.key)}
                  >
                    {t(`projects.details.taskFilters.${f.labelKey}`)}
                  </button>
                ))}
              </div>

              {visibleTasks.length === 0 ? (
                <p className="pm-empty-inline">{t('projects.details.noTasksInView')}</p>
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
            </>
          )}

          {/* =========================================================================
             TAB 2: PROJECT FEEDBACKS VIEW
             ========================================================================= */}
          {projectDetailTab === 'feedbacks' && (
            <div className="project-submissions-panel">
              <div className="panel-header-row">
                <h3>Member Feedbacks for {data.project?.PName}</h3>
                <p>Review thoughts, evaluations, and suggestions submitted by project members.</p>
              </div>

              {loadingSubmissions ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#6b52d1' }}>
                  <FaSpinner className="fa-spin" style={{ fontSize: '1.5rem' }} />
                  <p style={{ marginTop: '8px', color: '#64748b', fontSize: '0.88rem' }}>Loading feedbacks...</p>
                </div>
              ) : projectFeedbacks.length === 0 ? (
                <div className="pm-empty-inline" style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
                  No feedback has been submitted for this project yet.
                </div>
              ) : (
                <div className="project-feedbacks-stack">
                  {projectFeedbacks.map((fb) => (
                    <div key={fb._id} className="proj-sub-card">
                      <div className="sub-meta-top">
                        <span className="sub-author">👤 {fb.userId?.name || fb.author || 'Member'}</span>
                        {fb.targetMember && (
                          <span className="sub-target">Target: {fb.targetMember}</span>
                        )}
                        <span className="sub-cat">{fb.type}</span>
                        <span className="sub-stars">⭐ {fb.rating}/5</span>
                        <span className="sub-date">{new Date(fb.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="sub-body">{fb.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
             TAB 3: PROJECT ISSUES & COMPLAINTS VIEW
             ========================================================================= */}
          {projectDetailTab === 'complaints' && (
            <div className="project-submissions-panel">
              <div className="panel-header-row">
                <h3>Reported Issues & Complaints for {data.project?.PName}</h3>
                <p>Manage and resolve issues submitted by members regarding tasks, assignments, or conflicts.</p>
              </div>

              {loadingSubmissions ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#6b52d1' }}>
                  <FaSpinner className="fa-spin" style={{ fontSize: '1.5rem' }} />
                  <p style={{ marginTop: '8px', color: '#64748b', fontSize: '0.88rem' }}>Loading complaints...</p>
                </div>
              ) : projectComplaints.length === 0 ? (
                <div className="pm-empty-inline" style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
                  No issues or complaints reported for this project.
                </div>
              ) : (
                <div className="project-complaints-stack">
                  {projectComplaints.map((c) => (
                    <div key={c._id} className="proj-sub-card">
                      <div className="sub-meta-top">
                        <span className="sub-author">👤 {c.userId?.name || c.from || 'Member'}</span>
                        {c.targetMember && (
                          <span className="sub-target">Target: {c.targetMember}</span>
                        )}
                        <span className="sub-cat">{c.category}</span>
                        <span className={`sub-priority ${(c.priority || 'medium').toLowerCase()}`}>
                          {c.priority} Priority
                        </span>
                        <span className={`sub-status status-${(c.status || 'open').toLowerCase().replace(' ', '-')}`}>
                          {c.status || 'Open'}
                        </span>
                        <span className="sub-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>

                      <h4 className="sub-head">{c.title}</h4>
                      <p className="sub-body">{c.description}</p>

                      {(isAdmin || myRole === 'CHAIRPERSON') && (
                        <div className="sub-action-row">
                          <span className="status-lbl">Change Status:</span>
                          <select
                            value={c.status || 'Open'}
                            onChange={(e) => handleUpdateComplaintStatus(c._id, e.target.value)}
                            className={`status-select status-${(c.status || 'open').toLowerCase().replace(' ', '-')}`}
                          >
                            <option value="Open">🟡 Open (Pending)</option>
                            <option value="In Progress">🔵 In Progress</option>
                            <option value="Resolved">🟢 Resolved</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ---------------- committee modal ---------------- */}
      <Modal
        open={!!committeeModal}
        title={committeeModal?.mode === "edit" ? t('projects.details.modals.committee.editTitle') : t('projects.details.modals.committee.newTitle')}
        onClose={() => setCommitteeModal(null)}
        footer={
          <>
            <button className="pm-btn pm-btn-ghost" onClick={() => setCommitteeModal(null)}>{t('common.cancel')}</button>
            <button className="pm-btn pm-btn-primary" onClick={submitCommittee} disabled={saving}>
              {saving ? t('projects.details.modals.committee.saving') : t('common.save')}
            </button>
          </>
        }
      >
        <form className="pm-form" onSubmit={submitCommittee}>
          <label>
            {t('projects.details.modals.committee.nameLabel')}
            <input
              value={committeeForm.name}
              onChange={(e) => setCommitteeForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={t('projects.details.modals.committee.namePlaceholder')}
            />
          </label>
          <label>
            {t('projects.details.modals.committee.descriptionLabel')} <span className="opt">{t('projects.details.modals.committee.optional')}</span>
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
        title={memberModal?.committee ? t('projects.details.modals.member.addToTitle', { name: memberModal.committee.name }) : t('projects.details.modals.member.addTitle')}
        onClose={() => setMemberModal(null)}
        footer={
          <>
            <button className="pm-btn pm-btn-ghost" onClick={() => setMemberModal(null)}>{t('common.cancel')}</button>
            <button className="pm-btn pm-btn-primary" onClick={submitMember} disabled={saving}>
              {saving ? t('projects.details.modals.member.adding') : t('projects.details.modals.member.addMember')}
            </button>
          </>
        }
      >
        <form className="pm-form" onSubmit={submitMember}>
          <label>
            {t('projects.details.modals.member.personLabel')}
            <select
              value={memberForm.userId}
              onChange={(e) => setMemberForm((p) => ({ ...p, userId: e.target.value }))}
            >
              <option value="">{t('projects.details.modals.member.selectSomeone')}</option>
              {assignable.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} — {u.indexNo}
                </option>
              ))}
            </select>
          </label>

          {assignable.length === 0 && (
            <p className="pm-empty-inline">{t('projects.details.modals.member.allAssigned')}</p>
          )}

          <label>
            {t('projects.details.modals.member.positionLabel')} <span className="opt">{t('projects.details.modals.committee.optional')}</span>
            <input
              value={memberForm.position}
              onChange={(e) => setMemberForm((p) => ({ ...p, position: e.target.value }))}
              placeholder={t('projects.details.modals.member.positionPlaceholder')}
            />
          </label>
          {modalError && <p className="pm-form-error">{modalError}</p>}
        </form>
      </Modal>

      {/* ---------------- task modal ---------------- */}
      <Modal
        open={taskModal}
        title={t('projects.details.modals.task.newTitle')}
        onClose={() => setTaskModal(false)}
        width={540}
        footer={
          <>
            <button className="pm-btn pm-btn-ghost" onClick={() => setTaskModal(false)}>{t('common.cancel')}</button>
            <button className="pm-btn pm-btn-primary" onClick={submitTask} disabled={saving}>
              {saving ? t('projects.details.modals.task.creating') : t('projects.details.modals.task.createTask')}
            </button>
          </>
        }
      >
        <form className="pm-form" onSubmit={submitTask}>
          <label>
            {t('projects.details.modals.task.titleLabel')}
            <input
              value={taskForm.title}
              onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={t('projects.details.modals.task.titlePlaceholder')}
            />
          </label>

          <label>
            {t('projects.details.modals.task.descriptionLabel')} <span className="opt">{t('projects.details.modals.committee.optional')}</span>
            <textarea
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
            />
          </label>

          <div className="pm-form-row">
            <label>
              {t('projects.details.modals.task.assignToLabel')}
              <select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm((p) => ({ ...p, assignedTo: e.target.value }))}
              >
                <option value="">{t('projects.details.modals.task.selectMember')}</option>
                {members.map((m) => (
                  <option key={m._id} value={m.user?._id}>{m.user?.name}</option>
                ))}
              </select>
            </label>

            <label>
              {t('projects.details.modals.task.committeeLabel')} <span className="opt">{t('projects.details.modals.committee.optional')}</span>
              <select
                value={taskForm.committeeId}
                onChange={(e) => setTaskForm((p) => ({ ...p, committeeId: e.target.value }))}
              >
                <option value="">{t('projects.details.modals.task.none')}</option>
                {committees.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="pm-form-row">
            <label>
              {t('projects.details.modals.task.dueDateLabel')}
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </label>
            <label>
              {t('projects.details.modals.task.dueTimeLabel')} <span className="opt">{t('projects.details.modals.committee.optional')}</span>
              <input
                type="time"
                value={taskForm.dueTime}
                onChange={(e) => setTaskForm((p) => ({ ...p, dueTime: e.target.value }))}
              />
            </label>
          </div>

          <label>
            {t('projects.details.modals.task.priorityLabel')}
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}
            >
              <option value="LOW">{t('projects.details.modals.task.priorityLow')}</option>
              <option value="MEDIUM">{t('projects.details.modals.task.priorityMedium')}</option>
              <option value="HIGH">{t('projects.details.modals.task.priorityHigh')}</option>
            </select>
          </label>

          {modalError && <p className="pm-form-error">{modalError}</p>}
        </form>
      </Modal>

      {/* ---------------- edit project modal ---------------- */}
      <Modal
        open={editModal}
        title={t('projects.details.modals.editProject.title')}
        onClose={() => setEditModal(false)}
        footer={
          <>
            <button className="pm-btn pm-btn-ghost" onClick={() => setEditModal(false)}>{t('common.cancel')}</button>
            <button className="pm-btn pm-btn-primary" onClick={submitProjectEdit} disabled={saving}>
              {saving ? t('projects.details.modals.editProject.saving') : t('projects.details.modals.editProject.saveChanges')}
            </button>
          </>
        }
      >
        {editForm && (
          <form className="pm-form" onSubmit={submitProjectEdit}>
            <label>
              {t('projects.details.modals.editProject.nameLabel')}
              <input
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              />
            </label>
            <label>
              {t('projects.details.modals.editProject.descriptionLabel')}
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              />
            </label>
            <div className="pm-form-row">
              <label>
                {t('projects.details.modals.editProject.startDateLabel')}
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))}
                />
              </label>
              <label>
                {t('projects.details.modals.editProject.endDateLabel')}
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))}
                />
              </label>
            </div>
            <label>
              {t('projects.details.modals.editProject.statusLabel')}
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="UPCOMING">{t('projects.details.modals.editProject.statusUpcoming')}</option>
                <option value="ACTIVE">{t('projects.details.modals.editProject.statusActive')}</option>
                <option value="COMPLETED">{t('projects.details.modals.editProject.statusCompleted')}</option>
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
