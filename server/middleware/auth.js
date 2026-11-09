const jwt = require("jsonwebtoken");
const users = require("../data/users");

// Protects a route: requires  Authorization: Bearer <token>
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  // 1. Missing or malformed header -> 401
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    // 2. Verify signature + expiry
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 3. The user must still exist
    const user = users.find((u) => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    // 4. Attach the user (never the hash) for the next handler
    req.user = { id: user.id, name: user.name, email: user.email };
    return next();
  } catch (err) {
    // Bad signature, tampered, or expired -> same 401 message
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = requireAuth;
