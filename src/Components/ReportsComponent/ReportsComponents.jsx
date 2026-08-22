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
import { apiFetch } from '../../utils/api';
import { getUser } from '../../utils/auth';
import '../../SCSS/componentStyle/Reports.scss';

const ReportsComponents = () => {
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
      setError(e.message || 'Could not load reports data.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

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
          author: feedback.author.trim() || currentUser?.name || 'Anonymous Member',
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
      alert(err.message || 'Could not submit feedback.');
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
          from: complaint.from.trim() || currentUser?.name || 'Anonymous Member',
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
      alert(err.message || 'Could not submit complaint.');
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
            <span className="hero-eyebrow">Analytics & Governance</span>
            <h1>Reports & Feedback</h1>
            <p className="hero-sub">
              Track organizational performance, project delivery metrics, and member feedback in real time.
            </p>
          </div>

          <div className="hero-actions">
            <button className="rpt-btn rpt-btn-secondary" onClick={() => setShowComplaintsModal(true)}>
              <FaExclamationCircle aria-hidden="true" /> Report Issue
            </button>
            <button className="rpt-btn rpt-btn-primary" onClick={downloadReportCSV}>
              <FaDownload aria-hidden="true" /> Export CSV
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
              <span className="kpi-label">Average Performance</span>
              <div className="kpi-val-row">
                <span className="kpi-value">{loading ? '...' : `${kpi.avgPerformance}%`}</span>
                <span className="kpi-trend is-positive">
                  <FaArrowUp aria-hidden="true" /> Live Score
                </span>
              </div>
              <span className="kpi-caption">Calculated from task deadline adherence</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap is-blue">
              <FaUsers aria-hidden="true" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Active Members</span>
              <div className="kpi-val-row">
                <span className="kpi-value">{loading ? '...' : kpi.activeMembers}</span>
                <span className="kpi-tag">Active Roster</span>
              </div>
              <span className="kpi-caption">Active chairpersons and committee members</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap is-emerald">
              <FaCheckCircle aria-hidden="true" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Project Health</span>
              <div className="kpi-val-row">
                <span className="kpi-value">{loading ? '...' : `${kpi.projectHealth}%`}</span>
                <span className="kpi-trend is-positive">
                  <FaArrowUp aria-hidden="true" /> On Track
                </span>
              </div>
              <span className="kpi-caption">{kpi.totalProjects || 0} project(s) in scope</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap is-amber">
              <FaTasks aria-hidden="true" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Task Velocity</span>
              <div className="kpi-val-row">
                <span className="kpi-value">{loading ? '...' : `${kpi.taskVelocity}%`}</span>
                <span className="kpi-tag">Completion</span>
              </div>
              <span className="kpi-caption">{kpi.completedTasks || 0} of {kpi.totalTasks || 0} tasks finished</span>
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
              <FaChartBar aria-hidden="true" /> Performance Scorecard
              <span className="tab-badge">{filteredPerformance.length}</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'projects' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <FaFileAlt aria-hidden="true" /> Project Summaries
              <span className="tab-badge">{filteredProjects.length}</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'feedback' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('feedback')}
            >
              <FaComments aria-hidden="true" /> Feedback Hub
              <span className="tab-badge">{filteredFeedback.length}</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'complaints' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('complaints')}
            >
              <FaShieldAlt aria-hidden="true" /> Issue Tracker
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
              placeholder={`Search in ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')} title="Clear search">
                <FaTimes />
              </button>
            )}
          </div>

          <div className="toolbar-filters">
            <div className="filter-item">
              <label>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                {activeTab === 'performance' && (
                  <>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="needs attention">Needs Attention</option>
                  </>
                )}
                {activeTab === 'projects' && (
                  <>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
                  </>
                )}
                {activeTab === 'complaints' && (
                  <>
                    <option value="resolved">Resolved</option>
                    <option value="inprogress">In Progress</option>
                    <option value="open">Open</option>
                  </>
                )}
              </select>
            </div>

            <div className="filter-item">
              <label>Period:</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="all">All Time (Joined to Date)</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">Current Year</option>
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
                <FaSyncAlt aria-hidden="true" /> Reset
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
                  <h2>Member Performance Scorecard</h2>
                  <p>Individual task execution, deadline adherence, and delivery metrics</p>
                </div>
                <button className="rpt-btn rpt-btn-sm" onClick={downloadReportCSV}>
                  <FaDownload aria-hidden="true" /> Export Scorecard
                </button>
              </div>

              {loading ? (
                <div className="pm-skeleton-list" style={{ padding: '24px', textAlign: 'center' }}>
                  <FaSpinner className="spin" style={{ fontSize: '1.8rem', color: 'var(--accent)' }} />
                  <p style={{ marginTop: '10px', color: 'var(--label-muted)', fontSize: '0.86rem' }}>
                    Fetching live member scores from database...
                  </p>
                </div>
              ) : filteredPerformance.length === 0 ? (
                <div className="reports-empty-state">
                  <FaFileAlt className="empty-icon" />
                  <h3>No performance records found</h3>
                  <p>Try adjusting your search criteria or clear active filters.</p>
                </div>
              ) : (
                <div className="rpt-table-wrap">
                  <table className="rpt-table">
                    <thead>
                      <tr>
                        <th>Member Details</th>
                        <th>Assigned Project(s)</th>
                        <th>Tasks Completed</th>
                        <th>Performance Score</th>
                        <th>Rating</th>
                        <th>Deadline Adherence</th>
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
                              <strong>{item.tasksDone}</strong> / {item.totalTasks} Done
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
                              {item.completedOnTime || 0} on-time
                            </span>
                            {item.overdueTasks > 0 && (
                              <span style={{ color: '#dc2626', marginLeft: '6px', fontWeight: 600 }}>
                                • {item.overdueTasks} overdue
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
                  <h2>Project Delivery & Health</h2>
                  <p>Milestone tracking, committee allocations, and task progression</p>
                </div>
                <button className="rpt-btn rpt-btn-sm" onClick={downloadReportCSV}>
                  <FaDownload aria-hidden="true" /> Export Summary
                </button>
              </div>

              {loading ? (
                <div className="pm-skeleton-list" style={{ padding: '24px', textAlign: 'center' }}>
                  <FaSpinner className="spin" style={{ fontSize: '1.8rem', color: 'var(--accent)' }} />
                  <p style={{ marginTop: '10px', color: 'var(--label-muted)', fontSize: '0.86rem' }}>
                    Fetching live project summaries from database...
                  </p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="reports-empty-state">
                  <FaFileAlt className="empty-icon" />
                  <h3>No project records match your filter</h3>
                  <p>Try resetting the search terms or status filters.</p>
                </div>
              ) : (
                <div className="rpt-project-grid">
                  {filteredProjects.map((p) => (
                    <article key={p.id} className="rpt-project-card">
                      <div className="p-card-top">
                        <div>
                          <span className="p-lead-name">Led by {p.lead}</span>
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
                          <span>Overall Progress</span>
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
                            <span>Members</span>
                          </div>
                        </div>
                        <div className="p-metric-item">
                          <FaSitemap aria-hidden="true" />
                          <div>
                            <strong>{p.committees}</strong>
                            <span>Committees</span>
                          </div>
                        </div>
                        <div className="p-metric-item">
                          <FaCheckCircle aria-hidden="true" />
                          <div>
                            <strong>
                              {p.tasksDone}/{p.totalTasks}
                            </strong>
                            <span>Tasks</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-card-foot">
                        <span className="budget-tag">Health: {p.budgetHealth}</span>
                        <span className="p-completion-rate">
                          {p.totalTasks > 0 ? Math.round((p.tasksDone / p.totalTasks) * 100) : 0}% Tasks Done
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
                  <h2>Member Feedback & Sentiment</h2>
                  <p>Direct impressions, feature ideas, and suggestions from active users</p>
                </div>
                <button className="rpt-btn rpt-btn-primary" onClick={() => setShowFeedbackModal(true)}>
                  <FaComments aria-hidden="true" /> Submit New Feedback
                </button>
              </div>

              {loading ? (
                <div className="pm-skeleton-list" style={{ padding: '24px', textAlign: 'center' }}>
                  <FaSpinner className="spin" style={{ fontSize: '1.8rem', color: 'var(--accent)' }} />
                </div>
              ) : filteredFeedback.length === 0 ? (
                <div className="reports-empty-state">
                  <FaComments className="empty-icon" />
                  <h3>No feedback found</h3>
                  <p>Submit feedback or adjust your search filter.</p>
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
                            <span className="f-role-badge">{item.role || 'Member'}</span>
                          </div>
                        </div>

                        <div className="f-meta-right">
                          <span className="f-type-tag">{item.type}</span>
                          <div className="f-stars-row" title={`Rated ${item.rating} of 5`}>
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
                        <span className="f-date">Submitted on {item.date}</span>
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
                  <h2>Reported Issues & Inquiries</h2>
                  <p>Track technical tickets, operational concerns, and resolution progress</p>
                </div>
                <button className="rpt-btn rpt-btn-primary" onClick={() => setShowComplaintsModal(true)}>
                  <FaExclamationCircle aria-hidden="true" /> File An Issue
                </button>
              </div>

              {loading ? (
                <div className="pm-skeleton-list" style={{ padding: '24px', textAlign: 'center' }}>
                  <FaSpinner className="spin" style={{ fontSize: '1.8rem', color: 'var(--accent)' }} />
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="reports-empty-state">
                  <FaShieldAlt className="empty-icon" />
                  <h3>No reported issues match your criteria</h3>
                  <p>All operational tickets are currently in order.</p>
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
                            Priority: {issue.priority}
                          </span>
                          <span className="meta-badge from">Reported by: {issue.from}</span>
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
              <h2>Send User Feedback</h2>
              <button className="rpt-modal-close" onClick={() => setShowFeedbackModal(false)}>
                <FaTimes />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="rpt-modal-success">
                <div className="success-icon">✓</div>
                <h3>Thank You!</h3>
                <p>Your feedback has been saved and shared with administration.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="rpt-form">
                <div className="rpt-form-group">
                  <label>Your Name / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson (optional)"
                    value={feedback.author}
                    onChange={(e) => setFeedback({ ...feedback, author: e.target.value })}
                  />
                </div>

                <div className="rpt-form-group">
                  <label>Feedback Category</label>
                  <select
                    value={feedback.type}
                    onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                  >
                    <option value="Suggestion">Suggestion / Improvement</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="General">General Experience</option>
                    <option value="Bug Report">UI / Usability Bug</option>
                  </select>
                </div>

                <div className="rpt-form-group">
                  <label>Overall Experience Rating</label>
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
                    <span className="rating-num-label">{feedback.rating} of 5 Stars</span>
                  </div>
                </div>

                <div className="rpt-form-group">
                  <label>Feedback Message *</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your feedback or thoughts in detail..."
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
                    Cancel
                  </button>
                  <button type="submit" className="rpt-btn rpt-btn-primary" disabled={submitting}>
                    {submitting ? <FaSpinner className="spin" /> : <FaPaperPlane aria-hidden="true" />} Submit Feedback
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
              <h2>Report An Issue or Ticket</h2>
              <button className="rpt-modal-close" onClick={() => setShowComplaintsModal(false)}>
                <FaTimes />
              </button>
            </div>

            {complaintSubmitted ? (
              <div className="rpt-modal-success">
                <div className="success-icon">✓</div>
                <h3>Ticket Created</h3>
                <p>Your issue ticket has been registered and assigned for review.</p>
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="rpt-form">
                <div className="rpt-form-row">
                  <div className="rpt-form-group">
                    <label>Reporter Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={complaint.from}
                      onChange={(e) => setComplaint({ ...complaint, from: e.target.value })}
                    />
                  </div>
                  <div className="rpt-form-group">
                    <label>Category</label>
                    <select
                      value={complaint.category}
                      onChange={(e) => setComplaint({ ...complaint, category: e.target.value })}
                    >
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Data Entry">Data Entry Correction</option>
                      <option value="Access Permissions">Access & Permissions</option>
                      <option value="System Performance">System Performance</option>
                      <option value="Other">Other Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="rpt-form-row">
                  <div className="rpt-form-group">
                    <label>Issue Title *</label>
                    <input
                      type="text"
                      placeholder="Short summary of the issue"
                      value={complaint.title}
                      onChange={(e) => setComplaint({ ...complaint, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="rpt-form-group">
                    <label>Priority Level</label>
                    <select
                      value={complaint.priority}
                      onChange={(e) => setComplaint({ ...complaint, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="rpt-form-group">
                  <label>Detailed Description *</label>
                  <textarea
                    rows={4}
                    placeholder="Provide details or steps to reproduce the issue..."
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
                    Cancel
                  </button>
                  <button type="submit" className="rpt-btn rpt-btn-primary" disabled={submitting}>
                    {submitting ? <FaSpinner className="spin" /> : <FaPaperPlane aria-hidden="true" />} Submit Issue Ticket
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
