const pool = require("../config/db");


exports.findUserByEmpId = async (email) => {
  const [rows] = await pool.execute(
    "SELECT * FROM admin WHERE email = ?",
    [email]
  );
  return rows[0];
};

exports.findUserByMobileNumber = async (mobile) => {
  const [rows] = await pool.execute(
    "SELECT * FROM admin WHERE mobile = ?",
    [mobile]
  );
  return rows[0];
};




