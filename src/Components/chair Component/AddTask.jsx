import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../SCSS/ChairStyle/AddTask.scss";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddTask = () => {
  const [selectedCommittee, setSelectedCommittee] = useState("");
  const [committees, setCommittees] = useState([]);
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [tasks, setTasks] = useState([
    {
      TName: "",
      Description: "",
      AssignedTo: [],
      Status: "Pending",
      StartDate: "",
      EndDate: "",
    },
  ]);

  const [errors, setErrors] = useState([]);

  // ✅ Fetch committees when component mounts
  useEffect(() => {
    fetchCommittees();
  }, []);

  // ✅ Fetch members for selected committee
  useEffect(() => {
    if (selectedCommittee) {
      fetchCommitteeMembers(selectedCommittee);
    } else {
      setCommitteeMembers([]);
    }
  }, [selectedCommittee]);

  const fetchCommittees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/committee/all");
      setCommittees(res.data.data || []);
    } catch (err) {
      console.error("Error fetching committees:", err);
      toast.error("Failed to fetch committees");
    }
  };

  const fetchCommitteeMembers = async (committeeName) => {
    try {
      const selected = committees.find((c) => c.CName === committeeName);
      if (!selected) return;
      const res = await axios.get(`http://localhost:5000/api/committee/${selected._id}`);
      setCommitteeMembers(res.data.data?.Members || []);
    } catch (err) {
      console.error("Error fetching committee members:", err);
      toast.error("Failed to fetch committee members");
    }
  };

const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);

    if (field === "StartDate" || field === "EndDate") {
        validateRowDates(index, newTasks[index]);
    }
};

  const handleAddRow = () => {
    setTasks([
      ...tasks,
      {
        TName: "",
        Description: "",
        AssignedTo: [],
        Status: "Pending",
        StartDate: "",
        EndDate: "",
      },
    ]);
    setErrors((prev) => [...prev, ""]);
  };

const handleMemberSelect = (index, memberName) => {
  const updatedTasks = [...tasks];
  const selectedList = updatedTasks[index].AssignedTo || [];
  if (!selectedList.includes(memberName)) {
    updatedTasks[index].AssignedTo = [...selectedList, memberName];
  } else {
    toast.info(`${memberName} is already added`);
  }
  setTasks(updatedTasks);
};

const handleRemoveMember = (index, memberName) => {
  const updatedTasks = [...tasks];
  updatedTasks[index].AssignedTo = updatedTasks[index].AssignedTo.filter(
    (m) => m !== memberName
  );
  setTasks(updatedTasks);
};

const validateRowDates = (index, task) => {
  const start = task.StartDate ? new Date(task.StartDate) : null;
  const end = task.EndDate ? new Date(task.EndDate) : null;
  const newErrors = [...errors];

  if (start && end) {
    if (end.getTime() <= start.getTime()) {
     newErrors[index] = "End date must be after Start date.";
    } else {
      newErrors[index] = "";
    }
  } else {
    // clear error if one of dates missing (allow other validations if needed)
    newErrors[index] = "";
  }
  setErrors(newErrors);
};

const validateTasks = () => {
  const newErrors = tasks.map((t, i) => {
    const start = t.StartDate ? new Date(t.StartDate) : null;
    const end = t.EndDate ? new Date(t.EndDate) : null;
    if (start && end) {
      if (end.getTime() <= start.getTime()) {
        return "End date must be after Start date.";
      }
    }
    return "";
  });
  setErrors(newErrors);
  return newErrors.every((e) => e === "");
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCommittee) {
      toast.error("Please select a committee first!");
      return;
    }
     if (!validateTasks()) {
     toast.error("Please fix date errors before submitting.");
      return;
    }

    try {
      const selected = committees.find((c) => c.CName === selectedCommittee);

   await Promise.all(
  tasks.map((task) => {
    if (!task.Project) task.Project = "Default Project"; // make sure it’s filled
    return axios.post("http://localhost:5000/api/task/create", {
       TName: task.TName,
      Description: task.Description,
      AssignedTo: task.AssignedTo, // now a string
      Project: task.Project || "Default Project",  
      //CommitteeId: selected._id,
      Committee: selected.CName,   // ✅ matches schema
       Status: task.Status || "Pending",
      StartDate: task.StartDate ? new Date(task.StartDate) : new Date(),
EndDate: task.EndDate ? new Date(task.EndDate) : new Date(),
    });
  })
);


      toast.success("Tasks added successfully!");
      setTasks([
        {
          TName: "",
          Description: "",
          AssignedTo: [],
          Status: "Pending",
          StartDate: "",
          EndDate: "",
        },
      ]);
       setErrors([]);
      setSelectedCommittee("");
    } catch (err) {
      console.error("Error saving tasks:", err);
      toast.error("Error saving tasks");
    }
  };

  return (
    <div className="add-task">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="table-wrapper">
       
        <div className="committee-selection">
          <label>Select Committee *</label>
          <select
            value={selectedCommittee}
            onChange={(e) => setSelectedCommittee(e.target.value)}
          >
            <option value="">-- Select Committee --</option>
            {committees.map((c) => (
              <option key={c._id} value={c.CName}>
                {c.CName}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Add Task Form */}
        <form onSubmit={handleSubmit}>
          <table>
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Description</th>
                <th>Assigned Members</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={task.TName}
                      onChange={(e) =>
                        handleTaskChange(index, "TName", e.target.value)
                      }
                      placeholder="Enter task name"
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      value={task.Description}
                      onChange={(e) =>
                        handleTaskChange(index, "Description", e.target.value)
                      }
                      placeholder="Enter description"
                    />
                  </td>

                  {/* ✅ Assigned Members */}
                  <td className="assigned-members">
                    <div className="selected-members">
                      {task.AssignedTo.map((member, i) => (
                        <span key={i} className="member-chip">
                          {member}
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMember(index, member)
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <select
                      onChange={(e) => {
                        if (e.target.value)
                          handleMemberSelect(index, e.target.value);
                      }}
                      defaultValue=""
                      disabled={!selectedCommittee}
                    >
                      <option value="" disabled>
                        Select member...
                      </option>
                      {committeeMembers.map((m) => (
                        <option key={m.UserId} value={m.UserName}>
                          {m.UserName}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      type="date"
                      value={task.StartDate}
                      onChange={(e) =>
                        handleTaskChange(index, "StartDate", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="date"
                      value={task.EndDate}
                      onChange={(e) =>
                        handleTaskChange(index, "EndDate", e.target.value)
                      }
                    />
                       {errors[index] ? (
                     <div style={{ color: " #c0392b", fontSize: 12, marginTop: 6 }}>
                       {errors[index]}
                     </div>
                   ) : null}
                  </td>

                  <td>
                    <button type="button" onClick={handleAddRow}>
                      +
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="submit-section">
            <button type="submit" className="btn-submit">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTask;
