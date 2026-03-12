import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { sendEmail } from "../lib/email.js";

export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("No se encontró un usuario con ese email");

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash OTP for storage
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordOTP: hashedOtp,
      resetPasswordOTPExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    },
  });

  await sendEmail({
    email: user.email,
    subject: "Código de recuperación de contraseña",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Recuperación de Contraseña</h2>
        <p>Su código de seguridad es:</p>
        <h1 style="color: #2196f3; letter-spacing: 5px;">${otp}</h1>
        <p>Este código expira en 10 minutos.</p>
      </div>
    `,
  });
};

export const resetPasswordWithOTP = async (email: string, otp: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
    throw new Error("Solicitud inválida");
  }

  // Check expiration
  if (new Date() > user.resetPasswordOTPExpires) {
    throw new Error("El código ha expirado");
  }

  // Verify OTP hash
  const hashedInputOtp = crypto.createHash("sha256").update(otp).digest("hex");
  if (hashedInputOtp !== user.resetPasswordOTP) {
    throw new Error("Código incorrecto");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordOTP: null,
      resetPasswordOTPExpires: null,
    },
  });
};