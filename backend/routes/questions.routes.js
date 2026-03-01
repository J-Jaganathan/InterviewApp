const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const [questions] = await pool.query(
    "SELECT id, question_text, category FROM questions LIMIT ?",
    [limit]
  );

  res.json(questions);
});

module.exports = router;