/* Layout - Wraps all pages with Sidebar + Navbar */
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import styles from "./Layout.module.css";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userObj, setUser] = useState(null);

  useEffect(() => {
    const userObj = JSON.parse(localStorage.getItem("user"));
    setUser(userObj);
  }, []);

  return (
    <div className={styles.appShell}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.mainArea}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} userObj={userObj} />
        <br />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
