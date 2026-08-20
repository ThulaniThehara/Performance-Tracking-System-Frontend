import React, { useState } from "react";
import "../../SCSS/componentStyle/AdminMemberForm.scss";
import "../../SCSS/AdminStyles/AdminViewAccount/AdminViewAccount.scss";

const baseURL = import.meta.env.VITE_API_URL; // ex: http://localhost:5000/api

const FACULTIES = [
  "Faculty of Engineering",
  "Faculty of Medicine",
  "Faculty of IT",
  "Faculty of Business",
  "Faculty of Architecture",
];

const BATCHES = ["21", "22", "23", "24", "25"];

const ROLES = ["ADMIN", "MEMBER"];

const MemberAddFormComponent = ({ onMemberAdded }) => {
  const [formData, setFormData] = useState({
    indexNo: "",
    name: "",
    email: "",
    contactNO: "",
    gender: "male",
    dob: "",
    faculty: "",
    batch: "",
    userRole: "MEMBER", // ✅ default
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ basic validation
    const required = [
      "indexNo",
      "name",
      "email",
      "contactNO",
      "dob",
      "faculty",
      "batch",
      "userRole",
    ];
    for (const key of required) {
      if (!String(formData[key] || "").trim()) {
        setError("Please fill in all required fields.");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      // ✅ Admin creates user + email set-password link
      const res = await fetch(`${baseURL}/admin/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // should exist because admin is logged in
        },
        body: JSON.stringify({
          indexNo: formData.indexNo.trim(),
          email: formData.email.trim(), // Email = username
          name: formData.name.trim(),
          faculy: formData.faculty, // IMPORTANT: schema field is "faculy"
          batch: formData.batch,
          contactNO: formData.contactNO.trim(),
          experience: "",
          userRole: formData.userRole, // ✅ ADMIN or MEMBER only
          // NOTE: gender & dob are not in your BaseUser schema currently.
          // Only send these if you add them to schema.
          // gender: formData.gender,
          // dob: formData.dob,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setError(data?.message || "Failed to create account.");
        return;
      }

      // ✅ Notify parent to refresh + show toast
      if (onMemberAdded) {
        onMemberAdded({
          indexNo: formData.indexNo,
          name: formData.name,
          email: formData.email,
          contactNO: formData.contactNO,
          userRole: formData.userRole,
          gender: formData.gender,
          dob: formData.dob,
          faculy: formData.faculty,
          batch: formData.batch,
        });
      }

      // ✅ Clear form
      setFormData({
        indexNo: "",
        name: "",
        email: "",
        contactNO: "",
        gender: "male",
        dob: "",
        faculty: "",
        batch: "",
        userRole: "MEMBER",
      });
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-add-form">
      <h2>Basic Information</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="indexNo">Index Number:</label>
        <input
          type="text"
          id="indexNo"
          name="indexNo"
          value={formData.indexNo}
          onChange={handleInputChange}
          placeholder="Ex: 225513L"
          required
        />

        <label htmlFor="memberName">Member Name:</label>
        <input
          type="text"
          id="memberName"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter member full name"
          required
        />

        <label htmlFor="email">Email (Username):</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="member@email.com"
          required
        />

        <label htmlFor="contactNO">Contact Number:</label>
        <input
          type="text"
          id="contactNO"
          name="contactNO"
          value={formData.contactNO}
          onChange={handleInputChange}
          placeholder="07X XXX XXXX"
          required
        />

        {/* ✅ Role dropdown (ADMIN / MEMBER only) */}
        <label htmlFor="userRole">Role:</label>
        <select
          id="userRole"
          name="userRole"
          value={formData.userRole}
          onChange={handleInputChange}
          required
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <h2>Personal Details</h2>

        <label htmlFor="gender">Gender:</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          required
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <label htmlFor="dob">Date of Birth:</label>
        <input
          type="date"
          id="dob"
          name="dob"
          value={formData.dob}
          onChange={handleInputChange}
          required
        />

        <label htmlFor="faculty">Faculty:</label>
        <select
          id="faculty"
          name="faculty"
          value={formData.faculty}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Faculty</option>
          {FACULTIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <label htmlFor="batch">Batch:</label>
        <select
          id="batch"
          name="batch"
          value={formData.batch}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Batch</option>
          {BATCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="form-hint">
          A password setup link will be sent to the member’s email.
        </p>
      </form>
    </div>
  );
};

export default MemberAddFormComponent;
