import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Expo } from "expo-server-sdk";
import { sendPushNotifications } from "./lib/utils";
import cors, { CorsOptions } from "cors";
import { config } from "dotenv";
import { PrismaClient } from "./generated/prisma"; // relative to your source folder
config();
const db = new PrismaClient()
const app = express();
const port = process.env.PORT || 8000;
const corsOption: CorsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};
// Middleware
app.use(bodyParser.json());
app.use(cors(corsOption));
// Create a new Expo SDK client
const expo = new Expo();

// Store push tokens (in memory for demo; use a DB in production)
const savedPushTokens: string[] = [];

// Endpoint to save a device token
app.post("/register", (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };

  if (
    token &&
    Expo.isExpoPushToken(token) &&
    !savedPushTokens.includes(token)
  ) {
    savedPushTokens.push(token);
    console.log("Registered token:", token);
    res.json({ success: true });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Invalid or duplicate token" });
  }
});

// Send notification endpoint
app.post("/send-notification", async (req: Request, res: Response) => {
  try {
    const tickets = await sendPushNotifications(savedPushTokens, req.body);
    res.json({ success: true, tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
});

app.get("/hellow", (req: Request, res: Response) => {
  res.json({ message: "hellow world" });
});
app.get("/users", async(req: Request, res: Response) => {
  try {
    const users = await db.user.findMany()
    res.json(users)
  } catch (error) {
    res.json(error)
  }
 
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(process.env.JWT_SUCRET_KEY);
});
