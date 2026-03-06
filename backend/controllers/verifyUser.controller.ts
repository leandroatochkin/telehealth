import { FastifyInstance } from "fastify";
import { verifyAccountService } from "../services/verifyUser.service.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

export const verifyAccountController = async (
  app: FastifyInstance
) => {
  app.post("/auth/verify",async (request, reply) => {
    const { email, otp } = request.body as any;

    try {
      const result = await verifyAccountService({ email, otp });

      return reply.status(200).send({
        status: "success",
        message: result.message,
      });
    } catch (error: any) {
      return reply.status(400).send({
        status: "fail",
        message: error.message,
      });
    }
  });
};