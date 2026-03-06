import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { signupService } from "../services/signup.service.js";
import { signToken } from "../lib/token.js";

export const signupController = async (
  app: FastifyInstance
) => {
  app.post('/auth/signup', async (request, reply) => {
    const { email, password, passwordConfirm, username } =
    request.body as any;

  try {
    const user = await signupService({
      email,
      password,
      passwordConfirm,
      username,
    });

    const token = signToken(user.id);

    return reply.status(201).send({
      status: "success",
      message: "Registration successful",
      token,
    });
  } catch (error: any) {
    return reply.status(400).send({
      status: "fail",
      message: error.message,
    });
  }
  }
)}