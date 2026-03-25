import { streamClient } from "../lib/stream.js";
import { logApiUsage } from "./usage.service.js";

interface StreamUserInput {
  id: string;
  username: string;
}

interface StreamTokenResponse {
  token: string;
  user: {
    id: string;
    name: string;
  };
}

export const generateStreamTokenService = async (
  user: StreamUserInput
): Promise<StreamTokenResponse> => {
  if (!user || !user.id || !user.username) {
    throw new Error("Invalid user data for Stream token generation");
  }

  const { id, username } = user;

  try {
    // Ensure user exists in Stream
    await streamClient.upsertUser({
      id,
      name: username,
      role: "admin",
    });

    // Create Stream token
    const token = streamClient.createToken(id);

    await logApiUsage("STREAM", 1, "access-token-auth");

    return {
      token,
      user: {
        id,
        name: username,
      },
    };
  } catch (error) {
    console.error("Stream token generation error:", error);
    throw new Error("Failed to generate Stream token");
  }
};