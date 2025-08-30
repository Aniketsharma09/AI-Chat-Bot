require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const path = require("path");

/* Require route*/
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
// cours policy
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// using the routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use(express.static(path.join(__dirname, "../public")));

app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;
