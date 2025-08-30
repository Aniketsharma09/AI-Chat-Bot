const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const { createMemory, queryMemory } = require("../services/pinecon.service");
const messageModel = require("../models/message.model");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // user authentication middleware
  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake?.headers?.cookie
        ? cookie.parse(socket.handshake.headers.cookie)
        : {};
      const token = cookies.token;

      if (!token) return next(new Error("invalid token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) return next(new Error("user not found"));

      const { password, ...userData } = user._doc;
      socket.user = userData;
      next();
    } catch (error) {
      return next(new Error("invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      // storing user input and creating vectore of user input
      const [message, userInputVector] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          content: messagePayload.content,
          user: socket.user._id,
          role: "user",
        }),
        // create vector of user input
        generateVector(messagePayload.content),
      ]);
      // store user message

      // fetch long term memory
      let longTermMemory = await queryMemory({
        vector: userInputVector,
        topK : 5,
        metadata: { user: socket.user._id },
      });

      const memoryText = longTermMemory.map((i) => i.metadata.text).join("\n");

      longTermMemory = [
        {
          role: "user",
          parts: [
            {
              text: `These are some old conversation messages use them to responde according to the old conversation and note that if there is old message or this is the only message respond according to the user input not according to this message:\n${memoryText}`,
            },
          ],
        },
      ];
      // storing user input vector into pinecon and fetching short term memory
      const [userPinconData, messageHistory] = await Promise.all([
        createMemory({
          messageId: message._id,
          vector: userInputVector,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            text: messagePayload.content,
          },
        }),
        // fetch short term memory (last 10 messages)
        (
          await messageModel
            .find({ chat: messagePayload.chat })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
        ).reverse(),
      ]);

      let shortTermMemory = messageHistory.map((i) => ({
        role: i.role,
        parts: [{ text: i.content }],
      }));

      // generate response
      const response = await generateResponse([
        ...longTermMemory,
        ...shortTermMemory,
      ]);
      // sending the ai responce to user
      socket.emit("ai-response", response);

      // store AI response and creating vectore of  AI response  
      const [responseMessage, responseVector] = await Promise.all([
       messageModel.create({
        chat: messagePayload.chat,
        content: response,
        user: socket.user._id,
        role: "model",
      }),
      // create vector of AI response
      generateVector(response)
      ])

      // storing the ai responce vector into pinecon
      await createMemory({
        messageId: responseMessage._id,
        vector: responseVector,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });

    });
  });
}

module.exports = initSocketServer;
