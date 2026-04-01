const express = require("express");
const router = express.Router();
const assetController = require("../controllers/asset.controller");
const auth = require("../middleware/auth.middleware");


// Add Asset Module
router.get("/all", auth, assetController.allAssets);
router.post("/add/:empid", auth, assetController.addAsset);

// Search Single Asset = based on assetCode/serialNum & Cat - Consumed in Asset Form to auto fill details
//                                                          - Consumed in Asset Edit form to auto fill details
router.get("/searchSingle/:category", auth, assetController.getAssetBySearch);

// Search Module = Search based on AssetCode/SerialNum - Consumed in Asset History tab
router.get("/search", auth, assetController.searchAssets);
// History Module = Get asset history based on cat and id
router.get("/history/:category/:id", auth, assetController.getAssetHistory)

// SIngle Update asset with like surrender details
router.patch("/:category/:id", assetController.updateAsset);



module.exports = router;
