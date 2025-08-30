const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

async function newChatController(req, res) {
  try {
    const user = req.user;
    const { title } = req.body;
    const chat = await chatModel.create({
      user: user._id,
      title,
    });

    return res
      .status(201)
      .json({ message: "new chat created successfuly", chat });
  } catch (error) {
    return res.status(400).json({ message: "error while creating the chat" });
  }
}

async function getMessagesController(req, res) {
  const { id } = req.body;
  try {
    const messages = await messageModel.find({ chat: id });
    res.status(200).json({
      message: "message fetch successfully",
      messages,
    });
  } catch (error) {
    console.log("error while fetching message", error);
  }
}

async function getChatsController(req, res) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "unauthorized user login to access this page" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const chats = await chatModel.find({ user: decoded.id });
      if (!chats) {
        return res.status(404).json({ message: "no chat's found" });
      }
      res.status(200).json({
        message: "all chat fetched successfully",
        chats,
      });
    } catch (err) {
      console.log("invalid token", err.message);
    }
  } catch (error) {
    console.log("error while fetching all chats", error);
  }
}
module.exports = {
  newChatController,
  getMessagesController,
  getChatsController,
};
