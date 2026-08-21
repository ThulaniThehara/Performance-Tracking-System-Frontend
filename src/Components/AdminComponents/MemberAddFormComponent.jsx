import React, { useState } from "react";
import "../../SCSS/componentStyle/AdminMemberForm.scss";
import {
  FaUserCheck,
  FaSpinner,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaCopy,
  FaCheck,
  FaSyncAlt,
  FaCheckCircle,
} from "react-icons/fa";

const baseURL = import.meta.env.VITE_API_URL; // ex: http://localhost:5000/api

const FACULTIES = [
  "Faculty of Engineering",
  "Faculty of Medicine",
  "Faculty of IT",
  "Faculty of Business",
  "Faculty of Architecture",
];

const BATCHES = ["21", "22", "23", "24", "25"];

const ROLES = ["MEMBER", "ADMIN"];

// Helper to generate a secure, readable temporary password
const generateRandomPassword = () => {
  const charsUpper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const charsLower = "abcdefghijkmnpqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "@#$&*!";

  const getRandom = (str) => str[Math.floor(Math.random() * str.length)];

  // Example format: Pts@K7m8#
  return `Pts@${getRandom(charsUpper)}${getRandom(charsLower)}${getRandom(numbers)}${getRandom(numbers)}${getRandom(symbols)}`;
};

