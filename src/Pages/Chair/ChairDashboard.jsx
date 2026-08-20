import React, { useEffect, useState } from "react";
import Header from '../../Components/Header/Header';
import LeftNavChair from '../../Components/chair Component/LeftNavChair';
import "../../SCSS/ChairStyle/ChairDashboard.scss";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";

const ChairDashboard = () => {
  const [user, setUser] = useState(null);
  const [committees, setCommittees] = useState([]);
  const [memberProjects, setMemberProjects] = useState([]); // { PName, role, year? }
  const [experienceYears, setExperienceYears] = useState(0);
  const [loading, setLoading] = useState(true);

  // helper: try to find current user identifiers in localStorage
  const getStoredUserIdentifiers = () => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        // prefer _id and indexNo if present
        return {
          id: parsed._id || parsed.id || null,
          indexNo: parsed.indexNo || parsed.index || parsed.index_no || null,
          email: parsed.email || null,
        };
      }
    } catch (err) {
      // ignore JSON parse error
    }

    return {
      id: localStorage.getItem('userId') || localStorage.getItem('user_id') || null,
      indexNo: localStorage.getItem('indexNo') || localStorage.getItem('index_no') || null,
      email: localStorage.getItem('email') || null,
    };
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const ids = getStoredUserIdentifiers();
    try {
      let fetchedUser = null;

      // fetch user by id / indexNo / email (whichever we have)
      if (ids.id) {
        const res = await axios.get(`http://localhost:5000/api/user/id/${ids.id}`);
        fetchedUser = res.data.data;
      } else if (ids.indexNo) {
        const res = await axios.get(`http://localhost:5000/api/user/indexNo/${encodeURIComponent(ids.indexNo)}`);
        // controller returns array for index fetch; pick first
        fetchedUser = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
      } else if (ids.email) {
        const res = await axios.get(`http://localhost:5000/api/user/email/${encodeURIComponent(ids.email)}`);
        fetchedUser = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
      } else {
        console.warn('No logged-in user info found in localStorage (keys tried: user, userId, indexNo, email). Dashboard shows placeholder data.');
      }

      if (fetchedUser) {
        setUser(fetchedUser);

        // compute experience (years) from joinedDate if present
        if (fetchedUser.joinedDate) {
          const joined = new Date(fetchedUser.joinedDate);
          const now = new Date();
          const years = Math.floor((now - joined) / (1000 * 60 * 60 * 24 * 365));
          setExperienceYears(years >= 0 ? years : 0);
        } else {
          setExperienceYears(0);
        }

        // fetch committees for this user (committee controller accepts query userId)
        // prefer using the user's _id if available
        const userIdForCommittees = fetchedUser._id || fetchedUser.id;
        if (userIdForCommittees) {
          try {
            const comRes = await axios.get(`http://localhost:5000/api/committee/user/my-committees?userId=${userIdForCommittees}`);
            setCommittees(comRes.data.data || []);
          } catch (err) {
            console.error('Failed to fetch committees for user:', err);
            // fallback: fetch all committees and filter by members containing user's name
            try {
              const allCom = await axios.get(`http://localhost:5000/api/committee/all`);
              const fallback = (allCom.data.data || []).filter(c =>
                (c.Members || []).some(m => {
                  // match by UserId or UserName or indexNo where available
                  if (m.UserId && userIdForCommittees) {
                    return String(m.UserId) === String(userIdForCommittees);
                  }
                  if (m.UserName && fetchedUser.name) {
                    return m.UserName.toLowerCase() === fetchedUser.name.toLowerCase();
                  }
                  return false;
                })
              );
              setCommittees(fallback);
            } catch (err2) {
              console.error('Fallback committees fetch failed:', err2);
            }
          }
        }

        // fetch member projects by indexNo (MemberProject model uses indexNo)
        const idx = fetchedUser.indexNo || ids.indexNo;
        if (idx) {
          try {
            const mpRes = await axios.get(`http://localhost:5000/api/memberProject/get/indexNo/${encodeURIComponent(idx)}`);
            const mpData = mpRes.data.data || [];

            // For each PName, optionally fetch project details to extract year (StartDate/EndDate)
            const withYear = await Promise.all(mpData.map(async (mp) => {
              const out = { PName: mp.PName, role: mp.role };
              try {
                const pRes = await axios.get(`http://localhost:5000/api/project/name/${encodeURIComponent(mp.PName)}`);
                const projects = pRes.data.data || [];
                if (projects.length) {
                  const proj = projects[0];
                  // prefer StartDate then EndDate for "year"
                  const dateStr = proj.StartDate || proj.EndDate || null;
                  if (dateStr) {
                    const year = (new Date(dateStr)).getFullYear();
                    out.year = year;
                  }
                }
              } catch (err) {
                // ignore per-project lookup failures
              }
              return out;
            }));

            setMemberProjects(withYear);
          } catch (err) {
            console.error('Failed to fetch member projects by indexNo:', err);
          }
        } else {
          // no indexNo available: try fetching memberProject by name (fallback)
          try {
            const mpRes = await axios.get(`http://localhost:5000/api/memberProject/get`);
            const allMp = mpRes.data.data || [];
            // filter by name matching user's name
            const filtered = allMp.filter(mp => fetchedUser.name && mp.PName && String(mp.PName).toLowerCase().includes(String(fetchedUser.name).toLowerCase()) );
            setMemberProjects(filtered.map(mp => ({ PName: mp.PName, role: mp.role })));
          } catch (err) {
            // ignore
          }
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Small loading/placeholder UI then the main layout (we keep your earlier markup)
  return (
    <>
      <Header />
      <LeftNavChair />
      <div className="chair-dashboard">
        <div className="dashboard-container">
          {/* Left Profile Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                <img src={user?.avatar || "https://placekitten.com/240/240"} alt="profile" />
              </div>

              <div className="profile-name">
                <h2>{user?.name || "Jenny"}</h2>
                <h3>{user?.name ? (user.name.split(' ')[1] || '') : "Sherman"}</h3>
              </div>

              <div className="profile-actions">
                <button className="btn btn-edit">EditProfile</button>
                <button className="btn btn-primary">View more</button>
              </div>

              <hr className="profile-divider" />

              <h4 className="section-title">Personal Details</h4>
              <div className="profile-details">
                <div className="detail-item">
                  <FaPhoneAlt className="icon" />
                  <span>{user?.contactNO || user?.contact || '+94 77 2315 897'}</span>
                </div>
                <div className="detail-item">
                  <FaEnvelope className="icon" />
                  <span>{user?.email || 'Jenny33@gmail.com'}</span>
                </div>
                <div className="detail-item">
                  <FaMapMarkerAlt className="icon" />
                  <span>{user?.faculy || user?.faculty || 'University of Moratuwa'}</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                  Joined: {user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : '—'}
                </div>
              </div>

              <h4 className="section-title">Committees</h4>
              <ul className="committees-list">
                {loading ? <li>Loading...</li> : (
                  committees.length ? committees.map((c) => (
                    <li key={c._id || c.CName}>→ {c.CName}</li>
                  )) : <li>— No committees</li>
                )}
              </ul>
            </div>
          </aside>

          {/* Center Content */}
          <main className="main-content">
            {/* Performance Card */}
            <div className="card performance-card">
              <h3 className="card-title">2025 Performance review</h3>
              <hr className="card-divider" />

              <div className="performance-body">
                <div className="donut-chart">
                  <svg viewBox="0 0 100 100" width="140" height="140">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#6f4bd8" 
                      strokeWidth="8" 
                      strokeDasharray="214 283"
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#ff6b9d" 
                      strokeWidth="8" 
                      strokeDasharray="69 283"
                      strokeDashoffset="-214"
                      transform="rotate(-90 50 50)"
                    />
                    <circle cx="50" cy="50" r="30" fill="white" />
                    <text x="50" y="55" textAnchor="middle" fontSize="20" fontWeight="700" fill="#333">76%</text>
                  </svg>
                </div>

                <div className="performance-label">
                  <p className="muted-text">Performance Rating</p>
                </div>
              </div>
            </div>

            {/* Contribution Card */}
            <div className="card contribution-card">
              <h3 className="card-title">Contribution</h3>
              <hr className="card-divider" />

              <div className="contribution-icons">
                <div className="contrib-icon">📊</div>
                <div className="contrib-icon">📈</div>
                <div className="contrib-icon">📉</div>
              </div>
            </div>
          </main>

          {/* Right Experience Sidebar */}
          <aside className="experience-sidebar">
            <div className="experience-card">
              <h3 className="card-title">Experience & performance</h3>

              <div className="experience-section">
                <p className="muted-text">Years of experience</p>
                <div className="experience-number">{loading ? "—" : experienceYears}</div>
              </div>

              <div className="worked-projects">
                <p className="muted-text">Worked Projects</p>
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Year</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="3">Loading...</td></tr>
                    ) : (
                      memberProjects.length ? memberProjects.map((p, i) => (
                        <tr key={i}>
                          <td>{p.PName}</td>
                          <td>{p.year || '—'}</td>
                          <td>{p.role || '—'}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3">— No projects found</td></tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default ChairDashboard;