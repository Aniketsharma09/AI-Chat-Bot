const app = require("./src/app");
const connectToDB = require("./src/db/db");
const initSocketServer = require('./src/sockets/socket.server');
const httpServer = require('http').createServer(app);

initSocketServer(httpServer);

httpServer.listen(3000, (req, res) => {
    console.log("server is runing on the port 3000");
})
connectToDB();