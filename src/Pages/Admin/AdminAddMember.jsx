import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import Toast from "../../Components/Toast/Toast";
import "../../SCSS/AdminStyles/AdminAddMember/AdminAddMember.scss";
import "../../SCSS/Projects/Projects.scss";
import MemberAddFormComponent from "../../Components/AdminComponents/MemberAddFormComponent";
import MemberViewAccountComponent from "../../Components/AdminComponents/MemberViewAccountComponent";
import { FaUserPlus, FaUsers } from "react-icons/fa";

const AdminAddMember = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("add");
  const [showToast, setShowToast] = useState(false);

  const baseURL = import.meta.env.VITE_API_URL; // ex: http://localhost:5000/api

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
      navigate("/");
      return;
    }

    try {
      const userObj = JSON.parse(userRaw);
      const role = (userObj?.userRole || userObj?.role || "").toUpperCase();
      if (role !== "ADMIN") {
        navigate("/admin-dashboard");
      }
    } catch {
      navigate("/");
    }
  }, [navigate]);

  // Handle URL Hash Navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "view" || hash === "list" || hash === "search") {
        setActiveView("view");
      } else if (hash === "add" || hash === "register" || hash === "new") {
        setActiveView("add");
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Fetch Members for Directory View
  const fetchMembers = async () => {
    setLoadingMembers(true);
    setMembersError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseURL}/user/all`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(t('admin.addMember.failedLoadMembers'));
      const json = await res.json();
      setMembers(json.data || []);
    } catch (err) {
      setMembersError(err.message || t('admin.addMember.failedLoadMembers'));
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (activeView === "view") {
      fetchMembers();
    }
  }, [activeView]);

  const handleViewChange = (view) => {
    setActiveView(view);
    window.location.hash = view;
  };

  const handleMemberAdded = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      handleViewChange("view");
    }, 1800);
  };

  const handleMemberDeleted = (deletedId) => {
    setMembers((prev) => prev.filter((m) => (m._id || m.id) !== deletedId));
  };

  const handleMemberUpdated = (updatedMember) => {
    const uId = updatedMember._id || updatedMember.id;
    setMembers((prev) =>
      prev.map((m) => ((m._id || m.id) === uId ? { ...m, ...updatedMember } : m))
    );
  };

  return (
    <div className="pm-page">
      <Header />
      <LeftNavigationBar />
      <Toast message={t('admin.addMember.toastCreated')} isVisible={showToast} duration={2200} />

      <div className="pm-wrapper">
        <header className="pm-hero">
          <div>
            <p className="pm-eyebrow">MANAGEMENT</p>
            <h1>{t('shell.nav.members', { defaultValue: 'Members' })}</h1>
            <p className="pm-hero-sub">
              {t('admin.addMember.subtitle', { defaultValue: 'Register and manage all member accounts and user profiles' })}
            </p>
          </div>
        </header>

        {/* Top Underline Indicator Navigation Bar (Matching Committees tab navigation) */}
        <header className="member-navigation-header">
          <nav className="underline-tab-bar" aria-label={t('admin.addMember.navLabel')}>
            <button
              type="button"
              className={`underline-tab ${activeView === "add" ? "active" : ""}`}
              onClick={() => handleViewChange("add")}
            >
              <FaUserPlus className="tab-icon" />
              <span className="tab-text">{t('admin.addMember.addNewMember')}</span>
              {activeView === "add" && <span className="active-underline" />}
            </button>

            <button
              type="button"
              className={`underline-tab ${activeView === "view" ? "active" : ""}`}
              onClick={() => handleViewChange("view")}
            >
              <FaUsers className="tab-icon" />
              <span className="tab-text">{t('admin.addMember.viewMembers')}</span>
              {members.length > 0 && <span className="tab-count-pill">{members.length}</span>}
              {activeView === "view" && <span className="active-underline" />}
            </button>
          </nav>
        </header>

        {/* Dynamic Content View */}
        <section className="member-content-section">
          {activeView === "add" && <MemberAddFormComponent onMemberAdded={handleMemberAdded} />}

          {activeView === "view" && (
            <div className="member-directory-wrapper">
              <MemberViewAccountComponent
                members={members}
                loading={loadingMembers}
                error={membersError}
                onMemberDeleted={handleMemberDeleted}
                onMemberUpdated={handleMemberUpdated}
                onAddMemberClick={() => handleViewChange("add")}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminAddMember;
