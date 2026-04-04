/* Navbar - Top navigation bar with page title and actions */
import { useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";

const pageTitles = {
  //   '/dashboard': 'Dashboard',
  "/assets": "Assets",

  "/asset/history": "Assets History",
  //   '/assets/add': 'Add Asset',
  //   '/users': 'Users',
};

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  // const title = pageTitles[pathname] || '◈ AssetHub'

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

      {/* <div className={styles.actions}>
        <div className={styles.avatar}>AD</div>
      </div> */}
    </header>
  );
}
