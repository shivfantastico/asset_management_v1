const assetService = require("../services/asset.service");

exports.allAssets = async (req, res, next) => {
  try {
    const data = await assetService.allAsset();

    const result = {};

    data.forEach((row) => {
      if (!result[row.user_id]) {
        result[row.user_id] = {
          user_id: row.user_id,
          emp_id: row.emp_id,
          name: row.name,
          department: row.department,
          assets: {
            pc: [],
            printer: [],
            gsm: [],
            tablet: [],
            dongle: [],
          },
        };
      }

      // ✅ PC
      if (row.pc_id) {
        result[row.user_id].assets.pc.push({
          id: row.pc_id,
          type: row.asset_type,
          serial: row.pc_serial,
          model: row.pc_model,
          asset_code: row.pc_asset_code,
          handover_dt: row.pc_handover_date,
          to_date: row.pc_to_date,
          user_verified: row.pc_user_verified,
          status: row.pc_status
        });
      }

      // ✅ Printer
      if (row.printer_id) {
        result[row.user_id].assets.printer.push({
          id: row.printer_id,
          type: "printer",
          serial: row.printer_serial,
          model: row.printer_model,
          asset_code: row.printer_asset_code,
          handover_dt: row.printer_handover_date,
          to_date: row.printer_to_date,
          user_verified: row.printer_user_verified,
          status: row.printer_status
        });
      }

      // ✅ GSM
      if (row.gsm_id) {
        result[row.user_id].assets.gsm.push({
          id: row.gsm_id,
          type: "gsm",
          model: row.gsm_model,
          phone: row.gsm_phone,
          imei: row.gsm_imei,
          serial: row.gsm_serial,
          handover_dt: row.gsm_handover_date,
          to_date: row.gsm_to_date,
          user_verified: row.gsm_user_verified,
          status: row.gsm_status
        });
      }

      // ✅ Tablet
      if (row.tablet_id) {
        result[row.user_id].assets.tablet.push({
          id: row.tablet_id,
          type: "tablet",
          model: row.tablet_model,
          serial: row.tablet_serial,
          asset_code: row.tablet_asset_code,
          handover_dt: row.tablet_handover_date,
          to_date: row.tablet_to_date,
          user_verified: row.tablet_user_verified,
          status: row.tablet_status
        });
      }

      // ✅ Dongle 🔌📶
      if (row.dongle_id) {
        result[row.user_id].assets.dongle.push({
          id: row.dongle_id,
          type: "dongle",
          model: row.dongle_model,
          imei: row.dongle_imei,
          handover_dt: row.dongle_handover_date,
          to_date: row.dongle_to_date,
          user_verified: row.dongle_user_verified,
          serial: row.dongle_serial,
          status: row.dongle_status
        });
      }
    });

    res.status(200).json({
      success: true,
      count: Object.keys(result).length,
      data: Object.values(result),
    });
  } catch (error) {
    next(error);
  }
};

exports.addAsset = async (req, res, next) => {
  try {
    const { empid } = req.params;
    const { category, userData, assetData } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const result = await assetService.addAssetType(
      empid,
      category,
      userData,
      assetData,
    );

    res.status(201).json({
      success: true,
      message: "Asset added successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// Search Single Asset

exports.getAssetBySearch = async (req, res) => {

  const { category } = req.params;
  const { q } = req.query;

  console.log(category, q)

  if (!q) {
    return res.status(400).json({ error: "Search query required" });
  }

  try {
    const asset = await assetService.searchSingleAsset(category, q);

    if (!asset) {
      return res.json({ data: null });
    }

    res.json({
      data: asset,
    });
  } catch (err) {
    console.error("Search asset error:", err);
    res.status(500).json({ error: "Failed to search asset" });
  }
};


// Search Asset controller
exports.searchAssets = async (req, res) => {
  try {
    const q = req.query.q;

    const data = await assetService.searchAssets(q);

    return res.json({ data });
  } catch (err) {
    console.error("Asset search error:", err);
    return res.status(500).json({ error: "Search failed" });
  }
};

// Get History - On Asset Code/ Serial No



exports.getAssetHistory = async (req, res) => {
  const { category, id } = req.params;

  try {
    const data = await assetService.getAssetHistory(category, id);
    console.log(data)
    return res.json({ data });

  } catch (err) {
    console.error("History fetch error:", err);

    if (err.message === "INVALID_CATEGORY") {
      return res.status(400).json({ error: "Unknown category" });
    }

    if (err.message === "ASSET_NOT_FOUND") {
      return res.status(404).json({ error: "Asset not found" });
    }

    return res.status(500).json({ error: "Failed to load history" });
  }
};



exports.updateAsset = async (req, res) => {
  const { category, id } = req.params;
  const updateData = req.body;

  try {
    const result = await assetService.updateAsset(
      category,
      id,
      updateData
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Update asset error:", err);

    if (err.message === "INVALID_CATEGORY") {
      return res.status(400).json({ error: "Invalid category" });
    }

    if (err.message === "ASSET_NOT_FOUND") {
      return res.status(404).json({ error: "Asset not found" });
    }

    if (err.message === "NO_UPDATE_DATA") {
      return res.status(400).json({ error: "No data provided" });
    }

    res.status(500).json({ error: "Failed to update asset" });
  }
};

