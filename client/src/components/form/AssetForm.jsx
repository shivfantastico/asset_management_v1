/* 
  Dynamic Asset Form
  - Uses react-hook-form for validation
  - Switches between PC and Printer fields based on selected category
*/
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "./AssetForm.module.css";
import { useState } from "react";
import debounce from "lodash.debounce";
import axios from "axios";
// import axios from "../utils/axios";
import { Oval } from "react-loader-spinner";

import pc from "../../pages/assets/pc.png";
import printer from "../../pages/assets/printer.png";
import gsm from "../../pages/assets/gsm_1.png";
import tablet from "../../pages/assets/tablet_1.png";
import dongle from "../../pages/assets/dongle_1.png";

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

/* ---- Field definitions per asset type ---- */
const PC_FIELDS = [
  { name: "emp_id", label: "Employee ID", type: "text", required: true },
  { name: "name", label: "Employee Name", type: "text", disabled: true },
  { name: "department", label: "Department", type: "text", disabled: true },
  { name: "asset_code", label: "Asset Code", type: "text", required: true },
  {
    name: "serial_number",
    label: "Serial Number",
    type: "text",
    required: true,
  },
  {
    name: "asset_type",
    label: "PC Type",
    type: "select",
    options: ["laptop", "desktop"],
    required: true,
  },
  { name: "make", label: "Make / Brand", type: "text", required: true },
  { name: "model_name", label: "Model Name", type: "text", required: true },
  {
    name: "monitor_serial_number",
    label: "Monitor Serial No.",
    type: "text",
    required: false,
  },
  {
    name: "ram",
    label: "RAM",
    type: "select",
    options: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"],
    required: true,
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
  },
  {
    name: "specifications",
    label: "Specifications",
    type: "textarea",
    required: true,
  },
  {
    name: "windows_product_key",
    label: "Windows Product Key",
    type: "text",
    required: true,
  },
  {
    name: "has_antivirus",
    label: "Antivirus Installed ?",
    type: "checkbox",
    required: false,
  },
];

const PRINTER_FIELDS = [
  { name: "emp_id", label: "Employee ID", type: "text", required: true },
  { name: "name", label: "Employee Name", type: "text", disabled: true },
  { name: "department", label: "Department", type: "text", disabled: true },
  { name: "asset_code", label: "Asset Code", type: "text", required: true },
  {
    name: "serial_number",
    label: "Serial Number",
    type: "text",
    required: true,
  },
  { name: "make", label: "Make / Brand", type: "text", required: true },
  { name: "model_name", label: "Model Name", type: "text", required: true },
  {
    name: "deployed_location",
    label: "Deployed Location",
    type: "text",
    required: true,
  },
];

const GSM_Phone_FIELD = [
  { name: "emp_id", label: "Employee ID", type: "text", required: true },
  { name: "name", label: "Employee Name", type: "text", disabled: true },
  { name: "department", label: "Department", type: "text", disabled: true },
  {
    name: "serial_number",
    label: "Serial Number",
    type: "text",
    required: true,
  },
  { name: "make", label: "Make / Brand", type: "text", required: true },
  { name: "model_name", label: "Model Name", type: "text", required: true },
  { name: "imei_no", label: "IMEI Number", type: "text", required: true },
  { name: "phone_number", label: "Phone Number", type: "text", required: true },
  {
    name: "deployed_location",
    label: "Deployed Location",
    type: "text",
    required: true,
  },
];

const TABLET_FIELD = [
  { name: "emp_id", label: "Employee ID", type: "text", required: true },
  { name: "name", label: "Employee Name", type: "text", disabled: true },
  { name: "department", label: "Department", type: "text", disabled: true },
  { name: "asset_code", label: "Asset Code", type: "text", required: true },
  {
    name: "serial_number",
    label: "Serial Number",
    type: "text",
    required: true,
  },
  { name: "make", label: "Make / Brand", type: "text", required: true },
  { name: "model_name", label: "Model Name", type: "text", required: true },
  {
    name: "operating_sys",
    label: "Operating System",
    type: "text",
    required: true,
  },
  { name: "processor", label: "Processor", type: "text", required: true },
  {
    name: "ram",
    label: "RAM",
    type: "select",
    options: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"],
    required: true,
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
  },
  { name: "mac_address", label: "MAC Address", type: "text", required: true },
  { name: "imei_no", label: "IMEI Number", type: "text", required: true },
];

const DONGLE_FIELD = [
  { name: "emp_id", label: "Employee ID", type: "text", required: true },
  { name: "name", label: "Employee Name", type: "text", disabled: true },
  { name: "department", label: "Department", type: "text", disabled: true },
  {
    name: "serial_number",
    label: "Serial Number",
    type: "text",
    required: true,
  },
  { name: "make", label: "Make / Brand", type: "text", required: true },
  { name: "model_name", label: "Model Name", type: "text", required: true },
  { name: "imei_no", label: "IMEI Number", type: "text", required: true },
];

