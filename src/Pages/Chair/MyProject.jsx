import React, { useEffect, useState } from 'react';
import Header from '../../Components/Header/Header';
import LeftNavChair from '../../Components/chair Component/LeftNavChair';
import axios from 'axios';
import '../../SCSS/ChairStyle/MyProject.scss';
import { useNavigate } from 'react-router-dom';

const MyProject = () => {
  const projectId = '68d799d39f75e374f4e80aef'; // hardcoded for now
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [chairPersons, setChairPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // fetch project by ID
      const projectRes = await axios.get(`http://localhost:5000/api/project/${projectId}`);
      const projectData = projectRes.data.data || projectRes.data;
      
      if (!projectData) {
        setError('Project not found');
        setLoading(false);
        return;
      }

      setProject(projectData);

      // fetch chairperson details if chairPerson field contains name(s)
      // assuming chairPerson is a string like "John Doe" or comma-separated names
      if (projectData.chairPerson) {
        try {
          // try to fetch user by name
          const chairNames = projectData.chairPerson.split(',').map(n => n.trim());
          const chairPersonData = await Promise.all(
            chairNames.map(async (name) => {
              try {
                const res = await axios.get(`http://localhost:5000/api/user/name/${encodeURIComponent(name)}`);
                const users = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
                return users[0] || { name, email: '—' };
              } catch (err) {
                // fallback: return just the name
                return { name, email: '—' };
              }
            })
          );
          setChairPersons(chairPersonData);
        } catch (err) {
          console.error('Failed to fetch chairperson details:', err);
          // fallback: just use the chairPerson string
          setChairPersons([{ name: projectData.chairPerson, email: '—' }]);
        }
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <LeftNavChair />
        <div className="my-project-page">
          <div className="loading-state">Loading project...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <LeftNavChair />
        <div className="my-project-page">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchProjectData}>Retry</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <LeftNavChair />
      <div className="my-project-page">
        <div className="project-hero">
          {/* Project header with gradient background */}
          <div className="hero-background"></div>

          <div className="project-content">
            {/* Project Title */}
            <h1 className="project-title">{project?.PName || 'Project'}</h1>

            {/* Project Overview Section */}
            <div className="project-overview">
              {/* Left: Project Image (placeholder) */}
              <div className="project-image-section">
                <div className="project-image-placeholder">
                  <img 
                    src={project?.image || 'https://via.placeholder.com/280x200?text=' + encodeURIComponent(project?.PName || 'Project')} 
                    alt={project?.PName}
                  />
                </div>
              </div>

              {/* Right: Project Description */}
              <div className="project-description-section">
                <p className="project-description">
                  {project?.description || 'No description available'}
                </p>
                <div className="project-meta">
                  <div className="meta-item">
                    <strong>Status:</strong>
                    <span className={`status-badge status-${(project?.status || '').toLowerCase()}`}>
                      {project?.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <strong>Start Date:</strong>
                    <span>{project?.StartDate ? new Date(project.StartDate).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="meta-item">
                    <strong>End Date:</strong>
                    <span>{project?.EndDate ? new Date(project.EndDate).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chair Persons Section */}
            <div className="chair-persons-section">
              <h2>Chair Persons</h2>
              <div className="chair-persons-grid">
                {chairPersons.length > 0 ? (
                  chairPersons.map((person, idx) => (
                    <div key={idx} className="chair-person-card">
                      <div className="chair-avatar">
                        {/* Circle with initials */}
                        <span className="avatar-initials">
                          {person.name
                            .split(' ')
                            .slice(0, 2)
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                      </div>
                      <p className="chair-name">{person.name}</p>
                      <p className="chair-role">{person.role || 'Chair Person'}</p>
                    </div>
                  ))
                ) : (
                  <p>No chair persons assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProject;