const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function registerUserController(req, res) {
  try {
    // get the data from body
    const { username, email, password } = req.body;
    // check if username or email is already exists or user is alerady registerd
    const isUserExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (isUserExists) {
      return res.status(400).json({
        message: "username or email already exists",
      });
    }
    // encryp the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // register the user
    const user = await userModel.create({
      username: username,
      email: email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
    });

    res.status(201).json({
      message: "user register successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
}

async function loginUserController(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Identifier or password is require to login" });
    }
    const user = await userModel.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid username/email or password" });
    }
    let isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res
        .status(400)
        .json({ message: "invalid username/email or password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    const { password: pwd, ...userData } = user._doc;
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax", 
    });
    res.status(200).json({ message: "Login successfully", userData });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error,
    });
  }
}

async function getUserController(req, res) {
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(401)
      .json({ message: "unauthorized user login to access this page" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "invalid token please login again" });
    }
    const { password, ...userData } = user._doc;
    return res.status(200).json({
      message: "user fetched successfully",
      userData,
    });
  } catch (err) {
    return res
      .status(401)
      .json({ message: "invalid token please login again" });
  }
}

module.exports = {
  registerUserController,
  loginUserController,
  getUserController,
};
