const app = require("./src/app");
const connectToDB = require("./src/db/db");
const initSocketServer = require("./src/sockets/socket.server");
const httpServer = require("http").createServer(app);

initSocketServer(httpServer);
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, (req, res) => {
  console.log("server is runing on the port 3000");
});
connectToDB();
