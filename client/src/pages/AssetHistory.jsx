/**
 * AssetHistory.jsx
 * ─────────────────────────────────────────────────────────────────
 * Lloyds Metals & Energy Ltd. — Asset Transfer History
 *
 * Layout: Two-panel split
 *   LEFT  — Debounced search (asset_code / serial_number) + asset list
 *   RIGHT — Selected asset details + transfer timeline
 *
 * API contracts expected (adjust base URL / axios instance as needed):
 *   GET /api/assets/search?q={query}
 *     → { data: [{ id, asset_code, serial_number, model_name, category, status }] }
 *
 *   GET /api/assets/history/:category/:id
 *     → {
 *         data: {
 *           asset: { asset_code, serial_number, model_name, make, handover_date,
 *                    category, status, ram?, storage?, specifications? },
 *           history: [
 *             { holder_name, department, designation?,
 *               from_date, to_date|null, reason?, is_current }
 *           ]   // newest first
 *         }
 *       }
 *
 * Debounce: 400 ms
 * Toast: inline (no external library needed)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "../utils/axios"; // adjust import path as needed
import styles from "./AssetHistory.module.css";

// ── Category display helpers ───────────────────────────────────────
const CATEGORY_META = {
  pc: { label: "Computer / Laptop", icon: "🖥", color: "#3B82F6" },
  printer: { label: "Printer", icon: "🖨", color: "#8B5CF6" },
  gsmphone: { label: "GSM Phone", icon: "📱", color: "#10B981" },
  tablet: { label: "Tablet", icon: "⬜", color: "#F59E0B" },
  dongle: { label: "Dongle", icon: "🔌", color: "#EF4444" },
  keyboard: { label: "Keyboard", icon: "⌨️", color: "#b9eb15" },
  mouse: { label: "Mouse", icon: "🖱️", color: "#3027d7" },
  switches: { label: "Switch", icon: "🔀", color: "#e247c3" },
  firewall: { label: "Firewall", icon: "🛡️", color: "#3a9cc0" },
  accesspt: { label: "Access Point", icon: "📡", color: "#c2380a" },
  tv: { label: "TV", icon: "📺", color: "#820707" },
  server: { label: "Server", icon: "🗄️", color: "#b12ac3" },
  mobile: { label: "Mobile", icon: "📞", color: "#1089aa" },
  headphone: { label: "Headphone", icon: "🎧", color: "#f08820" },
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const daysBetween = (from, to) => {
  // console.log(from, to)
  const a = new Date(from);
  const b = to ? new Date(to) : new Date();
  const diff = Math.abs(b - a);
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days}d`;
  const mo = Math.floor(days / 30);
  const rem = days % 30;
  return rem > 0 ? `${mo} mo ${rem}d` : `${mo} mo`;
};

// ── Inline Toast ───────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }, []);
  return { toasts, show };
}

function ToastContainer({ toasts }) {
  return (
    <div className={styles.toastContainer}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[`toast_${t.type}`]}`}
        >
          <span className={styles.toastIcon}>
            {t.type === "success" ? "✓" : t.type === "info" ? "ℹ" : "⚠"}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Avatar initials ────────────────────────────────────────────────
function Avatar({ name, size = 36, isCurrent = false }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div
      className={`${styles.avatar} ${isCurrent ? styles.avatarCurrent : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

// ── Skeleton loaders ───────────────────────────────────────────────
function SkeletonList() {
  return (
    <div className={styles.skeletonList}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={styles.skeletonItem}
          style={{ "--d": `${i * 0.06}s` }}
        >
          <div className={styles.skeletonCircle} />
          <div className={styles.skeletonLines}>
            <div className={styles.skeletonLine} style={{ width: "60%" }} />
            <div className={styles.skeletonLine} style={{ width: "40%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className={styles.skeletonDetail}>
      <div
        className={styles.skeletonBlock}
        style={{ height: 28, width: "55%" }}
      />
      <div
        className={styles.skeletonBlock}
        style={{ height: 14, width: "30%", marginTop: 6 }}
      />
      <div className={styles.skeletonMetaRow}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={styles.skeletonMeta}>
            <div
              className={styles.skeletonBlock}
              style={{ height: 11, width: "70%" }}
            />
            <div
              className={styles.skeletonBlock}
              style={{ height: 16, width: "85%", marginTop: 4 }}
            />
          </div>
        ))}
      </div>
      <div
        className={styles.skeletonBlock}
        style={{ height: 1, width: "100%", marginTop: 20 }}
      />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={styles.skeletonTimelineItem}
          style={{ "--d": `${i * 0.08}s` }}
        >
          <div className={styles.skeletonCircle} />
          <div className={styles.skeletonLines} style={{ flex: 1 }}>
            <div
              className={styles.skeletonBlock}
              style={{ height: 15, width: "40%" }}
            />
            <div
              className={styles.skeletonBlock}
              style={{ height: 11, width: "25%", marginTop: 4 }}
            />
            <div
              className={styles.skeletonBlock}
              style={{ height: 10, width: "65%", marginTop: 6 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────
function EmptyState({ query }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>◎</div>
      <p className={styles.emptyTitle}>
        {query ? `No assets found for "${query}"` : "No results"}
      </p>
      <p className={styles.emptySub}>
        Try searching by asset code or serial number
      </p>
    </div>
  );
}

// ── No selection state ─────────────────────────────────────────────
function NoSelection() {
  return (
    <div className={styles.noSelection}>
      <div className={styles.noSelectionIcon}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="56"
          height="56"
        >
          <rect
            x="8"
            y="14"
            width="48"
            height="32"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M22 46v4M42 46v4M16 50h32"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="32" cy="30" r="6" stroke="currentColor" strokeWidth="2" />
          <path
            d="M26 30h-6M44 30h-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className={styles.noSelectionTitle}>Select an Asset</h3>
      <p className={styles.noSelectionSub}>
        Search by asset code or serial number, then select an asset to view its
        full transfer history.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function AssetHistory() {
  const { toasts, show: showToast } = useToast();

  // Search
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false); // has user typed?

  // Selection
  const [selectedAsset, setSelectedAsset] = useState(null); // item from search list
  const [detail, setDetail] = useState(null); // full history payload
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Active tab on right panel
  const [activeTab, setActiveTab] = useState("history");

  const inputRef = useRef(null);

  // ── Debounce ─────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  // ── Search API call ───────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQ) {
      setSearchResults([]);
      setSearched(false);
      return;
    }
    const controller = new AbortController();
    (async () => {
      // console.log(debouncedQ);
      setSearching(true);
      setSearched(true);
      try {
        const res = await axios.get("/api/assets/search", {
          params: { q: debouncedQ },
          signal: controller.signal,
        });
        setSearchResults(res.data?.data ?? []);
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          showToast("Search failed. Please try again.", "error");
        }
      } finally {
        setSearching(false);
      }
    })();
    return () => controller.abort();
  }, [debouncedQ]); // eslint-disable-line

  // ── Load history for selected asset ──────────────────────────────
  useEffect(() => {
    if (!selectedAsset) return;
    const controller = new AbortController();
    (async () => {
      setLoadingDetail(true);
      setDetail(null);
      setActiveTab("history");
      try {
        const res = await axios.get(
          `/api/assets/history/${selectedAsset.category}/${selectedAsset.id}`,
          { signal: controller.signal },
        );
        setDetail(res.data?.data ?? null);
        if (!res.data?.data?.history?.length) {
          showToast("No transfer history found for this asset.", "info");
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          showToast("Failed to load asset history.", "error");
          setDetail(null);
        }
      } finally {
        setLoadingDetail(false);
      }
    })();
    return () => controller.abort();
  }, [selectedAsset]); // eslint-disable-line

  const handleSelectAsset = (item) => {
    // console.log(item)
    setSelectedAsset(item);
  };

  const handleClearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const cat = detail?.asset?.category;
  const catMeta = CATEGORY_META[cat] ?? CATEGORY_META.pc;

  // ── Handover count ────────────────────────────────────────────────
  const handoverCount = detail?.history?.length ?? 0;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} />

      {/* ══════════════════════════════════════════════
          LEFT PANEL — Search + Asset List
      ══════════════════════════════════════════════ */}
      <aside className={styles.sidebar}>
        {/* Sidebar header */}
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Asset History</h2>
          <p className={styles.sidebarSub}>Transfer &amp; Handover Records</p>
        </div>

        {/* Search input */}
        <div className={styles.searchWrap}>
          <div
            className={`${styles.searchBox} ${query ? styles.searchBoxActive : ""}`}
          >
            <span className={styles.searchIcon}>
              {searching ? (
                <span className={styles.searchSpinner} />
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
            </span>
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search asset code or serial no."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                className={styles.clearBtn}
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <p className={styles.searchHint}>
            Search by asset code or serial number
          </p>
        </div>

        {/* Results list */}
        <div className={styles.listArea}>
          {searching && !searchResults.length ? (
            <SkeletonList />
          ) : searched && searchResults.length === 0 ? (
            <EmptyState query={debouncedQ} />
          ) : searchResults.length > 0 ? (
            <ul className={styles.assetList}>
              {searchResults.map((item, idx) => {
                const m = CATEGORY_META[item.category] ?? CATEGORY_META.pc;
                const sel =
                  selectedAsset?.id === item.id &&
                  selectedAsset?.category === item.category;
                return (
                  <div key={`${item.category}-${item.id}`}>
                    <br />

                    <li
                      key={`${item.category}-${item.id}`}
                      className={`${styles.assetItem} ${sel ? styles.assetItemSelected : ""}`}
                      style={{ "--idx": idx }}
                      onClick={() => handleSelectAsset(item)}
                    >
                      <div
                        className={styles.assetItemIcon}
                        style={{ "--cat-color": m.color }}
                      >
                        {m.icon}
                      </div>
                      <div className={styles.assetItemBody}>
                        <span className={styles.assetItemName}>
                          {item.model_name || "Unknown Asset"}
                        </span>
                        <span className={styles.assetItemCode}>
                          {item.asset_code
                            ? "Asset Code:" + item.asset_code
                            : "Serial No:" + item.serial_number}
                          {/* { "Asset Code:"+ item.asset_code || "Serial No:"+item.serial_number} */}
                        </span>
                      </div>
                      {item.status && (
                        <span
                          className={`${styles.statusChip} ${
                            item.status === "active"
                              ? styles.statusActive
                              : item.status === "returned"
                                ? styles.statusReturned
                                : styles.statusDefault
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </li>
                  </div>
                );
              })}
            </ul>
          ) : (
            <div className={styles.idleHint}>
              <span className={styles.idleIcon}>⌕</span>
              <p>Start typing to search assets</p>
            </div>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — Asset Detail + History
      ══════════════════════════════════════════════ */}
      <main className={styles.detail}>
        {!selectedAsset && !loadingDetail ? (
          <NoSelection />
        ) : loadingDetail ? (
          <SkeletonDetail />
        ) : detail ? (
          <>
            {/* ── Asset header ─────────────────────────────────── */}
            <div className={styles.detailHeader}>
              <div className={styles.detailHeaderLeft}>
                <div
                  className={styles.categoryTag}
                  style={{ "--cat-color": catMeta.color }}
                >
                  <span>{catMeta.icon}</span>
                  {catMeta.label}
                </div>
                <h1 className={styles.assetName}>{detail.asset.model_name}</h1>
                <p className={styles.assetId}>
                  Asset Code:{" "}
                  <strong>
                    {detail.asset.asset_code || detail.asset.serial_number}
                  </strong>
                </p>
              </div>
              <div className={styles.detailHeaderRight}>
                <span
                  className={`${styles.statusBadge} ${
                    detail.asset.status === "active"
                      ? styles.statusBadgeActive
                      : styles.statusBadgeDefault
                  }`}
                >
                  {detail.asset.status ?? "Active"}
                </span>
              </div>
            </div>

            {/* ── Key metrics strip ─────────────────────────────── */}
            <div className={styles.metricsStrip}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Serial Number</span>
                <span className={styles.metricValue}>
                  {detail.asset.serial_number || "—"}
                </span>
              </div>
              {/* <div className={styles.metricDivider} /> */}
              {/* <div className={styles.metric}>
                <span className={styles.metricLabel}>First Handover</span>
                <span className={styles.metricValue}>
                  {fmtDate(detail.asset.handover_date)}
                </span>
              </div> */}
              <div className={styles.metricDivider} />
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Current Holder</span>
                <span className={styles.metricValue}>
                  {detail.history?.find((h) => h.is_current)?.holder_name ||
                    "—"}
                </span>
              </div>
              <div className={styles.metricDivider} />
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Handovers</span>
                <span
                  className={`${styles.metricValue} ${styles.metricAccent}`}
                >
                  {handoverCount}
                </span>
              </div>
            </div>

            {/* ── Tab bar ──────────────────────────────────────── */}
            <div className={styles.tabBar}>
              {["history", "details"].map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "history" ? "History" : "Details"}
                </button>
              ))}
            </div>

            {/* ── Tab: History ─────────────────────────────────── */}
            {activeTab === "history" && (
              <div className={styles.timelineWrap}>
                {!detail.history?.length ? (
                  <div className={styles.noHistory}>
                    <span>No transfer history recorded for this asset.</span>
                  </div>
                ) : (
                  <ol className={styles.timeline}>
                    {detail.history.map((entry, idx) => (
                      <li
                        key={idx}
                        className={`${styles.timelineEntry} ${entry.is_current ? styles.timelineEntryCurrent : ""}`}
                        style={{ "--idx": idx }}
                      >
                        {/* Spine dot */}
                        <div className={styles.spineDot}>
                          <div
                            className={`${styles.dot} ${entry.is_current ? styles.dotCurrent : ""}`}
                          />
                          {idx < detail.history.length - 1 && (
                            <div className={styles.spine} />
                          )}
                        </div>

                        {/* Entry card */}
                        <div
                          className={`${styles.entryCard} ${entry.is_current ? styles.entryCardCurrent : ""}`}
                        >
                          <div className={styles.entryCardTop}>
                            <div className={styles.entryLeft}>
                              <Avatar
                                name={entry.holder_name}
                                size={38}
                                isCurrent={entry.is_current}
                              />
                              <div className={styles.entryInfo}>
                                <span className={styles.entryName}>
                                  {entry.holder_name}
                                </span>
                                <span className={styles.entryDept}>
                                  {entry.department}
                                  {/* {entry.designation
                                    ? ` · ${entry.designation}`
                                    : ""} */}
                                </span>
                              </div>
                            </div>

                            <div className={styles.entryRight}>
                              {entry.is_current && (
                                <span className={styles.currentTag}>
                                  Current
                                </span>
                              )}
                              {idx === detail.history.length - 1 &&
                                !entry.is_current && (
                                  <span className={styles.initialTag}>
                                    Initial assign
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Date + duration row */}
                          <div className={styles.entryMeta}>
                            <span className={styles.entryDates}>
                              {entry.is_current
                                ? `Assigned: ${fmtDate(entry.from_date)}`
                                : `${fmtDate(entry.from_date)} → ${fmtDate(entry.to_date)}`}
                            </span>
                            <span className={styles.entryDot}>•</span>
                            <span className={styles.entryDuration}>
                              {daysBetween(entry.from_date, entry.to_date)}
                            </span>
                            {entry.reason && (
                              <>
                                <span className={styles.entryDot}>•</span>
                                <span className={styles.entryReason}>
                                  {entry.reason}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            {/* ── Tab: Details ─────────────────────────────────── */}
            {activeTab === "details" && (
              <div className={styles.detailsGrid}>
                {[
                  { label: "Category", value: catMeta.label },
                  { label: "Make", value: detail.asset.make },
                  { label: "Model Name", value: detail.asset.model_name },
                  { label: "Asset Code", value: detail.asset.asset_code },
                  { label: "Serial Number", value: detail.asset.serial_number },
                  { label: "RAM", value: detail.asset.ram },
                  { label: "Storage", value: detail.asset.storage },
                  {
                    label: "Operating System",
                    value: detail.asset.operating_sys,
                  },
                  { label: "Processor", value: detail.asset.processor },
                  { label: "MAC Address", value: detail.asset.mac_address },
                  { label: "IMEI Number", value: detail.asset.imei_no },
                  {
                    label: "Specifications",
                    value: detail.asset.specifications,
                  },
                  {
                    label: "Deployed Location",
                    value: detail.asset.deployed_location,
                  },
                ]
                  .filter((r) => r.value)
                  .map((row, i) => (
                    <div
                      key={i}
                      className={`${styles.detailRow} ${
                        row.label === "Specifications"
                          ? styles.detailRowFull
                          : ""
                      }`}
                    >
                      <span className={styles.detailLabel}>{row.label}</span>
                      <span className={styles.detailValue}>{row.value}</span>
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
