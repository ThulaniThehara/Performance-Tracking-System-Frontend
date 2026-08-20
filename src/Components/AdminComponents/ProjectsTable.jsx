import { React, useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa'
import ConfirmDialog from '../ConfirmationComponent/ConfirmDialog'
import "../../SCSS/AdminStyles/AdminProjectStyles/AdminProjects.scss"
import "../../SCSS/componentStyle/ProjectModal.scss"

const ProjectsTable = ({ projects: propsProjects = [], onProjectDeleted, onProjectUpdated, searchQuery = '', filterDept = '' }) => {
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
    if (!date) return 'N/A'
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
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.projectName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Edit/View Project Modal */}
      {selectedProject && !showAddMembersModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Project' : 'Project Details'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              {!isEditMode ? (
                <div className="project-details">
                  <div className="detail-section">
                    <div className="detail-item">
                      <label>Project Name:</label>
                      <p>{selectedProject.projectName}</p>
                    </div>
                    <div className="detail-item">
                      <label>Description:</label>
                      <p>{selectedProject.description}</p>
                    </div>
                  </div>
                  <div className="detail-section">
                    <div className="detail-item">
                      <label>Start Date:</label>
                      <p>{formatDate(selectedProject.startDate)}</p>
                    </div>
                    <div className="detail-item">
                      <label>End Date:</label>
                      <p>{formatDate(selectedProject.endDate)}</p>
                    </div>
                  </div>
                  <div className="detail-section">
                    <div className="detail-item">
                      <label>Department:</label>
                      <p>{selectedProject.department}</p>
                    </div>
                    <div className="detail-item">
                      <label>Chair Person:</label>
                      <p>{selectedProject.chairPerson}</p>
                    </div>
                  </div>
                  <div className="detail-section">
                    <div className="detail-item">
                      <label>Member Count:</label>
                      <p>{selectedProject.memberCount}</p>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <p>{selectedProject.status}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form className="project-edit-form">
                  <div className="form-group">
                    <label>Project Name:</label>
                    <input type="text" name="projectName" value={editFormData.projectName} onChange={handleEditInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea name="description" rows="3" value={editFormData.description} onChange={handleEditInputChange} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date:</label>
                      <input type="date" name="startDate" value={editFormData.startDate} onChange={handleEditInputChange} />
                    </div>
                    <div className="form-group">
                      <label>End Date:</label>
                      <input type="date" name="endDate" value={editFormData.endDate} onChange={handleEditInputChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Department:</label>
                      <select name="department" value={editFormData.department} onChange={handleEditInputChange}>
                        <option value="General">General</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Science">Science</option>
                        <option value="Arts">Arts</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Chair Person:</label>
                      <input type="text" name="chairPerson" value={editFormData.chairPerson} onChange={handleEditInputChange} />
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="modal-footer">
              {!isEditMode ? (
                <>
                  <button className="btn-secondary" onClick={handleCloseModal}>Close</button>
                  <button className="btn-primary" onClick={() => setIsEditMode(true)}>Edit</button>
                </>
              ) : (
                <>
                  <button className="btn-secondary" onClick={() => setIsEditMode(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleSaveChanges}>Save Changes</button>
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
              <h2>Add Members to {selectedProject.projectName}</h2>
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
                      Add
                    </button>
                  </div>
                ))}
              </div>
              {projectMembers[selectedProject.id] && projectMembers[selectedProject.id].length > 0 && (
                <div className="added-members">
                  <h4>Added Members:</h4>
                  <ul>
                    {projectMembers[selectedProject.id].map(member => (
                      <li key={member.id}>{member.name} ({member.department})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddMembersModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className='table-wrapper'>
        <table className='modern-table'>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Department</th>
              <th>Chair Person</th>
              <th>Members</th>
              <th>Start Date</th>
              <th>Status</th>
              <th>Actions</th>
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
                    title='View Details'
                  >
                    View
                  </button>
                  <button 
                    className='btn-action btn-add-person'
                    onClick={() => handleAddMembers(project)}
                    title='Add Members'
                  >
                    <FaUserPlus />
                  </button>
                  <button 
                    className='btn-action btn-edit'
                    onClick={() => handleEditClick(project)}
                    title='Edit Project'
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className='btn-action btn-delete'
                    onClick={() => handleDeleteClick(project)}
                    title='Delete Project'
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

