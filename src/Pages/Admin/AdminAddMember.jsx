import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import Toast from "../../Components/Toast/Toast";
import "../../SCSS/AdminStyles/AdminAddMember/AdminAddMember.scss";
import MemberAddFormComponent from "../../Components/AdminComponents/MemberAddFormComponent";
import TaskBar from "../../Components/SerachAnd/SearchAndButton";
import MemberViewAccountComponent from "../../Components/AdminComponents/MemberViewAccountComponent";
import "../../SCSS/AdminStyles/AdminViewAccount/AdminViewAccount.scss";

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
    setTimeout(() => setActiveView("view"), 300);
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      setMembersError("");

      const token = localStorage.getItem("token");

      // ✅ backend mount: app.use('/api/user', baseUserRoute)
      const res = await fetch(`${baseURL}/user/all`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // safe parse
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
    // local UI update (we will later connect to backend delete)
    setMembers((prev) => prev.filter((m) => m._id !== memberId && m.id !== memberId));
  };

  const handleMemberUpdated = (updatedMember) => {
    // local UI update (we will later connect to backend update)
    setMembers((prev) =>
      prev.map((m) => (m._id === updatedMember._id || m.id === updatedMember.id ? updatedMember : m))
    );
  };

  return (
    <div className="admin-add-member">
      <Header />
      <LeftNavigationBar />
      <Toast message="Account created successfully!" isVisible={showToast} duration={2000} />

      <div className="taskbar-wrapper">
        <TaskBar
          title1="Add New Member"
          title2="View Members"
          onAddClick={() => handleViewChange("add")}
          onViewClick={() => handleViewChange("view")}
          activeView={activeView}
        />
      </div>

      <div className="content-wrapper">
        {activeView === "add" && <MemberAddFormComponent onMemberAdded={handleMemberAdded} />}

        {activeView === "view" && (
          <MemberViewAccountComponent
            members={members}
            loading={loadingMembers}
            error={membersError}
            onMemberDeleted={handleMemberDeleted}
            onMemberUpdated={handleMemberUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default AdminAddMember;
