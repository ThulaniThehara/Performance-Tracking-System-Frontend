import React, { useState } from "react";
import ConfirmDialog from "../ConfirmationComponent/ConfirmDialog";
import "../../SCSS/AdminStyles/AdminViewAccount/AdminViewAccount.scss";
import "../../SCSS/componentStyle/MemberViewModal.scss";

const MemberViewAccountComponent = ({
  members = [],
  loading = false,
  error = "",
  onMemberDeleted,
  onMemberUpdated,
}) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
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
      onMemberDeleted(memberToDelete._id);
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
    if (onMemberUpdated) {
      onMemberUpdated(editFormData);
    }
    setSelectedMember(null);
    setIsEditMode(false);
  };

  return (
    <div>
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Member"
        message={`Are you sure you want to delete ${memberToDelete?.name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Loading / error */}
      {loading && <p style={{ marginTop: 12 }}>Loading members...</p>}
      {!loading && error && <p style={{ marginTop: 12, color: "red" }}>{error}</p>}

      {/* Modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? "Edit Member" : "Member Details"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {!isEditMode ? (
                <div className="member-details">
                  <div className="detail-section">
                    <img
                      src={"/assets/default-avatar.png"}
                      alt={selectedMember.name}
                      className="member-avatar"
                    />
                  </div>

                  <div className="detail-section">
                    <div className="detail-item">
                      <label>Name:</label>
                      <p>{selectedMember.name}</p>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <p>{selectedMember.email}</p>
                    </div>
                    <div className="detail-item">
                      <label>Contact Number:</label>
                      <p>{selectedMember.contactNO}</p>
                    </div>
                    <div className="detail-item">
                      <label>Index No:</label>
                      <p>{selectedMember.indexNo}</p>
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-item">
                      <label>Faculty:</label>
                      <p>{selectedMember.faculy}</p>
                    </div>
                    <div className="detail-item">
                      <label>Batch:</label>
                      <p>{selectedMember.batch}</p>
                    </div>
                    <div className="detail-item">
                      <label>Role:</label>
                      <p>{selectedMember.userRole}</p>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <p>
                        <span
                          className={`status-badge ${
                            selectedMember.isVerified ? "status-active" : "status-inactive"
                          }`}
                        >
                          {selectedMember.isVerified ? "Active" : "Pending"}
                        </span>
                      </p>
                    </div>
                    <div className="detail-item">
                      <label>Created:</label>
                      <p>{formatDate(selectedMember.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form className="member-edit-form">
                  <div className="form-group">
                    <label>Name:</label>
                    <input name="name" value={editFormData?.name || ""} onChange={handleEditInputChange} />
                  </div>

                  <div className="form-group">
                    <label>Email:</label>
                    <input name="email" value={editFormData?.email || ""} onChange={handleEditInputChange} />
                  </div>

                  <div className="form-group">
                    <label>Contact Number:</label>
                    <input
                      name="contactNO"
                      value={editFormData?.contactNO || ""}
                      onChange={handleEditInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Faculty:</label>
                    <input
                      name="faculy"
                      value={editFormData?.faculy || ""}
                      onChange={handleEditInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Batch:</label>
                    <input name="batch" value={editFormData?.batch || ""} onChange={handleEditInputChange} />
                  </div>

                  <div className="form-group">
                    <label>Role:</label>
                    <select name="userRole" value={editFormData?.userRole || "MEMBER"} onChange={handleEditInputChange}>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                  </div>
                </form>
              )}
            </div>

            <div className="modal-footer">
              {!isEditMode ? (
                <>
                  <button className="btn-secondary" onClick={handleCloseModal}>Close</button>
                  <button className="btn-primary" onClick={() => setIsEditMode(true)}>Edit</button>
                </>
              ) : (
                <>
                  <button className="btn-secondary" onClick={() => setIsEditMode(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleSaveChanges}>Save Changes</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ marginTop: 24 }} className="table-wrapper">
        <table className="member-table" role="table" aria-label="Members table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th style={{ width: 120 }}>Role</th>
              <th style={{ width: 110 }} className="center">Status</th>
              <th style={{ width: 140 }}>Created</th>
              <th style={{ width: 160 }} className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              !error &&
              members.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td className="center">{m.userRole}</td>
                  <td className="center">
                    <span className={`status-badge ${m.isVerified ? "status-active" : "status-inactive"}`}>
                      {m.isVerified ? "Active" : "Pending"}
                    </span>
                  </td>
                  <td>{formatDate(m.createdAt)}</td>
                  <td className="actions">
                    <button className="btn view" onClick={() => handleViewClick(m)}>View</button>
                    <button className="btn edit" onClick={() => handleEditClick(m)}>Edit</button>
                    <button className="btn delete" onClick={() => handleDeleteClick(m)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberViewAccountComponent;
