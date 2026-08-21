import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import Toast from "../../Components/Toast/Toast";
import "../../SCSS/AdminStyles/AdminAddMember/AdminAddMember.scss";
import MemberAddFormComponent from "../../Components/AdminComponents/MemberAddFormComponent";
import MemberViewAccountComponent from "../../Components/AdminComponents/MemberViewAccountComponent";
import { FaPlus, FaSearch } from "react-icons/fa";

const AdminAddMember = () => {
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("add");
  const [showToast, setShowToast] = useState(false);

  const baseURL = import.meta.env.VITE_API_URL; // ex: http://localhost:5000/api

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState("");

  // ✅ AUTH CHECK (ADMIN ONLY)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
      navigate("/", { replace: true });
      return;
    }

    let user = null;
    try {
      user = JSON.parse(userRaw);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/", { replace: true });
      return;
    }

    const role = String(user?.role || user?.userRole || "").toUpperCase();
    if (role !== "ADMIN") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === "view") fetchMembers(); // refresh when switching to view
  };

  const handleMemberAdded = async () => {
    setShowToast(true);
    await fetchMembers();
    setTimeout(() => setActiveView("view"), 400);
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      setMembersError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`${baseURL}/user/all`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setMembersError(data?.message || "Failed to load members");
        setMembers([]);
        return;
      }

      const list = Array.isArray(data) ? data : data?.data || [];
      setMembers(list);
    } catch (e) {
      setMembersError("Server error while loading members");
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  // initial fetch
  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMemberDeleted = (memberId) => {
    setMembers((prev) => prev.filter((m) => m._id !== memberId && m.id !== memberId));
  };

  const handleMemberUpdated = (updatedMember) => {
    setMembers((prev) =>
      prev.map((m) => (m._id === updatedMember._id || m.id === updatedMember.id ? updatedMember : m))
    );
  };

  return (
    <div className="admin-add-member-page">
      <Header />
      <LeftNavigationBar />
      <Toast message="Member account created successfully!" isVisible={showToast} duration={2200} />

      <main className="admin-add-member-main">
        <div className="admin-member-container">
          {/* Top Segmented TaskBar (Matching screenshot style) */}
          <header className="member-navigation-header">
            <div className="member-segmented-taskbar" role="tablist">
              <button
                type="button"
                className={`tab-segment ${activeView === "add" ? "active" : ""}`}
                onClick={() => handleViewChange("add")}
                role="tab"
                aria-selected={activeView === "add"}
              >
                <FaPlus className="segment-icon" />
                <span className="segment-text">Add Member</span>
              </button>

              <button
                type="button"
                className={`tab-segment ${activeView === "view" ? "active" : ""}`}
                onClick={() => handleViewChange("view")}
                role="tab"
                aria-selected={activeView === "view"}
              >
                <FaSearch className="segment-icon" />
                <span className="segment-text">View Members</span>
                {members.length > 0 && <span className="segment-count">({members.length})</span>}
              </button>
            </div>
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
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminAddMember;
