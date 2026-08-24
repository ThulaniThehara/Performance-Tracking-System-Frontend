import { useTranslation } from "react-i18next";
import { FaPlus, FaSearch } from "react-icons/fa";
import "../../SCSS/AdminStyles/AdminCommitees/Manage Committees.scss";
import "../../SCSS/AdminStyles/AdminAddMember/AdminAddMember.scss";
import "../../SCSS/Projects/Projects.scss";
import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import { useState } from "react";
import AddCommitteeForm from "../../Components/chair Component/AddCommitteeForm";
import ViewCommittees from "../../Components/chair Component/ViewCommitees";

const ManageCommittees = () => {
    const { t } = useTranslation();
    const [activeView, setActiveView] = useState('add');
      
    const handleViewChange = (view) => {
      setActiveView(view);
    };
  
    const handleCommitteeAdded = () => {
      setActiveView('view');
    };
    
    return (
        <div className="pm-page">
            <Header/>
            <LeftNavigationBar/>
            <div className="pm-wrapper">
              <header className="pm-hero">
                <div>
                  <p className="pm-eyebrow">MANAGEMENT</p>
                  <h1>{t('shell.nav.committees', { defaultValue: 'Committees' })}</h1>
                  <p className="pm-hero-sub">
                    {t('admin.committees.subtitle', { defaultValue: 'Organize society committees and assign heads & members' })}
                  </p>
                </div>
              </header>

              {/* Top Underline Indicator Navigation Bar (Matching Member tab navigation) */}
              <header className="member-navigation-header">
                <nav className="underline-tab-bar" aria-label="Committees Navigation">
                  <button
                    type="button"
                    className={`underline-tab ${activeView === "add" ? "active" : ""}`}
                    onClick={() => handleViewChange("add")}
                  >
                    <FaPlus className="tab-icon" />
                    <span className="tab-text">{t('admin.committees.addTitle', { defaultValue: 'Add New Committees' })}</span>
                    {activeView === "add" && <span className="active-underline" />}
                  </button>

                  <button
                    type="button"
                    className={`underline-tab ${activeView === "view" ? "active" : ""}`}
                    onClick={() => handleViewChange("view")}
                  >
                    <FaSearch className="tab-icon" />
                    <span className="tab-text">{t('admin.committees.searchTitle', { defaultValue: 'Search Committee' })}</span>
                    {activeView === "view" && <span className="active-underline" />}
                  </button>
                </nav>
              </header>

              <div className='content-wrapper' style={{ padding: 0 }}>
                {activeView === 'add' && <AddCommitteeForm onCommitteeAdded={handleCommitteeAdded} />}
                {activeView === 'view' && <ViewCommittees />}
              </div>
            </div>
       </div>
    );
}

export default ManageCommittees;