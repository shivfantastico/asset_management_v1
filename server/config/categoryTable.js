// ── Category → table/column map ───────────────────────────────────
const CATEGORY_TABLE = {
  pc:      { table: 'asset_pc',      imeiCol: null,      phoneCol: null },
  printer: { table: 'asset_printer', imeiCol: null,      phoneCol: null },
  gsmphone:     { table: 'asset_gsmphone', imeiCol: 'imei_no', phoneCol: 'phone_No' },
  tablet:  { table: 'asset_tablet',  imeiCol: 'imei_no', phoneCol: null },
  dongle:  { table: 'asset_dongle',  imeiCol: 'imei_no', phoneCol: null },
  keyboard:  { table: 'asset_keyboard',  imeiCol: null, phoneCol: null },
  mouse:  { table: 'asset_mouse',  imeiCol: null, phoneCol: null },
  switches:  { table: 'asset_switches',  imeiCol: null, phoneCol: null },
  firewall:  { table: 'asset_firewall',  imeiCol: null, phoneCol: null },
  accesspt:  { table: 'asset_accesspt',  imeiCol: null, phoneCol: null },
};


module.exports = CATEGORY_TABLE;