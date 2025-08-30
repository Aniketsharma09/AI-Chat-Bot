const express = require('express');
const router = express.Router();
const {verifyUser} = require('../midlewares/auth.midlewares');
const {newChatController, getMessagesController, getChatsController} = require('../controllers/chat.controllers');


router.post('/',verifyUser,newChatController);
router.post('/messages',getMessagesController );
router.post('/chats', getChatsController)

module.exports = router;