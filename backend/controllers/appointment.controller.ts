import { FastifyInstance } from "fastify";
import { AppointmentService } from "../services/appointment.service.js";
import {
  CreateAppointmentBody,
  AppointmentParams,
} from "../types/appointment.types.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const service = new AppointmentService();

export const appointmentController = async (
  app: FastifyInstance
) => {
  // CREATE APPOINTMENT
  app.post<{
    Body: CreateAppointmentBody;
  }>("/appointments", { preHandler: isAuthenticated },async (request, reply) => {
    try {
      const { professionalId, patientId, startTime, endTime } =
        request.body;

      if (!professionalId || !patientId || !startTime || !endTime) {
        return reply.status(400).send({
          status: "fail",
          message: "Missing required fields",
        });
      }

      const appointment = await service.create({
        professionalId,
        patientId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });

      return reply.status(201).send({
        status: "success",
        data: appointment,
      });
    } catch (error: any) {
      return reply.status(400).send({
        status: "fail",
        message: error.message,
      });
    }
  });

  // JOIN CALL
  app.post<{
    Params: AppointmentParams;
  }>("/appointments/:id/join-call", { preHandler: isAuthenticated },async (request, reply) => {
    try {
      const { id } = request.params;

      const result = await service.joinCall(
        id,
        request.user
      );

      return reply.status(200).send({
        status: "success",
        ...result,
      });
    } catch (error: any) {
      return reply.status(403).send({
        status: "fail",
        message: error.message,
      });
    }
  });

  // END APPOINTMENT
  app.patch<{
    Params: AppointmentParams;
  }>("/appointments/:id/end", async (request, reply) => {
    try {
      const { id } = request.params;

      const result = await service.endAppointment(
        id,
        request.user
      );

      return reply.status(200).send({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      return reply.status(403).send({
        status: "fail",
        message: error.message,
      });
    }
  });

  app.get("/appointments/patient", { 
    preHandler: [isAuthenticated] 
  }, async (request, reply) => {
    try {
      const appointments = await service.getUpcoming(request.user);

      return reply.status(200).send({
        status: "success",
        results: appointments.length,
        data: appointments,
      });
    } catch (error: any) {
      return reply.status(500).send({
        status: "error",
        message: error.message,
      });
    }
  });

  app.get<{
  Params: { professionalId: string };
  Querystring: { date: string };
}>("/appointments/professional/:professionalId", { preHandler: isAuthenticated }, async (request, reply) => {
  try {
    const { professionalId } = request.params;
    const { date } = request.query;

    // Optional: Security check to ensure the doctor is requesting their own data
    if (request.user?.role === "PROFESSIONAL" && request.user.id !== professionalId) {
      return reply.status(403).send({ status: "fail", message: "Forbidden" });
    }

    const appointments = await service.getByProfessionalAndDate(professionalId, date);

    return reply.status(200).send({
      status: "success",
      data: appointments,
    });
  } catch (error: any) {
    return reply.status(500).send({
      status: "error",
      message: error.message,
    });
  }
});

app.post<{
  Body: {
    professionalId: string;
    startTime: string;
    endTime: string;
  };
}>("/appointments/create", { preHandler: isAuthenticated }, async (request, reply) => {
  try {
    const { professionalId, startTime, endTime } = request.body;
    
    // Security: Get patientId from the verified token, not the body
    const patientId = (request as any).user.id;
    console.log("Data: ",professionalId, patientId, startTime, endTime);
    if (!professionalId || !startTime || !endTime) {
      return reply.status(400).send({
        status: "fail",
        message: "Missing required fields",
      });
    }

    const appointment = await service.create({
      professionalId,
      patientId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    return reply.status(201).send({
      status: "success",
      data: appointment,
    });
  } catch (error: any) {
    return reply.status(400).send({
      status: "fail",
      message: error.message,
    });
  }
});

app.post("/appointments/:id/end", { preHandler: isAuthenticated }, async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    // This calls the service we created in previous steps
    const updatedAppointment = await service.endAppointment(id, user);

    return reply.send({
      status: "success",
      data: updatedAppointment
    });
  } catch (error: any) {
    return reply.status(400).send({
      status: "fail",
      message: error.message
    });
  }
});
};

