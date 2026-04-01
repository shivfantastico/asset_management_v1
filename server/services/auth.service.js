const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async ({ email, password }) => {

  const [rows] = await db.execute(
    `SELECT * FROM admin WHERE email=? AND is_active=1`,
    [email]
  );

  if (!rows.length) throw new Error("User not found");

  const user = rows[0];

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role
    }
  };
};
