/**
 * AddAsset.jsx  (updated)
 * ─────────────────────────────────────────────────────────────────
 * Changes from original:
 *   1. "Save Asset" no longer directly submits — it opens
 *      AssetReviewModal for the admin to verify.
 *   2. The actual API + docx generation runs only after the admin
 *      clicks "Save & Generate Document" inside the modal.
 *   3. After save, the modal flips to its Print phase automatically.
 *
 * Nothing else in the file changed from the original.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AssetForm from "../components/form/AssetForm"
import { useToast } from '../components/toast/ToastContext'
import styles from '../pages/AddAsset.module.css'
import axios from '../utils/axios'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import AssetReviewModal from "../components/modal/AssetReviewModal"

export default function AddAsset() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [isSubmitting,    setIsSubmitting]    = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [pendingFormData, setPendingFormData] = useState(null)

  // ── Step 1: Form "Save Asset" button ──────────────────────────
  // Don't submit yet — capture the data and open the review modal.
  const handleFormSubmit = async(formData)=> {
    setPendingFormData(formData)
    setReviewModalOpen(true)
  }

  // ── Step 2: Admin confirms inside the review modal ─────────────
  // This is the actual save + docx generation (original logic unchanged).
  const handleConfirmed = async(formData)=> {
    setIsSubmitting(true)
    try {
      const empid   = formData.emp_id
      const payload = {
        category: formData.category,
        userData: {
          name:       formData.name,
          department: formData.department,
        },
        assetData: formData,
      }

      // 1. API call
      await axios.post(`/api/assets/add/${empid}`, payload, { timeout: 10000 })

      // 2. Load .docx template
      const response = await fetch('/asset_template_v1.docx')
      const content  = await response.arrayBuffer()

      const zip = new PizZip(content)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks:    true,
        delimiters:    { start: '{', end: '}' },
      })

      // 3. Inject data
      doc.setData({
        name:             formData.name,
        emp_id:           formData.emp_id,
        department:       formData.department,
        handover_date:    formData.handover_date,
        handed_over_by:   formData.handed_over_by,
        asset_code:       formData.asset_code,
        serial_number:    formData.serial_number,
        remarks:          formData.remarks,
        specification:    formData.model_name,
        make:             formData.make,
      })

      // 4. Render + download
      doc.render()
      const blob = doc.getZip().generate({
        type:     'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      // saveAs(blob, `Asset_${formData.emp_id}.docx`)

      showToast('Asset saved successfully!', 'success')

      // Modal stays open — flips to Print phase automatically
      // (AssetReviewModal handles the phase transition internally)

    } catch (error) {
      console.error(error)
      showToast('Failed to save asset. Please try again.', 'error')
      // Re-throw so the modal knows the confirm failed and stays on review phase
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Step 3: Admin closes modal after printing ──────────────────
  const handleModalClose = ()=> {
    setReviewModalOpen(false)
    // Navigate away only if save was completed (pendingFormData cleared)
    // if (!isSubmitting) {
    //   navigate('/assets')
    // }
  }

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/assets')}>
          ← Back to Assets
        </button>
        <div>
          <h1 className={styles.title}>Add New Asset</h1>
          <p className={styles.subtitle}>Register a new asset and assign it to a user</p>
        </div>
      </div>

      {/* AsAssetFormsetForm — "Save Asset" now calls handleFormSubmit which opens the modal */}
      <AssetForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />

      {/* Review + Print Modal */}
      <AssetReviewModal
        isOpen={reviewModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirmed}
        formData={pendingFormData ?? {}}
        category={pendingFormData?.category ?? 'pc'}
        isSubmitting={isSubmitting}
      />

    </div>
  )
}