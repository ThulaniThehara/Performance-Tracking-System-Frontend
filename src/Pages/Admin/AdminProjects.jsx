import React from 'react'
import {FaSearch,FaPlus,FaFilter} from 'react-icons/fa'
import '../../SCSS/AdminStyles/AdminProjectStyles/AdminProjects.scss'
import SearchAndButton from '../../Components/SerachAnd/SearchAndButton.jsx'
import ProjectsTable from '../../Components/AdminComponents/ProjectsTable.jsx'
import LeftNavigationBar from '../../Components/LeftNavigationBar/LeftNavigationBar.jsx'
import Header from '../../Components/Header/Header.jsx'
import TaskBar from '../../Components/SerachAnd/SearchAndButton'
import Toast from '../../Components/Toast/Toast'
import LeftNavChair from '../../Components/chair Component/LeftNavChair.jsx'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ProjectAddForm from '../../Components/AdminComponents/ProjectAddForm.jsx'

const AdminProjects = () => {
  const navigate = useNavigate()

  const [activeView, setActiveView] = useState('view');
  const [showToast, setShowToast] = useState(false);
  const [projects, setProjects] = useState([
    { id: 1, projectName: 'Event 1', description: 'Some notes about Event 1', startDate: '2025-01-01', endDate: '2025-01-15', department: 'Engineering', chairPerson: 'Aisha Khan', memberCount: 5, status: 'active' },
    { id: 2, projectName: 'Event 2', description: 'Some notes about Event 2', startDate: '2025-02-01', endDate: '2025-02-15', department: 'Science', chairPerson: 'Daniel Smith', memberCount: 3, status: 'active' },
    { id: 3, projectName: 'Event 3', description: 'Some notes about Event 3', startDate: '2025-03-01', endDate: '2025-03-15', department: 'Arts', chairPerson: 'Fatima Ali', memberCount: 4, status: 'upcoming' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  
  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleProjectAdded = (formData) => {
    const newProject = {
      id: Math.max(...projects.map(p => p.id), 0) + 1,
      projectName: formData.projectName,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      department: formData.department || 'General',
      chairPerson: formData.chairPerson || 'TBD',
      memberCount: 0,
      status: 'upcoming'
    };
    
    setProjects([...projects, newProject]);
    setShowToast(true);
    setTimeout(() => {
      setActiveView('view');
    }, 500);
  };

  const handleProjectDeleted = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const handleProjectUpdated = (updatedProject) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleAddMembers = (projectId) => {
    // Will be handled in ProjectsTable component
  };
  return (
    <div className='admin-projects-container'>
      <Header />
      <LeftNavigationBar />
      <Toast message="Project created successfully!" isVisible={showToast} duration={2000} />
      
      <div className='taskbar-wrapper'>
        <TaskBar
          title1="Add New Project"
          title2="View Projects"
          onAddClick={() => handleViewChange('add')}
          onViewClick={() => handleViewChange('view')}
          activeView={activeView}
        />
      </div>

      <div className='content-wrapper'>
      {activeView === 'view' && (
        <>
          <div className='search_bar'>
            <input 
              type="text" 
              placeholder='Search by Project Name'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            /> 
            <FaSearch />
          </div>

          <div className='filter_bar'>
            <FaFilter />
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Science">Science</option>
              <option value="Arts">Arts</option>
            </select>
          </div>
        </>
      )}

      {activeView === 'add' && <div className='form-section'><ProjectAddForm onProjectAdded={handleProjectAdded} /></div>}
      {activeView === 'view' && (
        <ProjectsTable 
          projects={projects} 
          onProjectDeleted={handleProjectDeleted}
          onProjectUpdated={handleProjectUpdated}
          searchQuery={searchQuery}
          filterDept={filterDept}
        />
      )}
      </div>
    </div>
  )
}

export default AdminProjects
