import { FastifyInstance } from "fastify";
import { requestPasswordReset, resetPasswordWithOTP } from "../services/resetPassword.service.js";

export const passwordController = async (app: FastifyInstance) => {
  
  // 1. Request the code
  app.post("/auth/forgot-password", async (request, reply) => {
    const { email } = request.body as { email: string };
    try {
      await requestPasswordReset(email);
      return reply.send({ status: "success", message: "Código enviado" });
    } catch (error: any) {
      return reply.status(400).send({ status: "fail", message: error.message });
    }
  });

  // 2. Submit code + new password
  app.post("/auth/reset-password", async (request, reply) => {
    const { email, otp, password } = request.body as any;
    try {
      await resetPasswordWithOTP(email, otp, password);
      return reply.send({ status: "success", message: "Contraseña actualizada" });
    } catch (error: any) {
      return reply.status(400).send({ status: "fail", message: error.message });
    }
  });
};