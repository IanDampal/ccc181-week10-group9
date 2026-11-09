const path = require("path");
// Load server/.env no matter which folder you start node from
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Fail loudly at startup instead of a mystery 500 at login
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Create server/.env (see README).");
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const sessionsRouter = require("./routes/sessions");
const usersRouter = require("./routes/users");

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

// MEMBER 2 adds below this line (users/me route)
// GET /api/v1/users/me
app.use("/api/v1/users", usersRouter);

// MEMBER 2 adds last: 404 handler and 500 error handler
// 404: no route matched
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// 500: any error thrown in a route/middleware (must have 4 arguments)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Malformed JSON body is the client's fault -> 400
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body." });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});