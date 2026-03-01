const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const userId = req.user.id;

  const [[sessions]] = await pool.query(
    "SELECT COUNT(*) as total FROM sessions WHERE user_id = ?",
    [userId]
  );

  const [[completed]] = await pool.query(
    "SELECT COUNT(*) as completed FROM sessions WHERE user_id = ? AND status='completed'",
    [userId]
  );

  res.json({
    totalSessions: sessions.total,
    completedSessions: completed.completed,
  });
});

module.exports = router;