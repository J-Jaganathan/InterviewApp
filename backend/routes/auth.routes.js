const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

  if (users.length === 0)
    return res.status(400).json({ message: "User not found" });

  const user = users[0];

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword)
    return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token });
});

module.exports = router;