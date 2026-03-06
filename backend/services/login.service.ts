import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { streamClient } from "../lib/stream.js";

interface LoginInput {
  email: string;
  password: string;
}

export const loginService = async ({
  email,
  password,
}: LoginInput) => {
  // Validate input
  if (!email || !password) {
    throw new Error("Please provide email and password");
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Incorrect email or password");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Incorrect email or password");
  }

  // Check if verified 
  if (!user.isVerified) {
    throw new Error("Please verify your email before logging in");
  }

  await streamClient.upsertUser({
        id: user.id,
        name: user.username,
      });

      const streamToken = streamClient.createToken(user.id);

  return {
    ...user,
    streamToken
  };
};