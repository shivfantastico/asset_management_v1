const pool = require("../config/db");
const CATEGORY_TABLE = require("../config/categoryTable");

exports.allAsset = async () => {
  const query = `
    SELECT 
      u.id AS user_id,
      u.emp_id,
      u.name,
      u.department,
      u.asset_pc,
      u.asset_printer,
      u.asset_gsmphone,
      u.asset_tablet,
      u.asset_dongle,
      u.asset_keyboard,
      u.asset_mouse,
      u.asset_switches,
      u.asset_firewall,
      u.asset_accesspt,
      u.asset_tv,
      u.asset_server,
      u.asset_mobile,
      u.asset_headphone,

      -- PC Fields
      pc.id AS pc_id,
      pc.asset_type,
      pc.serial_number AS pc_serial,
      pc.model_name AS pc_model,
      pc.asset_code AS pc_asset_code,
      pc.handover_date AS pc_handover_date,
      pc.to_date AS pc_to_date,
      pc.user_verified AS pc_user_verified,
      pc.status AS pc_status,

      -- Printer Fields
      pr.id AS printer_id,
      pr.serial_number AS printer_serial,
      pr.model_name AS printer_model,
      pr.asset_code AS printer_asset_code,
      pr.handover_date AS printer_handover_date,
      pr.to_date AS printer_to_date,
      pr.user_verified AS printer_user_verified,
      pr.status AS printer_status,

      -- GSM Fields
      gsm.id AS gsm_id,
      gsm.model_name AS gsm_model,
      gsm.phone_No AS gsm_phone,
      gsm.imei_no AS gsm_imei,
      gsm.serial_number AS gsm_serial,
      gsm.handover_date AS gsm_handover_date,
      gsm.to_date AS gsm_to_date,
      gsm.user_verified AS gsm_user_verified,
      gsm.status AS gsm_status,

      -- Tablet Fields
      tab.id AS tablet_id,
      tab.model_name AS tablet_model,
      tab.serial_number AS tablet_serial,
      tab.asset_code AS tablet_asset_code,
      tab.handover_date AS tablet_handover_date,
      tab.to_date AS tablet_to_date,
      tab.user_verified AS tablet_user_verified,
      tab.status AS tab_status,

      -- Dongle Fields
      dg.id AS dongle_id,
      dg.model_name AS dongle_model,
      dg.imei_no AS dongle_imei,
      dg.handover_date AS dongle_handover_date,
      dg.to_date AS dongle_to_date,
      dg.user_verified AS dongle_user_verified,
      dg.serial_number AS dongle_serial,
      dg.status AS dongle_status,

      -- Keyboard Fields
      k.id AS keyboard_id,
      k.model_name AS keyboard_model,
      k.handover_date AS keyboard_handover_date,
      k.to_date AS keyboard_to_date,
      k.user_verified AS keyboard_user_verified,
      k.serial_number AS keyboard_serial,
      k.status AS keyboard_status,

      -- Mouse Fields
      m.id AS mouse_id,
      m.model_name AS mouse_model,
      m.handover_date AS mouse_handover_date,
      m.to_date AS mouse_to_date,
      m.user_verified AS mouse_user_verified,
      m.serial_number AS mouse_serial,
      m.status AS mouse_status,

      -- Switch Fields
      s.id AS switch_id,
      s.model_name AS switch_model,
      s.handover_date AS switch_handover_date,
      s.to_date AS switch_to_date,
      s.user_verified AS switch_user_verified,
      s.serial_number AS switch_serial,
      s.status AS switch_status,

      -- Firewall Fields
      f.id AS firewall_id,
      f.model_name AS firewall_model,
      f.handover_date AS firewall_handover_date,
      f.to_date AS firewall_to_date,
      f.user_verified AS firewall_user_verified,
      f.serial_number AS firewall_serial,
      f.status AS firewall_status,

      -- Accesspt Fields
      a.id AS accesspt_id,
      a.model_name AS accesspt_model,
      a.handover_date AS accesspt_handover_date,
      a.to_date AS accesspt_to_date,
      a.user_verified AS accesspt_user_verified,
      a.serial_number AS accesspt_serial,
      a.status AS accesspt_status,

      -- TV Fields
      tv.id AS tv_id,
      tv.model_name AS tv_model,
      tv.handover_date AS tv_handover_date,
      tv.to_date AS tv_to_date,
      tv.user_verified AS tv_user_verified,
      tv.serial_number AS tv_serial,
      tv.status AS tv_status,

      -- Server Fields
      server.id AS server_id,
      server.model_name AS server_model,
      server.handover_date AS server_handover_date,
      server.to_date AS server_to_date,
      server.user_verified AS server_user_verified,
      server.serial_number AS server_serial,
      server.status AS server_status,

      -- Mobile Fields
      mobile.id AS mobile_id,
      mobile.model_name AS mobile_model,
      mobile.handover_date AS mobile_handover_date,
      mobile.to_date AS mobile_to_date,
      mobile.user_verified AS mobile_user_verified,
      mobile.serial_number AS mobile_serial,
      mobile.status AS mobile_status,

      -- headphone Fields
      headphone.id AS headphone_id,
      headphone.model_name AS headphone_model,
      headphone.handover_date AS headphone_handover_date,
      headphone.to_date AS headphone_to_date,
      headphone.user_verified AS headphone_user_verified,
      headphone.serial_number AS headphone_serial,
      headphone.status AS headphone_status

    FROM users u
    LEFT JOIN asset_pc pc ON pc.user_id = u.id
    LEFT JOIN asset_printer pr ON pr.user_id = u.id
    LEFT JOIN asset_gsmphone gsm ON gsm.user_id = u.id
    LEFT JOIN asset_tablet tab ON tab.user_id = u.id
    LEFT JOIN asset_dongle dg ON dg.user_id = u.id
    LEFT JOIN asset_keyboard k ON k.user_id = u.id
    LEFT JOIN asset_mouse m ON m.user_id = u.id
    LEFT JOIN asset_switches s ON s.user_id = u.id
    LEFT JOIN asset_firewall f ON f.user_id = u.id
    LEFT JOIN asset_accesspt a ON a.user_id = u.id
    LEFT JOIN asset_tv tv ON tv.user_id = u.id
    LEFT JOIN asset_server server ON server.user_id = u.id
    LEFT JOIN asset_mobile mobile ON mobile.user_id = u.id
    LEFT JOIN asset_headphone headphone ON headphone.user_id = u.id
  `;

  const [rows] = await pool.query(query);
  return rows;
};

