import React, { useState } from "react";
import "../../SCSS/LoginPage/LoginPage.scss";
import { FaUser, FaLock, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const baseURL = import.meta.env.VITE_API_URL; // ex: http://localhost:5000/api
const API_URL = `${baseURL}/auth/login`;

// Placeholder marketing data for the hero illustration — purely decorative.
const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const BAR_HEIGHTS = [42, 65, 50, 82, 60, 94, 74];
const ENGAGEMENT_PERCENT = 82;
const RING_RADIUS = 32;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_OFFSET = RING_CIRCUMFERENCE * (1 - ENGAGEMENT_PERCENT / 100);

const HeroVisual = () => {
  const { t } = useTranslation();

  return (
  <div className="hero-visual" aria-hidden="true">
    <div className="hero-card hero-card--main">
      <div className="hero-card-head">
        <span className="hero-dot" />
        <span className="hero-dot" />
        <span className="hero-dot" />
        <span className="hero-search">{t('login.hero.search')}</span>
      </div>

      <div className="hero-bars">
        {WEEK_DAYS.map((day, i) => (
          <div className="hero-bar" key={`${day}-${i}`} style={{ "--h": `${BAR_HEIGHTS[i]}%` }}>
            <span className="hero-bar-fill" />
            <span className="hero-bar-label">{day}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="hero-card hero-card--ring">
      <svg viewBox="0 0 80 80">
        <circle className="ring-track" cx="40" cy="40" r={RING_RADIUS} />
        <circle
          className="ring-value"
          cx="40"
          cy="40"
          r={RING_RADIUS}
          style={{
            strokeDasharray: RING_CIRCUMFERENCE,
            strokeDashoffset: RING_OFFSET,
          }}
        />
      </svg>
      <div className="ring-label">
        <strong>{ENGAGEMENT_PERCENT}%</strong>
        <span>{t('login.hero.engaged')}</span>
      </div>
    </div>

    <div className="hero-card hero-card--trend">
      <svg viewBox="0 0 100 40" className="trend-line">
        <polyline points="0,32 15,26 30,28 45,18 60,20 75,8 100,4" />
      </svg>
      <span className="trend-label">{t('login.hero.trend')}</span>
    </div>
  </div>
  );
};

const Ambient = ({ variant, children }) => (
  <div className={`ambient ambient-${variant}`} aria-hidden="true">
    {children}
  </div>
);

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const features = t('login.features', { returnObjects: true });

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ sample role-based routing (replace paths later)
  const goDashboardByRole = (role) => {
    const r = String(role || "").toUpperCase();

    if (r === "ADMIN") return navigate("/admin/dashboard");
    if (r === "CHAIRPERSON") return navigate("/chairperson/dashboard");
    if (r === "COMMITTEEHEAD") return navigate("/committee-head/dashboard");
    if (r === "MEMBER") return navigate("/member/dashboard");

    return navigate("/"); // fallback
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      setError(t('login.errors.missingFields'));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      });

      // handle non-json response safely
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setError(data?.message || t('login.errors.loginFailed'));
        return;
      }

      // ✅ Save token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Redirect by role (backend returns user.role)
      goDashboardByRole(data?.user?.role);
    } catch (err) {
      // Reaching here means fetch() rejected, so no HTTP response came back at
      // all — the server being down, or the browser blocking the response
      // because this page's origin is not in the API's CORS allow-list. A real
      // server-side failure returns a status and is handled by !res.ok above,
      // so calling this one a "server error" points debugging the wrong way.
      console.error("Login request could not reach the API:", err);
      setError(
        `Could not reach the server at ${baseURL}. Check that the backend is running and that this page's address is allowed by it.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="LoginPage">
      <div className="login-card">
        <div className="login-panel">
          <Ambient variant="light">
            <span className="drop drop-l1" />
            <span className="drop drop-l2" />
            <span className="drop drop-l3" />
          </Ambient>

          <span className="brand-mark">Performance Tracking System</span>

          <div className="login-panel-content">
            <p className="eyebrow">{t('login.eyebrow')}</p>
            <h1 className="heading">{t('login.heading')}</h1>
            <p className="subtitle">{t('login.subtitle')}</p>

            <form className="login-form" onSubmit={handleLogin} noValidate>
              <label className="field">
                <span className="field-label">{t('login.usernameLabel')}</span>
                <div className="field-control">
                  <span className="field-icon-badge">
                    <FaUser className="field-icon" />
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={onChange}
                    placeholder={t('login.usernamePlaceholder')}
                    autoComplete="username"
                  />
                </div>
              </label>

              <label className="field">
                <span className="field-label">{t('login.passwordLabel')}</span>
                <div className="field-control">
                  <span className="field-icon-badge">
                    <FaLock className="field-icon" />
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder={t('login.passwordPlaceholder')}
                    autoComplete="current-password"
                  />
                </div>
              </label>

              {error && <p className="form-error">{error}</p>}

              <button className="submit-button" type="submit" disabled={loading}>
                {loading ? t('login.signingIn') : t('login.signIn')}
              </button>

              <p
                className="forgot-link"
                onClick={() => navigate("/forgot-password")}
              >
                {t('login.forgotPassword')}
              </p>
            </form>
          </div>
        </div>

        <div className="showcase-panel">
          <Ambient variant="dark">
            <span className="drop drop-a" />
            <span className="drop drop-b" />
            <span className="drop drop-c" />
          </Ambient>

          <div className="showcase-content">
            <span className="showcase-tag">
              {t('login.showcaseTag')}
            </span>

            <div className="showcase-heading">
              <h2>Performance</h2>
              <h2>Tracking</h2>
              <h2>System</h2>
            </div>

            <HeroVisual />

            <ul className="showcase-features">
              {features.map((feature) => (
                <li key={feature}>
                  <FaCheckCircle />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
