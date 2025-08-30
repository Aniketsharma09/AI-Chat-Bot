const { request } = require("../app");
const chatModel = require("../models/chat.model");
const messageModel = require('../models/message.model')

async function newChatController(req, res) {
  try {
    const user = req.user;
    const {title} = req.body;
    const chat = await chatModel.create({
      user: user._id,
      title,
    });

    return res.status(201).json({message:'new chat created successfuly',
        chat
    })
  } catch (error) {
    return res.status(400).json({ message: "error while creating the chat" });
  }
}

async function getMessagesController(req, res){
    const {id} = req.body;
    try {
      const messages = await messageModel.find({chat : id});
      res.status(200).json({
        message : 'message fetch successfully',
        messages
      })
      
    } catch (error) {
        console.log('error while fetching message', error);
        
    }
}

async function getChatsController(req, res) {

   try {
      const chats = await chatModel.find({});
      res.status(200).json({
        message : 'all chat fetched successfully',
        chats
      })
      
   } catch (error) {
      console.log('error while fetching all chats', error);
      
   }
}
module.exports = {newChatController, getMessagesController, getChatsController};
