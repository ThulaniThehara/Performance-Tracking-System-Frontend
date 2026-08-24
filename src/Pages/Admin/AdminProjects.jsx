import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaPlus, FaSearch, FaCrown, FaArrowRight, FaFolderOpen } from "react-icons/fa";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
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
      setError(e.message || t('admin.projects.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = useCallback(async () => {
    setForm(emptyForm());
    setFormError("");
    setShowCreate(true);
    try {
      const res = await apiFetch("/user/all");
      const list = (res?.data || []).filter((u) => u.status === "ACTIVE");
      setUsers(list);
    } catch (e) {
      setFormError(e.message || t('admin.projects.loadMembersError'));
    }
  }, [t]);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      openCreate();
      // Remove param from URL without page reload
      setSearchParams((params) => {
        params.delete("create");
        return params;
      }, { replace: true });
    }
  }, [searchParams, openCreate, setSearchParams]);

  const onFormChange = (e) => {
    setFormError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submitProject = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setFormError(t('admin.projects.errors.nameRequired'));
    if (!form.startDate) return setFormError(t('admin.projects.errors.startDateRequired'));
    if (!form.chairpersonId) return setFormError(t('admin.projects.errors.chairpersonRequired'));

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
      setFormError(err.message || t('admin.projects.errors.createFailed'));
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
              <p className="pm-eyebrow">{t('admin.projects.eyebrow')}</p>
              <h1>{t('shell.nav.projects')}</h1>
              <p className="pm-hero-sub">
                {t('admin.projects.subtitle')}
              </p>
            </div>

            <button className="pm-btn pm-btn-primary" onClick={openCreate}>
              <FaPlus aria-hidden="true" /> {t('admin.projects.createProject')}
            </button>
          </header>

          {error && <p className="pm-error">{error}</p>}

          <div className="pm-admin-toolbar">
            <div className="pm-search-box">
              <FaSearch aria-hidden="true" />
              <input
                placeholder={t('admin.projects.searchPlaceholder')}
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
              <h3>{projects.length === 0 ? t('admin.projects.emptyNoProjects') : t('admin.projects.emptyNoMatches')}</h3>
              <p>
                {projects.length === 0
                  ? t('admin.projects.emptyNoProjectsBody')
                  : t('admin.projects.emptyNoMatchesBody')}
              </p>
              {projects.length === 0 && (
                <button className="pm-btn pm-btn-primary" onClick={openCreate}>
                  <FaPlus aria-hidden="true" /> {t('admin.projects.createProject')}
                </button>
              )}
            </div>
          ) : (
            <div className="pm-admin-table-wrap">
              <table className="pm-admin-table">
                <thead>
                  <tr>
                    <th>{t('admin.projects.table.project')}</th>
                    <th>{t('enums.role.CHAIRPERSON')}</th>
                    <th>{t('admin.projects.table.status')}</th>
                    <th>{t('shell.nav.members')}</th>
                    <th>{t('shell.nav.committees')}</th>
                    <th>{t('projects.card.progress')}</th>
                    <th>{t('admin.projects.table.startDate')}</th>
                    <th aria-hidden="true"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const statusKey = String(p.status || "").toUpperCase();
                    return (
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
                          <span className="pm-muted">{t('projects.overview.unassigned')}</span>
                        )}
                      </td>
                      <td>
                        <span className={`pm-project-status is-${statusKey.toLowerCase()}`}>
                          {t(`enums.projectStatus.${statusKey}`, { defaultValue: humanise(p.status) })}
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
                          {t('projects.card.manage')} <FaArrowRight aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showCreate}
        title={t('admin.projects.createProject')}
        onClose={() => setShowCreate(false)}
        footer={
          <>
            <button className="pm-btn pm-btn-ghost" onClick={() => setShowCreate(false)}>
              {t('common.cancel')}
            </button>
            <button className="pm-btn pm-btn-primary" onClick={submitProject} disabled={saving}>
              {saving ? t('admin.projects.modal.creating') : t('admin.projects.createProject')}
            </button>
          </>
        }
      >
        <form className="pm-form" onSubmit={submitProject}>
          <label>
            {t('admin.projects.modal.nameLabel')}
            <input
              name="title"
              value={form.title}
              onChange={onFormChange}
              placeholder={t('admin.projects.modal.namePlaceholder')}
            />
          </label>

          <label>
            <span>{t('projects.details.modals.editProject.descriptionLabel')} <span className="opt">{t('projects.details.modals.committee.optional')}</span></span>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={onFormChange}
              placeholder={t('admin.projects.modal.descriptionPlaceholder')}
            />
          </label>

          <div className="pm-form-row">
            <label>
              <span>{t('projects.details.modals.editProject.startDateLabel')}</span>
              <input type="date" name="startDate" value={form.startDate} onChange={onFormChange} />
            </label>
            <label>
              <span>{t('projects.details.modals.editProject.endDateLabel')} <span className="opt">{t('projects.details.modals.committee.optional')}</span></span>
              <input type="date" name="endDate" value={form.endDate} onChange={onFormChange} />
            </label>
          </div>

          <label>
            {t('projects.details.modals.editProject.statusLabel')}
            <select name="status" value={form.status} onChange={onFormChange}>
              <option value="UPCOMING">{t('projects.details.modals.editProject.statusUpcoming')}</option>
              <option value="ACTIVE">{t('projects.details.modals.editProject.statusActive')}</option>
              <option value="COMPLETED">{t('projects.details.modals.editProject.statusCompleted')}</option>
            </select>
          </label>

          <label>
            <span className="pm-chair-label">
              <FaCrown aria-hidden="true" /> {t('enums.role.CHAIRPERSON')}
            </span>
            <select name="chairpersonId" value={form.chairpersonId} onChange={onFormChange}>
              <option value="">{t('admin.projects.modal.selectChairperson')}</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} — {u.indexNo} ({t(`enums.role.${String(u.userRole || '').toUpperCase()}`, { defaultValue: humanise(u.userRole) })})
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
