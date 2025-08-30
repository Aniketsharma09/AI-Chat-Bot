require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

/* Require route*/
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
// cours policy
const cors = require('cors');
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true, 
}));
app.use(cookieParser());
app.use(express.json());

// using the routes
app.use('/api/auth',authRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;