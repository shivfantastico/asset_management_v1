/**
 * Login.jsx
 * Lloyds Metals & Energy Ltd. — Corporate Login
 *
 * Usage in App.jsx:
 *   import Login from './pages/Login/Login'
 *   <Route path="/login" element={<Login />} />
 *
 * Deps: react-hook-form
 *   npm install react-hook-form
 *
 * Place login_bg_2.jpg inside src/assets/
 *   import loginBg from '../../assets/login_bg_2.jpg'
 *   (update the import path below if your structure differs)
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import loginBg from "../assets/login_bg_2.jpg";
import companyLogo from "../assets/lloyds_metals_logo.png";
import api from "../utils/axios";

// ── Eye icons ─────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ── Main component ────────────────────────────────────────────────
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post("/api/admin/login", data);
      // console.log(res);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      // replace
      navigate("/assets", { replace: true });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* ── Full-bleed background ─────────────────────────── */}
      <div
        className={styles.bg}
        style={{ backgroundImage: `url(${loginBg})` }}
        aria-hidden="true"
      />

      {/* Multi-layer overlay: dark base + red diagonal accent */}
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.overlayAccent} aria-hidden="true" />

      {/* ── Floating particle dots (pure CSS) ────────────── */}
      <div className={styles.particles} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={styles.particle} style={{ "--i": i }} />
        ))}
      </div>

      {/* ── Card ─────────────────────────────────────────── */}
      <main className={styles.card}>
        {/* Red top bar */}
        <div className={styles.cardBar} />

        {/* Logo block */}
        <header className={styles.header}>
          <div className={styles.logoRow}>
            <img
              src={companyLogo}
              alt="Company Logo"
              className={styles.companyLogo}
            />
          </div>
          <div className={styles.divider} />
          <h1 className={styles.title}>Asset Management Portal</h1>
          <p className={styles.subtitle}>
            Sign in with your corporate credentials to continue
          </p>
        </header>

        {/* Form */}
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          autoComplete="on"
        >
          {/* Email */}
          <div
            className={`${styles.field} ${errors.email ? styles.fieldError : ""}`}
          >
            <label className={styles.label} htmlFor="email">
              Corporate Email
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon} aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="admin@lloyds.in"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email", {
                  required: "Email address is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
            </div>
            {errors.email && (
              <span id="email-error" className={styles.errorMsg} role="alert">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div
            className={`${styles.field} ${errors.password ? styles.fieldError : ""}`}
          >
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon} aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${styles.inputPassword}`}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
            {errors.password && (
              <span
                id="password-error"
                className={styles.errorMsg}
                role="alert"
              >
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Forgot password */}
          {/* <div className={styles.forgotRow}>
            <a href="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </a>
          </div> */}

          {/* Submit */}
          <button
            type="submit"
            className={`${styles.submitBtn} ${isLoading ? styles.submitBtnLoading : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner} aria-label="Signing in…" />
            ) : (
              <>
                <span>Sign In</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <footer className={styles.footer}>
          {/* <p className={styles.footerTxt}>
            Secured by Lloyds IT &nbsp;·&nbsp; Authorised Personnel Only
          </p> */}
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} Lloyds Metals &amp; Energy Ltd. All
            rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