//  service to add diff asset - PC, Printer, Table etc
exports.addAssetType = async (empid, category, userData, assetData) => {
  // console.log(assetData)
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Check user exists
    const [users] = await conn.query("SELECT * FROM users WHERE emp_id = ?", [
      empid,
    ]);

    let userId;

    if (users.length > 0) {
      // ✅ User exists
      userId = users[0].id;

      // Update asset flag
      await conn.query(`UPDATE users SET asset_${category} = 1 WHERE id = ?`, [
        userId,
      ]);
    } else {
      // ❌ Create new user
      const assetFlags = {
        asset_pc: 0,
        asset_printer: 0,
        asset_gsmphone: 0,
        asset_tablet: 0,
        asset_dongle: 0,
        asset_keyboard: 0,
        asset_mouse: 0,
        asset_switches: 0,  
        asset_firewall: 0,
        asset_accesspt: 0,
        asset_tv: 0,
        asset_server: 0,
        asset_mobile: 0,
        asset_headphone: 0,
      };

      assetFlags[`asset_${category}`] = 1;

      const [result] = await conn.query(
        `INSERT INTO users 
        (emp_id, name, department, asset_pc, asset_printer, asset_gsmphone, asset_tablet, asset_dongle, asset_keyboard, asset_mouse, asset_switches, asset_firewall, asset_accesspt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          empid,
          userData.name,
          userData.department,
          assetFlags.asset_pc,
          assetFlags.asset_printer,
          assetFlags.asset_gsmphone,
          assetFlags.asset_tablet,
          assetFlags.asset_dongle,
          assetFlags.asset_keyboard,
          assetFlags.asset_mouse,
          assetFlags.asset_switches,
          assetFlags.asset_firewall,
          assetFlags.asset_accesspt,
        ],
      );

      userId = result.insertId;
    }

    // 2️⃣ Insert into respective asset table
    let tableName = "";
    let insertQuery = "";
    let values = [];

    switch (category) {
      case "pc":
        tableName = "asset_pc";
        insertQuery = `
          INSERT INTO ${tableName}
          (asset_type, serial_number, model_name, make, operating_sys, monitor_serial_number,
          has_antivirus,has_adapter, has_bag, windows_product_key, specifications, ram, storage, asset_code,
          handover_date, handed_over_by, requested_by, remarks, user_verified,status, user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.asset_type,
          assetData.serial_number,
          assetData.model_name,
          assetData.make,
          assetData.operating_sys,
          assetData.monitor_serial_number || null,
          assetData.has_antivirus,
          assetData.has_adapter,
          assetData.has_bag,
          assetData.windows_product_key,
          assetData.specifications,
          assetData.ram,
          assetData.storage,
          assetData.asset_code,
          assetData.handover_date,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;

      case "printer":
        tableName = "asset_printer";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, serial_number,
           asset_code, handover_date,
           deployed_location, make,
           handed_over_by, requested_by,
           remarks, user_verified, status,
            user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.serial_number,
          assetData.asset_code,
          assetData.handover_date,
          assetData.deployed_location,
          assetData.make,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;

      case "gsmphone":
        tableName = "asset_gsmphone";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, make,
           phone_No, imei_no,
          serial_number,
           handover_date,handed_over_by,
           requested_by, remarks, 
           user_verified, deployed_location, status,
            user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.make,
          assetData.phone_no,
          assetData.imei_no,
          assetData.serial_number,
          assetData.handover_date,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.deployed_location,
          assetData.status || 1,
          userId,
        ];
        break;

      case "tablet":
        tableName = "asset_tablet";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, make, operating_sys, processor,
          ram, storage, mac_address, imei_no, 
          serial_number, asset_code, handover_date,
          handed_over_by, requested_by, remarks, user_verified, status,
           user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.make,
          assetData.operating_sys,
          assetData.processor,
          assetData.ram,
          assetData.storage,
          assetData.mac_address,
          assetData.imei_no,
          assetData.serial_number,
          assetData.asset_code,
          assetData.handover_date,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;

      case "dongle":
        tableName = "asset_dongle";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, make, imei_no,
           handover_date, handed_over_by, requested_by,
           remarks, user_verified, serial_number, status,
           user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.make,
          assetData.imei_no,
          assetData.handover_date,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.serial_number,
          assetData.status || 1,
          userId,
        ];
        break;

        case "keyboard":
        tableName = "asset_keyboard";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, serial_number,
           asset_code, keyboard_type,
           handover_date,
           make,
           handed_over_by, requested_by,
           remarks, user_verified, status,
            user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.serial_number,
          assetData.asset_code,
          assetData.keyboard_type,
          assetData.handover_date,
          assetData.make,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;

        case "mouse":
        tableName = "asset_mouse";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, serial_number,
           asset_code, mouse_type,
           handover_date,
           make,
           handed_over_by, requested_by,
           remarks, user_verified, status,
           user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.serial_number,
          assetData.asset_code,
          assetData.mouse_type,
          assetData.handover_date,
          assetData.make,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;

        case "switches":
        tableName = "asset_switches";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, serial_number,
           asset_code, handover_date,
           deployed_location, make,
           handed_over_by, requested_by,
           remarks, user_verified, status,
            user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.serial_number,
          assetData.asset_code,
          assetData.handover_date,
          assetData.deployed_location,
          assetData.make,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;

        case "firewall":
        tableName = "asset_firewall";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, serial_number,
           asset_code, handover_date,
           deployed_location, make,
           handed_over_by, requested_by,
           remarks, user_verified, status,
            user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.serial_number,
          assetData.asset_code,
          assetData.handover_date,
          assetData.deployed_location,
          assetData.make,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;

        case "accesspt":
        tableName = "asset_accesspt";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, serial_number,
           asset_code, handover_date,
           deployed_location, make,
           handed_over_by, requested_by,
           remarks, user_verified, status,
            user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.serial_number,
          assetData.asset_code,
          assetData.handover_date,
          assetData.deployed_location,
          assetData.make,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;

        case "mobile":
        tableName = "asset_mobile";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, make, operating_sys, processor,
          deployed_location,
          ram, storage, mac_address, imei_no, 
          serial_number, asset_code, handover_date,
          handed_over_by, requested_by, remarks, user_verified, status,
           user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.make,
          assetData.operating_sys,
          assetData.processor,
          assetData.deployed_location,
          assetData.ram,
          assetData.storage,
          assetData.mac_address,
          assetData.imei_no,
          assetData.serial_number,
          assetData.asset_code,
          assetData.handover_date,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;

        case "tv":
        tableName = "asset_tv";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, serial_number,
           asset_code, handover_date,
           deployed_location, make,
           handed_over_by, requested_by,
           remarks, user_verified, status,
            user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.serial_number,
          assetData.asset_code,
          assetData.handover_date,
          assetData.deployed_location,
          assetData.make,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;

        case "server":
        tableName = "asset_server";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, serial_number,
           asset_code, handover_date,
           deployed_location, make,
           handed_over_by, requested_by,
           remarks, user_verified, status,
            user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.serial_number,
          assetData.asset_code,
          assetData.handover_date,
          assetData.deployed_location,
          assetData.make,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;

        case "headphone":
        tableName = "asset_headphone";
        insertQuery = `
          INSERT INTO ${tableName}
          (model_name, serial_number,
           asset_code, handover_date,
           make,
           handed_over_by, requested_by,
           remarks, user_verified, status,
            user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          assetData.model_name,
          assetData.serial_number,
          assetData.asset_code,
          assetData.handover_date,
          assetData.make,
          assetData.handed_over_by,
          assetData.requested_by,
          assetData.remarks,
          assetData.user_verified || 0,
          assetData.status || 1,
          userId,
        ];
        break;



      default:
        throw new Error("Invalid category");
    }

    await conn.query(insertQuery, values);

    await conn.commit();

    return { userId, category };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};


// Search Single Asset

exports.searchSingleAsset = async (category, query) => {
  const q = (query || "").trim();
  if (!q) return null;

  const meta = CATEGORY_TABLE[category];
  if (!meta) throw new Error("Invalid category");

  const table = meta.table;

  let sql;
  let params;

  const isNumeric = !isNaN(q); // ✅ check if ID

  const noAssetCodeTables = ["gsmphone", "dongle", "keyboard", "mouse", "switches", "firewall", "accesspt", "tv", "server", "mobile", "headphone"];

  if (noAssetCodeTables.includes(category)) {
    if (isNumeric) {
      sql = `SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`;
      params = [Number(q)];
    } else {
      sql = `SELECT * FROM \`${table}\` WHERE serial_number = ? LIMIT 1`;
      params = [q];
    }
  } else {
    if (isNumeric) {
      sql = `SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`;
      params = [Number(q)];
    } else {
      sql = `
        SELECT * FROM \`${table}\`
        WHERE asset_code = ? OR serial_number = ?
        LIMIT 1
      `;
      params = [q, q];
    }
  }

  const [rows] = await pool.query(sql, params);

  if (!rows.length) return null;

  return rows[0];
};




