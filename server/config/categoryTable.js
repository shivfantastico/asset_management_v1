// ── Category → table/column map ───────────────────────────────────
const CATEGORY_TABLE = {
  pc:      { table: 'asset_pc',      imeiCol: null,      phoneCol: null },
  printer: { table: 'asset_printer', imeiCol: null,      phoneCol: null },
  gsm:     { table: 'asset_gsmphone', imeiCol: 'imei_no', phoneCol: 'phone_No' },
  tablet:  { table: 'asset_tablet',  imeiCol: 'imei_no', phoneCol: null },
  dongle:  { table: 'asset_dongle',  imeiCol: 'imei_no', phoneCol: null },
};


module.exports = CATEGORY_TABLE;