/* Common fields shared by all asset types */
const COMMON_FIELDS = [
  // handover info
  {
    name: "handover_date",
    label: "Handover Date",
    type: "date",
    required: true,
  },
  {
    name: "handed_over_by",
    label: "Handed Over By",
    type: "select",
    options: [], // will be filled dynamically
    required: true,
  },
  { name: "requested_by", label: "Requested By", type: "text", required: true },
  { name: "remarks", label: "Remarks", type: "textarea", required: true },
  // Surrender info
  // {
  //   name: "surrender_date",
  //   label: "Surrender Date",
  //   type: "date",
  //   required: true,
  // },
  // {
  //   name: "surrendered_to",
  //   label: "Surrendered To",
  //   type: "text",
  //   required: true,
  // },
  // { name: "closing_remarks", label: "Closing Remarks", type: "textarea", required: true }
];

export default function AssetForm({ onSubmit, isSubmitting }) {
  const [empLoading, setEmpLoading] = useState(false);
  const [empFetched, setEmpFetched] = useState(false);
  const [user, setUser] = useState([]);
  // console.log(onSubmit)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { category: "pc" } });

  const category = watch("category");
  const empId = watch("emp_id");
  const assetCode = watch("asset_code");
  const serialNumber = watch("serial_number");
  // console.log(empId);

  /* Reset type-specific fields when category changes */
  useEffect(() => {
    reset({ category });
    const userObj = JSON.parse(localStorage.getItem("user"));
    // console.log(userObj);

    if (userObj) {
      setUser([userObj]); // ✅ store as array
    }
  }, [category, reset]);

  /* Pick fields based on selected category */
  const typeFields =
    category === "pc"
      ? PC_FIELDS
      : category === "printer"
        ? PRINTER_FIELDS
        : category === "gsm"
          ? GSM_Phone_FIELD
          : category === "tablet"
            ? TABLET_FIELD
            : category === "dongle"
              ? DONGLE_FIELD
              : [];

  const categoryLabels = {
    pc: "PC Details",
    printer: "Printer Details",
    gsm: "GSM Details",
    tablet: "Tablet Details",
    dongle: "Dongle Details",
  };

  /* Render a single field */
  const renderField = (field) => {
    const isError = errors[field.name];

    if (field.name === "emp_id") {
      return (
        <div key={field.name} className={styles.fieldGroup}>
          <label className={styles.label}>
            {field.label} <span className={styles.required}>*</span>
          </label>

          <div className={styles.inputWithLoader}>
            <input
              type="text"
              {...register("emp_id", { required: "Employee ID is required" })}
              className={styles.input}
              placeholder="Enter employee ID"
            />

            {/* {empLoading && <span className={styles.loader}></span>} */}
            {empLoading && (
              <Oval
                height={25}
                width={25}
                color="#057103"
                wrapperClass=""
                visible={true}
                ariaLabel="oval-loading"
                secondaryColor="#1bea17"
                strokeWidth={6}
                strokeWidthSecondary={6}
                wrapperStyle={{
                  position: "absolute",
                  top: "50%",
                  right: "5%",
                  transform: "translate(50%, -50%)", // adjust for perfect centering
                }}
              />
            )}
          </div>

          {errors.emp_id && (
            <p className={styles.errorMsg}>{errors.emp_id.message}</p>
          )}
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <div key={field.name} className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              disabled={empLoading || (!empFetched && field.name !== "emp_id")}
              {...register(field.name, {
                validate: (value) =>
                  field.required ? value || `${field.label} is required` : true,
              })}
              className={styles.checkbox}
            />
            {field.label}
            {field.required && <span className={styles.required}>*</span>}
          </label>

          {/* Error Message */}
          {errors[field.name] && (
            <>
              <p className={styles.errorMsg}>{errors[field.name].message}</p>
            </>
          )}
        </div>
      );
    }

    if (field.type === "select") {
      let options = field.options || [];
      // console.log(user);
      // 🔥 Inject dynamic users for handed_over_by
      if (field.name === "handed_over_by") {
        options = user.map((u) => ({
          label: `${u.name}`,
          value: u.name,
        }));
      }

      return (
        <div key={field.name} className={styles.fieldGroup}>
          <label className={styles.label}>
            {field.label}{" "}
            {field.required && <span className={styles.required}>*</span>}
          </label>
          <select
            disabled={empLoading || (!empFetched && field.name !== "emp_id")}
            {...register(field.name, {
              required: field.required ? `${field.label} is required` : false,
            })}
            className={`${styles.input} ${isError ? styles.inputError : ""}`}
          >
            <option value="">Select {field.label}</option>
            {options.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
          {isError && <p className={styles.errorMsg}>{isError.message}</p>}
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div
          key={field.name}
          className={`${styles.fieldGroup} ${styles.fullWidth}`}
        >
          <label className={styles.label}>
            {field.label}{" "}
            {field.required && <span className={styles.required}>*</span>}
          </label>
          <textarea
            disabled={empLoading || (!empFetched && field.name !== "emp_id")}
            {...register(field.name, {
              required: field.required ? `${field.label} is required` : false,
            })}
            className={`${styles.input} ${styles.textarea} ${isError ? styles.inputError : ""}`}
            rows={3}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
          {isError && <p className={styles.errorMsg}>{isError.message}</p>}
        </div>
      );
    }

    if (field.name === "name" || field.name === "department") {
      return (
        <div key={field.name} className={styles.fieldGroup}>
          <label className={styles.label}>{field.label}</label>
          <input
            type="text"
            {...register(field.name)}
            disabled // always disabled
            className={styles.input}
          />
        </div>
      );
    }

    // text
    return (
      <div key={field.name} className={styles.fieldGroup}>
        <label className={styles.label}>
          {field.label}{" "}
          {field.required && <span className={styles.required}>*</span>}
        </label>
        <input
          type={field.type}
          disabled={empLoading || (!empFetched && field.name !== "emp_id")}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false,
          })}
          className={`${styles.input} ${isError ? styles.inputError : ""}`}
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
        {isError && <p className={styles.errorMsg}>{isError.message}</p>}
      </div>
    );
  };

  const debouncedFetchEmployee = debounce(async (empId) => {
    try {
      setEmpLoading(true);
      setEmpFetched(false);
      const res = await axios.get(`/api/user/employee/${empId}`);
      // console.log(res);
      const data = res.data;

      setValue("name", data.name);
      setValue("department", data.department);
      setEmpFetched(true);
    } catch (err) {
      console.error("Employee fetch error:", err);
      setEmpFetched(false);
    } finally {
      setEmpLoading(false);
    }
  }, 600);

  // const token =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc1MTE4NDU0LCJleHAiOjE3NzUyMDQ4NTR9.CYlLULJNw_LxQzUZXDZ081Z4ESro7OklGOpPQRvKHpk"

  const debouncedAssetFetch = debounce(async (value) => {
    if (!value) return;
    const token = localStorage.getItem("token")
    
    try {
      // http://localhost:5000/api/assets/searchSingle/pc?q=PG04FK13
      const res = await axios.get(
        `http://localhost:5000/api/assets/searchSingle/${category}?q=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log(res);
      const data = res.data.data;
      // console.log(data);
      if (!data) return;

      // 🔥 Auto-fill fields
      Object.keys(data).forEach((key) => {
        if (data[key] !== null) {
          setValue(key, data[key]);
        }
      });
    } catch (err) {
      console.error("Asset fetch error:", err);
    }
  }, 600);

  useEffect(() => {
    if (assetCode) {
      // console.log(assetCode);
      debouncedAssetFetch(assetCode);
    }
    return () => debouncedAssetFetch.cancel();
  }, [assetCode, category]);

  useEffect(() => {
    if (serialNumber) {
      // console.log(serialNumber);
      debouncedAssetFetch(serialNumber);
    }
    return () => debouncedAssetFetch.cancel();
  }, [serialNumber, category]);

  useEffect(() => {
    if (!empId || empId.length < 5) return;
    debouncedFetchEmployee(empId);

    return () => {
      debouncedFetchEmployee.cancel();
    };
  }, [empId]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      {/* Asset Category Selector */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Asset Category</h3>
        <div className={styles.categoryGrid}>
          {[
            { value: "pc", label: "PC / Laptop", icon: "💻" },
            { value: "printer", label: "Printer", icon: "🖨️" },
            { value: "gsm", label: "GSM Phone", icon: "📱", disabled: false },
            { value: "tablet", label: "Tablet", icon: "📟", disabled: false },
            { value: "dongle", label: "Dongle", icon: "🔌", disabled: false },
          ].map((cat) => (
            <label
              key={cat.value}
              className={`${styles.categoryCard} ${category === cat.value ? styles.categoryActive : ""} ${cat.disabled ? styles.categoryDisabled : ""}`}
            >
              <input
                type="radio"
                value={cat.value}
                {...register("category")}
                disabled={cat.disabled}
                style={{ display: "none" }}
              />
              {/* <span className={styles.categoryIcon}>{cat.icon}</span> */}
              <img
                src={getCategoryImage(cat.value)}
                alt="asset"
                className={styles.assetImg}
              />
              <span className={styles.categoryLabel}>{cat.label}</span>
              {cat.disabled && <span className={styles.comingSoon}>Soon</span>}
            </label>
          ))}
        </div>
      </div>

      {/* Dynamic type-specific fields */}
      {typeFields.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {categoryLabels[category] || "Asset Details"}
          </h3>
          <div className={styles.fieldsGrid}>{typeFields.map(renderField)}</div>
        </div>
      )}

      {/* Common fields */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Handover Information</h3>
        <div className={styles.fieldsGrid}>
          {COMMON_FIELDS.map(renderField)}
        </div>
        <br />
        {/* Submit */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className={styles.btnSpinner} />
            ) : (
              "+ Save Asset"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
