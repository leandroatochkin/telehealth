import bcrypt from "bcryptjs";
import {prisma} from "../lib/prisma.js";
import { sendEmail } from "../lib/email.js";
import { generateOTP } from "../lib/helpers.js";

interface SignupInput {
  email: string;
  password: string;
  passwordConfirm: string;
  username: string;
}

export const signupService = async ({
  email,
  password,
  passwordConfirm,
  username,
}: SignupInput) => {
  // Check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Validate password match
  if (password !== passwordConfirm) {
    throw new Error("Passwords do not match");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires
    },
  });

  // Send email
  try {
    await sendEmail({
      email: newUser.email,
      subject: "OTP for email verification",
      html: `<h1>Your OTP is: ${otp}</h1>`,
    });
  } catch (error) {
    // rollback if email fails
    await prisma.user.delete({
      where: { id: newUser.id },
    });

    throw new Error("Error sending verification email");
  }

  return newUser;
};