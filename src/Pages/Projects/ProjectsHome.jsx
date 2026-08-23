import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { FaCrown, FaUsers, FaFolderOpen } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import ProjectCard from "../../Components/Projects/ProjectCard";
import MyTasksWidget from "../../Components/Projects/MyTasksWidget";

import { apiFetch } from "../../utils/api";
import { getUser, getRole } from "../../utils/auth";
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
  const { t } = useTranslation();
  const user = getUser();
  const role = getRole();

  if (role === "MEMBER") {
    return <Navigate to="/member/dashboard?tab=projects" replace />;
  }

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
      setError(e.message || t('projects.home.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
              <p className="pm-eyebrow">{t('projects.home.eyebrow')}</p>
              <h1>{t('projects.home.greeting', { name: firstName })}</h1>
              <p className="pm-hero-sub">
                {t('projects.home.subtitle')}
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
                        {t('projects.home.led')}
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
                        {t('projects.home.contributing')}
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
                    <h3>{t('projects.home.emptyTitle')}</h3>
                    <p>
                      {t('projects.home.emptyBody')}
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
