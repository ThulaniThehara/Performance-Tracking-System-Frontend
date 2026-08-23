import { React, useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '../ConfirmationComponent/ConfirmDialog'
import "../../SCSS/AdminStyles/AdminProjectStyles/AdminProjects.scss"
import "../../SCSS/componentStyle/ProjectModal.scss"

const ProjectsTable = ({ projects: propsProjects = [], onProjectDeleted, onProjectUpdated, searchQuery = '', filterDept = '' }) => {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [projects, setProjects] = useState(propsProjects);
  const [projectMembers, setProjectMembers] = useState({})

  // Sample members from the admin members section
  const sampleMembers = [
    { id: 1, name: "Aisha Khan", email: "aisha.khan@example.com", department: "Engineering" },
    { id: 2, name: "Daniel Smith", email: "daniel.smith@example.com", department: "Science" },
    { id: 3, name: "Fatima Ali", email: "fatima.ali@example.com", department: "Arts" },
  ];

  useEffect(() => {
    if (propsProjects.length > 0) {
      setProjects(propsProjects);
    }
  }, [propsProjects]);

  // Filter and search projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterDept === '' || project.department === filterDept;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date) => {
    if (!date) return t('projectsTable.notApplicable')
    return new Date(date).toLocaleDateString()
  }

  const handleViewClick = (project) => {
    setSelectedProject(project)
    setIsEditMode(false)
  }

  const handleEditClick = (project) => {
    setSelectedProject(project)
    setEditFormData(project)
    setIsEditMode(true)
  }

  const handleCloseModal = () => {
    setSelectedProject(null)
    setIsEditMode(false)
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveChanges = () => {
    if (onProjectUpdated) {
      onProjectUpdated(editFormData);
    }
    setProjects(projects.map(p => p.id === editFormData.id ? editFormData : p));
    handleCloseModal()
  }

  const handleDeleteClick = (project) => {
    setProjectToDelete(project)
    setShowConfirmDelete(true)
  }

  const handleConfirmDelete = () => {
    if (onProjectDeleted && projectToDelete) {
      onProjectDeleted(projectToDelete.id);
    }
    setProjects(projects.filter(p => p.id !== projectToDelete.id));
    setShowConfirmDelete(false)
    setProjectToDelete(null)
  }

  const handleAddMembers = (project) => {
    setSelectedProject(project)
    setShowAddMembersModal(true)
  }

  const handleAddMemberToProject = (memberId) => {
    if (!selectedProject) return;
    const member = sampleMembers.find(m => m.id === memberId);
    if (member) {
      setProjectMembers(prev => ({
        ...prev,
        [selectedProject.id]: [...(prev[selectedProject.id] || []), member]
      }));
      // Update memberCount in projects
      setProjects(projects.map(p => 
        p.id === selectedProject.id 
          ? { ...p, memberCount: (p.memberCount || 0) + 1 }
          : p
      ));
    }
  }

  return(
    <div className='projects-table-container'>
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title={t('projectsTable.deleteDialog.title')}
        message={t('projectsTable.deleteDialog.message', { name: projectToDelete?.projectName })}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        confirmText={t('projectsTable.deleteDialog.confirm')}
        cancelText={t('common.cancel')}
      />

      {/* Edit/View Project Modal */}
      {selectedProject && !showAddMembersModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? t('projectsTable.editTitle') : t('projectsTable.detailsTitle')}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              {!isEditMode ? (
                <div className="project-details">
                  <div className="detail-section">
                    <div className="detail-item">
                      <label>{t('projectsTable.detail.projectName')}</label>
                      <p>{selectedProject.projectName}</p>
                    </div>
                    <div className="detail-item">
                      <label>{t('projectsTable.detail.description')}</label>
                      <p>{selectedProject.description}</p>
                    </div>
                  </div>
                  <div className="detail-section">
                    <div className="detail-item">
                      <label>{t('projectsTable.detail.startDate')}</label>
                      <p>{formatDate(selectedProject.startDate)}</p>
                    </div>
                    <div className="detail-item">
                      <label>{t('projectsTable.detail.endDate')}</label>
                      <p>{formatDate(selectedProject.endDate)}</p>
                    </div>
                  </div>
                  <div className="detail-section">
                    <div className="detail-item">
                      <label>{t('projectsTable.detail.department')}</label>
                      <p>{selectedProject.department}</p>
                    </div>
                    <div className="detail-item">
                      <label>{t('projectsTable.detail.chairPerson')}</label>
                      <p>{selectedProject.chairPerson}</p>
                    </div>
                  </div>
                  <div className="detail-section">
                    <div className="detail-item">
                      <label>{t('projectsTable.detail.memberCount')}</label>
                      <p>{selectedProject.memberCount}</p>
                    </div>
                    <div className="detail-item">
                      <label>{t('projectsTable.detail.status')}</label>
                      <p>{selectedProject.status}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form className="project-edit-form">
                  <div className="form-group">
                    <label>{t('projectsTable.detail.projectName')}</label>
                    <input type="text" name="projectName" value={editFormData.projectName} onChange={handleEditInputChange} />
                  </div>
                  <div className="form-group">
                    <label>{t('projectsTable.detail.description')}</label>
                    <textarea name="description" rows="3" value={editFormData.description} onChange={handleEditInputChange} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('projectsTable.detail.startDate')}</label>
                      <input type="date" name="startDate" value={editFormData.startDate} onChange={handleEditInputChange} />
                    </div>
                    <div className="form-group">
                      <label>{t('projectsTable.detail.endDate')}</label>
                      <input type="date" name="endDate" value={editFormData.endDate} onChange={handleEditInputChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('projectsTable.detail.department')}</label>
                      <select name="department" value={editFormData.department} onChange={handleEditInputChange}>
                        <option value="General">{t('projectAddForm.departments.general')}</option>
                        <option value="Engineering">{t('projectAddForm.departments.engineering')}</option>
                        <option value="Science">{t('projectAddForm.departments.science')}</option>
                        <option value="Arts">{t('projectAddForm.departments.arts')}</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t('projectsTable.detail.chairPerson')}</label>
                      <input type="text" name="chairPerson" value={editFormData.chairPerson} onChange={handleEditInputChange} />
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="modal-footer">
              {!isEditMode ? (
                <>
                  <button className="btn-secondary" onClick={handleCloseModal}>{t('projects.details.aria.close')}</button>
                  <button className="btn-primary" onClick={() => setIsEditMode(true)}>{t('projectsTable.editButton')}</button>
                </>
              ) : (
                <>
                  <button className="btn-secondary" onClick={() => setIsEditMode(false)}>{t('common.cancel')}</button>
                  <button className="btn-primary" onClick={handleSaveChanges}>{t('admin.dashboard.editModal.saveChanges')}</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      {showAddMembersModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowAddMembersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('projectsTable.addMembersTitle', { name: selectedProject.projectName })}</h2>
              <button className="modal-close" onClick={() => setShowAddMembersModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="members-list">
                {sampleMembers.map(member => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <h3>{member.name}</h3>
                      <p>{member.email}</p>
                      <span className="dept-badge">{member.department}</span>
                    </div>
                    <button
                      className="btn-add-member"
                      onClick={() => handleAddMemberToProject(member.id)}
                    >
                      {t('projectsTable.addButton')}
                    </button>
                  </div>
                ))}
              </div>
              {projectMembers[selectedProject.id] && projectMembers[selectedProject.id].length > 0 && (
                <div className="added-members">
                  <h4>{t('projectsTable.addedMembers')}</h4>
                  <ul>
                    {projectMembers[selectedProject.id].map(member => (
                      <li key={member.id}>{member.name} ({member.department})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddMembersModal(false)}>{t('projects.details.aria.close')}</button>
            </div>
          </div>
        </div>
      )}

      <div className='table-wrapper'>
        <table className='modern-table'>
          <thead>
            <tr>
              <th>{t('projectsTable.columns.projectName')}</th>
              <th>{t('projectsTable.columns.department')}</th>
              <th>{t('projectsTable.columns.chairPerson')}</th>
              <th>{t('projectsTable.columns.members')}</th>
              <th>{t('projectsTable.columns.startDate')}</th>
              <th>{t('projectsTable.columns.status')}</th>
              <th>{t('projectsTable.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td>
                  <span className='project-name'>{project.projectName}</span>
                </td>
                <td>
                  <span className='dept-badge'>{project.department}</span>
                </td>
                <td>{project.chairPerson}</td>
                <td className='center'>{project.memberCount}</td>
                <td>
                  <span className='date-badge'>{formatDate(project.startDate)}</span>
                </td>
                <td>
                  <span className={`status-badge status-${project.status}`}>{project.status}</span>
                </td>
                <td className='actions-cell'>
                  <button
                    className='btn-action btn-view'
                    onClick={() => handleViewClick(project)}
                    title={t('projectsTable.actionTitles.view')}
                  >
                    {t('projectsTable.viewButton')}
                  </button>
                  <button
                    className='btn-action btn-add-person'
                    onClick={() => handleAddMembers(project)}
                    title={t('projectsTable.actionTitles.addMembers')}
                  >
                    <FaUserPlus />
                  </button>
                  <button
                    className='btn-action btn-edit'
                    onClick={() => handleEditClick(project)}
                    title={t('projectsTable.actionTitles.edit')}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className='btn-action btn-delete'
                    onClick={() => handleDeleteClick(project)}
                    title={t('projectsTable.actionTitles.delete')}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProjectsTable

