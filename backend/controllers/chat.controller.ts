import { FastifyInstance, FastifyRequest } from "fastify";
import { backupMessageService } from "../services/chat.service.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

export const chatController = async (app: FastifyInstance) => {
  app.post(
    "/chat/backup",
    { preHandler: isAuthenticated }, 
    async (request: FastifyRequest, reply) => {
      const { channelId, text, streamMessageId } = request.body as any;
      const user = (request as any).user;

      if (!user?.id) {
        return reply.status(401).send({
          status: "fail",
          message: "No se encontró el ID de usuario en el token",
        });
      }

      try {
        const message = await backupMessageService({
          channelId,
          text,
          streamMessageId,
          userId: user.id,
        });

        return reply.status(201).send({
          status: "success",
          data: message,
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          status: "fail",
          message: error.message,
        });
      }
    }
  );
};