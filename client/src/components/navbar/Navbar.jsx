/* Navbar - Top navigation bar with page title and actions */
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const pageTitles = {
  "/assets": "Assets",
  "/asset/history": "Assets History",
};

export default function Navbar({ onMenuClick, userObj }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // const [userObj, setUser] = useState([])
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    navigate("/login");
  };

const getInitials = (name) => {
  if (!name) return "";

  const words = name.trim().split(" ");

  if (words.length === 1) {
    return words[0][0].toUpperCase(); // Shritesh → S
  }

  return (
    words[0][0] + words[words.length - 1][0]
  ).toUpperCase(); // Shritesh Bucche → SB
};

  return (
    <header className={styles.navbar}>
      {/* Hamburger for mobile */}
      <button
        className={styles.menuBtn}
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      <div className={styles.spacer} />

      {/* Profile Section */}
      <div className={styles.profileWrapper} ref={dropdownRef}>
        <button
          className={styles.avatarBtn}
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-label="Profile menu"
          aria-expanded={dropdownOpen}
        >
          <span className={styles.avatarInitials}>{getInitials(userObj?.name)}</span>
          <span className={styles.avatarStatus} />
          <svg
            className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown */}
        <div
          className={`${styles.dropdown} ${dropdownOpen ? styles.dropdownVisible : ""}`}
          role="menu"
        >
          {/* User Info Header */}
          <div className={styles.dropdownHeader}>
            <div className={styles.dropdownAvatar}>{getInitials(userObj?.name)}</div>
            <div className={styles.dropdownUserInfo}>
              <span className={styles.dropdownName}>{userObj?.name}</span>
              <span className={styles.dropdownRole}>Administrator</span>
            </div>
          </div>

          {/* <div className={styles.dropdownDivider} /> */}

          {/* Menu Items */}
          {/* <button className={styles.dropdownItem} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </button> */}

          {/* <button className={styles.dropdownItem} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button> */}

          <div className={styles.dropdownDivider} />

          <button
            className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
            onClick={handleLogout}
            role="menuitem"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