// search Asset module

exports.searchAssets = async (query) => {
  const q = (query || "").trim();
  if (!q) return [];

  const like = `%${q}%`;

  // 🔴 STEP 1: Try exact match first
  for (const [category, { table }] of Object.entries(CATEGORY_TABLE)) {
    const hasAssetCode = !["gsmphone", "dongle", "keyboard", "mouse", "switches", "firewall", "accesspt", "tv", "server", "mobile", "headphone"].includes(category);

    let sql, params;

    if (hasAssetCode) {
      sql = `
        SELECT 
          id,
          asset_code,
          serial_number,
          model_name,
          make,
          '${category}' AS category
        FROM \`${table}\`
        WHERE asset_code = ? OR serial_number = ?
        LIMIT 1
      `;
      params = [q, q];
    } else {
      sql = `
        SELECT 
          id,
          NULL AS asset_code,
          serial_number,
          model_name,
          make,
          '${category}' AS category
        FROM \`${table}\`
        WHERE serial_number = ?
        LIMIT 1
      `;
      params = [q];
    }

    const [rows] = await pool.query(sql, params);

    if (rows.length > 0) {
      return [
        {
          ...rows[0],
          status: "active",
        },
      ];
    }
  }

  // 🟡 STEP 2: Fallback to LIKE search
  const results = [];

  for (const [category, { table }] of Object.entries(CATEGORY_TABLE)) {
    const hasAssetCode = !["gsmphone", "dongle", "keyboard", "mouse", "switches", "firewall", "accesspt", "tv", "server", "mobile", "headphone"].includes(category);

    let sql, params;

    if (hasAssetCode) {
      sql = `
        SELECT 
          id,
          asset_code,
          serial_number,
          model_name,
          make,
          '${category}' AS category
        FROM \`${table}\`
        WHERE asset_code LIKE ? OR serial_number LIKE ?
        LIMIT 5
      `;
      params = [like, like];
    } else {
      sql = `
        SELECT 
          id,
          NULL AS asset_code,
          serial_number,
          model_name,
          make,
          '${category}' AS category
        FROM \`${table}\`
        WHERE serial_number LIKE ?
        LIMIT 5
      `;
      params = [like];
    }

    const [rows] = await pool.query(sql, params);

    rows.forEach((r) => {
      results.push({
        ...r,
        status: "active",
      });
    });
  }

  return results.slice(0, 20);
};




