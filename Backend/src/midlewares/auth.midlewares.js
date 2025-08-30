const jwt = require("jsonwebtoken");
const { request } = require("../app");
const userModel = require("../models/user.model");
async function verifyUser(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decode.id);
    if(!user){
        return res.status(404).json({message:"No user find"});
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(404).json({
      message: "no token found",
    });
  }
}
module.exports = {verifyUser};