import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaHome, FaUser, FaProjectDiagram, FaHandsHelping } from 'react-icons/fa';
import { FaCodeCommit, FaPersonRifle } from 'react-icons/fa6';

function LeftNavigationBar() {

  const [active, setActive] = React.useState(() =>
    localStorage.getItem('activeNav') || 'home'
  );
  const location = useLocation();


  useEffect(() => {
    const saved = localStorage.getItem('activeNav');
    if (saved) {
      setActive(saved);
      return;
    }

    const path = location.pathname || '/';

    if (path === '/' || path === '') {
      setActive('home');
    } else if (path.includes('ManageCommittees')) {
      setActive('manage_committees');
    } else if (path.includes('ManageTasks')) {
      setActive('manage_tasks');
    } else if (path.includes('Projects') || path.includes('MyProjects') || path.includes('My Projects')) {
      setActive('projects');
    } else if (path.includes('ChairDashboard') || path.includes('Profile')) {
      setActive('profile');
    } else if (path.includes('Rotaract')) {
      setActive('rotaract');
    } else if (path.includes('Reports')) {
      setActive('reports');
    } else if (path.includes('Settings')) {
      setActive('settings');
    } else {
      
      setActive('home');
    }
 
  }, []);

  const handleNav = (key) => {
    setActive(key);
    localStorage.setItem('activeNav', key);
  }

  return (
    <div>
      <div className={`LeftNavigationBar`}>
        <div className="brand">
          <img src="https://rcunialumni.home.blog/wp-content/uploads/2023/05/racualu-full-black-logo.png?w=1080" alt="Rotaract logo" className="logo" />
        </div>

        <div className={`row ${active === 'home' ? 'active' : ''}`} onClick={() => handleNav('home')}>
          <FaHome/>
          <Link to="/" className={active === 'home' ? 'active' : ''} onClick={() => handleNav('home')}>Home</Link>
        </div>

        <div className={`row ${active === 'projects' ? 'active' : ''}`} onClick={() => handleNav('projects')}>
          <FaProjectDiagram/>
          <Link to="/MyProject" className={active === 'projects' ? 'active' : ''} onClick={() => handleNav('projects')}>My Projects</Link>
        </div>

        <div className={`row ${active === 'profile' ? 'active' : ''}`} onClick={() => handleNav('profile')}>
          <FaUser/>
          <Link to="/ChairDashboard" className={active === 'profile' ? 'active' : ''} onClick={() => handleNav('profile')}>Profile</Link>
        </div>

        <div className={`row ${active === 'rotaract' ? 'active' : ''}`} onClick={() => handleNav('rotaract')}>
          <Link to="/Rotaract" className={active === 'rotaract' ? 'active' : ''} onClick={() => handleNav('rotaract')}>Rotaract</Link>
        </div>

        <div className={`row manage-row ${active.startsWith('manage_') ? "active" : ''}`}>
          <span className="manage-label">Manage</span>
          <div className="row1">
            <Link
              className={active === 'manage_projects' ? 'active' : ''}
              to="/Projects"
              onClick={() => handleNav('manage_projects')}
            >
              Projects
            </Link>
            <Link
              className={active === 'manage_committees' ? 'active' : ''}
              to="/ManageCommittees"
              onClick={() => handleNav('manage_committees')}
            >
              Committees
            </Link>
            <Link
              className={active === 'manage_tasks' ? 'active' : ''}
              to="/ManageTasks"
              onClick={() => handleNav('manage_tasks')}
            >
              Tasks
            </Link>
          </div>
        </div>

        <div className={`row ${active === 'reports' ? 'active' : ''}`} onClick={() => handleNav('reports')}>
          <FaCodeCommit/>
          <Link to="/Reports" className={active === 'reports' ? 'active' : ''} onClick={() => handleNav('reports')}>Reports</Link>
        </div>

        <div className={`row ${active === 'settings' ? 'active' : ''}`} onClick={() => handleNav('settings')}>
          <Link to="/Settings" className={active === 'settings' ? 'active' : ''} onClick={() => handleNav('settings')}>Settings</Link>
        </div>
      </div>
    </div>
  )
}

export default LeftNavigationBar;