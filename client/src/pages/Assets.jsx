/**
 * Assets.jsx  (updated)
 * ─────────────────────────────────────────────────────────────────
 * Changes from original (marked with // ← NEW):
 *   1. `id` and `category` now included in every flat row.
 *   2. Edit column's render now calls handleEditClick(row).
 *   3. EditAssetModal imported and rendered with onSaved → refetch.
 *   4. fetchAssets() extracted to module scope so onSaved can call it.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// import { mockAssets } from '../mock/mockData'
import styles from "../pages/Assets.module.css";
import axios from "../utils/axios";
import Table from "../components/table/Table";
import { FaLaptop } from "react-icons/fa";
import { AiFillPrinter } from "react-icons/ai";
import { CgSmartphoneShake } from "react-icons/cg";
import { FaTabletScreenButton } from "react-icons/fa6";
import { GiWifiRouter } from "react-icons/gi";
import { FaEdit } from "react-icons/fa";

import EditAssetModal from "../components/modal/EditAssetModal"; // ← NEW

import pc from "../pages/assets/pc.png";
import printer from "../pages/assets/printer.png";
import gsm from "../pages/assets/gsm_1.png";
import tablet from "../pages/assets/tablet_1.png";
import dongle from "../pages/assets/dongle_1.png";

const PAGE_SIZE = 5;

const getCategoryImage = (category) => {
  switch (category) {
    case "pc":
      return pc;
    case "printer":
      return printer;
    case "gsm":
      return gsm;
    case "tablet":
      return tablet;
    case "dongle":
      return dongle;
    default:
      return pc;
  }
};

const filterConfig = {
  all: { label: "All" },
  pc: { icon: <FaLaptop className={styles.icon} /> },
  printer: { icon: <AiFillPrinter className={styles.icon} /> },
  gsm: { icon: <CgSmartphoneShake className={styles.icon} /> },
  tablet: { icon: <FaTabletScreenButton className={styles.icon} /> },
  dongle: { icon: <GiWifiRouter className={styles.icon} /> },
};

// ── Helper: format date ───────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB");
};

export default function Assets() {
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  // ── NEW: edit modal state ──────────────────────────────────────
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // { id, category }

  // ── Fetch all assets ──────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/assets/all");
      const apiData = res.data.data;
      const flatData = [];

      apiData.forEach((user) => {
        // PC
        user.assets.pc.forEach((pc) => {
          flatData.push({
            id: pc.id, // ← NEW
            category: "pc", // ← NEW
            serial_number: pc.serial,
            model_name: pc.model,
            assigned_to: user.name,
            emp_id: user.emp_id,
            department: user.department,
            handover_date: formatDate(pc.handover_dt),
            to_date: formatDate(pc.to_date) || "--",
            user_verified: pc.user_verified,
            status: pc.status,
          });
        });

        // Printer
        user.assets.printer.forEach((pr) => {
          flatData.push({
            id: pr.id, // ← NEW
            category: "printer", // ← NEW
            serial_number: pr.serial,
            model_name: pr.model,
            assigned_to: user.name,
            emp_id: user.emp_id,
            department: user.department,
            handover_date: formatDate(pr.handover_dt),
            to_date: formatDate(pr.to_date) || "--",
            user_verified: pr.user_verified,
            status: pr.status,
          });
        });

        // GSM
        user.assets.gsm.forEach((gsm) => {
          flatData.push({
            id: gsm.id, // ← NEW
            category: "gsm", // ← NEW
            serial_number: gsm.serial,
            model_name: gsm.model,
            assigned_to: user.name,
            emp_id: user.emp_id,
            department: user.department,
            handover_date: formatDate(gsm.handover_dt),
            to_date: formatDate(gsm.to_date) || "--",
            user_verified: gsm.user_verified,
            status: gsm.status,
          });
        });

        // Tablet
        user.assets.tablet.forEach((tb) => {
          flatData.push({
            id: tb.id, // ← NEW
            category: "tablet", // ← NEW
            serial_number: tb.serial,
            model_name: tb.model,
            assigned_to: user.name,
            emp_id: user.emp_id,
            department: user.department,
            handover_date: formatDate(tb.handover_dt),
            to_date: formatDate(tb.to_date) || "--",
            user_verified: tb.user_verified,
            status: tb.status,
          });
        });

        // Dongle
        user.assets.dongle.forEach((dg) => {
          flatData.push({
            id: dg.id, // ← NEW
            category: "dongle", // ← NEW
            serial_number: dg.serial,
            model_name: dg.model,
            assigned_to: user.name,
            emp_id: user.emp_id,
            department: user.department,
            handover_date: formatDate(dg.handover_dt),
            to_date: formatDate(dg.to_date) || "--",
            user_verified: dg.user_verified,
            status: dg.status,
          });
        });
      });

      setAssets(flatData);
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, filterCat]);

  // ── NEW: open edit modal ───────────────────────────────────────
  const handleEditClick = useCallback((row) => {
    if (!row.id || !row.category) {
      console.warn("Edit clicked but row is missing id or category", row);
      return;
    }
    setEditTarget({ id: row.id, category: row.category });
    setEditModalOpen(true);
  }, []);

  // ── Table column definitions ───────────────────────────────────
  // (columns defined here so handleEditClick is in scope)
  const columns = useMemo(
    () => [
      {
        key: "serial_number",
        label: "Serial Number",
        width: 160,
        render: (v) => (
          <span
            style={{
              fontFamily: "var(--font-condensed)",
              fontSize: 13,
              color: "#111827",
              fontWeight: 700,
            }}
          >
            {v}
          </span>
        ),
      },
      {
        key: "model_name",
        label: "Asset",
        render: (_, row) => (
          <div className={styles.assetCell}>
            <img
              src={getCategoryImage(row.category)}
              alt="asset"
              className={styles.assetImg}
            />
            <div className={styles.assetText}>
              <span className={styles.assetModel}>{row.model_name || "—"}</span>
              <span className={styles.assetCategory}>
                {row.category?.toUpperCase()}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "assigned_to",
        label: "Assigned To",
        render: (_, row) => (
          <div className={styles.assetCell}>
            {/* <img src={getCategoryImage(row.category)} alt="asset" className={styles.assetImg} /> */}
            <div className={styles.assetText}>
              <span className={styles.assetModel}>
                {row.assigned_to || "—"}
              </span>
              <span className={styles.assetCategory}>
                {row.emp_id?.toUpperCase()}
              </span>
            </div>
          </div>
        ),
      },

      { key: "department", label: "Department" },
      { key: "handover_date", label: "Handover Date" },
      { key: "to_date", label: "Surrender Date" },
      {
        key: "status",
        label: "Status",
        render: (v) => (
          <span
            className={`${styles.verifiedBadge} ${v ? styles.yes : styles.no}`}
          >
            {v ? "●  In Use" : "●  Surrendered"}
          </span>
        ),
      },
      {
        key: "edit",
        label: "Edit",
        render: (_, row) => (
          // ← NEW: onClick fires handleEditClick with the full row
          <div
            className={styles.editAssetCell}
            onClick={() => handleEditClick(row)}
            title={`Edit ${row.model_name || "asset"}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleEditClick(row)}
            style={{ cursor: "pointer" }}
          >
            <FaEdit />
          </div>
        ),
      },
    ],
    [handleEditClick],
  );

  // ── Filter + search ────────────────────────────────────────────
  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchCat = filterCat === "all" || a.category === filterCat;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.serial_number?.toLowerCase().includes(q) ||
        a.model_name?.toLowerCase().includes(q) ||
        a.assigned_to?.toLowerCase().includes(q) ||
        a.emp_id?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [assets, search, filterCat]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.parentPage}>
      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by code, model, user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.filterTabs}>
          {["all", "pc", "printer", "gsm", "tablet", "dongle"].map((cat) => (
            <button
              key={cat}
              className={`${styles.filterTab} ${filterCat === cat ? styles.activeTab : ""}`}
              onClick={() => setFilter(cat)}
            >
              {filterConfig[cat]?.label || filterConfig[cat]?.icon}
            </button>
          ))}
        </div>
      </div>

      <br />

      <div className={styles.page}>
        {/* Page Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>◈ AssetHub</h1>
            <p className={styles.subtitle}>
              {filtered.length} asset{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button
            className={styles.addBtn}
            onClick={() => navigate("/assets/add")}
          >
            + Add Asset
          </button>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <Table
            columns={columns}
            data={paginated}
            loading={loading}
            emptyMessage="No assets match your filters."
          />
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>

            <div className={styles.pageNumbers}>
              {(() => {
                let start = Math.max(1, page - 1);
                let end = Math.min(totalPages, page + 1);

                // Ensure always 3 pages if possible
                if (page === 1) {
                  end = Math.min(3, totalPages);
                } else if (page === totalPages) {
                  start = Math.max(totalPages - 2, 1);
                }

                const pages = [];
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }

                return pages.map((p) => (
                  <button
                    key={p}
                    className={`${styles.pageNum} ${page === p ? styles.pageActive : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ));
              })()}
            </div>

            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── NEW: Edit Asset Modal ─────────────────────────────── */}
      <EditAssetModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditTarget(null);
        }}
        onSaved={() => {
          fetchAssets();
        }} // refetch list after save
        assetRef={editTarget}
      />
    </div>
  );
}
