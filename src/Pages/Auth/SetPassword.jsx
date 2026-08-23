import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SetPassword = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError(t('auth.setPassword.invalidToken'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.setPassword.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.setPassword.passwordMismatch'));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || t('auth.setPassword.setFailed'));
        return;
      }

      alert(t('auth.setPassword.successAlert'));
      navigate("/"); // redirect to login
    } catch (err) {
      setError(t('auth.setPassword.serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>{t('auth.setPassword.heading')}</h2>
        <p>{t('auth.setPassword.subtitle')}</p>

        <input
          type="password"
          placeholder={t('auth.setPassword.newPasswordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder={t('auth.setPassword.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? t('auth.setPassword.settingButton') : t('auth.setPassword.setPasswordButton')}
        </button>
      </form>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f6fb",
  },
  card: {
    width: "380px",
    padding: "30px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  error: {
    color: "#d7263d",
    fontSize: "14px",
  },
};

export default SetPassword;
