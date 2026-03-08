import { FastifyInstance } from "fastify";
import { loginService } from "../services/login.service.js";
import { signToken } from "../lib/token.js";


export const loginController = async (
  app: FastifyInstance
) => {
  app.post("/auth/login", async (request, reply) => {
    const { email, password } = request.body as any;

    try {
      const user = await loginService({ email, password });

      const token = signToken(user.id);

      

      return reply.status(200).send({
        status: "success",
        token,
        streamToken: user.streamToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          name: user.name,
          surname: user.surname,
        },
     
      });
    } catch (error: any) {
      return reply.status(401).send({
        status: "fail",
        message: error.message,
      });
    }
  });
};