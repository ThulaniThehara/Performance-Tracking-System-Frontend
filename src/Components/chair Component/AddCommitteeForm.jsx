import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes, FaFolderOpen, FaUsers, FaTag, FaAlignLeft } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../SCSS/ChairStyle/AddCommitteeForm.scss";

const AddCommitteeForm = ({ projectId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        committeeName: "",
        description: ""
    });

    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
    const [allMembers, setAllMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAllMembers();
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            // Fetch projects from backend /api/project/get endpoint
            let response;
            try {
                response = await axios.get("http://localhost:5000/api/project/get");
            } catch (err) {
                response = await axios.get("http://localhost:5000/api/project/all");
            }
            const projectList = response.data.data || response.data || [];
            if (Array.isArray(projectList) && projectList.length > 0) {
                setProjects(projectList);
            } else {
                throw new Error("No projects found");
            }
        } catch (error) {
            console.error("Error fetching projects from backend:", error);
        }
    };

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredMembers([]);
        } else {
            const filtered = allMembers.filter(
                (member) =>
                    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    member.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredMembers(filtered);
        }
    }, [searchQuery, allMembers]);

    const fetchAllMembers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/user/all");
            setAllMembers(response.data.data || []);
        } catch (error) {
            console.error("Error fetching members:", error);
            toast.warning("Couldn't connect to server");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectMember = (member) => {
        if (!selectedMembers.find((m) => m._id === member._id)) {
            setSelectedMembers([...selectedMembers, member]); 
        } else {
            toast.info(`${member.name} is already added`);
        }
        setSearchQuery("");
        setFilteredMembers([]);
    };

    const handleRemoveMember = (memberId) => {
        const member = selectedMembers.find(m => m._id === memberId);
        setSelectedMembers(selectedMembers.filter((m) => m._id !== memberId));
        if (member) {
            toast.info(`${member.name} removed from committee`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!selectedProjectId && !projectId) {
            toast.error("Please select a project for this committee");
            return;
        }

        if (!formData.committeeName.trim()) {
            toast.error("Please enter a committee name");
            return;
        }

        if (!formData.description.trim()) {
            toast.error("Please enter a description");
            return;
        }

        if (selectedMembers.length === 0) {
            toast.warning("Please add at least one member to the committee");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const committeeData = {
                CName: formData.committeeName,
                Description: formData.description,
                projectId: selectedProjectId || projectId,
                ProjectId: selectedProjectId || projectId,
                Members: selectedMembers.map(member => ({
                    UserId: member._id,
                    UserName: member.name,
                    Role: "Member"
                }))
            };

            console.log("Sending committee data:", committeeData); 

            const response = await axios.post(
                "http://localhost:5000/api/committee/add",
                committeeData
            );

            // Success notification
            toast.success(
                `✅ ${response.data.message || "Committee created successfully!"}`,
                {
                    position: "top-center",
                    autoClose: 3000,
                }
            );
            
            // Reset form
            setFormData({
                committeeName: "",
                description: ""
            });
            if (!projectId) setSelectedProjectId("");
            setSelectedMembers([]);
            
            // Call success callback after a short delay
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 1500);

        } catch (error) {
            console.error("Error adding committee:", error);
            
            // Error notification with specific message
            const errorMessage = 
                error.response?.data?.message || 
                error.response?.data?.error || 
                "Failed to create committee. Please try again.";
            
            toast.error(
                `❌ ${errorMessage}`,
                {
                    position: "top-center",
                    autoClose: 5000,
                }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-committee-form-container">
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            
            <form onSubmit={handleSubmit} className="add-committee-form">
                <div className="form-header">
                    <h2>Create New Committee</h2>
                    <p>Select a project, specify details, and assign members.</p>
                </div>

                <div className="form-group">
                    <label><FaFolderOpen className="field-icon" /> Select Project *</label>
                    <select
                        name="projectId"
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="project-select-input"
                        disabled={isSubmitting || !!projectId}
                        required
                    >
                        <option value="">-- Choose a Project --</option>
                        {projects.map((proj) => (
                            <option key={proj._id || proj.id} value={proj._id || proj.id}>
                                {proj.PName || proj.projectName || proj.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label><FaTag className="field-icon" /> Committee Name *</label>
                    <input
                        type="text"
                        name="committeeName"
                        value={formData.committeeName}
                        onChange={handleChange}
                        placeholder="e.g. Technical Operations Committee"
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="form-group">
                    <label><FaAlignLeft className="field-icon" /> Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the responsibilities and scope of this committee..."
                        rows="3"
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="form-group">
                    <label><FaUsers className="field-icon" /> Search and Add Members *</label>
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search members by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                            autoComplete="off"
                            disabled={isSubmitting}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="clear-search"
                                onClick={() => setSearchQuery("")}
                                disabled={isSubmitting}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {filteredMembers.length > 0 && (
                        <div className="search-results">
                            {filteredMembers.map((member) => (
                                <div
                                    key={member._id}
                                    className="search-result-item"
                                    onClick={() => handleSelectMember(member)}
                                >
                                    <div className="member-info">
                                        <div className="member-avatar">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="member-details">
                                            <div className="member-name">{member.name}</div>
                                            <div className="member-email">{member.email}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {searchQuery && filteredMembers.length === 0 && (
                        <div className="no-results">
                            No members found matching "{searchQuery}"
                        </div>
                    )}
                </div>

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                    <div className="selected-members-section">
                        <label>Selected Members ({selectedMembers.length})</label>
                        <div className="selected-members-list">
                            {selectedMembers.map((member) => (
                                <div key={member._id} className="selected-member-chip">
                                    <div className="member-avatar-small">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="member-name-small">{member.name}</span>
                                    <button
                                        type="button"
                                        className="remove-member-btn"
                                        onClick={() => handleRemoveMember(member._id)}
                                        disabled={isSubmitting}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner"></span>
                                Creating...
                            </>
                        ) : (
                            "Add Committee"
                        )}
                    </button>
                    {onCancel && (
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddCommitteeForm;