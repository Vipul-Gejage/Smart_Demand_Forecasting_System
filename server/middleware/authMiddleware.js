const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader);
  console.log("VERIFY SECRET:", process.env.JWT_SECRET);

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // ✅ FIRST declare token
  const token = authHeader.split(" ")[1];

  // ✅ THEN use it
  console.log("TOKEN:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};