import React, { useState, useEffect } from 'react';
import {
  FaCommentDots,
  FaExclamationTriangle,
  FaStar,
  FaPaperPlane,
  FaHistory,
  FaCheckCircle,
  FaExclamationCircle,
  FaProjectDiagram,
  FaUser,
  FaFolder,
  FaSpinner,
  FaInfoCircle,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../utils/api';
import '../../SCSS/MemberStyles/MemberFeedback.scss';

const MemberFeedback = ({ allWorkedProjects = [] }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('feedback'); // 'feedback' | 'complaints' | 'history'

  // Scope selection
  const [targetScope, setTargetScope] = useState('project'); // 'project' | 'general'
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [targetMember, setTargetMember] = useState('');

  // Fallback project list if not provided via props
  const [projectList, setProjectList] = useState(allWorkedProjects);

  // Submissions history
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Feedback Form State
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'General Feedback',
    message: '',
    rating: 5,
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // Complaint Form State
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    category: 'Project Task Issue',
    priority: 'Medium',
    description: '',
  });
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState('');
  const [complaintError, setComplaintError] = useState('');

  // Load project list if empty
  useEffect(() => {
    if (allWorkedProjects && allWorkedProjects.length > 0) {
      setProjectList(allWorkedProjects);
      if (!selectedProjectId && allWorkedProjects[0]) {
        setSelectedProjectId(allWorkedProjects[0]._id || allWorkedProjects[0].id || '');
        setSelectedProjectName(allWorkedProjects[0].PName || allWorkedProjects[0].name || '');
      }
    } else {
      const fetchProjects = async () => {
        try {
          const res = await apiFetch('/pm/my-projects');
          if (res?.data) {
            const all = [...(res.data.led || []), ...(res.data.contributing || [])];
            setProjectList(all);
            if (all.length > 0) {
              setSelectedProjectId(all[0]._id || all[0].id || '');
              setSelectedProjectName(all[0].PName || all[0].name || '');
            }
          }
        } catch (e) {
          console.warn('Could not load member projects:', e);
        }
      };
      fetchProjects();
    }
  }, [allWorkedProjects]);

  const loadSubmissions = async () => {
    try {
      setIsLoadingHistory(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/feedback/my-submissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMyFeedbacks(data.feedbacks || []);
        setMyComplaints(data.complaints || []);
      }
    } catch (e) {
      console.warn('Could not fetch submissions:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleProjectSelect = (projId) => {
    setSelectedProjectId(projId);
    const found = projectList.find(p => (p._id || p.id) === projId);
    setSelectedProjectName(found?.PName || found?.name || '');
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSuccess('');

    if (!feedbackForm.message.trim()) {
      setFeedbackError('Please enter your feedback message.');
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      const token = localStorage.getItem('token');
      const payload = {
        ...feedbackForm,
        projectId: targetScope === 'project' ? selectedProjectId : null,
        projectName: targetScope === 'project' ? selectedProjectName : null,
        targetMember: targetScope === 'project' && targetMember.trim() ? targetMember.trim() : null,
      };

      const res = await fetch('http://localhost:5000/api/feedback/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit feedback');

      setFeedbackSuccess(data.message || 'Feedback sent to administration successfully!');
      setFeedbackForm({ type: 'General Feedback', message: '', rating: 5 });
      setTargetMember('');
      loadSubmissions();
      setTimeout(() => setFeedbackSuccess(''), 5000);
    } catch (err) {
      setFeedbackError(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Submit Complaint
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setComplaintError('');
    setComplaintSuccess('');

    if (!complaintForm.title.trim() || !complaintForm.description.trim()) {
      setComplaintError('Title and description are required.');
      return;
    }

    try {
      setIsSubmittingComplaint(true);
      const token = localStorage.getItem('token');
      const payload = {
        ...complaintForm,
        projectId: targetScope === 'project' ? selectedProjectId : null,
        projectName: targetScope === 'project' ? selectedProjectName : null,
        targetMember: targetScope === 'project' && targetMember.trim() ? targetMember.trim() : null,
      };

      const res = await fetch('http://localhost:5000/api/feedback/submit-complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit complaint');

      setComplaintSuccess(data.message || 'Complaint / Issue submitted to admin successfully!');
      setComplaintForm({ title: '', category: 'Project Task Issue', priority: 'Medium', description: '' });
      setTargetMember('');
      loadSubmissions();
      setTimeout(() => setComplaintSuccess(''), 5000);
    } catch (err) {
      setComplaintError(err.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  return (
    <div className="member-feedback-container">
      {/* Clean Minimalist Header */}
      <div className="feedback-clean-header">
        <span className="header-eyebrow">SUPPORT & FEEDBACK</span>
        <h1 className="header-title">Feedback & Issues</h1>
        <p className="header-subtitle">
          Share feedback on your projects, collaborate with team members, or report any issues directly to the administration.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="feedback-tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <FaCommentDots /> Give Feedback
        </button>
        <button
          className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          <FaExclamationTriangle /> Report Issues / Complaints
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory /> My Submissions & Status ({myComplaints.length + myFeedbacks.length})
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="feedback-content-card">
        {/* =========================================================================
            TAB 1: GIVE FEEDBACK
           ========================================================================= */}
        {activeTab === 'feedback' && (
          <div className="feedback-form-pane">
            <div className="pane-intro">
              <h2>Submit Project or Platform Feedback</h2>
              <p>Your suggestions help improve project workflows and platform performance.</p>
            </div>

            {feedbackSuccess && (
              <div className="alert alert-success">
                <FaCheckCircle /> <span>{feedbackSuccess}</span>
              </div>
            )}

            {feedbackError && (
              <div className="alert alert-error">
                <FaExclamationCircle /> <span>{feedbackError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="interactive-form">
              {/* Scope Selection */}
              <div className="form-group-section">
                <label className="section-label">Feedback Scope</label>
                <div className="scope-toggle-buttons">
                  <button
                    type="button"
                    className={`scope-btn ${targetScope === 'project' ? 'active' : ''}`}
                    onClick={() => setTargetScope('project')}
                  >
                    <FaFolder /> Specific Project / Member
                  </button>
                  <button
                    type="button"
                    className={`scope-btn ${targetScope === 'general' ? 'active' : ''}`}
                    onClick={() => setTargetScope('general')}
                  >
                    <FaInfoCircle /> General Platform Feedback
                  </button>
                </div>
              </div>

              {/* Project & Member Selection when targetScope === 'project' */}
              {targetScope === 'project' && (
                <div className="project-selection-box">
                  <div className="form-row two-col">
                    <div className="form-field">
                      <label htmlFor="selectProject">Select Project <span className="req">*</span></label>
                      {projectList.length > 0 ? (
                        <select
                          id="selectProject"
                          value={selectedProjectId}
                          onChange={(e) => handleProjectSelect(e.target.value)}
                          className="modern-select"
                          required
                        >
                          {projectList.map((p) => (
                            <option key={p._id || p.id} value={p._id || p.id}>
                              {p.PName || p.name || 'Untitled Project'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="no-projects-hint">
                          No active projects found. Your feedback will be marked as general.
                        </div>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="targetMember">Target Member (Optional)</label>
                      <input
                        id="targetMember"
                        type="text"
                        value={targetMember}
                        onChange={(e) => setTargetMember(e.target.value)}
                        placeholder="e.g. Project Leader, Jane Doe"
                        className="modern-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category and Rating */}
              <div className="form-row two-col">
                <div className="form-field">
                  <label htmlFor="feedbackCategory">Feedback Type</label>
                  <select
                    id="feedbackCategory"
                    value={feedbackForm.type}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, type: e.target.value }))}
                    className="modern-select"
                  >
                    <option value="Project Collaboration">Project Collaboration & Teamwork</option>
                    <option value="Task Management">Task Distribution & Milestones</option>
                    <option value="Committee Coordination">Committee Coordination</option>
                    <option value="Platform Usability">Platform Usability & UI</option>
                    <option value="Feature Suggestion">Feature Suggestion</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Satisfaction Rating</label>
                  <div className="star-rating-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-icon-btn ${feedbackForm.rating >= star ? 'filled' : ''}`}
                        onClick={() => setFeedbackForm(prev => ({ ...prev, rating: star }))}
                        aria-label={`Rating ${star} stars`}
                      >
                        <FaStar />
                      </button>
                    ))}
                    <span className="rating-text">{feedbackForm.rating} / 5 Stars</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="form-field">
                <label htmlFor="feedbackMessage">Your Feedback / Suggestions <span className="req">*</span></label>
                <textarea
                  id="feedbackMessage"
                  rows="4"
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Provide your thoughts, praises, or suggestions for improvement..."
                  className="modern-textarea"
                  required
                />
              </div>

              <div className="form-submit-row">
                <button type="submit" className="submit-btn primary" disabled={isSubmittingFeedback}>
                  {isSubmittingFeedback ? <FaSpinner className="fa-spin" /> : <FaPaperPlane />} Submit Feedback to Admin
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 2: REPORT COMPLAINTS & ISSUES
           ========================================================================= */}
        {activeTab === 'complaints' && (
          <div className="complaint-form-pane">
            <div className="pane-intro">
              <h2>Report a Project or Technical Issue</h2>
              <p>Complaints and issue reports are delivered directly to administration for prompt investigation.</p>
            </div>

            {complaintSuccess && (
              <div className="alert alert-success">
                <FaCheckCircle /> <span>{complaintSuccess}</span>
              </div>
            )}

            {complaintError && (
              <div className="alert alert-error">
                <FaExclamationCircle /> <span>{complaintError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitComplaint} className="interactive-form">
              {/* Scope Selection */}
              <div className="form-group-section">
                <label className="section-label">Issue Scope</label>
                <div className="scope-toggle-buttons">
                  <button
                    type="button"
                    className={`scope-btn ${targetScope === 'project' ? 'active' : ''}`}
                    onClick={() => setTargetScope('project')}
                  >
                    <FaFolder /> Project / Member Issue
                  </button>
                  <button
                    type="button"
                    className={`scope-btn ${targetScope === 'general' ? 'active' : ''}`}
                    onClick={() => setTargetScope('general')}
                  >
                    <FaInfoCircle /> General / Technical Bug
                  </button>
                </div>
              </div>

              {/* Project & Member Selection */}
              {targetScope === 'project' && (
                <div className="project-selection-box">
                  <div className="form-row two-col">
                    <div className="form-field">
                      <label htmlFor="complaintProject">Related Project <span className="req">*</span></label>
                      {projectList.length > 0 ? (
                        <select
                          id="complaintProject"
                          value={selectedProjectId}
                          onChange={(e) => handleProjectSelect(e.target.value)}
                          className="modern-select"
                          required
                        >
                          {projectList.map((p) => (
                            <option key={p._id || p.id} value={p._id || p.id}>
                              {p.PName || p.name || 'Untitled Project'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="no-projects-hint">No active projects found.</div>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="complaintTargetMember">Concerned Member / Role (Optional)</label>
                      <input
                        id="complaintTargetMember"
                        type="text"
                        value={targetMember}
                        onChange={(e) => setTargetMember(e.target.value)}
                        placeholder="e.g. Assigned Committee Member"
                        className="modern-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Subject Title */}
              <div className="form-field">
                <label htmlFor="complaintTitle">Issue / Complaint Subject <span className="req">*</span></label>
                <input
                  id="complaintTitle"
                  type="text"
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Cannot upload project task deliverable"
                  className="modern-input"
                  required
                />
              </div>

              {/* Category & Urgency */}
              <div className="form-row two-col">
                <div className="form-field">
                  <label htmlFor="complaintCat">Category</label>
                  <select
                    id="complaintCat"
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, category: e.target.value }))}
                    className="modern-select"
                  >
                    <option value="Project Task Issue">Project Task Assignment Problem</option>
                    <option value="Committee Communication">Committee Communication / Conflict</option>
                    <option value="Evaluation / Scoring">Evaluation & Performance Score Discrepancy</option>
                    <option value="Technical Issue">Technical Issue / Bug</option>
                    <option value="Account & Access">Account & Access Issue</option>
                    <option value="Other">Other Problem</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="complaintPriority">Priority / Urgency</label>
                  <select
                    id="complaintPriority"
                    value={complaintForm.priority}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="modern-select"
                  >
                    <option value="Low">Low Priority (Minor)</option>
                    <option value="Medium">Medium Priority (Standard)</option>
                    <option value="High">High Priority (Urgent)</option>
                    <option value="Critical">Critical (Blocking Work)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="form-field">
                <label htmlFor="complaintDescription">Detailed Description <span className="req">*</span></label>
                <textarea
                  id="complaintDescription"
                  rows="4"
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what occurred, any affected tasks, and steps to reproduce..."
                  className="modern-textarea"
                  required
                />
              </div>

              <div className="form-submit-row">
                <button type="submit" className="submit-btn danger" disabled={isSubmittingComplaint}>
                  {isSubmittingComplaint ? <FaSpinner className="fa-spin" /> : <FaExclamationTriangle />} Submit Issue to Admin
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 3: MY SUBMISSIONS & STATUS TRACKING
           ========================================================================= */}
        {activeTab === 'history' && (
          <div className="submissions-history-pane">
            <div className="pane-intro">
              <h2>My Submitted Feedbacks & Issues</h2>
              <p>Track the progress and review statuses of your past submissions.</p>
            </div>

            {isLoadingHistory ? (
              <div className="loading-state">
                <FaSpinner className="fa-spin" /> Loading your submissions...
              </div>
            ) : (
              <div className="history-sections-wrap">
                {/* Complaints Section */}
                <div className="history-block">
                  <h3>Reported Issues ({myComplaints.length})</h3>
                  {myComplaints.length === 0 ? (
                    <div className="empty-notice">You haven't reported any issues yet.</div>
                  ) : (
                    <div className="cards-grid">
                      {myComplaints.map((c) => (
                        <div key={c._id} className="history-card complaint-card">
                          <div className="card-top">
                            <span className="cat-tag">{c.category}</span>
                            <span className={`priority-badge ${(c.priority || 'medium').toLowerCase()}`}>
                              {c.priority} Priority
                            </span>
                            <span className={`status-badge status-${(c.status || 'open').toLowerCase().replace(' ', '-')}`}>
                              {c.status || 'Open'}
                            </span>
                            <span className="card-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>

                          <h4 className="card-title">{c.title}</h4>
                          <p className="card-desc">{c.description}</p>

                          <div className="card-meta-footer">
                            {c.projectName && (
                              <span className="project-pill">📁 Project: {c.projectName}</span>
                            )}
                            {c.targetMember && (
                              <span className="member-pill">👤 Member: {c.targetMember}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Feedbacks Section */}
                <div className="history-block" style={{ marginTop: '30px' }}>
                  <h3>Submitted Feedbacks ({myFeedbacks.length})</h3>
                  {myFeedbacks.length === 0 ? (
                    <div className="empty-notice">You haven't submitted any feedback yet.</div>
                  ) : (
                    <div className="cards-grid">
                      {myFeedbacks.map((fb) => (
                        <div key={fb._id} className="history-card feedback-card">
                          <div className="card-top">
                            <span className="cat-tag">{fb.type}</span>
                            <span className="star-tag">⭐ {fb.rating}/5</span>
                            <span className="card-date">{new Date(fb.createdAt).toLocaleDateString()}</span>
                          </div>

                          <p className="card-desc">{fb.message}</p>

                          <div className="card-meta-footer">
                            {fb.projectName && (
                              <span className="project-pill">📁 Project: {fb.projectName}</span>
                            )}
                            {fb.targetMember && (
                              <span className="member-pill">👤 Member: {fb.targetMember}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberFeedback;
