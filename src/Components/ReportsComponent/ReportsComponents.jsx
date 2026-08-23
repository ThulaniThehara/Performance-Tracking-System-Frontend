import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FaFileAlt,
  FaComments,
  FaExclamationCircle,
  FaDownload,
  FaChartBar,
  FaSearch,
  FaPaperPlane,
  FaTimes,
  FaUsers,
  FaCheckCircle,
  FaTasks,
  FaShieldAlt,
  FaSyncAlt,
  FaArrowUp,
  FaSitemap,
  FaSpinner,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../utils/api';
import { getUser } from '../../utils/auth';
import '../../SCSS/componentStyle/Reports.scss';

const ReportsComponents = () => {
  const { t } = useTranslation();
  const currentUser = getUser();

  const [activeTab, setActiveTab] = useState('performance');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [kpi, setKpi] = useState({
    avgPerformance: '100.0',
    activeMembers: 0,
    projectHealth: 100,
    taskVelocity: 100,
    totalTasks: 0,
    completedTasks: 0,
    totalProjects: 0,
  });

  const [performanceList, setPerformanceList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [complaintList, setComplaintList] = useState([]);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showComplaintsModal, setShowComplaintsModal] = useState(false);

  const [feedback, setFeedback] = useState({
    type: 'Suggestion',
    author: currentUser?.name || '',
    message: '',
    rating: 5,
  });

  const [complaint, setComplaint] = useState({
    category: 'Technical Issue',
    title: '',
    description: '',
    priority: 'Medium',
    from: currentUser?.name || '',
  });

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  // Fetch live reports and analytics data from backend
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch(`/pm/reports?period=${dateRange}`);
      if (!res?.data) return;

      setKpi(res.data.kpi || {});
      setPerformanceList(res.data.performance || []);
      setProjectList(res.data.projects || []);
      setFeedbackList(res.data.feedback || []);
      setComplaintList(res.data.complaints || []);
    } catch (e) {
      setError(e.message || t('reports.loadError'));
    } finally {
      setLoading(false);
    }
  }, [dateRange, t]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Filtered Performance Data
  const filteredPerformance = useMemo(() => {
    return performanceList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (item.member || '').toLowerCase().includes(q) ||
        (item.project || '').toLowerCase().includes(q) ||
        (item.role || '').toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || (item.status || '').toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [performanceList, searchQuery, statusFilter]);

  // Filtered Projects Data
  const filteredProjects = useMemo(() => {
    return projectList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (item.name || '').toLowerCase().includes(q) ||
        (item.lead || '').toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || (item.status || '').toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [projectList, searchQuery, statusFilter]);

  // Filtered Feedback Data
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        (item.author || '').toLowerCase().includes(q) ||
        (item.message || '').toLowerCase().includes(q) ||
        (item.type || '').toLowerCase().includes(q)
      );
    });
  }, [feedbackList, searchQuery]);

  // Filtered Complaints Data
  const filteredComplaints = useMemo(() => {
    return complaintList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (item.from || '').toLowerCase().includes(q) ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || (item.status || '').toLowerCase().replace(' ', '') === statusFilter.toLowerCase().replace(' ', '');
      return matchesSearch && matchesStatus;
    });
  }, [complaintList, searchQuery, statusFilter]);

  // Submit Feedback to backend
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.message.trim()) return;

    try {
      setSubmitting(true);
      const res = await apiFetch('/pm/reports/feedback', {
        method: 'POST',
        body: JSON.stringify({
          author: feedback.author.trim() || currentUser?.name || t('reports.anonymous'),
          type: feedback.type,
          message: feedback.message.trim(),
          rating: feedback.rating,
        }),
      });

      if (res?.data) {
        setFeedbackList([
          {
            id: res.data._id,
            author: res.data.author,
            role: res.data.role,
            type: res.data.type,
            message: res.data.message,
            rating: res.data.rating,
            date: new Date().toISOString().split('T')[0],
          },
          ...feedbackList,
        ]);
      }

      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setShowFeedbackModal(false);
        setFeedback({ type: 'Suggestion', author: currentUser?.name || '', message: '', rating: 5 });
      }, 1200);
    } catch (err) {
      alert(err.message || t('reports.feedbackSubmitError'));
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Complaint to backend
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaint.title.trim() || !complaint.description.trim()) return;

    try {
      setSubmitting(true);
      const res = await apiFetch('/pm/reports/complaint', {
        method: 'POST',
        body: JSON.stringify({
          from: complaint.from.trim() || currentUser?.name || t('reports.anonymous'),
          category: complaint.category,
          title: complaint.title.trim(),
          description: complaint.description.trim(),
          priority: complaint.priority,
        }),
      });

      if (res?.data) {
        setComplaintList([
          {
            id: res.data._id,
            from: res.data.from,
            category: res.data.category,
            title: res.data.title,
            description: res.data.description,
            priority: res.data.priority,
            status: res.data.status,
            date: new Date().toISOString().split('T')[0],
          },
          ...complaintList,
        ]);
      }

      setComplaintSubmitted(true);
      setTimeout(() => {
        setComplaintSubmitted(false);
        setShowComplaintsModal(false);
        setComplaint({ category: 'Technical Issue', title: '', description: '', priority: 'Medium', from: currentUser?.name || '' });
      }, 1200);
    } catch (err) {
      alert(err.message || t('reports.complaintSubmitError'));
    } finally {
      setSubmitting(false);
    }
  };

  // Download CSV Export
  const downloadReportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `report_${activeTab}_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeTab === 'performance') {
      headers = ['Member', 'Role', 'Faculty', 'Batch', 'Project(s)', 'Performance Score (%)', 'Tasks Completed', 'Total Tasks', 'Completed On-Time', 'Completed Late', 'Overdue Tasks', 'Status', 'Date'];
      rows = filteredPerformance.map((p) => [
        `"${p.member || ''}"`,
        `"${p.role || ''}"`,
        `"${p.faculty || ''}"`,
        `"${p.batch || ''}"`,
        `"${p.project || ''}"`,
        p.score,
        p.tasksDone,
        p.totalTasks,
        p.completedOnTime,
        p.completedLate,
        p.overdueTasks,
        `"${p.status || ''}"`,
        p.date,
      ]);
    } else if (activeTab === 'projects') {
      headers = ['Project Name', 'Lead Chairperson', 'Progress (%)', 'Members', 'Committees', 'Tasks Done', 'Total Tasks', 'Status', 'Health'];
      rows = filteredProjects.map((p) => [
        `"${p.name || ''}"`,
        `"${p.lead || ''}"`,
        p.progress,
        p.members,
        p.committees,
        p.tasksDone,
        p.totalTasks,
        `"${p.status || ''}"`,
        `"${p.budgetHealth || ''}"`,
      ]);
    } else if (activeTab === 'feedback') {
      headers = ['Author', 'Role', 'Type', 'Rating', 'Message', 'Date'];
      rows = filteredFeedback.map((f) => [
        `"${f.author || ''}"`,
        `"${f.role || 'Member'}"`,
        `"${f.type || ''}"`,
        f.rating,
        `"${(f.message || '').replace(/"/g, '""')}"`,
        f.date,
      ]);
    } else {
      headers = ['From', 'Category', 'Title', 'Priority', 'Status', 'Date', 'Description'];
      rows = filteredComplaints.map((c) => [
        `"${c.from || ''}"`,
        `"${c.category || ''}"`,
        `"${c.title || ''}"`,
        `"${c.priority || ''}"`,
        `"${c.status || ''}"`,
        c.date,
        `"${(c.description || '').replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-page">
      <div className="reports-wrapper">
        {/* Page Hero Header */}
        <header className="reports-hero">
          <div className="hero-left">
            <span className="hero-eyebrow">{t('reports.hero.eyebrow')}</span>
            <h1>{t('reports.hero.title')}</h1>
            <p className="hero-sub">
              {t('reports.hero.subtitle')}
            </p>
          </div>

          <div className="hero-actions">
            <button className="rpt-btn rpt-btn-secondary" onClick={() => setShowComplaintsModal(true)}>
              <FaExclamationCircle aria-hidden="true" /> {t('reports.hero.reportIssue')}
            </button>
            <button className="rpt-btn rpt-btn-primary" onClick={downloadReportCSV}>
              <FaDownload aria-hidden="true" /> {t('reports.hero.exportCsv')}
            </button>
          </div>
        </header>

        {error && <div className="pm-error" style={{ marginBottom: '24px' }}>{error}</div>}

        {/* Top KPI Metrics Cards */}
        <section className="reports-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrap is-purple">
              <FaChartBar aria-hidden="true" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">{t('reports.kpi.avgPerformance')}</span>
              <div className="kpi-val-row">
                <span className="kpi-value">{loading ? '...' : `${kpi.avgPerformance}%`}</span>
                <span className="kpi-trend is-positive">
                  <FaArrowUp aria-hidden="true" /> {t('reports.kpi.liveScore')}
                </span>
              </div>
              <span className="kpi-caption">{t('reports.kpi.avgPerformanceCaption')}</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap is-blue">
              <FaUsers aria-hidden="true" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">{t('reports.kpi.activeMembers')}</span>
              <div className="kpi-val-row">
                <span className="kpi-value">{loading ? '...' : kpi.activeMembers}</span>
                <span className="kpi-tag">{t('reports.kpi.activeRoster')}</span>
              </div>
              <span className="kpi-caption">{t('reports.kpi.activeMembersCaption')}</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap is-emerald">
              <FaCheckCircle aria-hidden="true" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">{t('reports.kpi.projectHealth')}</span>
              <div className="kpi-val-row">
                <span className="kpi-value">{loading ? '...' : `${kpi.projectHealth}%`}</span>
                <span className="kpi-trend is-positive">
                  <FaArrowUp aria-hidden="true" /> {t('reports.kpi.onTrack')}
                </span>
              </div>
              <span className="kpi-caption">{t('reports.kpi.projectHealthCaption', { count: kpi.totalProjects || 0 })}</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap is-amber">
              <FaTasks aria-hidden="true" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">{t('reports.kpi.taskVelocity')}</span>
              <div className="kpi-val-row">
                <span className="kpi-value">{loading ? '...' : `${kpi.taskVelocity}%`}</span>
                <span className="kpi-tag">{t('reports.kpi.completion')}</span>
              </div>
              <span className="kpi-caption">{t('reports.kpi.taskVelocityCaption', { completed: kpi.completedTasks || 0, total: kpi.totalTasks || 0 })}</span>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="reports-nav-bar">
          <div className="nav-tabs-group">
            <button
              className={`nav-tab-btn ${activeTab === 'performance' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              <FaChartBar aria-hidden="true" /> {t('reports.tabs.performance')}
              <span className="tab-badge">{filteredPerformance.length}</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'projects' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <FaFileAlt aria-hidden="true" /> {t('reports.tabs.projects')}
              <span className="tab-badge">{filteredProjects.length}</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'feedback' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('feedback')}
            >
              <FaComments aria-hidden="true" /> {t('reports.tabs.feedback')}
              <span className="tab-badge">{filteredFeedback.length}</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'complaints' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('complaints')}
            >
              <FaShieldAlt aria-hidden="true" /> {t('reports.tabs.complaints')}
              <span className="tab-badge">{filteredComplaints.length}</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Search + Dynamic Filters */}
        <div className="reports-toolbar">
          <div className="toolbar-search">
            <FaSearch aria-hidden="true" className="search-icon" />
            <input
              type="text"
              placeholder={t('reports.searchPlaceholder', { tab: t(`reports.tabs.${activeTab}`) })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')} title={t('reports.clearSearch')}>
                <FaTimes />
              </button>
            )}
          </div>

          <div className="toolbar-filters">
            <div className="filter-item">
              <label>{t('reports.filters.statusLabel')}</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">{t('reports.filters.allStatuses')}</option>
                {activeTab === 'performance' && (
                  <>
                    <option value="excellent">{t('reports.filters.excellent')}</option>
                    <option value="good">{t('reports.filters.good')}</option>
                    <option value="needs attention">{t('reports.filters.needsAttention')}</option>
                  </>
                )}
                {activeTab === 'projects' && (
                  <>
                    <option value="active">{t('reports.filters.active')}</option>
                    <option value="completed">{t('reports.filters.completed')}</option>
                    <option value="upcoming">{t('reports.filters.upcoming')}</option>
                  </>
                )}
                {activeTab === 'complaints' && (
                  <>
                    <option value="resolved">{t('reports.filters.resolved')}</option>
                    <option value="inprogress">{t('reports.filters.inProgress')}</option>
                    <option value="open">{t('reports.filters.open')}</option>
                  </>
                )}
              </select>
            </div>

            <div className="filter-item">
              <label>{t('reports.filters.periodLabel')}</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="all">{t('reports.filters.allTime')}</option>
                <option value="month">{t('reports.filters.thisMonth')}</option>
                <option value="quarter">{t('reports.filters.thisQuarter')}</option>
                <option value="year">{t('reports.filters.currentYear')}</option>
              </select>
            </div>

            {(searchQuery || statusFilter !== 'all' || dateRange !== 'all') && (
              <button
                className="reset-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDateRange('all');
                }}
              >
                <FaSyncAlt aria-hidden="true" /> {t('reports.filters.reset')}
              </button>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        <main className="reports-main-content">
          {/* TAB 1: PERFORMANCE SCORECARD */}
          {activeTab === 'performance' && (
            <div className="reports-pane">
              <div className="pane-header">
                <div>
                  <h2>{t('reports.performancePane.title')}</h2>
                  <p>{t('reports.performancePane.subtitle')}</p>
                </div>
                <button className="rpt-btn rpt-btn-sm" onClick={downloadReportCSV}>
                  <FaDownload aria-hidden="true" /> {t('reports.performancePane.exportScorecard')}
                </button>
              </div>

              {loading ? (
                <div className="pm-skeleton-list" style={{ padding: '24px', textAlign: 'center' }}>
                  <FaSpinner className="spin" style={{ fontSize: '1.8rem', color: 'var(--accent)' }} />
                  <p style={{ marginTop: '10px', color: 'var(--label-muted)', fontSize: '0.86rem' }}>
                    {t('reports.performancePane.loadingText')}
                  </p>
                </div>
              ) : filteredPerformance.length === 0 ? (
                <div className="reports-empty-state">
                  <FaFileAlt className="empty-icon" />
                  <h3>{t('reports.performancePane.emptyTitle')}</h3>
                  <p>{t('reports.performancePane.emptyBody')}</p>
                </div>
              ) : (
                <div className="rpt-table-wrap">
                  <table className="rpt-table">
                    <thead>
                      <tr>
                        <th>{t('reports.performancePane.columns.memberDetails')}</th>
                        <th>{t('reports.performancePane.columns.assignedProjects')}</th>
                        <th>{t('reports.performancePane.columns.tasksCompleted')}</th>
                        <th>{t('reports.performancePane.columns.performanceScore')}</th>
                        <th>{t('reports.performancePane.columns.rating')}</th>
                        <th>{t('reports.performancePane.columns.deadlineAdherence')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPerformance.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="member-cell">
                              <div className="member-avatar">
                                {(item.member || 'U')
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </div>
                              <div>
                                <strong className="member-name">{item.member}</strong>
                                <span className="member-role">{item.role}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="project-tag">{item.project}</span>
                          </td>
                          <td>
                            <div className="task-count-cell">
                              {t('reports.performancePane.tasksDoneRatio', { done: item.tasksDone, total: item.totalTasks })}
                            </div>
                          </td>
                          <td>
                            <div className="rpt-score-meter">
                              <div className="meter-track">
                                <div
                                  className={`meter-fill ${
                                    item.score >= 90 ? 'is-high' : item.score >= 75 ? 'is-med' : 'is-low'
                                  }`}
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                              <span className="meter-val">{item.score}%</span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`rpt-pill ${
                                item.status === 'Excellent'
                                  ? 'is-excellent'
                                  : item.status === 'Good'
                                  ? 'is-good'
                                  : 'is-warning'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="rpt-date-cell">
                            <span style={{ color: '#059669', fontWeight: 600 }}>
                              {t('reports.performancePane.onTimeCount', { count: item.completedOnTime || 0 })}
                            </span>
                            {item.overdueTasks > 0 && (
                              <span style={{ color: '#dc2626', marginLeft: '6px', fontWeight: 600 }}>
                                • {t('reports.performancePane.overdueCount', { count: item.overdueTasks })}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROJECT SUMMARIES */}
          {activeTab === 'projects' && (
            <div className="reports-pane">
              <div className="pane-header">
                <div>
                  <h2>{t('reports.projectsPane.title')}</h2>
                  <p>{t('reports.projectsPane.subtitle')}</p>
                </div>
                <button className="rpt-btn rpt-btn-sm" onClick={downloadReportCSV}>
                  <FaDownload aria-hidden="true" /> {t('reports.projectsPane.exportSummary')}
                </button>
              </div>

              {loading ? (
                <div className="pm-skeleton-list" style={{ padding: '24px', textAlign: 'center' }}>
                  <FaSpinner className="spin" style={{ fontSize: '1.8rem', color: 'var(--accent)' }} />
                  <p style={{ marginTop: '10px', color: 'var(--label-muted)', fontSize: '0.86rem' }}>
                    {t('reports.projectsPane.loadingText')}
                  </p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="reports-empty-state">
                  <FaFileAlt className="empty-icon" />
                  <h3>{t('reports.projectsPane.emptyTitle')}</h3>
                  <p>{t('reports.projectsPane.emptyBody')}</p>
                </div>
              ) : (
                <div className="rpt-project-grid">
                  {filteredProjects.map((p) => (
                    <article key={p.id} className="rpt-project-card">
                      <div className="p-card-top">
                        <div>
                          <span className="p-lead-name">{t('reports.projectsPane.ledBy', { name: p.lead })}</span>
                          <h3>{p.name}</h3>
                        </div>
                        <span
                          className={`rpt-pill ${
                            p.status === 'Completed'
                              ? 'is-excellent'
                              : p.status === 'Active'
                              ? 'is-active'
                              : 'is-upcoming'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <div className="p-progress-block">
                        <div className="p-prog-head">
                          <span>{t('reports.projectsPane.overallProgress')}</span>
                          <strong>{p.progress}%</strong>
                        </div>
                        <div className="p-prog-bar">
                          <div className="p-prog-fill" style={{ width: `${p.progress}%` }} />
                        </div>
                      </div>

                      <div className="p-metrics-row">
                        <div className="p-metric-item">
                          <FaUsers aria-hidden="true" />
                          <div>
                            <strong>{p.members}</strong>
                            <span>{t('shell.nav.members')}</span>
                          </div>
                        </div>
                        <div className="p-metric-item">
                          <FaSitemap aria-hidden="true" />
                          <div>
                            <strong>{p.committees}</strong>
                            <span>{t('shell.nav.committees')}</span>
                          </div>
                        </div>
                        <div className="p-metric-item">
                          <FaCheckCircle aria-hidden="true" />
                          <div>
                            <strong>
                              {p.tasksDone}/{p.totalTasks}
                            </strong>
                            <span>{t('reports.projectsPane.tasksMetric')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-card-foot">
                        <span className="budget-tag">{t('reports.projectsPane.health', { value: p.budgetHealth })}</span>
                        <span className="p-completion-rate">
                          {t('reports.projectsPane.tasksDonePercent', { pct: p.totalTasks > 0 ? Math.round((p.tasksDone / p.totalTasks) * 100) : 0 })}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FEEDBACK HUB */}
          {activeTab === 'feedback' && (
            <div className="reports-pane">
              <div className="pane-header">
                <div>
                  <h2>{t('reports.feedbackPane.title')}</h2>
                  <p>{t('reports.feedbackPane.subtitle')}</p>
                </div>
                <button className="rpt-btn rpt-btn-primary" onClick={() => setShowFeedbackModal(true)}>
                  <FaComments aria-hidden="true" /> {t('reports.feedbackPane.submitNew')}
                </button>
              </div>

              {loading ? (
                <div className="pm-skeleton-list" style={{ padding: '24px', textAlign: 'center' }}>
                  <FaSpinner className="spin" style={{ fontSize: '1.8rem', color: 'var(--accent)' }} />
                </div>
              ) : filteredFeedback.length === 0 ? (
                <div className="reports-empty-state">
                  <FaComments className="empty-icon" />
                  <h3>{t('reports.feedbackPane.emptyTitle')}</h3>
                  <p>{t('reports.feedbackPane.emptyBody')}</p>
                </div>
              ) : (
                <div className="rpt-feedback-list">
                  {filteredFeedback.map((item) => (
                    <article key={item.id} className="rpt-feedback-card">
                      <div className="f-card-header">
                        <div className="f-author-block">
                          <div className="member-avatar">
                            {(item.author || 'M')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <h4>{item.author}</h4>
                            <span className="f-role-badge">{item.role || t('enums.role.MEMBER')}</span>
                          </div>
                        </div>

                        <div className="f-meta-right">
                          <span className="f-type-tag">{item.type}</span>
                          <div className="f-stars-row" title={t('reports.feedbackPane.ratedOf5', { rating: item.rating })}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= item.rating ? 'star-filled' : 'star-empty'}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="f-message">"{item.message}"</p>

                      <div className="f-card-footer">
                        <span className="f-date">{t('reports.feedbackPane.submittedOn', { date: item.date })}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ISSUE TRACKER */}
          {activeTab === 'complaints' && (
            <div className="reports-pane">
              <div className="pane-header">
                <div>
                  <h2>{t('reports.complaintsPane.title')}</h2>
                  <p>{t('reports.complaintsPane.subtitle')}</p>
                </div>
                <button className="rpt-btn rpt-btn-primary" onClick={() => setShowComplaintsModal(true)}>
                  <FaExclamationCircle aria-hidden="true" /> {t('reports.complaintsPane.fileIssue')}
                </button>
              </div>

              {loading ? (
                <div className="pm-skeleton-list" style={{ padding: '24px', textAlign: 'center' }}>
                  <FaSpinner className="spin" style={{ fontSize: '1.8rem', color: 'var(--accent)' }} />
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="reports-empty-state">
                  <FaShieldAlt className="empty-icon" />
                  <h3>{t('reports.complaintsPane.emptyTitle')}</h3>
                  <p>{t('reports.complaintsPane.emptyBody')}</p>
                </div>
              ) : (
                <div className="rpt-issues-list">
                  {filteredComplaints.map((issue) => (
                    <article key={issue.id} className="rpt-issue-card">
                      <div className="issue-left-icon">
                        <FaExclamationCircle aria-hidden="true" />
                      </div>

                      <div className="issue-body">
                        <div className="issue-title-row">
                          <h4>{issue.title}</h4>
                          <span
                            className={`rpt-pill ${
                              issue.status === 'Resolved'
                                ? 'is-excellent'
                                : issue.status === 'In Progress'
                                ? 'is-good'
                                : 'is-warning'
                            }`}
                          >
                            {issue.status}
                          </span>
                        </div>

                        <p className="issue-desc">{issue.description}</p>

                        <div className="issue-meta-tags">
                          <span className="meta-badge category">{issue.category}</span>
                          <span
                            className={`meta-badge priority ${
                              issue.priority === 'High' || issue.priority === 'Critical'
                                ? 'is-high-priority'
                                : ''
                            }`}
                          >
                            {t('reports.complaintsPane.priority', { value: issue.priority })}
                          </span>
                          <span className="meta-badge from">{t('reports.complaintsPane.reportedBy', { name: issue.from })}</span>
                          <span className="meta-badge date">{issue.date}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="rpt-modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="rpt-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="rpt-modal-header">
              <h2>{t('reports.feedbackModal.title')}</h2>
              <button className="rpt-modal-close" onClick={() => setShowFeedbackModal(false)}>
                <FaTimes />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="rpt-modal-success">
                <div className="success-icon">✓</div>
                <h3>{t('reports.feedbackModal.successTitle')}</h3>
                <p>{t('reports.feedbackModal.successBody')}</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="rpt-form">
                <div className="rpt-form-group">
                  <label>{t('reports.feedbackModal.nameLabel')}</label>
                  <input
                    type="text"
                    placeholder={t('reports.feedbackModal.namePlaceholder')}
                    value={feedback.author}
                    onChange={(e) => setFeedback({ ...feedback, author: e.target.value })}
                  />
                </div>

                <div className="rpt-form-group">
                  <label>{t('reports.feedbackModal.categoryLabel')}</label>
                  <select
                    value={feedback.type}
                    onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                  >
                    <option value="Suggestion">{t('reports.feedbackModal.categories.suggestion')}</option>
                    <option value="Feature Request">{t('reports.feedbackModal.categories.featureRequest')}</option>
                    <option value="General">{t('reports.feedbackModal.categories.general')}</option>
                    <option value="Bug Report">{t('reports.feedbackModal.categories.bugReport')}</option>
                  </select>
                </div>

                <div className="rpt-form-group">
                  <label>{t('reports.feedbackModal.ratingLabel')}</label>
                  <div className="interactive-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={`star-btn ${feedback.rating >= star ? 'is-active' : ''}`}
                        onClick={() => setFeedback({ ...feedback, rating: star })}
                      >
                        ★
                      </button>
                    ))}
                    <span className="rating-num-label">{t('reports.feedbackModal.starsOf5', { n: feedback.rating })}</span>
                  </div>
                </div>

                <div className="rpt-form-group">
                  <label>{t('reports.feedbackModal.messageLabel')}</label>
                  <textarea
                    rows={4}
                    placeholder={t('reports.feedbackModal.messagePlaceholder')}
                    value={feedback.message}
                    onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                    required
                  />
                </div>

                <div className="rpt-modal-actions">
                  <button
                    type="button"
                    className="rpt-btn rpt-btn-secondary"
                    onClick={() => setShowFeedbackModal(false)}
                    disabled={submitting}
                  >
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="rpt-btn rpt-btn-primary" disabled={submitting}>
                    {submitting ? <FaSpinner className="spin" /> : <FaPaperPlane aria-hidden="true" />} {t('reports.feedbackModal.submit')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* COMPLAINT / ISSUE MODAL */}
      {showComplaintsModal && (
        <div className="rpt-modal-overlay" onClick={() => setShowComplaintsModal(false)}>
          <div className="rpt-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="rpt-modal-header">
              <h2>{t('reports.complaintModal.title')}</h2>
              <button className="rpt-modal-close" onClick={() => setShowComplaintsModal(false)}>
                <FaTimes />
              </button>
            </div>

            {complaintSubmitted ? (
              <div className="rpt-modal-success">
                <div className="success-icon">✓</div>
                <h3>{t('reports.complaintModal.successTitle')}</h3>
                <p>{t('reports.complaintModal.successBody')}</p>
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="rpt-form">
                <div className="rpt-form-row">
                  <div className="rpt-form-group">
                    <label>{t('reports.complaintModal.reporterLabel')}</label>
                    <input
                      type="text"
                      placeholder={t('reports.complaintModal.reporterPlaceholder')}
                      value={complaint.from}
                      onChange={(e) => setComplaint({ ...complaint, from: e.target.value })}
                    />
                  </div>
                  <div className="rpt-form-group">
                    <label>{t('reports.complaintModal.categoryLabel')}</label>
                    <select
                      value={complaint.category}
                      onChange={(e) => setComplaint({ ...complaint, category: e.target.value })}
                    >
                      <option value="Technical Issue">{t('reports.complaintModal.categories.technical')}</option>
                      <option value="Data Entry">{t('reports.complaintModal.categories.dataEntry')}</option>
                      <option value="Access Permissions">{t('reports.complaintModal.categories.access')}</option>
                      <option value="System Performance">{t('reports.complaintModal.categories.performance')}</option>
                      <option value="Other">{t('reports.complaintModal.categories.other')}</option>
                    </select>
                  </div>
                </div>

                <div className="rpt-form-row">
                  <div className="rpt-form-group">
                    <label>{t('reports.complaintModal.titleLabel')}</label>
                    <input
                      type="text"
                      placeholder={t('reports.complaintModal.titlePlaceholder')}
                      value={complaint.title}
                      onChange={(e) => setComplaint({ ...complaint, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="rpt-form-group">
                    <label>{t('reports.complaintModal.priorityLabel')}</label>
                    <select
                      value={complaint.priority}
                      onChange={(e) => setComplaint({ ...complaint, priority: e.target.value })}
                    >
                      <option value="Low">{t('reports.complaintModal.priorities.low')}</option>
                      <option value="Medium">{t('reports.complaintModal.priorities.medium')}</option>
                      <option value="High">{t('reports.complaintModal.priorities.high')}</option>
                      <option value="Critical">{t('reports.complaintModal.priorities.critical')}</option>
                    </select>
                  </div>
                </div>

                <div className="rpt-form-group">
                  <label>{t('reports.complaintModal.descriptionLabel')}</label>
                  <textarea
                    rows={4}
                    placeholder={t('reports.complaintModal.descriptionPlaceholder')}
                    value={complaint.description}
                    onChange={(e) => setComplaint({ ...complaint, description: e.target.value })}
                    required
                  />
                </div>

                <div className="rpt-modal-actions">
                  <button
                    type="button"
                    className="rpt-btn rpt-btn-secondary"
                    onClick={() => setShowComplaintsModal(false)}
                    disabled={submitting}
                  >
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="rpt-btn rpt-btn-primary" disabled={submitting}>
                    {submitting ? <FaSpinner className="spin" /> : <FaPaperPlane aria-hidden="true" />} {t('reports.complaintModal.submit')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsComponents;
