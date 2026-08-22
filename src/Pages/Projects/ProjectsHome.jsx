import React, { useCallback, useEffect, useState } from "react";
import { FaCrown, FaUsers, FaFolderOpen } from "react-icons/fa";

import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import ProjectCard from "../../Components/Projects/ProjectCard";
import MyTasksWidget from "../../Components/Projects/MyTasksWidget";

import { apiFetch } from "../../utils/api";
import { getUser } from "../../utils/auth";
import "../../SCSS/Projects/Projects.scss";

/**
 * "My Projects" — every society project the signed-in person is actually
 * assigned to, split into what they lead vs. what they contribute to.
 *
 * This page never creates projects. A project only exists once an admin
 * creates it and names its chairperson (Admin → Management → Projects); that
 * chairperson then runs their project — committees, members, tasks — from
 * this same account once they open it, since the details page grants full
 * management rights to whoever the server says is the chairperson.
 */
const ProjectsHome = () => {
  const user = getUser();
  const firstName = (user?.name || "there").split(" ")[0];

  const [led, setLed] = useState([]);
  const [contributing, setContributing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFetch("/pm/my-projects");
      if (!res) return;
      setLed(res.data.led || []);
      setContributing(res.data.contributing || []);
    } catch (e) {
      setError(e.message || "Could not load your projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const nothingAtAll = !loading && led.length === 0 && contributing.length === 0;

  return (
    <>
      <Header />
      <LeftNavigationBar />

      <div className="pm-page">
        <div className="pm-wrapper">
          <header className="pm-hero">
            <div>
              <p className="pm-eyebrow">Projects</p>
              <h1>Hello, {firstName}</h1>
              <p className="pm-hero-sub">
                Everything you lead and contribute to across your societies
              </p>
            </div>
          </header>

          {error && <p className="pm-error">{error}</p>}

          {loading ? (
            <div className="pm-card-grid">
              {[1, 2, 3].map((i) => <div key={i} className="pm-skeleton-card" />)}
            </div>
          ) : (
            <div className="pm-home-grid">
              {/* Left Column: Projects */}
              <div className="pm-home-projects">
                {/* Only appears for someone who is actually a project's chairperson. */}
                {led.length > 0 && (
                  <section className="pm-section is-highlighted">
                    <div className="pm-section-head">
                      <h2>
                        <span className="section-icon is-chair" aria-hidden="true">
                          <FaCrown />
                        </span>
                        Projects You Lead
                      </h2>
                      <span className="pm-count-pill">{led.length}</span>
                    </div>

                    <div className="pm-card-grid">
                      {led.map((p) => (
                        <ProjectCard key={p._id} project={p} variant="led" />
                      ))}
                    </div>
                  </section>
                )}

                {contributing.length > 0 && (
                  <section className="pm-section">
                    <div className="pm-section-head">
                      <h2>
                        <span className="section-icon" aria-hidden="true">
                          <FaUsers />
                        </span>
                        Projects You Contribute To
                      </h2>
                      <span className="pm-count-pill">{contributing.length}</span>
                    </div>

                    <div className="pm-card-grid">
                      {contributing.map((p) => (
                        <ProjectCard key={p._id} project={p} variant="contributing" />
                      ))}
                    </div>
                  </section>
                )}

                {nothingAtAll && (
                  <div className="pm-empty-state">
                    <span className="empty-icon" aria-hidden="true"><FaFolderOpen /></span>
                    <h3>No projects yet</h3>
                    <p>
                      You'll see a project here as soon as an admin adds you to
                      one, or names you its chairperson.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Pending & Active Tasks */}
              <aside className="pm-home-tasks">
                <MyTasksWidget />
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectsHome;
