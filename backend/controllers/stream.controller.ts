import { FastifyInstance } from "fastify";
import { generateStreamTokenService } from "../services/stream.service.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

export const streamController = async (
  app: FastifyInstance
) => {
  app.get("/stream/get-token", { preHandler: isAuthenticated }, async (request: any, reply) => {
    try {
      const { id, username } = request.user;

      const result = await generateStreamTokenService({
        id,
        username,
      });

      return reply.status(200).send({
        status: "success",
        ...result,
      });

    } catch (error: any) {
      return reply.status(500).send({
        status: "error",
        message: error.message,
      });
    }
  });
};