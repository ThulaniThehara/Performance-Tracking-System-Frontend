import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaCrown, FaArrowRight, FaFolderOpen } from "react-icons/fa";

import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import Modal from "../../Components/Projects/Modal";
import Avatar from "../../Components/Projects/Avatar";
import { apiFetch } from "../../utils/api";
import { formatDate, humanise } from "../../utils/projectUtils";
import "../../SCSS/Projects/Projects.scss";

const emptyForm = () => ({
  title: "",
  description: "",
  status: "UPCOMING",
  startDate: "",
  endDate: "",
  chairpersonId: "",
});

/**
 * Admin → Management → Projects.
 *
 * This is the ONLY place a society project gets created. Creating one always
 * means naming its chairperson in the same step — a project never exists
 * without a deliberately assigned owner. Once created, that chairperson runs
 * the project day to day (committees, members, tasks) from their own login,
 * on the project's details page; this admin page only creates and oversees.
 */
const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFetch("/pm/admin/projects");
      if (!res) return;
      setProjects(res.data || []);
    } catch (e) {
      setError(e.message || "Could not load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = async () => {
    setForm(emptyForm());
    setFormError("");
    setShowCreate(true);
    try {
      const res = await apiFetch("/user/all");
      const list = (res?.data || []).filter((u) => u.status === "ACTIVE");
      setUsers(list);
    } catch (e) {
      setFormError(e.message || "Could not load the member list.");
    }
  };

  const onFormChange = (e) => {
    setFormError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submitProject = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setFormError("Please give the project a name.");
    if (!form.startDate) return setFormError("Please pick a start date.");
    if (!form.chairpersonId) return setFormError("Please assign a chairperson.");

    try {
      setSaving(true);
      setFormError("");
      const res = await apiFetch("/pm/projects", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          status: form.status,
          startDate: form.startDate,
          endDate: form.endDate || undefined,
          chairpersonId: form.chairpersonId,
        }),
      });
      if (!res) return;
      setShowCreate(false);
      await load();
    } catch (err) {
      setFormError(err.message || "Could not create the project.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.PName?.toLowerCase().includes(q) ||
        p.societyName?.toLowerCase().includes(q) ||
        p.chairpersonId?.name?.toLowerCase().includes(q)
    );
  }, [projects, search]);

  return (
    <>
      <Header />
      <LeftNavigationBar />

      <div className="pm-page">
        <div className="pm-wrapper">
          <header className="pm-hero">
            <div>
              <p className="pm-eyebrow">Management</p>
              <h1>Projects</h1>
              <p className="pm-hero-sub">
                Create society projects and assign each one a chairperson
              </p>
            </div>

            <button className="pm-btn pm-btn-primary" onClick={openCreate}>
              <FaPlus aria-hidden="true" /> Create Project
            </button>
          </header>

          {error && <p className="pm-error">{error}</p>}

          <div className="pm-admin-toolbar">
            <div className="pm-search-box">
              <FaSearch aria-hidden="true" />
              <input
                placeholder="Search by project, society, or chairperson…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="pm-skeleton-list">
              {[1, 2, 3].map((i) => <div key={i} className="pm-skeleton-row" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="pm-empty-state">
              <span className="empty-icon" aria-hidden="true"><FaFolderOpen /></span>
              <h3>{projects.length === 0 ? "No projects yet" : "No matches"}</h3>
              <p>
                {projects.length === 0
                  ? "Create the first project and assign it a chairperson to get started."
                  : "Try a different search term."}
              </p>
              {projects.length === 0 && (
                <button className="pm-btn pm-btn-primary" onClick={openCreate}>
                  <FaPlus aria-hidden="true" /> Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="pm-admin-table-wrap">
              <table className="pm-admin-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Chairperson</th>
                    <th>Status</th>
                    <th>Members</th>
                    <th>Committees</th>
                    <th>Progress</th>
                    <th>Start date</th>
                    <th aria-hidden="true"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="pm-table-title">
                          <strong>{p.PName}</strong>
                          {p.societyName && <span>{p.societyName}</span>}
                        </div>
                      </td>
                      <td>
                        {p.chairpersonId ? (
                          <div className="pm-table-person">
                            <Avatar name={p.chairpersonId.name} size="xs" highlight />
                            <span>{p.chairpersonId.name}</span>
                          </div>
                        ) : (
                          <span className="pm-muted">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`pm-project-status is-${String(p.status || "").toLowerCase()}`}>
                          {humanise(p.status)}
                        </span>
                      </td>
                      <td>{p.memberCount ?? 0}</td>
                      <td>{p.committeeCount ?? 0}</td>
                      <td>
                        <div className="pm-table-progress">
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${p.progress ?? 0}%` }} />
                          </div>
                          <span>{p.progress ?? 0}%</span>
                        </div>
                      </td>
                      <td className="pm-muted">{formatDate(p.StartDate)}</td>
                      <td>
                        <Link to={`/projects/${p._id}`} className="pm-btn pm-btn-ghost pm-btn-xs">
                          Manage <FaArrowRight aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showCreate}
        title="Create Project"
        onClose={() => setShowCreate(false)}
        footer={
          <>
            <button className="pm-btn pm-btn-ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
            <button className="pm-btn pm-btn-primary" onClick={submitProject} disabled={saving}>
              {saving ? "Creating…" : "Create Project"}
            </button>
          </>
        }
      >
        <form className="pm-form" onSubmit={submitProject}>
          <label>
            Project name
            <input
              name="title"
              value={form.title}
              onChange={onFormChange}
              placeholder="e.g. Wanakkam 2026"
            />
          </label>

          <label>
            <span>Description <span className="opt">optional</span></span>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={onFormChange}
              placeholder="What is this project about?"
            />
          </label>

          <div className="pm-form-row">
            <label>
              <span>Start date</span>
              <input type="date" name="startDate" value={form.startDate} onChange={onFormChange} />
            </label>
            <label>
              <span>End date <span className="opt">optional</span></span>
              <input type="date" name="endDate" value={form.endDate} onChange={onFormChange} />
            </label>
          </div>

          <label>
            Status
            <select name="status" value={form.status} onChange={onFormChange}>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>

          <label>
            <span className="pm-chair-label">
              <FaCrown aria-hidden="true" /> Chairperson
            </span>
            <select name="chairpersonId" value={form.chairpersonId} onChange={onFormChange}>
              <option value="">Select who will lead this project…</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} — {u.indexNo} ({humanise(u.userRole)})
                </option>
              ))}
            </select>
          </label>

          {formError && <p className="pm-form-error">{formError}</p>}
        </form>
      </Modal>
    </>
  );
};

export default AdminProjects;
