require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sessionsRouter = require("./routes/sessions");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS and JSON must come BEFORE the routes
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

// GET /api/v1/health
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// POST /api/v1/sessions
app.use("/api/v1/sessions", sessionsRouter);

// ---- MEMBER 2 adds below this line (users/me route) -------------------
// ---- MEMBER 2 adds last: 404 handler and 500 error handler ------------

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});