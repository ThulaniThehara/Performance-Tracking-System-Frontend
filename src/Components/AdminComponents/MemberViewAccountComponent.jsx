import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../ConfirmationComponent/ConfirmDialog";
import "../../SCSS/AdminStyles/AdminViewAccount/AdminViewAccount.scss";
import "../../SCSS/componentStyle/MemberViewModal.scss";
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaUserGraduate,
  FaEnvelope,
  FaPhoneAlt,
  FaIdCard,
  FaTimes,
  FaCheck,
  FaPlus,
  FaUserShield,
  FaCalendarAlt,
  FaBuilding,
} from "react-icons/fa";

const MemberViewAccountComponent = ({
  members = [],
  loading = false,
  error = "",
  onMemberDeleted,
  onMemberUpdated,
  onAddMemberClick,
}) => {
  const { t } = useTranslation();
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRows, setSelectedRows] = useState({});

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Avatar background generator (Sleek black & dark slate minimalist)
  const getAvatarGradient = (name = "") => {
    const backgrounds = [
      "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
      "linear-gradient(135deg, #334155 0%, #475569 100%)",
      "linear-gradient(135deg, #090d16 0%, #1e293b 100%)",
      "linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % backgrounds.length;
    return backgrounds[index];
  };

  // Statistics calculation
  const totalCount = members.length;
  const chairpersonCount = members.filter((m) => (m.userRole || "").toUpperCase() === "CHAIRPERSON").length;
  const regularCount = members.filter((m) => (m.userRole || "").toUpperCase() === "MEMBER").length;

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (m.name || "").toLowerCase().includes(term) ||
        (m.email || "").toLowerCase().includes(term) ||
        (m.indexNo || "").toLowerCase().includes(term) ||
        (m.faculy || m.faculty || "").toLowerCase().includes(term) ||
        (m.batch || "").toLowerCase().includes(term);

      const role = (m.userRole || "MEMBER").toUpperCase();

      let matchesTab = true;
      if (activeTab === "chairperson") matchesTab = role === "CHAIRPERSON";
      else if (activeTab === "member") matchesTab = role === "MEMBER";

      return matchesSearch && matchesTab;
    });
  }, [members, searchTerm, activeTab]);

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    const newSelected = {};
    if (checked) {
      filteredMembers.forEach((m) => {
        const id = m._id || m.id || m.indexNo;
        newSelected[id] = true;
      });
    }
    setSelectedRows(newSelected);
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleViewClick = (member) => {
    setSelectedMember(member);
    setEditFormData({ ...member });
    setIsEditMode(false);
  };

  const handleEditClick = (member) => {
    setSelectedMember(member);
    setEditFormData({ ...member });
    setIsEditMode(true);
  };

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete && onMemberDeleted) {
      onMemberDeleted(memberToDelete._id || memberToDelete.id);
    }
    setShowConfirmDelete(false);
    setMemberToDelete(null);
    setSelectedMember(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
    setMemberToDelete(null);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    setIsEditMode(false);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    if (onMemberUpdated && editFormData) {
      onMemberUpdated(editFormData);
    }
    setSelectedMember(null);
    setIsEditMode(false);
  };

  return (
    <div className="members-dashboard-view">
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title={t('memberView.deleteDialog.title')}
        message={t('memberView.deleteDialog.message', { name: memberToDelete?.name })}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText={t('memberView.deleteDialog.confirm')}
        cancelText={t('common.cancel')}
      />

      {/* 1. Header Row */}
      <div className="view-page-header">
        <div className="header-left-title">
          <h1>{t('memberView.listTitle')}</h1>
        </div>
        <div className="header-right-action">
        </div>
      </div>


      {/* 3. Filter Nav Tabs & Search (3 Tabs) */}
      <div className="filter-navigation-bar">
        <div className="filter-tabs-left">
          <button
            type="button"
            className={`filter-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            {t('memberView.tabs.all')}
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === "chairperson" ? "active" : ""}`}
            onClick={() => setActiveTab("chairperson")}
          >
            {t('memberView.tabs.chairpersons')}
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === "member" ? "active" : ""}`}
            onClick={() => setActiveTab("member")}
          >
            {t('memberView.tabs.members')}
          </button>
        </div>

        <div className="search-box-right">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={t('memberView.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button type="button" className="clear-search-btn" onClick={() => setSearchTerm("")}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="view-loading-box">
          <div className="view-spinner" />
          <p>{t('memberView.loadingDirectory')}</p>
        </div>
      )}

      {!loading && error && (
        <div className="view-error-box">
          <p>{error}</p>
        </div>
      )}

      {/* 4. Card-Style Rows Table (Matching Reference Image) */}
      {!loading && !error && (
        <div className="table-card-container">
          <div className="table-responsive-wrapper">
            <table className="reference-styled-table" role="table">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>{t('memberView.table.indexId')}</th>
                  <th style={{ width: 125 }}>{t('memberView.table.joinedDate')}</th>
                  <th style={{ minWidth: 210 }}>{t('memberView.table.memberName')}</th>
                  <th style={{ minWidth: 150 }}>{t('memberView.table.faculty')}</th>
                  <th style={{ width: 95 }}>{t('memberView.table.batch')}</th>
                  <th style={{ width: 115 }} className="text-center">{t('memberView.table.role')}</th>
                  <th style={{ width: 110 }} className="text-center">{t('memberView.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m) => {
                    const rowId = m._id || m.id || m.indexNo;
                    return (
                      <tr key={rowId} className="card-table-row">
                        {/* Index ID */}
                        <td>
                          <span className="index-id-text">{m.indexNo || t('memberView.table.notApplicable')}</span>
                        </td>

                        {/* Joined Date */}
                        <td>
                          <span className="date-cell-text">{formatDate(m.createdAt)}</span>
                        </td>

                        {/* Member Avatar + Name + Email */}
                        <td>
                          <div className="customer-profile-cell">
                            <div
                              className="avatar-circle"
                              style={{ background: getAvatarGradient(m.name) }}
                            >
                              {getInitials(m.name)}
                            </div>
                            <div className="name-email-box">
                              <span className="customer-name">{m.name}</span>
                              <span className="customer-email">{m.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Faculty */}
                        <td>
                          <span className="faculty-badge">{m.faculy || m.faculty || t('memberView.table.generalFaculty')}</span>
                        </td>

                        {/* Batch */}
                        <td>
                          <span className="batch-badge">{m.batch ? t('memberView.table.batchValue', { n: m.batch }) : "—"}</span>
                        </td>

                        {/* Role Dropdown / Pill */}
                        <td className="text-center">
                          <span className={`role-pill-badge ${(m.userRole || "MEMBER").toLowerCase()}`}>
                            {m.userRole === "ADMIN" || m.userRole === "CHAIRPERSON" ? <FaUserShield /> : <FaUserGraduate />}
                            <span>{t(`enums.role.${(m.userRole || 'MEMBER').toUpperCase()}`, { defaultValue: m.userRole || 'MEMBER' })}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="text-center">
                          <div className="row-actions-flex">
                            <button
                              type="button"
                              className="row-action-btn view"
                              onClick={() => handleViewClick(m)}
                              title={t('memberView.actions.viewDetails')}
                            >
                              <FaEye />
                            </button>
                            <button
                              type="button"
                              className="row-action-btn edit"
                              onClick={() => handleEditClick(m)}
                              title={t('memberView.actions.editMember')}
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              className="row-action-btn delete"
                              onClick={() => handleDeleteClick(m)}
                              title={t('memberView.actions.deleteMember')}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-table-row">
                      <div className="empty-results-box">
                        <FaSearch className="empty-icon" />
                        <h3>{t('memberView.emptyResults.title')}</h3>
                        <p>{t('memberView.emptyResults.body')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member Details / Edit Modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modern-member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-profile">
                <div
                  className="modal-avatar-badge"
                  style={{ background: getAvatarGradient(selectedMember.name) }}
                >
                  {getInitials(selectedMember.name)}
                </div>
                <div>
                  <h2 className="modal-member-name">{selectedMember.name}</h2>
                  <span className="modal-role-tag">{t(`enums.role.${(selectedMember.userRole || 'MEMBER').toUpperCase()}`, { defaultValue: selectedMember.userRole || 'MEMBER' })}</span>
                </div>
              </div>
              <button type="button" className="modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {!isEditMode ? (
                <div className="member-details-grid">
                  <div className="detail-card">
                    <div className="detail-icon-wrap"><FaIdCard /></div>
                    <div className="detail-info">
                      <span className="detail-label">{t('memberView.detail.indexId')}</span>
                      <span className="detail-value">{selectedMember.indexNo || "—"}</span>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-icon-wrap"><FaEnvelope /></div>
                    <div className="detail-info">
                      <span className="detail-label">{t('memberView.detail.email')}</span>
                      <span className="detail-value email-value">{selectedMember.email}</span>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-icon-wrap"><FaPhoneAlt /></div>
                    <div className="detail-info">
                      <span className="detail-label">{t('memberView.detail.contact')}</span>
                      <span className="detail-value">{selectedMember.contactNO || "—"}</span>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-icon-wrap"><FaBuilding /></div>
                    <div className="detail-info">
                      <span className="detail-label">{t('memberView.detail.faculty')}</span>
                      <span className="detail-value">{selectedMember.faculy || selectedMember.faculty || "—"}</span>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-icon-wrap"><FaUserGraduate /></div>
                    <div className="detail-info">
                      <span className="detail-label">{t('memberView.detail.batch')}</span>
                      <span className="detail-value">{t('memberView.detail.batchValue', { n: selectedMember.batch || "—" })}</span>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-icon-wrap"><FaCalendarAlt /></div>
                    <div className="detail-info">
                      <span className="detail-label">{t('memberView.detail.registrationDate')}</span>
                      <span className="detail-value">{formatDate(selectedMember.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form className="modern-modal-edit-form" onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
                  <div className="modal-form-grid">
                    <div className="modal-field">
                      <label>{t('memberView.editForm.fullName')}</label>
                      <input
                        name="name"
                        value={editFormData?.name || ""}
                        onChange={handleEditInputChange}
                        className="modern-input"
                        required
                      />
                    </div>

                    <div className="modal-field">
                      <label>{t('memberView.editForm.email')}</label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData?.email || ""}
                        onChange={handleEditInputChange}
                        className="modern-input"
                        required
                      />
                    </div>

                    <div className="modal-field">
                      <label>{t('memberView.editForm.contact')}</label>
                      <input
                        name="contactNO"
                        value={editFormData?.contactNO || ""}
                        onChange={handleEditInputChange}
                        className="modern-input"
                      />
                    </div>

                    <div className="modal-field">
                      <label>{t('memberView.editForm.faculty')}</label>
                      <input
                        name="faculy"
                        value={editFormData?.faculy || editFormData?.faculty || ""}
                        onChange={handleEditInputChange}
                        className="modern-input"
                      />
                    </div>

                    <div className="modal-field">
                      <label>{t('memberView.editForm.batch')}</label>
                      <input
                        name="batch"
                        value={editFormData?.batch || ""}
                        onChange={handleEditInputChange}
                        className="modern-input"
                      />
                    </div>

                    <div className="modal-field">
                      <label>{t('memberView.editForm.role')}</label>
                      <select
                        name="userRole"
                        value={editFormData?.userRole || "MEMBER"}
                        onChange={handleEditInputChange}
                        className="modern-select"
                      >
                        <option value="MEMBER">{t('enums.role.MEMBER')}</option>
                        <option value="ADMIN">{t('enums.role.ADMIN')}</option>
                      </select>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="modal-footer">
              {!isEditMode ? (
                <>
                  <button type="button" className="btn-modal secondary" onClick={handleCloseModal}>
                    {t('projects.details.aria.close')}
                  </button>
                  <button type="button" className="btn-modal primary" onClick={() => setIsEditMode(true)}>
                    <FaEdit /> {t('memberView.editMemberButton')}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn-modal secondary" onClick={() => setIsEditMode(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="button" className="btn-modal primary" onClick={handleSaveChanges}>
                    <FaCheck /> {t('admin.dashboard.editModal.saveChanges')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberViewAccountComponent;
