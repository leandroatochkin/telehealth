import { prisma } from "../lib/prisma.js";

interface VerifyInput {
  email: string;
  otp: string;
}

export const verifyAccountService = async ({
  email,
  otp,
}: VerifyInput) => {
  // 1️⃣ Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("No user found with this email");
  }

  // 2️⃣ Check OTP
  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // 3️⃣ Check expiration
  if (!user.otpExpires || new Date() > user.otpExpires) {
    throw new Error("OTP has expired. Please request a new one.");
  }

  // 4️⃣ Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      otp: null,
      otpExpires: null,
    },
  });

  return { message: "Email has been verified" };
};