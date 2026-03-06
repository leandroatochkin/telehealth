import "dotenv/config";
import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

interface JwtPayload {
  id: string;
}

export const isAuthenticated = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  let token: string | undefined;

  // Get token from Authorization header
  const authHeader = request.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return reply.status(401).send({
      status: "fail",
      message: "You are not logged in. Please log in.",
    });
  }

  // Verify token
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
  } catch (err) {
    return reply.status(401).send({
      status: "fail",
      message: "Invalid or expired token.",
    });
  }

  // Check user still exists
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!currentUser) {
    return reply.status(401).send({
      status: "fail",
      message: "User linked to this token no longer exists.",
    });
  }

  // Attach user to request
  request.user = {
    id: currentUser.id,
    email: currentUser.email,
    role: currentUser.role,
  };
};