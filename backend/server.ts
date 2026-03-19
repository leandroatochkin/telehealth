import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { db } from "./db/psql.js";
import { signupController } from "./controllers/signup.controller.js";
import { verifyAccountController } from "./controllers/verifyUser.controller.js";
import { loginController } from "./controllers/login.controller.js";
import { streamController } from "./controllers/stream.controller.js";
import { appointmentController } from "./controllers/appointment.controller.js";
import { availabilityController } from "./controllers/availabitity.controller.js";
import { prescriptionController } from "./controllers/prescription.controller.js";
import { prescriptionPdfController } from "./controllers/prescriptionPdf.controller.js";
import { historyController } from "./controllers/history.controller.js";
import { historyPdfController } from "./controllers/historyPdf.controller.js";
import { patientDataController } from "./controllers/patientData.controller.js";
import { passwordController } from "./controllers/resetPassword.controller.js";
import { chatController } from "./controllers/chat.controller.js";

export const app = Fastify({
  logger: {
    level: "info",
  },
  bodyLimit: 10 * 1024,
});



app.get("/health", async (request, reply) => {
  console.log("API healthy")
  try {
    await db.query("SELECT 1");

    return {
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    reply.status(500);
    return {
      status: "error",
      database: "disconnected",
      message: error.message,
    };
  }
});

const urlPrefix = "/api/v1"

const start = async () => {
  
  await app.register(cors, {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
});

  await app.register(cookie, {
      secret: process.env.COOKIE_SECRET || '', // optional (for signed cookies)
    });

  await app.register(signupController, { prefix: urlPrefix });
  await app.register(verifyAccountController, { prefix: urlPrefix });
  await app.register(loginController, { prefix: urlPrefix });
  await app.register(streamController, { prefix: urlPrefix });
  await app.register(appointmentController, { prefix: urlPrefix });
  await app.register(availabilityController, { prefix: urlPrefix });
  await app.register(prescriptionController, { prefix: urlPrefix });
  await app.register(prescriptionPdfController, { prefix: urlPrefix });
  await app.register(historyController, { prefix: urlPrefix });
  await app.register(historyPdfController, { prefix: urlPrefix });
  await app.register(patientDataController, { prefix: urlPrefix });
  await app.register(passwordController, { prefix: urlPrefix });
  await app.register(chatController, { prefix: urlPrefix });
  
  app.setErrorHandler((error: any, request, reply) => {
  // Log the error details with Pino
    request.log.error({
      err: error,
      requestId: request.id,
      url: request.raw.url,
      query: request.query,
      // Add custom metadata to help debugging
      context: 'API_GLOBAL_ERROR'
    });

    // Send a clean response to the user
    reply.status(error.statusCode || 500).send({
      status: "ERROR",
      message: error.message || "An unexpected error occurred",
      requestId: request.id // Helpful for the user to report issues
    });
  });

  // 3. Finally, start listening
  try {
    await app.listen({ port: 3001 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();