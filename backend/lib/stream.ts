import { StreamChat } from "stream-chat";
import { getSystemSetting } from "../services/config.service.js";

const apiKey = await getSystemSetting("STREAM_API_KEY");
const apiSecret = await getSystemSetting("STREAM_API_SECRET");

if (!apiKey || !apiSecret) {
  throw new Error("Missing Stream credentials in environment variables");
}

export const streamClient = StreamChat.getInstance(
  apiKey,
  apiSecret
);