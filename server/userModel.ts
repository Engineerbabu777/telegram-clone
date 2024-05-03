import mongoose from "mongoose";

// Defining the user schema
const userSchema = new mongoose.Schema({
    name: String, // User's name
    imageId: String, // User's image ID
    email: { type: String, unique: true }, // User's email (unique)
    messages: [ // Array of messages
        {
            message: String, // Message content
            sender: String, // Sender's email
            receiver: String, // Receiver's email
            time: Date // Time of message
        }
    ]
});

// Creating the User model
export const User = mongoose.model("User", userSchema, "chatgram_users");
