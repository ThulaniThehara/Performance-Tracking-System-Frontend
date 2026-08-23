import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaSearch } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../ConfirmationComponent/ConfirmDialog';
import '../../SCSS/ChairStyle/ViewCommittees.scss';

const ViewCommittees = ({ projectId }) => {
    const { t } = useTranslation();
    const [committees, setCommittees] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCommitteeId, setEditingCommitteeId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [showAddMember, setShowAddMember] = useState(null);
    
    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        committeeId: null,
        committeeName: ''
    });

    useEffect(() => {
        fetchCommittees();
        fetchAllMembers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredMembers([]);
        } else {
            const filtered = allMembers.filter(
                (member) =>
                    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredMembers(filtered);
        }
    }, [searchQuery, allMembers]);

    const fetchCommittees = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/committee/all');
            setCommittees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching committees:', error);
            toast.error(t('viewCommittees.loadFailed'));
            setCommittees([]);
        } finally {
            setLoading(false);
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

    const handleAddMember = async (committeeId, member) => {
        try {
            const response = await axios.post(
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
                        Members: [...committee.Members, {
                            _id: Date.now().toString(),
                            UserId: member._id,
                            UserName: member.name,
                            Role: "Member"
                        }]
                    }
                    : committee
            ));

            toast.success(t('viewCommittees.memberAdded', { name: member.name }));
            setSearchQuery("");
            setShowAddMember(null);
        } catch (error) {
            console.error('Error adding member:', error);
            toast.error(error.response?.data?.message || t('viewCommittees.addMemberFailed'));
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
                        Members: committee.Members.filter(m => m._id !== memberId)
                    }
                    : committee
            ));

            toast.success(t('viewCommittees.memberRemoved'));
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error(error.response?.data?.message || t('viewCommittees.removeMemberFailed'));
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

            // Remove from local state
            setCommittees(committees.filter(committee => committee._id !== committeeId));

            toast.success(t('viewCommittees.deletedSuccess'));
            closeDeleteConfirmation();
        } catch (error) {
            console.error('Error deleting committee:', error);
            toast.error(error.response?.data?.message || t('viewCommittees.deleteFailed'));
            closeDeleteConfirmation();
        }
    };

    const toggleAddMember = (committeeId) => {
        setShowAddMember(showAddMember === committeeId ? null : committeeId);
        setSearchQuery("");
    };

    if (loading) {
        return (
            <div className="view-committees-loading">
                <div className="spinner-large"></div>
                <p>{t('viewCommittees.loading')}</p>
            </div>
        );
    }

    return (
        <div className="view-committees-container">
            <ToastContainer />
            
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={t('viewCommittees.deleteDialog.title')}
                message={t('viewCommittees.deleteDialog.message', { name: confirmDialog.committeeName })}
                onConfirm={confirmDeleteCommittee}
                onCancel={closeDeleteConfirmation}
                confirmText={t('projectsTable.deleteDialog.confirm')}
                cancelText={t('common.cancel')}
            />

            {committees.length === 0 ? (
                <div className="no-committees">
                    <p>{t('viewCommittees.noCommittees')}</p>
                </div>
            ) : (
                <div className="committees-grid">
                    {committees.map((committee) => (
                        <div key={committee._id} className="committee-card">
                            <div className="committee-header">
                                <h3>{committee.CName}</h3>
                                <button
                                    className="btn-delete-committee"
                                    onClick={() => openDeleteConfirmation(committee._id, committee.CName)}
                                    title={t('viewCommittees.deleteCommitteeTitle')}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                            
                            <div className="committee-description">
                                <p>{committee.Description}</p>
                            </div>

                            <div className="committee-members">
                                <div className="members-header">
                                    <span>{t('viewCommittees.membersHeader', { count: committee.Members?.length || 0 })}</span>
                                </div>

                                <div className="members-list">
                                    {committee.Members && committee.Members.length > 0 ? (
                                        committee.Members.map((member) => (
                                            <div key={member._id} className="member-item">
                                                <div className="member-info">
                                                    <div className="member-avatar">
                                                        {member.UserName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="member-name">{member.UserName}</span>
                                                </div>
                                                <button
                                                    className="btn-remove-member"
                                                    onClick={() => handleRemoveMember(committee._id, member._id)}
                                                    title={t('viewCommittees.removeMemberTitle')}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-members">{t('projects.memberList.noMembersYet')}</p>
                                    )}

                                    {/* Empty slots for visual effect */}
                                    {committee.Members && committee.Members.length < 4 && (
                                        Array.from({ length: 4 - committee.Members.length }).map((_, index) => (
                                            <div key={`empty-${index}`} className="member-item empty-slot">
                                                <div className="empty-placeholder"></div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <button
                                    className="btn-add-member"
                                    onClick={() => toggleAddMember(committee._id)}
                                >
                                    <FaPlus /> {t('viewCommittees.addMemberBtn')}
                                </button>

                                {/* Add Member Search */}
                                {showAddMember === committee._id && (
                                    <div className="add-member-section">
                                        <div className="search-input-wrapper">
                                            <FaSearch className="search-icon" />
                                            <input
                                                type="text"
                                                placeholder={t('memberView.searchPlaceholder')}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="search-input"
                                                autoComplete="off"
                                            />
                                            {searchQuery && (
                                                <button
                                                    className="clear-search"
                                                    onClick={() => setSearchQuery("")}
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>

                                        {filteredMembers.length > 0 && (
                                            <div className="search-results">
                                                {filteredMembers
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
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewCommittees;