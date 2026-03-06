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
};