const MemberAddFormComponent = ({ onMemberAdded }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    indexNo: "",
    email: "",
    contactNO: "",
    gender: "male",
    dob: "",
    faculty: "",
    batch: "",
    userRole: "MEMBER",
    temporaryPassword: generateRandomPassword(),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successModalData, setSuccessModalData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGeneratePassword = () => {
    const newPass = generateRandomPassword();
    setFormData((prev) => ({ ...prev, temporaryPassword: newPass }));
    setCopied(false);
  };

  const handleCopyPassword = () => {
    if (!formData.temporaryPassword) return;
    navigator.clipboard.writeText(formData.temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAllCredentials = () => {
    if (!successModalData) return;
    const text = `Performance Tracking System - Member Credentials\nEmail (Username): ${successModalData.email}\nTemporary Password: ${successModalData.temporaryPassword}\nIndex No: ${successModalData.indexNo}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please provide both first name and last name.");
      return;
    }

    const required = [
      "indexNo",
      "email",
      "contactNO",
      "dob",
      "faculty",
      "batch",
      "userRole",
      "temporaryPassword",
    ];
    for (const key of required) {
      if (!String(formData[key] || "").trim()) {
        setError("Please fill in all required fields marked with *.");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`${baseURL}/admin/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          indexNo: formData.indexNo.trim(),
          email: formData.email.trim(),
          name: fullName,
          faculy: formData.faculty,
          batch: formData.batch,
          contactNO: formData.contactNO.trim(),
          experience: "",
          userRole: formData.userRole,
          temporaryPassword: formData.temporaryPassword.trim(),
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setError(data?.message || "Failed to create account. Please check details.");
        return;
      }

      const createdMember = {
        indexNo: formData.indexNo,
        name: fullName,
        email: formData.email,
        contactNO: formData.contactNO,
        userRole: formData.userRole,
        gender: formData.gender,
        dob: formData.dob,
        faculy: formData.faculty,
        batch: formData.batch,
        temporaryPassword: formData.temporaryPassword.trim(),
      };

      setSuccessModalData(createdMember);

      // Reset form fields
      setFormData({
        firstName: "",
        lastName: "",
        indexNo: "",
        email: "",
        contactNO: "",
        gender: "male",
        dob: "",
        faculty: "",
        batch: "",
        userRole: "MEMBER",
        temporaryPassword: generateRandomPassword(),
      });
    } catch (err) {
      setError("Server error. Please check your network connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    const data = successModalData;
    setSuccessModalData(null);
    if (onMemberAdded && data) {
      onMemberAdded(data);
    }
  };

  return (
    <div className="member-form-card-wrapper">
      <div className="member-registration-card">
        {/* Form Header */}
        <div className="form-card-header">
          <h1 className="form-main-heading">Registration Form</h1>
          <p className="form-sub-description">
            Fill out the form carefully for registration. An automated temporary password will be generated for the member.
          </p>
        </div>

        {/* Registration Form */}
        <form className="modern-registration-form" onSubmit={handleSubmit} noValidate>
          {/* Row 1: Student Name (First Name + Last Name) */}
          <div className="form-group-full">
            <label className="form-label">
              Member Full Name <span className="req-star">*</span>
            </label>
            <div className="form-dual-inputs">
              <div className="input-subfield">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="modern-input"
                  required
                />
                <span className="field-hint">First Name</span>
              </div>
              <div className="input-subfield">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="modern-input"
                  required
                />
                <span className="field-hint">Last Name</span>
              </div>
            </div>
          </div>

          {/* Row 2: Email & Contact Number */}
          <div className="form-grid-2col">
            <div className="form-field-item">
              <label className="form-label" htmlFor="memberEmail">
                Student E-mail <span className="req-star">*</span>
              </label>
              <input
                type="email"
                id="memberEmail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ex: myname@example.com"
                className="modern-input"
                autoComplete="email"
                required
              />
              <span className="field-hint">example@example.com</span>
            </div>

            <div className="form-field-item">
              <label className="form-label" htmlFor="contactNO">
                Contact Number <span className="req-star">*</span>
              </label>
              <input
                type="tel"
                id="contactNO"
                name="contactNO"
                value={formData.contactNO}
                onChange={handleInputChange}
                placeholder="07X XXX XXXX"
                className="modern-input"
                required
              />
              <span className="field-hint">Phone / WhatsApp number</span>
            </div>
          </div>

          {/* Row 3: Student ID / Index No & Gender */}
          <div className="form-grid-2col">
            <div className="form-field-item">
              <label className="form-label" htmlFor="indexNo">
                Student ID / Index No <span className="req-star">*</span>
              </label>
              <input
                type="text"
                id="indexNo"
                name="indexNo"
                value={formData.indexNo}
                onChange={handleInputChange}
                placeholder="ex: 225513L"
                className="modern-input"
                required
              />
              <span className="field-hint">Unique student identity number</span>
            </div>

            <div className="form-field-item">
              <label className="form-label" htmlFor="gender">
                Gender <span className="req-star">*</span>
              </label>
              <div className="custom-select-wrapper">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="modern-select"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <span className="field-hint">Select gender</span>
            </div>
          </div>

          {/* Row 4: Faculty & Batch */}
          <div className="form-grid-2col">
            <div className="form-field-item">
              <label className="form-label" htmlFor="faculty">
                Faculty / Department <span className="req-star">*</span>
              </label>
              <div className="custom-select-wrapper">
                <select
                  id="faculty"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleInputChange}
                  className="modern-select"
                  required
                >
                  <option value="">Please Select Faculty</option>
                  {FACULTIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <span className="field-hint">Select assigned faculty</span>
            </div>

            <div className="form-field-item">
              <label className="form-label" htmlFor="batch">
                Academic Batch <span className="req-star">*</span>
              </label>
              <div className="custom-select-wrapper">
                <select
                  id="batch"
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  className="modern-select"
                  required
                >
                  <option value="">Please Select Batch</option>
                  {BATCHES.map((b) => (
                    <option key={b} value={b}>
                      Batch {b}
                    </option>
                  ))}
                </select>
              </div>
              <span className="field-hint">Intake batch year</span>
            </div>
          </div>

          {/* Row 5: Date of Birth & System Role */}
          <div className="form-grid-2col">
            <div className="form-field-item">
              <label className="form-label" htmlFor="dob">
                Date of Birth <span className="req-star">*</span>
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="modern-input"
                required
              />
              <span className="field-hint">Date of birth</span>
            </div>

            <div className="form-field-item">
              <label className="form-label" htmlFor="userRole">
                System Role <span className="req-star">*</span>
              </label>
              <div className="custom-select-wrapper">
                <select
                  id="userRole"
                  name="userRole"
                  value={formData.userRole}
                  onChange={handleInputChange}
                  className="modern-select"
                  required
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <span className="field-hint">Access privileges</span>
            </div>
          </div>

          {/* Row 6: Temporary Password Generator Section */}
          <div className="form-group-full temp-password-section">
            <div className="temp-password-header">
              <label className="form-label" htmlFor="tempPasswordInput">
                <FaKey className="label-icon" /> Temporary Password <span className="req-star">*</span>
              </label>
              <button
                type="button"
                className="generate-pass-btn"
                onClick={handleGeneratePassword}
                title="Generate new random password"
              >
                <FaSyncAlt className="btn-icon-spin" /> Generate New
              </button>
            </div>

            <div className="temp-password-control">
              <input
                type={showPassword ? "text" : "password"}
                id="tempPasswordInput"
                name="temporaryPassword"
                value={formData.temporaryPassword}
                onChange={handleInputChange}
                placeholder="Temporary Password"
                className="modern-input temp-pass-input"
                required
              />

              <div className="temp-password-actions">
                <button
                  type="button"
                  className="action-icon-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>

                <button
                  type="button"
                  className={`action-icon-btn copy-btn ${copied ? "copied" : ""}`}
                  onClick={handleCopyPassword}
                  title="Copy password to clipboard"
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
            <span className="field-hint">
              This temporary password will be assigned to the member for their initial login.
            </span>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="form-error-banner" role="alert">
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="form-submit-container">
            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="btn-spinner" />
                  <span>Registering Member...</span>
                </>
              ) : (
                <>
                  <FaUserCheck className="btn-icon" />
                  <span>Submit</span>
                </>
              )}
            </button>
            <p className="form-security-note">
              The member can sign in using their Email or Index No and the generated temporary password.
            </p>
          </div>
        </form>
      </div>

      {/* Success Credentials Modal */}
      {successModalData && (
        <div className="credentials-modal-overlay" onClick={handleCloseSuccessModal}>
          <div className="credentials-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-success-icon">
              <FaCheckCircle />
            </div>

            <h2 className="modal-title">Account Created!</h2>
            <p className="modal-desc">
              Member <strong>{successModalData.name}</strong> has been registered successfully.
            </p>

            <div className="credentials-box">
              <div className="credential-row">
                <span className="cred-label">Login Username:</span>
                <span className="cred-value">{successModalData.email}</span>
              </div>
              <div className="credential-row">
                <span className="cred-label">Index Number:</span>
                <span className="cred-value">{successModalData.indexNo}</span>
              </div>
              <div className="credential-row">
                <span className="cred-label">Temporary Password:</span>
                <span className="cred-value password-tag">{successModalData.temporaryPassword}</span>
              </div>
            </div>

            <div className="modal-actions-container">
              <button
                type="button"
                className="copy-creds-btn"
                onClick={handleCopyAllCredentials}
              >
                {copied ? <FaCheck /> : <FaCopy />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Credentials"}</span>
              </button>

              <button
                type="button"
                className="continue-btn"
                onClick={handleCloseSuccessModal}
              >
                Done / View Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberAddFormComponent;
