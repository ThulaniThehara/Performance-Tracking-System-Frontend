import React from 'react'
import LeftNavigationBar from '../../Components/LeftNavigationBar/LeftNavigationBar'
import Header from '../../Components/Header/Header'
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { useState } from 'react';
import "../../SCSS/AdminStyles/AdminDashboard/AdminDashboard.scss"
import ProjectAddForm from '../../Components/AdminComponents/ProjectAddForm';
import TaskBar from '../../Components/SerachAnd/SearchAndButton';
import Toast from '../../Components/Toast/Toast'
import { useNavigate } from 'react-router-dom';
import ProjectsTable from '../../Components/AdminComponents/ProjectsTable';


const AdminAddProject = () => {
    const [date, setDate] = useState(new Date());
    const navigate = useNavigate()
    const [activeView, setActiveView] = useState('add');
    const [showToast, setShowToast] = useState(false);
    const [projects, setProjects] = useState([
      { id: 1, projectName: 'Event 1', description: 'Some notes about Event 1', startDate: '2025-01-01', endDate: '2025-01-15', department: 'Engineering', chairPerson: 'Aisha Khan', memberCount: 5, status: 'active' },
      { id: 2, projectName: 'Event 2', description: 'Some notes about Event 2', startDate: '2025-02-01', endDate: '2025-02-15', department: 'Science', chairPerson: 'Daniel Smith', memberCount: 3, status: 'active' },
      { id: 3, projectName: 'Event 3', description: 'Some notes about Event 3', startDate: '2025-03-01', endDate: '2025-03-15', department: 'Arts', chairPerson: 'Fatima Ali', memberCount: 4, status: 'upcoming' },
    ]);
  
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
    
  return (
    <div>
      <LeftNavigationBar/>
      <Header/>
      <Toast message="Project created successfully!" isVisible={showToast} duration={2000} />
    
      <TaskBar
        title1="Add New Project"
        title2="View Projects"
        onAddClick={() => handleViewChange('add')}
        onViewClick={() => handleViewChange('view')}
        activeView={activeView}     
      />

      {activeView === 'add' && (
        <>
          {/* layout wrapper: form on left, calendar on right */}
          <div className="admin-add-layout">
            <div className="project-card">
              <h1>Project Form</h1>
              <ProjectAddForm onProjectAdded={handleProjectAdded}/>
            </div>

            <div className="calendar-container">
              <Calendar 
                onChange={setDate} 
                value={date} 
              />
              <p className="selected-date">Selected date: {date.toDateString()}</p>
            </div>
          </div>
        </>
      )}

      {activeView === 'view' && (
        <ProjectsTable 
          projects={projects}
          onProjectDeleted={handleProjectDeleted}
          onProjectUpdated={handleProjectUpdated}
        />
      )}

    </div>
  )
}

export default AdminAddProject
