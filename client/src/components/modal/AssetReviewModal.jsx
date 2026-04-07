/**
 * AssetReviewModal.jsx
 * ─────────────────────────────────────────────────────────────────
 * Two-phase modal for the Lloyds Asset Management System.
 *
 * Phase 1 — REVIEW
 *   Displays all submitted form data in a structured, scannable
 *   panel grouped by section. Admin can verify before committing.
 *   CTA: "Looks Good — Save & Generate" → triggers save + print phase.
 *
 * Phase 2 — PRINT PREVIEW
 *   Renders a corporate-standard handover certificate layout
 *   that matches the .docx template. Admin can print directly
 *   (window.print uses the @media print rules in the CSS).
 *
 * Props:
 *   isOpen       {boolean}   — controls visibility
 *   onClose      {function}  — called on backdrop / ✕ click
 *   onConfirm    {function}  — called when admin confirms; receives formData
 *   formData     {object}    — the raw form values
 *   category     {string}    — asset category key (pc | printer | gsm | tablet | dongle)
 *   isSubmitting {boolean}   — disables confirm button while API is in flight
 */

import { useState, useEffect, useRef } from "react";
import styles from "../modal/AssetReviewModal.module.css";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import companyFooter from "../../assets/company_footer.jpeg";

// ── Field label map ────────────────────────────────────────────────
const FIELD_LABELS = {
  emp_id: "Employee ID",
  name: "Employee Name",
  department: "Department",
  asset_type: "PC Type",
  make: "Make / Brand",
  model_name: "Model Name",
  serial_number: "Serial Number",
  asset_code: "Asset Code",
  monitor_serial_number: "Monitor Serial No.",
  ram: "RAM",
  storage: "Storage",
  specifications: "Specifications",
  windows_product_key: "Windows Product Key",
  has_antivirus: "Antivirus Installed",
  has_adapter: "Adapter",
  has_bag: "Bag",
  deployed_location: "Deployed Location",
  operating_sys: "Operating System",
  processor: "Processor",
  keyboard_type: "Keyboard Type",
  mouse_type: "Mouse Type",
  mac_address: "MAC Address",
  imei_no: "IMEI Number",
  phone_no: "Phone Number",
  handover_date: "Handover Date",
  handed_over_by: "Handed Over By",
  requested_by: "Requested By",
  remarks: "Remarks",
};

// ── Section groupings for review display ──────────────────────────
const SECTION_DEFS = [
  {
    id: "employee",
    title: "Employee Details",
    icon: "👤",
    fields: ["emp_id", "name", "department"],
  },
  {
    id: "asset",
    title: "Asset Information",
    icon: "🖥",
    fields: [
      "asset_type",
      "make",
      "model_name",
      "serial_number",
      "asset_code",
      "monitor_serial_number",
      "ram",
      "storage",
      "specifications",
      "windows_product_key",
      "has_antivirus",
      "has_adapter",
      "has_bag",
      "operating_sys",
      "processor",
      "keyboard_type",
      "mouse_type",
      "mac_address",
      "imei_no",
      "phone_no",
      "deployed_location",
    ],
  },
  {
    id: "handover",
    title: "Handover Details",
    icon: "📋",
    fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
  },
];

// ── Category display names ─────────────────────────────────────────
const CATEGORY_LABELS = {
  pc: "Computer / Laptop",
  printer: "Printer",
  gsmphone: "GSM Phone",
  tablet: "Tablet",
  dongle: "Dongle",
  keyboard: "Keyboard",
  mouse: "Mouse",
  switches: "Switch",
  firewall: "Firewall",
  accesspt: "Access Point",
  tv: "TV",
  server: "Server",
  mobile: "Mobile",
  headphone: "Headphone"
};

// ── Format a single value for display ─────────────────────────────
function fmt(key, val) {
  if (val === undefined || val === null || val === "") return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (key === "handover_date" && val) {
    try {
      return new Date(val).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return val;
    }
  }
  return String(val);
}

