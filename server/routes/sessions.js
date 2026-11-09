const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const users = require("../data/users");

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/v1/sessions
router.post("/", (req, res) => {
  const { email, password } = req.body || {};

  // 1. Validate the body -> 400
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    password.length === 0 ||
    !EMAIL_PATTERN.test(email.trim())
  ) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // 2. Find the user (email lowercased)
  const cleanEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  // 3. Compare password with the stored hash
  const passwordOk = user ? bcrypt.compareSync(password, user.passwordHash) : false;

  // 4. Unknown email OR wrong password -> same 401 message
  if (!passwordOk) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  // 5. Correct -> token (1 hour) + user (never the password or hash)
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

module.exports = router;