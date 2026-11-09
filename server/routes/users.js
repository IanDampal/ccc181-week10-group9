const express = require("express");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// GET /api/v1/users/me  (protected)
router.get("/me", requireAuth, (req, res) => {
  return res.status(200).json({ user: req.user });
});

module.exports = router;
