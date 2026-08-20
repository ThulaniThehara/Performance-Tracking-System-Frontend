import React, { useState } from 'react';
import { FaFileAlt, FaComments, FaExclamationCircle, FaDownload, FaChartBar, FaFilter, FaPaperPlane, FaTimes } from 'react-icons/fa';
import '../../SCSS/componentStyle/Reports.scss';

const ReportsComponents = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showComplaintsModal, setShowComplaintsModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  const [feedback, setFeedback] = useState({
    type: 'general',
    title: '',
    message: '',
    rating: 5,
  });

  const [complaint, setComplaint] = useState({
    category: 'other',
    title: '',
    description: '',
    priority: 'medium',
    evidence: '',
  });

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  // Mock data
  const performanceReports = [
    { id: 1, member: 'John Doe', project: 'Wanakkam', score: 92, status: 'Excellent', date: '2025-12-10' },
    { id: 2, member: 'Jane Smith', project: 'Sabandi', score: 85, status: 'Good', date: '2025-12-09' },
    { id: 3, member: 'Alex Johnson', project: 'Binara Padura', score: 78, status: 'Good', date: '2025-12-08' },
    { id: 4, member: 'Sarah Connor', project: 'Cricket Fiesta', score: 95, status: 'Excellent', date: '2025-12-07' },
  ];

  const projectReports = [
    { id: 1, name: 'Wanakkam', progress: 75, members: 8, tasks: 12, status: 'In Progress' },
    { id: 2, name: 'Sabandi', progress: 100, members: 6, tasks: 10, status: 'Completed' },
    { id: 3, name: 'Binara Padura', progress: 60, members: 7, tasks: 15, status: 'In Progress' },
  ];

  const recentFeedback = [
    { id: 1, author: 'John Doe', type: 'Suggestion', message: 'Great platform for tracking performance!', rating: 5, date: '2025-12-10' },
    { id: 2, author: 'Jane Smith', type: 'Bug Report', message: 'Task filter not working properly', rating: 3, date: '2025-12-09' },
    { id: 3, author: 'Alex Johnson', type: 'General', message: 'Love the new design!', rating: 5, date: '2025-12-08' },
  ];

  const recentComplaints = [
    { id: 1, from: 'John Doe', category: 'Technical', status: 'Resolved', date: '2025-12-10' },
    { id: 2, from: 'Jane Smith', category: 'Data Entry', status: 'In Progress', date: '2025-12-09' },
  ];

  const handleFeedbackSubmit = () => {
    console.log('Feedback submitted:', feedback);
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setShowFeedbackModal(false);
      setFeedback({ type: 'general', title: '', message: '', rating: 5 });
    }, 2000);
  };

  const handleComplaintSubmit = () => {
    console.log('Complaint submitted:', complaint);
    setComplaintSubmitted(true);
    setTimeout(() => {
      setComplaintSubmitted(false);
      setShowComplaintsModal(false);
      setComplaint({ category: 'other', title: '', description: '', priority: 'medium', evidence: '' });
    }, 2000);
  };

  const downloadReport = (type) => {
    console.log('Downloading report:', type);
  };

  return (
    <div className="reports-page">
      <div className="reports-container">
        {/* Header */}
        <div className="reports-header">
          <div className="header-content">
            <FaFileAlt className="header-icon" />
            <div>
              <h1>Reports & Feedback</h1>
              <p>View analytics, send feedback, and report issues</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn feedback-btn" onClick={() => setShowFeedbackModal(true)}>
              <FaComments /> Send Feedback
            </button>
            <button className="action-btn complaint-btn" onClick={() => setShowComplaintsModal(true)}>
              <FaExclamationCircle /> Report Issue
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="reports-tabs">
          <button
            className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <FaChartBar /> Performance
          </button>
          <button
            className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <FaFileAlt /> Projects
          </button>
          <button
            className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <FaComments /> Feedback
          </button>
          <button
            className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            <FaExclamationCircle /> Complaints
          </button>
        </div>

        {/* Filters */}
        <div className="reports-filters">
          <div className="filter-group">
            <label>Date Range:</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="filter-select">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Filter:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="inprogress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="reports-content">
          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="tab-pane performance-reports">
              <div className="report-section">
                <div className="section-header">
                  <h2>Performance Metrics</h2>
                  <button className="download-btn" onClick={() => downloadReport('performance')}>
                    <FaDownload /> Download Report
                  </button>
                </div>

                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-label">Average Performance</div>
                    <div className="metric-value">87.5%</div>
                    <div className="metric-trend positive">↑ 5% from last month</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Total Members</div>
                    <div className="metric-value">24</div>
                    <div className="metric-trend">Active in system</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Projects Completed</div>
                    <div className="metric-value">8</div>
                    <div className="metric-trend positive">↑ 2 this month</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Task Completion Rate</div>
                    <div className="metric-value">92%</div>
                    <div className="metric-trend positive">Excellent</div>
                  </div>
                </div>

                <div className="table-section">
                  <h3>Member Performance Details</h3>
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Member Name</th>
                        <th>Project</th>
                        <th>Performance Score</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceReports.map((report) => (
                        <tr key={report.id}>
                          <td className="member-name">{report.member}</td>
                          <td>{report.project}</td>
                          <td>
                            <div className="score-bar">
                              <div className="score-fill" style={{ width: `${report.score}%` }}></div>
                              <span className="score-text">{report.score}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge status-${report.status.toLowerCase()}`}>
                              {report.status}
                            </span>
                          </td>
                          <td>{report.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="tab-pane projects-reports">
              <div className="report-section">
                <div className="section-header">
                  <h2>Project Reports</h2>
                  <button className="download-btn" onClick={() => downloadReport('projects')}>
                    <FaDownload /> Download Report
                  </button>
                </div>

                <div className="projects-grid">
                  {projectReports.map((project) => (
                    <div key={project.id} className="project-card">
                      <div className="project-header">
                        <h3>{project.name}</h3>
                        <span className={`project-status ${project.status.toLowerCase().replace(' ', '-')}`}>
                          {project.status}
                        </span>
                      </div>

                      <div className="project-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="progress-text">{project.progress}% Complete</span>
                      </div>

                      <div className="project-stats">
                        <div className="stat">
                          <span className="stat-label">Members</span>
                          <span className="stat-value">{project.members}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Tasks</span>
                          <span className="stat-value">{project.tasks}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="tab-pane feedback-reports">
              <div className="report-section">
                <div className="section-header">
                  <h2>User Feedback</h2>
                  <button className="action-btn" onClick={() => setShowFeedbackModal(true)}>
                    <FaComments /> Submit Feedback
                  </button>
                </div>

                <div className="feedback-list">
                  {recentFeedback.map((item) => (
                    <div key={item.id} className="feedback-item">
                      <div className="feedback-header">
                        <div>
                          <h4>{item.author}</h4>
                          <span className="feedback-type">{item.type}</span>
                        </div>
                        <div className="feedback-rating">
                          {'⭐'.repeat(item.rating)}
                        </div>
                      </div>
                      <p className="feedback-message">{item.message}</p>
                      <span className="feedback-date">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Complaints Tab */}
          {activeTab === 'complaints' && (
            <div className="tab-pane complaints-reports">
              <div className="report-section">
                <div className="section-header">
                  <h2>Reported Issues</h2>
                  <button className="action-btn" onClick={() => setShowComplaintsModal(true)}>
                    <FaExclamationCircle /> Report Issue
                  </button>
                </div>

                <div className="complaints-list">
                  {recentComplaints.map((item) => (
                    <div key={item.id} className="complaint-item">
                      <div className="complaint-left">
                        <FaExclamationCircle className="complaint-icon" />
                        <div>
                          <h4>{item.from}</h4>
                          <p>{item.category}</p>
                        </div>
                      </div>
                      <div className="complaint-right">
                        <span className={`complaint-status ${item.status.toLowerCase().replace(' ', '-')}`}>
                          {item.status}
                        </span>
                        <span className="complaint-date">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay">
          <div className="modal-content feedback-modal">
            <div className="modal-header">
              <h2>Send Feedback</h2>
              <button className="close-btn" onClick={() => setShowFeedbackModal(false)}>
                <FaTimes />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="success-message modal-success">
                <div className="success-icon">✓</div>
                <h3>Thank You!</h3>
                <p>Your feedback has been submitted successfully.</p>
              </div>
            ) : (
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="feedback-type">Feedback Type</label>
                  <select
                    id="feedback-type"
                    value={feedback.type}
                    onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                    className="form-control"
                  >
                    <option value="general">General Feedback</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="suggestion">Suggestion</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="feedback-title">Title</label>
                  <input
                    id="feedback-title"
                    type="text"
                    placeholder="Brief title of your feedback"
                    value={feedback.title}
                    onChange={(e) => setFeedback({ ...feedback, title: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="feedback-message">Message</label>
                  <textarea
                    id="feedback-message"
                    placeholder="Describe your feedback in detail..."
                    rows="5"
                    value={feedback.message}
                    onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                    className="form-control"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Rating (1-5)</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`star ${feedback.rating >= star ? 'active' : ''}`}
                        onClick={() => setFeedback({ ...feedback, rating: star })}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowFeedbackModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleFeedbackSubmit}>
                    <FaPaperPlane /> Submit Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complaints Modal */}
      {showComplaintsModal && (
        <div className="modal-overlay">
          <div className="modal-content complaint-modal">
            <div className="modal-header">
              <h2>Report an Issue</h2>
              <button className="close-btn" onClick={() => setShowComplaintsModal(false)}>
                <FaTimes />
              </button>
            </div>

            {complaintSubmitted ? (
              <div className="success-message modal-success">
                <div className="success-icon">✓</div>
                <h3>Report Submitted</h3>
                <p>We've received your report and will investigate it shortly.</p>
              </div>
            ) : (
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="complaint-category">Category</label>
                  <select
                    id="complaint-category"
                    value={complaint.category}
                    onChange={(e) => setComplaint({ ...complaint, category: e.target.value })}
                    className="form-control"
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="data-entry">Data Entry Error</option>
                    <option value="member-conduct">Member Conduct</option>
                    <option value="data-privacy">Data Privacy</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="complaint-title">Title</label>
                  <input
                    id="complaint-title"
                    type="text"
                    placeholder="Brief title of the issue"
                    value={complaint.title}
                    onChange={(e) => setComplaint({ ...complaint, title: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="complaint-description">Description</label>
                  <textarea
                    id="complaint-description"
                    placeholder="Provide detailed description of the issue..."
                    rows="5"
                    value={complaint.description}
                    onChange={(e) => setComplaint({ ...complaint, description: e.target.value })}
                    className="form-control"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="complaint-priority">Priority</label>
                  <select
                    id="complaint-priority"
                    value={complaint.priority}
                    onChange={(e) => setComplaint({ ...complaint, priority: e.target.value })}
                    className="form-control"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="complaint-evidence">Evidence/Screenshots (optional)</label>
                  <textarea
                    id="complaint-evidence"
                    placeholder="Describe any evidence or steps to reproduce..."
                    rows="3"
                    value={complaint.evidence}
                    onChange={(e) => setComplaint({ ...complaint, evidence: e.target.value })}
                    className="form-control"
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowComplaintsModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleComplaintSubmit}>
                    <FaPaperPlane /> Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsComponents;
