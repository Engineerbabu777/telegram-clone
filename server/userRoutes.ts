import { Request, Response, Router } from "express"; // Express imports
const jwt = require("jsonwebtoken"); // JSON Web Token
import { User } from "./userModel"; // User model import
import "dotenv/config"; // Accessing environment variables

const router = Router(); // Creating router instance

// Route for user authentication
router.post("/auth", async (req: Request, res: Response) => {
  const user = new User(req.body); // Creating new user instance
  try {
    await user.save(); // Saving the user to the database
    // Creating JWT access token
    const accessToken = jwt.sign(
      user.toObject(),
      process.env.ACCESS_TOKEN_SECRET!
    );
    // Setting access token as a cookie in the response header
    res.setHeader("Set-Cookie", `user=${accessToken}; Path=/`);
    res.send("user created"); // Sending success message
  } catch (err) {
    console.log(err);
    res.status(500).send(err); // Sending error response
  }
});

// Route to get all users
router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find({}); // Finding all users
    res.send(users); // Sending users data
  } catch (err) {
    console.log(err);
  }
});

// Route to get user details based on JWT token
router.get("/user", async (req: Request, res: Response) => {
    try {
        // Verifying JWT token from authorization header
        const data = jwt.verify(req.headers.authorization, process.env.ACCESS_TOKEN_SECRET);
        // Finding user by email
        const user = await User.find({ email: data?.email });
        res.send(user); // Sending user data
    } catch (err) {
        console.log(err);
    }
});

// Route to get messages between two users
router.get("/messages", async (req:Request, res:Response) => {
  const { sender, receiver } = req.query; // Extracting sender and receiver from request query
  // Finding receiver user
  const user = await User.find({ email: receiver });
  // Filtering messages based on sender and receiver
  const filteredMessages = user[0]?.messages?.filter((message: any) => 
    (message.sender === sender && message.receiver === receiver) || 
    (message.sender === receiver && message.receiver === sender)
  );
  res.send(filteredMessages); // Sending filtered messages
});

export default router; // Exporting router instance
