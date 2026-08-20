// ...existing code...
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaUsers, FaEdit } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import ConfirmDialog from "../ConfirmationComponent/ConfirmDialog";
import "../../SCSS/ChairStyle/ViewTasks.scss";

const ViewTasks = () => {
  const [groupedTasks, setGroupedTasks] = useState({});
  const [members, setMembers] = useState([]);
  const [committees, setCommittees] = useState([]); // new: all committees (to fetch committee id)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    committeeName: "",
    taskId: null,
    type: "", // "task" or "committee"
  });

  // editing state per-task
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingCandidates, setEditingCandidates] = useState([]); // members of the committee being edited
  const [editSelectedMember, setEditSelectedMember] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchMembers();
    fetchCommittees(); // load committees to map names -> ids
  }, []);

  const fetchCommittees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/committee/all");
      setCommittees(res.data.data || []);
    } catch (err) {
      console.error("Error fetching committees:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/task/get");
      const taskData = res.data.data || res.data || [];
      // Group by Committee (use empty string key if none)
      const grouped = taskData.reduce((acc, task) => {
        const key = task.Committee || "Unassigned";
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
      }, {});
      setGroupedTasks(grouped);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to load tasks");
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user/all");
      setMembers(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  // when Edit is clicked: fetch members for that task's committee and open edit UI
  const handleEditClick = async (task) => {
    try {
      const committeeName = task.Committee;
      // find committee id by name
      const committee = committees.find((c) => c.CName === committeeName);
      let committeeMembers = [];
      if (committee) {
        const res = await axios.get(`http://localhost:5000/api/committee/${committee._id}`);
        committeeMembers = res.data.data?.Members || [];
      } else {
        // fallback: if no committee found, use global members
        committeeMembers = members.map((m) => ({ UserId: m._id, UserName: m.UserName }));
      }
      setEditingCandidates(committeeMembers);
      // choose first assigned or first candidate
      const currentAssigned = (task.AssignedTo && task.AssignedTo.length && task.AssignedTo[0]) || "";
      setEditSelectedMember(currentAssigned || (committeeMembers[0] && committeeMembers[0].UserName) || "");
      setEditingTaskId(task._id);
    } catch (err) {
      console.error("Error fetching committee members for edit:", err);
      toast.error("Failed to fetch committee members");
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingCandidates([]);
    setEditSelectedMember("");
  };

  const handleSaveEdit = async (taskId) => {
    try {
      // update assigned member (backend expects array)
      await axios.put(`http://localhost:5000/api/task/updateAssigned/${taskId}`, {
        AssignedTo: editSelectedMember ? [editSelectedMember] : [],
      });
      toast.success("Assigned member updated");
      fetchTasks();
      handleCancelEdit();
    } catch (err) {
      console.error("Error updating assigned member:", err);
      toast.error("Failed to update assigned member");
    }
  };

  const handleMemberChange = async (taskId, e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    try {
      await axios.put(`http://localhost:5000/api/task/updateAssigned/${taskId}`, {
        AssignedTo: selected,
      });
      toast.success("Assigned members updated");
      fetchTasks();
    } catch (err) {
      console.error("Error updating assigned members:", err);
      toast.error("Failed to update members");
    }
  };

  const openConfirmDialog = (type, name, id = null) => {
    setConfirmDialog({
      isOpen: true,
      type,
      committeeName: name,
      taskId: id,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: "",
      committeeName: "",
      taskId: null,
    });
  };

  const confirmDelete = async () => {
    const { type, committeeName, taskId } = confirmDialog;
    try {
      if (type === "committee") {
        // call backend to delete all tasks for committee
        await axios.delete(`http://localhost:5000/api/task/delete/committee/${encodeURIComponent(committeeName)}`);
        toast.success(`Deleted all tasks under ${committeeName}`);
      } else {
        // delete single task by id
        await axios.delete(`http://localhost:5000/api/task/delete/${taskId}`);
        toast.success("Task deleted successfully");
      }
      fetchTasks();
      closeConfirmDialog();
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error("Failed to delete");
      closeConfirmDialog();
    }
  };
  
    return (
      <div className="view-tasks-container">
        <ToastContainer />
  
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.type === "committee"
            ? `Delete Committee "${confirmDialog.committeeName}"?`
            : "Delete Task?"}
          message={confirmDialog.type === "committee"
            ? `This will remove all tasks under ${confirmDialog.committeeName}.`
            : "Are you sure you want to delete this task?"}
          onConfirm={confirmDelete}
          onCancel={closeConfirmDialog}
          confirmText="Delete"
          cancelText="Cancel"
        />
  
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="no-tasks">
            <p>No tasks found</p>
          </div>
        ) : (
          <div className="committees-grid">
            {Object.entries(groupedTasks).map(([committeeName, tasks]) => (
              <div key={committeeName} className="committee-card">
                <div className="committee-header">
                  <h3>{committeeName}</h3>
                  <button
                    className="btn-delete-committee"
                    onClick={() => openConfirmDialog("committee", committeeName)}
                    title="Delete all tasks for this committee"
                  >
                    <FaTrash />
                  </button>
                </div>
  
                <div className="tasks-list">
                  {tasks.map((task) => (
                    <div key={task._id} className="task-row">
                      <div className="task-card-inner">
                        <div className="task-card-header">
                          <h4 className="task-name">{task.TName}</h4>
  
                          <button
                            className="btn-delete-task header-delete"
                            onClick={() => openConfirmDialog("task", task.TName, task._id)}
                            title="Delete task"
                          >
                            <FaTrash />
                          </button>
                        </div>
  
                        <p className="description">{task.Description}</p>
  
                        <div className="task-bottom">
                          <div className="dates-col">
                            <div className="date-block">
                              <div className="date-label">Start:</div>
                              <div className="date-value">{task.StartDate ? new Date(task.StartDate).toLocaleDateString() : "-"}</div>
                            </div>
  
                            <div className="date-block">
                              <div className="date-label">Due:</div>
                              <div className="date-value">{task.EndDate ? new Date(task.EndDate).toLocaleDateString() : "-"}</div>
                            </div>
                          </div>
  
                          {/* Assigned box with editable UI */}
                          <div className="assigned-box">
                            <div className="assigned-header">
                              <FaUsers className="icon" />
                              <span className="assigned-title">Assigned To</span>
                            </div>
  
                            {!editingTaskId || editingTaskId !== task._id ? (
                              <div className="assigned-content">
                                {(task.AssignedTo && task.AssignedTo.length) ? (
                                  <div className="assigned-names">
                                    {task.AssignedTo.map((name, idx) => (
                                      <span key={idx} className="member-name">{name}</span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="assigned-names">
                                    <span className="member-name">—</span>
                                  </div>
                                )}
  
                                <button
                                  className="btn-edit-assigned"
                                  title="Edit assigned member"
                                  onClick={() => handleEditClick(task)}
                                >
                                  <FaEdit />
                                </button>
                              </div>
                            ) : (
                              <div className="assigned-edit">
                                <select
                                  value={editSelectedMember}
                                  onChange={(e) => setEditSelectedMember(e.target.value)}
                                >
                                  <option value="">-- none --</option>
                                  {editingCandidates.map((m) => (
                                    <option key={m.UserId || m._id} value={m.UserName}>
                                      {m.UserName}
                                    </option>
                                  ))}
                                </select>
                                <div className="edit-actions">
                                  <button className="btn-save" onClick={() => handleSaveEdit(task._id)}>Save</button>
                                  <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default ViewTasks;
  // ...existing code...