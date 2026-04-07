/**
 * EditAssetModal.jsx
 * ─────────────────────────────────────────────────────────────────
 * Lloyds Metals & Energy Ltd. — Edit Asset Details
 *
 * Flow:
 *   1. Parent passes { id, category } when admin clicks edit icon.
 *   2. Modal opens → immediately GETs /api/assets/:category/:id
 *      to fetch current field values.
 *   3. All editable fields for that category are pre-filled.
 *   4. On submit → PATCHes /api/assets/:category/:id with changed data.
 *   5. Success: toast + onSaved() callback so parent can refetch list.
 *
 * Props:
 *   isOpen    {boolean}   controls visibility
 *   onClose   {function}  called on ✕ / Escape / backdrop click
 *   onSaved   {function}  called after successful save (no args)
 *   assetRef  {object}    { id, category } of the asset to edit
 *
 * No external form library needed — controlled inputs only.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "../../utils/axios";
import styles from "../modal/EditAssetModal.module.css";

// ── Field definitions per category ───────────────────────────────
// Each field: { name, label, type, options?, required, disabled? }

const COMMON_FIELDS = [
  {
    name: "handover_date",
    label: "Handover Date",
    type: "date",
    required: true,
    disabled: false,
  },
  {
    name: "handed_over_by",
    label: "Handed Over By",
    type: "text",
    required: true,
    disabled: true,
  },
  {
    name: "requested_by",
    label: "Requested By",
    type: "text",
    required: true,
    disabled: false,
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    required: false,
    disabled: false,
  },
  {
    name: "to_date",
    label: "Surrender Date",
    type: "date",
    required: false,
    disabled: false,
  },
  {
    name: "surrendered_to",
    label: "Surrendered To",
    type: "select",
    options: [],
    required: false,
    disabled: false,
  },
  {
    name: "closing_remark",
    label: "Closing Remarks",
    type: "textarea",
    required: false,
    disabled: false,
  },
];

const FIELDS_BY_CATEGORY = {
  pc: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "asset_type",
      label: "PC Type",
      type: "select",
      options: ["laptop", "desktop"],
      required: true,
      disabled: false,
    },
    { name: "make", label: "Make / Brand", type: "text", required: true },
    { name: "model_name", label: "Model Name", type: "text", required: true },
    {
      name: "monitor_serial_number",
      label: "Monitor Serial No.",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "ram",
      label: "RAM",
      type: "select",
      options: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"],
      required: true,
      disabled: false,
    },
    {
      name: "storage",
      label: "Storage",
      type: "select",
      options: [
        "128 GB SSD",
        "256 GB SSD",
        "512 GB SSD",
        "1 TB SSD",
        "256 GB HDD",
        "512 GB HDD",
        "1 TB HDD",
      ],
      required: true,
      disabled: false,
    },
    {
      name: "specifications",
      label: "Specifications",
      type: "textarea",
      required: false,
      disabled: false,
    },
    {
      name: "operating_sys",
      label: "Operating System",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "windows_product_key",
      label: "Windows Product Key",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "has_antivirus",
      label: "Antivirus Installed",
      type: "checkbox",
      required: false,
      disabled: false,
    },
    {
      name: "has_adapter",
      label: "Adapter",
      type: "checkbox",
      required: false,
      disabled: false,
    },
    {
      name: "has_bag",
      label: "Bag",
      type: "checkbox",
      required: false,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  printer: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "deployed_location",
      label: "Deployed Location",
      type: "text",
      required: false,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  gsmphone: [
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "imei_no",
      label: "IMEI Number",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "phone_no",
      label: "Phone Number",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "deployed_location",
      label: "Deployed Location",
      type: "text",
      required: false,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  tablet: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "operating_sys",
      label: "Operating System",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "processor",
      label: "Processor",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "ram",
      label: "RAM",
      type: "select",
      options: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"],
      required: false,
      disabled: false,
    },
    {
      name: "storage",
      label: "Storage",
      type: "select",
      options: [
        "128 GB SSD",
        "256 GB SSD",
        "512 GB SSD",
        "1 TB SSD",
        "256 GB HDD",
        "512 GB HDD",
        "1 TB HDD",
      ],
      required: false,
      disabled: false,
    },
    {
      name: "mac_address",
      label: "MAC Address",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "imei_no",
      label: "IMEI Number",
      type: "text",
      required: false,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  dongle: [
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "imei_no",
      label: "IMEI Number",
      type: "text",
      required: false,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  keyboard: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "keyboard_type",
      label: "Keyboard Type",
      type: "select",
      options: ["wired", "wireless"],
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  mouse: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "mouse_type",
      label: "Mouse Type",
      type: "select",
      options: ["wired", "wireless"],
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  switches: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "deployed_location",
      label: "Deployed Location",
      type: "text",
      required: false,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  firewall: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "deployed_location",
      label: "Deployed Location",
      type: "text",
      required: false,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  accesspt: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "deployed_location",
      label: "Deployed Location",
      type: "text",
      required: false,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  mobile: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "operating_sys",
      label: "Operating System",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "processor",
      label: "Processor",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "ram",
      label: "RAM",
      type: "select",
      options: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"],
      required: false,
      disabled: false,
    },
    {
      name: "storage",
      label: "Storage",
      type: "select",
      options: [
        "128 GB SSD",
        "256 GB SSD",
        "512 GB SSD",
        "1 TB SSD",
        "256 GB HDD",
        "512 GB HDD",
        "1 TB HDD",
      ],
      required: false,
      disabled: false,
    },
    {
      name: "mac_address",
      label: "MAC Address",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "imei_no",
      label: "IMEI Number",
      type: "text",
      required: false,
      disabled: false,
    },
    {
      name: "deployed_location",
      label: "Deployed Location",
      type: "text",
      required: false,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  server: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "deployed_location",
      label: "Deployed Location",
      type: "text",
      required: false,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  tv: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "deployed_location",
      label: "Deployed Location",
      type: "text",
      required: false,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
  headphone: [
    {
      name: "asset_code",
      label: "Asset Code",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "serial_number",
      label: "Serial Number",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "make",
      label: "Make / Brand",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "model_name",
      label: "Model Name",
      type: "text",
      required: true,
      disabled: false,
    },
    ...COMMON_FIELDS,
  ],
};

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
  headphone: "Headphone",
};

const CATEGORY_COLORS = {
  pc: "#3B82F6",
  printer: "#8B5CF6",
  gsmphone: "#10B981",
  tablet: "#F59E0B",
  dongle: "#EF4444",
  keyboard: "#b9eb15",
  mouse: "#3027d7",
  switches: "#e247c3",
  firewall: "#3a9cc0",
  accesspt: "#c2380a",
  tv: "#820707",
  server: "#b12ac3",
  mobile: "#1089aa",
  headphone: "#f08820"
};

// Section groupings for the form layout
const SECTION_GROUPS = {
  pc: [
    {
      title: "Asset Details",
      icon: "🖥",
      fields: [
        "asset_code",
        "serial_number",
        "asset_type",
        "make",
        "model_name",
        "monitor_serial_number",
      ],
    },
    {
      title: "Specifications",
      icon: "⚙",
      fields: [
        "ram",
        "storage",
        "specifications",
        "operating_sys",
        "windows_product_key",
        "has_antivirus",
        "has_adapter",
        "has_bag",
      ],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  printer: [
    {
      title: "Asset Details",
      icon: "🖨",
      fields: [
        "asset_code",
        "serial_number",
        "make",
        "model_name",
        "deployed_location",
      ],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  gsmphone: [
    {
      title: "Device Details",
      icon: "📱",
      fields: [
        "serial_number",
        "make",
        "model_name",
        "imei_no",
        "phone_no",
        "deployed_location",
      ],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  tablet: [
    {
      title: "Device Details",
      icon: "⬜",
      fields: [
        "asset_code",
        "serial_number",
        "make",
        "model_name",
        "operating_sys",
        "processor",
      ],
    },
    {
      title: "Specs & Network",
      icon: "⚙",
      fields: ["ram", "storage", "mac_address", "imei_no"],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  dongle: [
    {
      title: "Device Details",
      icon: "🔌",
      fields: ["serial_number", "make", "model_name", "imei_no"],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  keyboard: [
    {
      title: "Asset Details",
      icon: "⌨️",
      fields: [
        "asset_code",
        "serial_number",
        "keyboard_type",
        "make",
        "model_name",
      ],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  mouse: [
    {
      title: "Asset Details",
      icon: "🖱️",
      fields: [
        "asset_code",
        "serial_number",
        "mouse_type",
        "make",
        "model_name",
      ],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  switches: [
    {
      title: "Asset Details",
      icon: "🔀",
      fields: [
        "asset_code",
        "serial_number",
        "make",
        "model_name",
        "deployed_location",
      ],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  firewall: [
    {
      title: "Asset Details",
      icon: "🛡️",
      fields: [
        "asset_code",
        "serial_number",
        "make",
        "model_name",
        "deployed_location",
      ],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  accesspt: [
    {
      title: "Asset Details",
      icon: "📡",
      fields: [
        "asset_code",
        "serial_number",
        "make",
        "model_name",
        "deployed_location",
      ],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  mobile: [
    {
      title: "Device Details",
      icon: "⬜",
      fields: [
        "asset_code",
        "serial_number",
        "make",
        "model_name",
        "operating_sys",
        "processor",
        "deployed_location",
      ],
    },
    {
      title: "Specs & Network",
      icon: "⚙",
      fields: ["ram", "storage", "mac_address", "imei_no"],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  tv: [
    {
      title: "Asset Details",
      icon: "⌨️",
      fields: [
        "asset_code",
        "serial_number",
        "make",
        "model_name",
        "deployed_location",
      ],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  server: [
    {
      title: "Asset Details",
      icon: "⌨️",
      fields: [
        "asset_code",
        "serial_number",
        "make",
        "model_name",
        "deployed_location",
      ],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
  headphone: [
    {
      title: "Asset Details",
      icon: "⌨️",
      fields: [
        "asset_code",
        "serial_number",
        "make",
        "model_name",
      ],
    },
    {
      title: "Handover Info",
      icon: "📋",
      fields: ["handover_date", "handed_over_by", "requested_by", "remarks"],
    },
    {
      title: "Surrender Info",
      icon: "↩",
      fields: ["to_date", "surrendered_to", "closing_remark"],
    },
  ],
};

// API field name remappings (DB column → form field name)
const API_REMAP = {
  // imei_no: "imei_number",
  phone_no: "phone_no",
};

function remapApiData(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    const mapped = API_REMAP[k] ?? k;
    // Normalise dates to yyyy-mm-dd for <input type="date">
    if (v && typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      out[mapped] = v.slice(0, 10);
    } else {
      out[mapped] = v ?? "";
    }
  }
  return out;
}

// ── Inline toast hook ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  return { toasts, show };
}

function ToastStack({ toasts }) {
  return (
    <div className={styles.toastStack}>
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

// ── Single form field renderer ─────────────────────────────────────
function Field({ def, value, onChange, error }) {
  const handleChange = (e) => {
    const val = def.type === "checkbox" ? e.target.checked : e.target.value;
    onChange(def.name, val);
  };

  const cls = `${styles.fieldWrap} ${error ? styles.fieldError : ""}`;

  if (def.type === "checkbox") {
    return (
      <div className={`${cls} ${styles.checkboxWrap}`}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={!!value}
            onChange={handleChange}
            disabled={def.disabled}
          />
          <span className={styles.checkboxCustom} />
          <span className={styles.label}>{def.label}</span>
        </label>
        {error && <span className={styles.errorMsg}>{error}</span>}
      </div>
    );
  }

  if (def.type === "textarea") {
    return (
      <div className={`${cls} ${styles.fieldFull}`}>
        <label className={styles.label}>
          {def.label}
          {def.required && <span className={styles.req}>*</span>}
        </label>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          value={value || ""}
          onChange={handleChange}
          disabled={def.disabled}
          rows={3}
          placeholder={`Enter ${def.label.toLowerCase()}…`}
        />
        {error && <span className={styles.errorMsg}>{error}</span>}
      </div>
    );
  }

  if (def.type === "select") {
    return (
      <div className={cls}>
        <label className={styles.label}>
          {def.label}
          {def.required && <span className={styles.req}>*</span>}
        </label>
        <div className={styles.selectWrap}>
          <select
            className={styles.select}
            value={value || ""}
            onChange={handleChange}
            disabled={def.disabled}
          >
            <option value="">— Select —</option>
            {def.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <span className={styles.selectArrow}>▾</span>
        </div>
        {error && <span className={styles.errorMsg}>{error}</span>}
      </div>
    );
  }

  return (
    <div className={cls}>
      <label className={styles.label}>
        {def.label}
        {def.required && <span className={styles.req}>*</span>}
      </label>
      <input
        type={def.type}
        className={styles.input}
        value={value || ""}
        onChange={handleChange}
        disabled={def.disabled}
        placeholder={def.disabled ? "" : `Enter ${def.label.toLowerCase()}…`}
        autoComplete="off"
      />
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────
export default function EditAssetModal({ isOpen, onClose, onSaved, assetRef }) {
  const { toasts, show: showToast } = useToast();

  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState(0);

  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    const userObj = JSON.parse(localStorage.getItem("user"));

    if (userObj) {
      // Convert to dropdown format
      setUserOptions([userObj.name]);
      // OR if multiple users:
      // setUserOptions(userObj.map(u => u.name));
    }
  }, []);

  const overlayRef = useRef(null);

  const cat = assetRef?.category;
  const id = assetRef?.id;
  const catColor = CATEGORY_COLORS[cat] ?? "#3B82F6";
  const catLabel = CATEGORY_LABELS[cat] ?? "Asset";
  const sections = SECTION_GROUPS[cat] ?? [];
  const allFields = FIELDS_BY_CATEGORY[cat] ?? [];

  // ── Fetch asset on open ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !cat || !id) return;
    setActiveSection(0);
    setErrors({});
    setFormData({});

    const controller = new AbortController();
    (async () => {
      setFetching(true);
      // console.log(cat, id);
      try {
        // /api/assets/searchSingle/${category}?q=${value}
        // /api/assets/${cat}/${id}
        const res = await axios.get(`/api/assets/searchSingle/${cat}?q=${id}`, {
          signal: controller.signal,
        });

        const raw = res.data?.data ?? res.data ?? {};
        // console.log(raw)
        setFormData(remapApiData(raw));
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          showToast("Failed to load asset details.", "error");
        }
      } finally {
        setFetching(false);
      }
    })();
    return () => controller.abort();
  }, [isOpen, cat, id]); // eslint-disable-line

  // ── Close on Escape ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  // ── Field change handler ───────────────────────────────────────
  const handleChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  // ── Validate required fields in current section only ──────────
  const validateSection = (sectionIdx) => {
    const sec = sections[sectionIdx];
    if (!sec) return true;
    const errs = {};
    sec.fields.forEach((fname) => {
      const def = allFields.find((f) => f.name === fname);
      if (def?.required && !formData[fname]) {
        errs[fname] = `${def.label} is required`;
      }
    });
    setErrors((prev) => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  // ── Navigate sections ──────────────────────────────────────────
  const goNext = () => {
    if (!validateSection(activeSection)) return;
    setActiveSection((s) => Math.min(s + 1, sections.length - 1));
  };

  const goPrev = () => setActiveSection((s) => Math.max(s - 1, 0));

  const updateAssetStatus = (asset) => {
    if (asset.to_date && asset.surrendered_to && asset.closing_remark) {
      asset.status = 0;
    } else {
      asset.status = 1; // optional (if you want default active)
    }

    return asset;
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Validate all required fields across all sections
    const errs = {};
    allFields.forEach((def) => {
      if (def.required && !formData[def.name]) {
        errs[def.name] = `${def.label} is required`;
      }
    });
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Jump to first section with an error
      const firstErrSection = sections.findIndex((sec) =>
        sec.fields.some((f) => errs[f]),
      );
      if (firstErrSection !== -1) setActiveSection(firstErrSection);
      showToast("Please fill in all required fields.", "error");
      return;
    }

    try {
      setSubmitting(true);
      // console.log(formData)
      const assets = updateAssetStatus(formData);
      await axios.patch(`/api/assets/${cat}/${id}`, assets);

      showToast("Asset updated successfully!", "success");
      setTimeout(() => {
        onSaved?.();
        onClose();
      }, 800);
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to save changes.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  const currentSection = sections[activeSection];
  const isLast = activeSection === sections.length - 1;

  const sectionFields = (currentSection?.fields ?? [])
    .map((fname) => {
      const field = allFields.find((f) => f.name === fname);

      if (!field) return null;

      // Inject dynamic options
      if (field.name === "surrendered_to") {
        return {
          ...field,
          options: userOptions,
        };
      }

      return field;
    })
    .filter(Boolean);

  return (
    <>
      <ToastStack toasts={toasts} />
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
        ref={overlayRef}
        // onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Asset"
      >
        <div className={styles.modal}>
          {/* ── Top bar ────────────────────────────────────── */}
          <div className={styles.topBar} style={{ "--cat": catColor }}>
            <div className={styles.topBarLeft}>
              <div className={styles.titleBlock}>
                <h2 className={styles.modalTitle}>Edit Asset</h2>
                <p className={styles.modalSub}>
                  {formData.model_name
                    ? `${formData.model_name}${formData.serial_number ? " · " + formData.serial_number : ""}`
                    : fetching
                      ? "Loading…"
                      : `ID ${id}`}
                </p>
                <div className={styles.categoryBadge}>
                  <span className={styles.categoryDot} />
                  {catLabel}
                </div>
              </div>
            </div>

            {/* <div className={styles.catChip}>
                <span className={styles.catDot} />
                {catLabel}
              </div> */}

            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* ── Progress stepper ───────────────────────────── */}
          <div className={styles.stepper}>
            {sections.map((sec, i) => (
              <button
                key={i}
                className={`${styles.step} ${i === activeSection ? styles.stepActive : ""} ${i < activeSection ? styles.stepDone : ""}`}
                onClick={() => setActiveSection(i)}
                type="button"
              >
                <span className={styles.stepIcon}>
                  {i < activeSection ? "✓" : sec.icon}
                </span>
                <span className={styles.stepLabel}>{sec.title}</span>
                {i < sections.length - 1 && (
                  <span
                    className={`${styles.stepLine} ${i < activeSection ? styles.stepLineDone : ""}`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Body ───────────────────────────────────────── */}
          <div className={styles.body}>
            {fetching ? (
              <div className={styles.fetchingState}>
                <div className={styles.fetchSpinner} />
                <p className={styles.fetchingText}>Loading asset details…</p>
              </div>
            ) : (
              <>
                {/* Section heading */}
                <div className={styles.sectionHeading}>
                  <span className={styles.sectionEmoji}>
                    {currentSection?.icon}
                  </span>
                  <h3 className={styles.sectionTitle}>
                    {currentSection?.title}
                  </h3>
                  <span className={styles.sectionProgress}>
                    {activeSection + 1} / {sections.length}
                  </span>
                </div>

                {/* Fields grid */}
                <div className={styles.fieldsGrid}>
                  {sectionFields.map((def) => (
                    <Field
                      key={def.name}
                      def={def}
                      value={formData[def.name]}
                      onChange={handleChange}
                      error={errors[def.name]}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Footer ─────────────────────────────────────── */}
          {!fetching && (
            <div className={styles.footer}>
              <button
                className={styles.prevBtn}
                onClick={goPrev}
                disabled={activeSection === 0}
                type="button"
              >
                ← Previous
              </button>

              <div className={styles.footerDots}>
                {sections.map((_, i) => (
                  <span
                    key={i}
                    className={`${styles.dot} ${i === activeSection ? styles.dotActive : i < activeSection ? styles.dotDone : ""}`}
                  />
                ))}
              </div>

              {isLast ? (
                <button
                  className={`${styles.saveBtn} ${submitting ? styles.saveBtnLoading : ""}`}
                  onClick={handleSubmit}
                  disabled={submitting}
                  type="button"
                >
                  {submitting ? (
                    <>
                      <span className={styles.btnSpinner} /> Saving…
                    </>
                  ) : (
                    <>Save Changes ✓</>
                  )}
                </button>
              ) : (
                <button
                  className={styles.nextBtn}
                  onClick={goNext}
                  type="button"
                  style={{ "--cat": catColor }}
                >
                  Next →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
