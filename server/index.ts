// Importing required modules and packages
import express from "express"; // Express framework
import "dotenv/config"; // Accessing environment variables
import http from "http"; // HTTP server
import cors from "cors"; // CORS middleware
import mongoose from "mongoose"; // MongoDB object modeling tool
import userRouter from "./userRoutes"; // User routes
import { Server } from "socket.io"; // Socket.IO server
import { User } from "./userModel"; // User model
import jwt from "jsonwebtoken"; // JSON Web Token for authentication

// Initializing express app
const app = express();
const server = http.createServer(app);
const { PORT } = process.env || 4000;

// Middleware setup
app.use(cors()); // Cross-Origin Resource Sharing
app.use(express.json()); // Parsing JSON requests

// Connecting to MongoDB
mongoose.connect(process.env.MONGO_URL!);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("connected to mongodb");
  // Starting the server
  server.listen(PORT, () => {
    console.log("http://localhost:4000");
  });
});

// Setting up Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000" // Allowing connections from this origin
  }
});

// Handling Socket.IO connections
io.on("connection", (socket) => {
  // Event listener for 'joined' event
  socket.on("joined", () => {
    // Emitting 'new-user' event to all sockets
    io.sockets.emit("new-user", "new user joined");
  });

  // Event listener for 'private message' event
  socket.on("private message", async (to, message, mySelf) => {
    // Finding the user by email
    const user = await User.find({ email: to });
    // Verifying the JWT token
    const decoded = jwt.verify(mySelf, process.env.ACCESS_TOKEN_SECRET!);
    // Finding the sender
    const sender = await User.findById(decoded);
    // Emitting 'refresh' event to all sockets
    io.sockets.emit("refresh", "new Message");

    // If user is found
    if (user) {
      // Updating messages for receiver
      user[0].messages.push({
        receiver: user[0].email,
        message,
        sender: sender?.email,
        time: new Date()
      });
      // Updating messages for sender
      sender?.messages.push({
        receiver: user[0].email,
        message,
        sender: sender?.email,
        time: new Date()
      });
      // Saving changes to the database
      await user[0].save();
      await sender?.save();
    }
  });
});

// Mounting user routes
app.use("/", userRouter);