// Get Asset History

exports.getAssetHistory = async (category, id) => {
  const meta = CATEGORY_TABLE[category];
  if (!meta) throw new Error("INVALID_CATEGORY");

  // 1. Get selected asset
  const [assetRows] = await pool.query(
    `SELECT * FROM \`${meta.table}\` WHERE id = ?`,
    [id]
  );

  if (!assetRows.length) throw new Error("ASSET_NOT_FOUND");

  const currentAsset = assetRows[0];

  // 2. Build dynamic query
  let query = `SELECT * FROM \`${meta.table}\` WHERE serial_number = ?`;
  let params = [currentAsset.serial_number];

  // Add asset_code condition only if exists
  if (currentAsset.asset_code) {
    query += ` OR asset_code = ?`;
    params.push(currentAsset.asset_code);
  }

  query += ` ORDER BY handover_date DESC`;

  const [historyRows] = await pool.query(query, params);

  // 3. Map history
  const history = [];

  for (const row of historyRows) {
    let user = null;

    if (row.user_id) {
      const [userRows] = await pool.query(
        `SELECT name, department, emp_id FROM users WHERE id = ?`,
        [row.user_id]
      );
      user = userRows[0];
    }

    history.push({
      holder_name: user?.name || "N/A",
      department: user?.department || "N/A",
      emp_id: user?.emp_id || "N/A",
      from_date: row.handover_date,
      to_date: row.to_date || null,
      reason: row.closing_remark ? row.closing_remark : row.remarks,
      // reason: row.remarks || null,
      is_current: row.to_date === null, // ✅ clean boolean
    });
  }

  return {
    asset: {
      asset_code: currentAsset.asset_code || null,
      serial_number: currentAsset.serial_number,
      model_name: currentAsset.model_name,
      make: currentAsset.make,
      ram: currentAsset.ram || null,
      storage: currentAsset.storage || null,
      has_antivirus: currentAsset.has_antivirus || null,
      has_adapter: currentAsset.has_adapter || null,
      has_bag: currentAsset.has_bag || null,
      specifications: currentAsset.specifications || null,
      deployed_location: currentAsset.deployed_location || null,
      operating_sys: currentAsset.operating_sys || null,
      processor: currentAsset.processor || null,
      mac_address: currentAsset.mac_address || null,
      imei_no: currentAsset.imei_no || null,
      category,
      status: "active",
    },
    history,
  };
};



exports.updateAsset = async (category, id, updateData) => {
  const meta = CATEGORY_TABLE[category];

  if (!meta) {
    throw new Error("INVALID_CATEGORY");
  }

  updateData = {
  ...updateData,
  to_date: updateData.to_date ? updateData.to_date : null,
  closing_remark: updateData.closing_remark  ? updateData.closing_remark : null 
};

  const table = meta.table;

  // ❌ prevent empty update
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new Error("NO_UPDATE_DATA");
  }

  // ✅ Build dynamic query
  const fields = [];
  const values = [];

  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  });

  if (fields.length === 0) {
    throw new Error("NO_VALID_FIELDS");
  }

  const sql = `
    UPDATE \`${table}\`
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  values.push(id);

  const [result] = await pool.query(sql, values);

  if (result.affectedRows === 0) {
    throw new Error("ASSET_NOT_FOUND");
  }

  return {
    message: "Asset updated successfully",
    updatedFields: fields.map((f) => f.split("=")[0].trim()),
  };
};

