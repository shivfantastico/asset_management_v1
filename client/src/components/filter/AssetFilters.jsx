/**
 * RECOMMENDED FILTER IMPLEMENTATION FOR ASSETS PAGE
 * ==================================================
 * Hybrid approach: Sidebar on desktop, Dropdown on mobile
 * Includes asset counts and logical grouping
 */

import { useState, useMemo } from "react";
import styles from "./AssetFilters.module.css";

// Icons (you already have these imported)
import { FaLaptop } from "react-icons/fa";
import { AiFillPrinter } from "react-icons/ai";
import { CgSmartphoneShake } from "react-icons/cg";
import { FaTabletScreenButton } from "react-icons/fa6";
import { GiWifiRouter } from "react-icons/gi";
import { FaEdit } from "react-icons/fa";
import { FaRegKeyboard } from "react-icons/fa6";
import { FaComputerMouse } from "react-icons/fa6";
import { IoIosSwitch } from "react-icons/io";
import { BsFillHddNetworkFill } from "react-icons/bs";
import { TbAccessPoint } from "react-icons/tb";

const CATEGORY_GROUPS = {
  computing: {
    label: "Computing Devices",
    categories: ["pc", "tablet", "printer"],
  },
  peripherals: {
    label: "Peripherals",
    categories: ["keyboard", "mouse"],
  },
  network: {
    label: "Network Equipment",
    categories: ["switches", "firewall", "accesspt", "dongle", "gsmphone"],
  },
};

const CATEGORY_CONFIG = {
  all: { label: "All Assets", icon: null },
  pc: { label: "PC / Laptop", icon: <FaLaptop /> },
  printer: { label: "Printers", icon: <AiFillPrinter /> },
  gsmphone: { label: "GSM Phones", icon: <CgSmartphoneShake /> },
  tablet: { label: "Tablets", icon: <FaTabletScreenButton /> },
  dongle: { label: "Dongles", icon: <GiWifiRouter /> },
  keyboard: { label: "Keyboards", icon: <FaRegKeyboard /> },
  mouse: { label: "Mouse", icon: <FaComputerMouse /> },
  switches: { label: "Switches", icon: <IoIosSwitch /> },
  firewall: { label: "Firewalls", icon: <BsFillHddNetworkFill /> },
  accesspt: { label: "Access Points", icon: <TbAccessPoint /> },
};

export default function AssetFilters({
  selectedCategory,
  onCategoryChange,
  assets,
  searchValue,
  onSearchChange,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculate counts per category
  const categoryCounts = useMemo(() => {
    const counts = { all: assets.length };

    Object.keys(CATEGORY_CONFIG).forEach((cat) => {
      if (cat !== "all") {
        counts[cat] = assets.filter((a) => a.category === cat).length;
      }
    });

    return counts;
  }, [assets]);

  // Desktop: Sidebar
  const DesktopSidebar = () => (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.headerContent}>
          <h3 className={styles.sidebarTitle}>Filter Assets</h3>
        </div>
      </div>

      {/* All Assets */}
      <div className={styles.filterSection}>
        <button
          className={`${styles.filterItem} ${selectedCategory === "all" ? styles.active : ""}`}
          onClick={() => onCategoryChange("all")}
        >
          <span className={styles.filterIcon}>◈</span>
          <span className={styles.filterLabel}>All Assets</span>
          <span className={styles.filterCount}>{categoryCounts.all}</span>
        </button>
      </div>

      {/* Grouped Categories */}
      {Object.entries(CATEGORY_GROUPS).map(([groupKey, group]) => (
        <div key={groupKey} className={styles.filterSection}>
          <div className={styles.groupLabel}>{group.label}</div>

          {group.categories.map((category) => (
            <button
              key={category}
              className={`${styles.filterItem} ${selectedCategory === category ? styles.active : ""}`}
              onClick={() => onCategoryChange(category)}
            >
              <span className={styles.filterIcon}>
                {CATEGORY_CONFIG[category]?.icon}
              </span>
              <span className={styles.filterLabel}>
                {CATEGORY_CONFIG[category]?.label}
              </span>
              <span className={styles.filterCount}>
                {categoryCounts[category] || 0}
              </span>
            </button>
          ))}
        </div>
      ))}

      {/* Clear Filters */}
      {selectedCategory !== "all" && (
        <div className={styles.sidebarFooter}>
          <button
            className={styles.clearBtn}
            onClick={() => onCategoryChange("all")}
          >
            Clear Filter
          </button>
        </div>
      )}
    </aside>
  );

  // Mobile: Dropdown + Chips
  const MobileFilters = () => (
    <div className={styles.mobileFilters}>
      {/* Search */}
      {/* <input
        type="text"
        placeholder="Search assets..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.mobileSearch}
      /> */}

      {/* Dropdown */}
      <button
        className={styles.mobileDropdownButton}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span className={styles.dropdownIcon}>
          {CATEGORY_CONFIG[selectedCategory]?.icon || "◈"}
        </span>
        <span className={styles.dropdownLabel}>
          {CATEGORY_CONFIG[selectedCategory]?.label || "All Assets"}
        </span>
        <span className={styles.dropdownCount}>
          ({categoryCounts[selectedCategory] || 0})
        </span>
        <span className={styles.dropdownChevron}>▼</span>
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className={styles.mobileOverlay}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className={styles.mobileMenu}>
            <div className={styles.mobileMenuHeader}>
              <h3>Filter by Category</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.mobileMenuContent}>
              {/* All */}
              <button
                className={`${styles.mobileMenuItem} ${selectedCategory === "all" ? styles.active : ""}`}
                onClick={() => {
                  onCategoryChange("all");
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className={styles.menuIcon}>◈</span>
                <span className={styles.menuLabel}>All Assets</span>
                <span className={styles.menuCount}>{categoryCounts.all}</span>
              </button>

              {/* Groups */}
              {Object.entries(CATEGORY_GROUPS).map(([groupKey, group]) => (
                <div key={groupKey} className={styles.mobileGroup}>
                  <div className={styles.mobileGroupLabel}>{group.label}</div>
                  {group.categories.map((category) => (
                    <button
                      key={category}
                      className={`${styles.mobileMenuItem} ${selectedCategory === category ? styles.active : ""}`}
                      onClick={() => {
                        onCategoryChange(category);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span className={styles.menuIcon}>
                        {CATEGORY_CONFIG[category]?.icon}
                      </span>
                      <span className={styles.menuLabel}>
                        {CATEGORY_CONFIG[category]?.label}
                      </span>
                      <span className={styles.menuCount}>
                        {categoryCounts[category] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <div className={styles.desktopOnly}>
        <DesktopSidebar />
      </div>
      <div className={styles.mobileOnly}>
        <MobileFilters />
      </div>
    </>
  );
}
