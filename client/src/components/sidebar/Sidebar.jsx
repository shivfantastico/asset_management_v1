/* Sidebar - Main navigation component */
import { NavLink } from 'react-router-dom'
import styles from '../sidebar/Sidebar.module.css'
// import lloydsLogo from "../../assets/lloyds_logo.png"
import lloydsLogo from "../../assets/lloyds_metals_logo.png"
import { FaHistory } from "react-icons/fa";

const navItems = [
  // { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { path: '/assets',    label: 'Assets',    icon: '◈' },
  { path: '/asset/history', label: 'Assets History', icon: '◎'}
  // { path: '/users',     label: 'Users',     icon: '◎' },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Lloyds Logo */}

        <div className={styles.logo}>
          <img src={lloydsLogo} alt="lloydsLogo" />
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <p className={styles.navLabel}>MAIN MENU</p>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navText}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.versionBadge}>© {new Date().getFullYear()} Lloyds Metals & Energy Ltd.</div>
          <div className={styles.versionBadge}>All Right Reserved.</div>
        </div>
      </aside>
    </>
  )
}