// ── ReviewPhase ────────────────────────────────────────────────────
function ReviewPhase({ formData, category, onConfirm, onClose, isSubmitting }) {
  return (
    <div className={styles.reviewBody}>
      {/* Category badge */}
      <div className={styles.categoryBadge}>
        <span className={styles.categoryDot} />
        {CATEGORY_LABELS[category] ?? category} · Asset Handover Record
      </div>

      {/* Sections */}
      {SECTION_DEFS.map((sec, si) => {
        const pairs = sec.fields
          .filter(
            (f) =>
              formData[f] !== undefined &&
              formData[f] !== null &&
              formData[f] !== "",
          )
          .map((f) => ({
            key: f,
            label: FIELD_LABELS[f] ?? f,
            value: fmt(f, formData[f]),
          }));

        if (pairs.length === 0) return null;

        return (
          <section
            key={sec.id}
            className={styles.section}
            style={{ "--delay": `${si * 0.06}s` }}
          >
            <div className={styles.sectionHead}>
              <span className={styles.sectionIcon}>{sec.icon}</span>
              <h3 className={styles.sectionTitle}>{sec.title}</h3>
              <span className={styles.sectionCount}>{pairs.length} fields</span>
            </div>

            <div className={styles.grid}>
              {pairs.map((p) => (
                <div
                  key={p.key}
                  className={`${styles.cell} ${p.key === "remarks" || p.key === "specifications" ? styles.cellFull : ""}`}
                >
                  <span className={styles.cellLabel}>{p.label}</span>
                  <span className={styles.cellValue}>{p.value}</span>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Action bar */}
      <div className={styles.actionBar}>
        <button
          className={styles.cancelBtn}
          onClick={onClose}
          disabled={isSubmitting}
        >
          ✕ &nbsp;Cancel
        </button>
        <button
          className={styles.editBtn}
          onClick={onClose}
          disabled={isSubmitting}
        >
          ✎ &nbsp;Edit Details
        </button>
        <button
          className={`${styles.confirmBtn} ${isSubmitting ? styles.confirmBtnLoading : ""}`}
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className={styles.spinner} />
          ) : (
            <>
              <span>Save &amp; Generate Document</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── PrintPhase ─────────────────────────────────────────────────────
function PrintPhase({ formData, category, onClose }) {
  const printRef = useRef(null);

  // const handlePrint = () => window.print();

  const handleDownload = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      // ✅ Enable PDF mode (makes hidden footer visible)
      element.classList.add(styles.pdfMode);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;

      const marginTop = 25;
      const marginLeft = 10;
      const marginRight = 10;

      const usableWidth = pageWidth - marginLeft - marginRight;
      const usableHeight = pageHeight - marginTop - 10;

      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = marginTop;

      pdf.addImage(imgData, "PNG", marginLeft, position, imgWidth, imgHeight);

      heightLeft -= usableHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = marginTop - imgHeight + (imgHeight - heightLeft);

        pdf.addImage(imgData, "PNG", marginLeft, position, imgWidth, imgHeight);

        heightLeft -= usableHeight;
      }

      const now = new Date();

      // Format: 30-Mar-2026_08-45-12-AM
      const formattedDateTime = now
        .toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        .replace(/,/g, "") // remove commas
        .replace(/ /g, "_") // spaces → underscores
        .replace(/:/g, "-"); // colons → safe for filename

      pdf.save(`Asset_${formData.emp_id}_${formattedDateTime}.pdf`);

      // pdf.save(`Asset_${formData.emp_id}.pdf`);

      // ❗ Remove PDF mode after generation
      element.classList.remove(styles.pdfMode);
    } catch (err) {
      console.error("PDF generation error:", err);
    }
  };

  const date = fmt("handover_date", formData.handover_date);
  const catLabel = CATEGORY_LABELS[category] ?? category;

  return (
    <div className={styles.printPhase}>
      {/* Screen-only toolbar */}
      <div className={styles.printToolbar}>
        <div className={styles.printToolbarLeft}>
          <span className={styles.printSuccessChip}>
            ✓ &nbsp;Saved successfully
          </span>
          <span className={styles.printInfo}>
            Review the certificate below before printing
          </span>
        </div>
        <div className={styles.printToolbarRight}>
          <button className={styles.printCloseBtn} onClick={onClose}>
            ✕ Close
          </button>
          <button className={styles.printBtn} onClick={handleDownload}>
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
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Download Certificate
          </button>
        </div>
      </div>

      {/* ── Printable certificate ─────────────────────────────── */}
      <div className={styles.printDoc} ref={printRef} id="printable-cert">
        {/* Letterhead */}
        <div className={styles.docHeader}>
          <div className={styles.docHeaderLeft}>
            <div className={styles.logo}>
              {/* Programmatic gear mark */}
              LMEL
              {/* <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="6" fill="#0d0d0d" />
                <path d="M18 2a2 2 0 0 1 2 2v1.2a12 12 0 0 1 4.24 1.76l.85-.85a2 2 0 0 1 2.83 2.83l-.85.85A12 12 0 0 1 28.8 14H30a2 2 0 0 1 0 4h-1.2a12 12 0 0 1-1.76 4.24l.85.85a2 2 0 0 1-2.83 2.83l-.85-.85A12 12 0 0 1 20 26.8V28a2 2 0 0 1-4 0v-1.2a12 12 0 0 1-4.24-1.76l-.85.85a2 2 0 0 1-2.83-2.83l.85-.85A12 12 0 0 1 7.2 18H6a2 2 0 0 1 0-4h1.2a12 12 0 0 1 1.76-4.24l-.85-.85a2 2 0 0 1 2.83-2.83l.85.85A12 12 0 0 1 16 5.2V4a2 2 0 0 1 2-2z"
                  fill="#C0000A" opacity="0.2" stroke="#C0000A" strokeWidth="1.5" />
              </svg> */}
            </div>
            <div className={styles.docCompany}>
              <span className={styles.docCompanyName}>
                LLOYDS METALS &amp; ENERGY LTD.
              </span>
              <span className={styles.docCompanyDept}>
                Information Technology Department
              </span>
            </div>
          </div>
          <div className={styles.docHeaderRight}>
            <span className={styles.docDocTitle}>
              ASSET HANDOVER CERTIFICATE
            </span>
            <span className={styles.docDocSub}>{catLabel}</span>
          </div>
        </div>

        <div className={styles.docRedBar} />

        <div className={styles.docFooter}>
          <span>Lloyds Metals &amp; Energy Ltd. · Confidential IT Record</span>
          <span>
            Generated:{" "}
            {new Date().toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true, // set false if you want 24-hour format
            })}
          </span>
        </div>

        {/* Meta strip */}
        <div className={styles.docMeta}>
          <span>
            Asset Code: <strong>{formData.asset_code || "—"}</strong>
          </span>
          <span>
            Date: <strong>{date}</strong>
          </span>
          <span>
            Emp. ID: <strong>{formData.emp_id || "—"}</strong>
          </span>
        </div>

        {/* Body table */}
        <table className={styles.docTable}>
          <tbody>
            {[
              { label: "Employee Name", value: formData.name },
              { label: "Department", value: formData.department },
              { label: "Make / Brand", value: formData.make },
              { label: "Model Name", value: formData.model_name },
              { label: "Serial Number", value: formData.serial_number },
              ...(formData.asset_code
                ? [{ label: "Asset Code", value: formData.asset_code }]
                : []),
              ...(formData.keyboard_type
                ? [{ label: "Keyboard Type", value: formData.keyboard_type }]
                : []),
              ...(formData.mouse_type
                ? [{ label: "Mouse Type", value: formData.mouse_type }]
                : []),
              ...(formData.ram ? [{ label: "RAM", value: formData.ram }] : []),
              ...(formData.storage
                ? [{ label: "Storage", value: formData.storage }]
                : []),
              ...(formData.imei_no
                ? [{ label: "IMEI Number", value: formData.imei_no }]
                : []),
              ...(formData.phone_no
                ? [{ label: "Phone Number", value: formData.phone_no }]
                : []),
              ...(formData.mac_address
                ? [{ label: "MAC Address", value: formData.mac_address }]
                : []),
              ...(formData.operating_sys
                ? [{ label: "Operating System", value: formData.operating_sys }]
                : []),
              ...(formData.has_antivirus
                ? [
                    {
                      label: "Antivirus Installed",
                      value: formData.has_antivirus,
                    },
                  ]
                : []),
              ...(formData.has_adapter
                ? [
                    {
                      label: "Adapter",
                      value: formData.has_adapter,
                    },
                  ]
                : []),
              ...(formData.has_bag
                ? [
                    {
                      label: "Bag",
                      value: formData.has_bag,
                    },
                  ]
                : []),
              ...(formData.windows_product_key
                ? [
                    {
                      label: "Windows Product Key",
                      value: formData.windows_product_key,
                    },
                  ]
                : []),
              ...(formData.deployed_location
                ? [
                    {
                      label: "Deployed Location",
                      value: formData.deployed_location,
                    },
                  ]
                : []),
              ...(formData.specifications
                ? [{ label: "Specifications", value: formData.specifications }]
                : []),
              { label: "Handover Date", value: date },
              { label: "Handed Over By", value: formData.handed_over_by },
              { label: "Requested By", value: formData.requested_by },
              ...(formData.remarks
                ? [{ label: "Remarks", value: formData.remarks }]
                : []),
            ].map((row, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? styles.docTrEven : styles.docTrOdd}
              >
                <td className={styles.docTdLabel}>{row.label}</td>
                <td className={styles.docTdValue}>{row.value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signature block */}
        <div className={styles.docSignatures}>
          <div className={styles.docSig}>
            <div className={styles.docSigLine} />
            <span className={styles.docSigName}>
              {formData.handed_over_by || "____________"}
            </span>
            <span className={styles.docSigRole}>IT Department — Issued By</span>
          </div>
          <div className={styles.docSig}>
            <div className={styles.docSigLine} />
            <span className={styles.docSigName}>
              {formData.name || "____________"}
            </span>
            <span className={styles.docSigRole}>Employee — Received By</span>
          </div>
          <div className={styles.docSig}>
            <div className={styles.docSigLine} />
            <span className={styles.docSigName}>____________</span>
            <span className={styles.docSigRole}>HOD — Acknowledged By</span>
          </div>
        </div>

        {/* Footer */}

        <div className={`${styles.pdfOnly}`}>
          <img
            src={companyFooter}
            alt="companyFooter"
            className={styles.footer}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────
export default function AssetReviewModal({
  isOpen,
  onClose,
  onConfirm,
  formData = {},
  category = "pc",
  isSubmitting = false,
}) {
  // phase: 'review' | 'print'
  const [phase, setPhase] = useState("review");
  const overlayRef = useRef(null);

  // Reset to review phase whenever modal opens
  useEffect(() => {
    if (isOpen) setPhase("review");
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    // console.log(formData)
    await onConfirm(formData);
    setPhase("print");
  };

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
      ref={overlayRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Asset Review"
    >
      <div
        className={`${styles.modal} ${phase === "print" ? styles.modalWide : ""}`}
      >
        {/* ── Modal header ─────────────────────────────────── */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            {/* Step indicators */}
            <div className={styles.steps}>
              <div
                className={`${styles.step} ${phase === "review" ? styles.stepActive : styles.stepDone}`}
              >
                <span className={styles.stepNum}>
                  {phase === "review" ? "1" : "✓"}
                </span>
                <span className={styles.stepLabel}>Review</span>
              </div>
              <div
                className={`${styles.stepConnector} ${phase === "print" ? styles.stepConnectorDone : ""}`}
              />
              <div
                className={`${styles.step} ${phase === "print" ? styles.stepActive : ""}`}
              >
                <span className={styles.stepNum}>2</span>
                <span className={styles.stepLabel}>Print</span>
              </div>
            </div>
            <h2 className={styles.modalTitle}>
              {phase === "review"
                ? "Review Asset Details"
                : "Print Certificate"}
            </h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* ── Modal body ───────────────────────────────────── */}
        <div className={styles.modalBody}>
          {phase === "review" ? (
            <ReviewPhase
              formData={formData}
              category={category}
              onConfirm={handleConfirm}
              onClose={onClose}
              isSubmitting={isSubmitting}
            />
          ) : (
            <PrintPhase
              formData={formData}
              category={category}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
