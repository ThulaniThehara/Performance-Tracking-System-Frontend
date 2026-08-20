// import React from 'react'
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import LeftNavigationBar from '../../Components/LeftNavigationBar/LeftNavigationBar'
import Header from '../../Components/Header/Header'
import TaskBar from '../../Components/SerachAnd/SearchAndButton'
import Toast from '../../Components/Toast/Toast'
import "../../SCSS/AdminStyles/AdminViewAccount/AdminViewAccount.scss"
import LeftNavChair from '../../Components/chair Component/LeftNavChair'
import MemberViewAccountComponent from '../../Components/AdminComponents/MemberViewAccountComponent'
import AdminAddMember from './AdminAddMember'
import MemberAddFormComponent from '../../Components/AdminComponents/MemberAddFormComponent'

const AdminViewAccount = () => {
  const navigate = useNavigate()

  const [activeView, setActiveView] = useState('add');
  const [showToast, setShowToast] = useState(false);
  const [members, setMembers] = useState([
    { id: 1, avatar: "https://i.pravatar.cc/80?img=12", name: "Aisha Khan", email: "aisha.khan@example.com", contactNumber: "03001234567", gender: "female", dob: "1998-05-15", department: "Engineering", batch: "2022", role: "Administrator", status: "active", registeredAt: "2025-02-10T09:22:00Z" },
    { id: 2, avatar: "https://i.pravatar.cc/80?img=5", name: "Daniel Smith", email: "daniel.smith@example.com", contactNumber: "03009876543", gender: "male", dob: "1997-08-22", department: "Science", batch: "2021", role: "Member", status: "inactive", registeredAt: "2024-11-03T11:12:00Z" },
    { id: 3, avatar: "", name: "Fatima Ali", email: "fatima.ali@example.com", contactNumber: "03005555555", gender: "female", dob: "1999-03-10", department: "Arts", batch: "2023", role: "Moderator", status: "active", registeredAt: "2025-05-16T14:40:00Z" },
  ]);
  
  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleMemberAdded = (newMember) => {
    const memberWithId = {
      ...newMember,
      id: Math.max(...members.map(m => m.id), 0) + 1,
      avatar: "https://i.pravatar.cc/80?img=" + Math.floor(Math.random() * 70),
      role: "Member",
      status: "active",
      registeredAt: new Date().toISOString()
    };
    setMembers([...members, memberWithId]);
    setShowToast(true);
    setTimeout(() => {
      setActiveView('view');
    }, 500);
  };
  
  const handleMemberDeleted = (memberId) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  const handleMemberUpdated = (updatedMember) => {
    setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
  };


  const handleTaskBarClick = (buttonType) => {
    if (buttonType === 'title1') {
      navigate('/admin/add-member')
    } else if (buttonType === 'title2') {
      navigate('/admin/view-account')
    }
  }

  return (
    <div className="admin-view-account">
      <Header />
      <LeftNavigationBar />
      <Toast message="Account created successfully!" isVisible={showToast} duration={2000} />
      <div className='taskbar-wrapper'>
        <TaskBar
          title1="Add New Member"
          title2="View Members"
          onAddClick={() => handleViewChange('add')}
          onViewClick={() => handleViewChange('view')}
          activeView={activeView}
        />
      </div>
      <div className='content-wrapper'>
      {activeView === 'add' && <MemberAddFormComponent onMemberAdded={handleMemberAdded} />}
      {activeView === 'view' && <MemberViewAccountComponent members={members} onMemberDeleted={handleMemberDeleted} onMemberUpdated={handleMemberUpdated} />}
      </div>
    </div>
  )
}

export default AdminViewAccount
