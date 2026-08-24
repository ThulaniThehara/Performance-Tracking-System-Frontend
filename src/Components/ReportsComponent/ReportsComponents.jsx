import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FaFileAlt,
  FaDownload,
  FaChartBar,
  FaSearch,
  FaTimes,
  FaUsers,
  FaCheckCircle,
  FaTasks,
  FaSyncAlt,
  FaArrowUp,
  FaSitemap,
  FaSpinner,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../utils/api';
import '../../SCSS/componentStyle/Reports.scss';

const ReportsComponents = () => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('performance');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        p.score !== null && p.score !== undefined ? `${p.score}%` : 'N/A',
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
                    <option value="unassigned">Unassigned</option>
                  </>
                )}
                {activeTab === 'projects' && (
                  <>
                    <option value="active">{t('reports.filters.active')}</option>
                    <option value="completed">{t('reports.filters.completed')}</option>
                    <option value="upcoming">{t('reports.filters.upcoming')}</option>
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
                              {item.totalTasks > 0 ? (
                                t('reports.performancePane.tasksDoneRatio', { done: item.tasksDone, total: item.totalTasks })
                              ) : (
                                <span className="rpt-no-tasks-subtle">0 / 0 Done</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {item.totalTasks > 0 || (item.score !== null && item.score !== undefined) ? (
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
                            ) : (
                              <div className="rpt-no-score">
                                <span className="rpt-no-tasks-badge">No assigned tasks</span>
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              className={`rpt-pill ${
                                item.status === 'Excellent'
                                  ? 'is-excellent'
                                  : item.status === 'Good'
                                  ? 'is-good'
                                  : item.status === 'Needs Attention'
                                  ? 'is-warning'
                                  : 'is-unassigned'
                              }`}
                            >
                              {item.status || 'Unassigned'}
                            </span>
                          </td>
                          <td className="rpt-date-cell">
                            {item.totalTasks > 0 ? (
                              <>
                                <span style={{ color: '#059669', fontWeight: 600 }}>
                                  {t('reports.performancePane.onTimeCount', { count: item.completedOnTime || 0 })}
                                </span>
                                {item.overdueTasks > 0 && (
                                  <span style={{ color: '#dc2626', marginLeft: '6px', fontWeight: 600 }}>
                                    • {t('reports.performancePane.overdueCount', { count: item.overdueTasks })}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="rpt-muted-dash">—</span>
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
        </main>
      </div>
    </div>
  );
};

export default ReportsComponents;
