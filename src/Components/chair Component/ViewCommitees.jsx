import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaTimes, FaSearch, FaFolderOpen, FaUsers, FaFilter } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../ConfirmationComponent/ConfirmDialog';
import '../../SCSS/ChairStyle/ViewCommittees.scss';

const ViewCommittees = ({ projectId: propProjectId }) => {
    const { t } = useTranslation();
    const [committees, setCommittees] = useState([]);
    const [projects, setProjects] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedProjectId, setSelectedProjectId] = useState(propProjectId || "all");
    const [searchFilter, setSearchFilter] = useState("");

    // Add member drawer state
    const [showAddMember, setShowAddMember] = useState(null);
    const [memberSearchQuery, setMemberSearchQuery] = useState("");
    const [filteredAddMembers, setFilteredAddMembers] = useState([]);
    
    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        committeeId: null,
        committeeName: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([
            fetchCommittees(),
            fetchProjects(),
            fetchAllMembers()
        ]);
        setLoading(false);
    };

    const fetchCommittees = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/committee/all');
            setCommittees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching committees:', error);
            toast.error(t('viewCommittees.loadFailed', { defaultValue: 'Failed to load committees' }));
            setCommittees([]);
        }
    };

    const fetchProjects = async () => {
        try {
            let response;
            try {
                response = await axios.get("http://localhost:5000/api/project/get");
            } catch (err) {
                response = await axios.get("http://localhost:5000/api/project/all");
            }
            const projectList = response.data.data || response.data || [];
            if (Array.isArray(projectList)) {
                setProjects(projectList);
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const fetchAllMembers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/user/all");
            setAllMembers(response.data.data || []);
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    // Helper map of project IDs to Project Names
    const projectMap = useMemo(() => {
        const map = {};
        projects.forEach(p => {
            const id = p._id || p.id;
            const name = p.PName || p.projectName || p.title;
            if (id && name) map[id] = name;
        });
        return map;
    }, [projects]);

    const getProjectName = (projRef) => {
        if (!projRef) return null;
        if (typeof projRef === 'string') return projectMap[projRef] || null;
        if (typeof projRef === 'object') return projRef.PName || projRef.projectName || projectMap[projRef._id] || null;
        return null;
    };

    // Member search inside add-member modal
    useEffect(() => {
        if (memberSearchQuery.trim() === "") {
            setFilteredAddMembers([]);
        } else {
            const q = memberSearchQuery.toLowerCase();
            const filtered = allMembers.filter(
                (member) =>
                    member.name?.toLowerCase().includes(q) ||
                    member.email?.toLowerCase().includes(q)
            );
            setFilteredAddMembers(filtered);
        }
    }, [memberSearchQuery, allMembers]);

    const handleAddMember = async (committeeId, member) => {
        try {
            await axios.post(
                `http://localhost:5000/api/committee/${committeeId}/members`,
                {
                    userId: member._id,
                    userName: member.name,
                    role: "Member"
                }
            );

            // Update local state
            setCommittees(committees.map(committee => 
                committee._id === committeeId
                    ? {
                        ...committee,
                        Members: [...(committee.Members || []), {
                            _id: Date.now().toString(),
                            UserId: member._id,
                            UserName: member.name,
                            Role: "Member"
                        }]
                    }
                    : committee
            ));

            toast.success(t('viewCommittees.memberAdded', { name: member.name, defaultValue: `Added ${member.name}` }));
            setMemberSearchQuery("");
            setShowAddMember(null);
        } catch (error) {
            console.error('Error adding member:', error);
            toast.error(error.response?.data?.message || t('viewCommittees.addMemberFailed', { defaultValue: 'Failed to add member' }));
        }
    };

    const handleRemoveMember = async (committeeId, memberId) => {
        try {
            await axios.delete(
                `http://localhost:5000/api/committee/${committeeId}/members`,
                {
                    data: { memberId: memberId }
                }
            );

            // Update local state
            setCommittees(committees.map(committee => 
                committee._id === committeeId
                    ? {
                        ...committee,
                        Members: (committee.Members || []).filter(m => m._id !== memberId)
                    }
                    : committee
            ));

            toast.success(t('viewCommittees.memberRemoved', { defaultValue: 'Member removed' }));
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error(error.response?.data?.message || t('viewCommittees.removeMemberFailed', { defaultValue: 'Failed to remove member' }));
        }
    };

    // Open confirmation dialog
    const openDeleteConfirmation = (committeeId, committeeName) => {
        setConfirmDialog({
            isOpen: true,
            committeeId,
            committeeName
        });
    };

    // Close confirmation dialog
    const closeDeleteConfirmation = () => {
        setConfirmDialog({
            isOpen: false,
            committeeId: null,
            committeeName: ''
        });
    };

    // Confirm and delete committee
    const confirmDeleteCommittee = async () => {
        const { committeeId } = confirmDialog;
        try {
            await axios.delete(`http://localhost:5000/api/committee/${committeeId}`);
            setCommittees(committees.filter(committee => committee._id !== committeeId));
            toast.success(t('viewCommittees.deletedSuccess', { defaultValue: 'Committee deleted successfully' }));
            closeDeleteConfirmation();
        } catch (error) {
            console.error('Error deleting committee:', error);
            toast.error(error.response?.data?.message || t('viewCommittees.deleteFailed', { defaultValue: 'Failed to delete committee' }));
            closeDeleteConfirmation();
        }
    };

    const toggleAddMember = (committeeId) => {
        setShowAddMember(showAddMember === committeeId ? null : committeeId);
        setMemberSearchQuery("");
    };

    // Filter committees by project and search query
    const filteredCommittees = useMemo(() => {
        return committees.filter(committee => {
            const committeeProjId = committee.projectId || committee.ProjectId || (typeof committee.Project === 'object' ? committee.Project?._id : committee.Project);
            
            // 1. Project filter
            if (selectedProjectId && selectedProjectId !== "all") {
                const matches = committeeProjId === selectedProjectId || 
                                (typeof committeeProjId === 'object' && committeeProjId?._id === selectedProjectId);
                if (!matches) return false;
            }

            // 2. Search query filter
            if (!searchFilter.trim()) return true;
            const q = searchFilter.toLowerCase();
            
            const nameMatch = committee.CName?.toLowerCase().includes(q);
            const descMatch = committee.Description?.toLowerCase().includes(q);
            
            const projName = (getProjectName(committeeProjId) || "").toLowerCase();
            const projMatch = projName.includes(q);

            const memberMatch = committee.Members?.some(m => 
                m.UserName?.toLowerCase().includes(q) || m.Role?.toLowerCase().includes(q)
            );

            return nameMatch || descMatch || projMatch || memberMatch;
        });
    }, [committees, selectedProjectId, searchFilter, projectMap]);

    if (loading) {
        return (
            <div className="view-committees-loading">
                <div className="spinner-large"></div>
                <p>{t('viewCommittees.loading', { defaultValue: 'Loading committees...' })}</p>
            </div>
        );
    }

    return (
        <div className="view-committees-container">
            <ToastContainer />
            
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={t('viewCommittees.deleteDialog.title', { defaultValue: 'Delete Committee' })}
                message={t('viewCommittees.deleteDialog.message', { name: confirmDialog.committeeName, defaultValue: `Are you sure you want to delete ${confirmDialog.committeeName}?` })}
                onConfirm={confirmDeleteCommittee}
                onCancel={closeDeleteConfirmation}
                confirmText={t('projectsTable.deleteDialog.confirm', { defaultValue: 'Delete' })}
                cancelText={t('common.cancel', { defaultValue: 'Cancel' })}
            />

            {/* Filter and Search Bar Header */}
            <div className="committees-filter-bar">
                <div className="filter-group">
                    <label className="filter-label">
                        <FaFolderOpen className="icon" />
                        <span>Filter by Project:</span>
                    </label>
                    <select
                        className="project-filter-select"
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                        <option value="all">📂 All Projects ({projects.length})</option>
                        {projects.map((proj) => {
                            const pId = proj._id || proj.id;
                            const pName = proj.PName || proj.projectName || proj.title;
                            return (
                                <option key={pId} value={pId}>
                                    {pName}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="search-filter-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-filter-input"
                        placeholder="Search by Committee, Project or Member name..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                    />
                    {searchFilter && (
                        <button className="clear-filter-btn" onClick={() => setSearchFilter("")}>
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="filter-stats-badge">
                    <span>Showing <strong>{filteredCommittees.length}</strong> of {committees.length} committees</span>
                </div>
            </div>

            {filteredCommittees.length === 0 ? (
                <div className="no-committees">
                    <p>{searchFilter || selectedProjectId !== "all" 
                        ? "No committees found matching your filter criteria." 
                        : t('viewCommittees.noCommittees', { defaultValue: 'No committees created yet.' })}
                    </p>
                </div>
            ) : (
                <div className="committees-grid">
                    {filteredCommittees.map((committee) => {
                        const committeeProjId = committee.projectId || committee.ProjectId || committee.Project;
                        const projName = getProjectName(committeeProjId);

                        return (
                            <div key={committee._id} className="committee-card">
                                {projName && (
                                    <div className="project-badge-tag">
                                        <FaFolderOpen className="tag-icon" />
                                        <span>{projName}</span>
                                    </div>
                                )}

                                <div className="committee-header">
                                    <h3>{committee.CName}</h3>
                                    <button
                                        className="btn-delete-committee"
                                        onClick={() => openDeleteConfirmation(committee._id, committee.CName)}
                                        title={t('viewCommittees.deleteCommitteeTitle', { defaultValue: 'Delete Committee' })}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                                
                                <div className="committee-description">
                                    <p>{committee.Description}</p>
                                </div>

                                <div className="committee-members">
                                    <div className="members-header">
                                        <FaUsers className="header-icon" />
                                        <span>Committee Members ({committee.Members?.length || 0})</span>
                                    </div>

                                    <div className="members-list">
                                        {committee.Members && committee.Members.length > 0 ? (
                                            committee.Members.map((member) => (
                                                <div key={member._id || member.UserId} className="member-item">
                                                    <div className="member-info">
                                                        <div className="member-avatar">
                                                            {member.UserName?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="member-name-block">
                                                            <span className="member-name">{member.UserName}</span>
                                                            {member.Role && <span className="member-role">{member.Role}</span>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="btn-remove-member"
                                                        onClick={() => handleRemoveMember(committee._id, member._id || member.UserId)}
                                                        title={t('viewCommittees.removeMemberTitle', { defaultValue: 'Remove Member' })}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-members">{t('projects.memberList.noMembersYet', { defaultValue: 'No members assigned yet' })}</p>
                                        )}
                                    </div>

                                    <button
                                        className="btn-add-member"
                                        onClick={() => toggleAddMember(committee._id)}
                                    >
                                        <FaPlus /> {t('viewCommittees.addMemberBtn', { defaultValue: 'Add Member to Committee' })}
                                    </button>

                                    {/* Add Member Search Drawer */}
                                    {showAddMember === committee._id && (
                                        <div className="add-member-section">
                                            <div className="search-input-wrapper">
                                                <FaSearch className="search-icon" />
                                                <input
                                                    type="text"
                                                    placeholder="Type user name or email to add..."
                                                    value={memberSearchQuery}
                                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                                    className="search-input"
                                                    autoComplete="off"
                                                />
                                                {memberSearchQuery && (
                                                    <button
                                                        className="clear-search"
                                                        onClick={() => setMemberSearchQuery("")}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                )}
                                            </div>

                                            {filteredAddMembers.length > 0 && (
                                                <div className="search-results">
                                                    {filteredAddMembers
                                                        .filter(member => 
                                                            !committee.Members?.some(m => m.UserId === member._id)
                                                        )
                                                        .map((member) => (
                                                            <div
                                                                key={member._id}
                                                                className="search-result-item"
                                                                onClick={() => handleAddMember(committee._id, member)}
                                                            >
                                                                <div className="member-avatar-small">
                                                                    {member.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="member-details">
                                                                    <div className="member-name">{member.name}</div>
                                                                    <div className="member-email">{member.email}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ViewCommittees;