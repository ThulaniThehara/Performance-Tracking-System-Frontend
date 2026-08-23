import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setError(t('memberForm.errors.nameRequired'));
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
        setError(t('memberForm.errors.requiredFields'));
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
        setError(data?.message || t('memberForm.errors.createFailed'));
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
      setError(t('memberForm.errors.serverError'));
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
          <h1 className="form-main-heading">{t('memberForm.heading')}</h1>
          <p className="form-sub-description">
            {t('memberForm.subtitle')}
          </p>
        </div>

        {/* Registration Form */}
        <form className="modern-registration-form" onSubmit={handleSubmit} noValidate>
          {/* Row 1: Student Name (First Name + Last Name) */}
          <div className="form-group-full">
            <label className="form-label">
              {t('memberForm.fullNameLabel')} <span className="req-star">*</span>
            </label>
            <div className="form-dual-inputs">
              <div className="input-subfield">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder={t('memberForm.firstNamePlaceholder')}
                  className="modern-input"
                  required
                />
                <span className="field-hint">{t('memberForm.firstNamePlaceholder')}</span>
              </div>
              <div className="input-subfield">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder={t('memberForm.lastNamePlaceholder')}
                  className="modern-input"
                  required
                />
                <span className="field-hint">{t('memberForm.lastNamePlaceholder')}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Email & Contact Number */}
          <div className="form-grid-2col">
            <div className="form-field-item">
              <label className="form-label" htmlFor="memberEmail">
                {t('memberForm.emailLabel')} <span className="req-star">*</span>
              </label>
              <input
                type="email"
                id="memberEmail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('memberForm.emailPlaceholder')}
                className="modern-input"
                autoComplete="email"
                required
              />
              <span className="field-hint">{t('memberForm.emailHint')}</span>
            </div>

            <div className="form-field-item">
              <label className="form-label" htmlFor="contactNO">
                {t('memberForm.contactLabel')} <span className="req-star">*</span>
              </label>
              <input
                type="tel"
                id="contactNO"
                name="contactNO"
                value={formData.contactNO}
                onChange={handleInputChange}
                placeholder={t('memberForm.contactPlaceholder')}
                className="modern-input"
                required
              />
              <span className="field-hint">{t('memberForm.contactHint')}</span>
            </div>
          </div>

          {/* Row 3: Student ID / Index No & Gender */}
          <div className="form-grid-2col">
            <div className="form-field-item">
              <label className="form-label" htmlFor="indexNo">
                {t('memberForm.indexNoLabel')} <span className="req-star">*</span>
              </label>
              <input
                type="text"
                id="indexNo"
                name="indexNo"
                value={formData.indexNo}
                onChange={handleInputChange}
                placeholder={t('memberForm.indexNoPlaceholder')}
                className="modern-input"
                required
              />
              <span className="field-hint">{t('memberForm.indexNoHint')}</span>
            </div>

            <div className="form-field-item">
              <label className="form-label" htmlFor="gender">
                {t('memberForm.genderLabel')} <span className="req-star">*</span>
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
                  <option value="male">{t('memberForm.genderMale')}</option>
                  <option value="female">{t('memberForm.genderFemale')}</option>
                  <option value="other">{t('memberForm.genderOther')}</option>
                </select>
              </div>
              <span className="field-hint">{t('memberForm.genderHint')}</span>
            </div>
          </div>

          {/* Row 4: Faculty & Batch */}
          <div className="form-grid-2col">
            <div className="form-field-item">
              <label className="form-label" htmlFor="faculty">
                {t('memberForm.facultyLabel')} <span className="req-star">*</span>
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
                  <option value="">{t('memberForm.facultySelectPlaceholder')}</option>
                  {FACULTIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <span className="field-hint">{t('memberForm.facultyHint')}</span>
            </div>

            <div className="form-field-item">
              <label className="form-label" htmlFor="batch">
                {t('memberForm.batchLabel')} <span className="req-star">*</span>
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
                  <option value="">{t('memberForm.batchSelectPlaceholder')}</option>
                  {BATCHES.map((b) => (
                    <option key={b} value={b}>
                      {t('memberForm.batchOption', { n: b })}
                    </option>
                  ))}
                </select>
              </div>
              <span className="field-hint">{t('memberForm.batchHint')}</span>
            </div>
          </div>

          {/* Row 5: Date of Birth & System Role */}
          <div className="form-grid-2col">
            <div className="form-field-item">
              <label className="form-label" htmlFor="dob">
                {t('memberForm.dobLabel')} <span className="req-star">*</span>
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
              <span className="field-hint">{t('memberForm.dobHint')}</span>
            </div>

            <div className="form-field-item">
              <label className="form-label" htmlFor="userRole">
                {t('memberForm.roleLabel')} <span className="req-star">*</span>
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
                      {t(`enums.role.${r}`, { defaultValue: r })}
                    </option>
                  ))}
                </select>
              </div>
              <span className="field-hint">{t('memberForm.roleHint')}</span>
            </div>
          </div>

          {/* Row 6: Temporary Password Generator Section */}
          <div className="form-group-full temp-password-section">
            <div className="temp-password-header">
              <label className="form-label" htmlFor="tempPasswordInput">
                <FaKey className="label-icon" /> {t('memberForm.tempPasswordLabel')} <span className="req-star">*</span>
              </label>
              <button
                type="button"
                className="generate-pass-btn"
                onClick={handleGeneratePassword}
                title={t('memberForm.generateNewTitle')}
              >
                <FaSyncAlt className="btn-icon-spin" /> {t('memberForm.generateNew')}
              </button>
            </div>

            <div className="temp-password-control">
              <input
                type={showPassword ? "text" : "password"}
                id="tempPasswordInput"
                name="temporaryPassword"
                value={formData.temporaryPassword}
                onChange={handleInputChange}
                placeholder={t('memberForm.tempPasswordPlaceholder')}
                className="modern-input temp-pass-input"
                required
              />

              <div className="temp-password-actions">
                <button
                  type="button"
                  className="action-icon-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? t('memberForm.hidePassword') : t('memberForm.showPassword')}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>

                <button
                  type="button"
                  className={`action-icon-btn copy-btn ${copied ? "copied" : ""}`}
                  onClick={handleCopyPassword}
                  title={t('memberForm.copyPasswordTitle')}
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
            <span className="field-hint">
              {t('memberForm.tempPasswordHint')}
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
                  <span>{t('memberForm.registering')}</span>
                </>
              ) : (
                <>
                  <FaUserCheck className="btn-icon" />
                  <span>{t('memberForm.submit')}</span>
                </>
              )}
            </button>
            <p className="form-security-note">
              {t('memberForm.securityNote')}
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

            <h2 className="modal-title">{t('memberForm.successModal.title')}</h2>
            <p className="modal-desc">
              {t('memberForm.successModal.description', { name: successModalData.name })}
            </p>

            <div className="credentials-box">
              <div className="credential-row">
                <span className="cred-label">{t('memberForm.successModal.loginUsername')}</span>
                <span className="cred-value">{successModalData.email}</span>
              </div>
              <div className="credential-row">
                <span className="cred-label">{t('memberForm.successModal.indexNumber')}</span>
                <span className="cred-value">{successModalData.indexNo}</span>
              </div>
              <div className="credential-row">
                <span className="cred-label">{t('memberForm.successModal.temporaryPassword')}</span>
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
                <span>{copied ? t('memberForm.successModal.copiedToClipboard') : t('memberForm.successModal.copyCredentials')}</span>
              </button>

              <button
                type="button"
                className="continue-btn"
                onClick={handleCloseSuccessModal}
              >
                {t('memberForm.successModal.done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberAddFormComponent;
