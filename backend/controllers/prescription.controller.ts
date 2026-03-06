import { FastifyInstance } from "fastify";
import {
  createPrescriptionService,
  getPatientPrescriptionsService,
  getDoctorPrescriptionsService
} from "../services/prescription.service.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

export const prescriptionController = async (
  app: FastifyInstance
) => {

  // CREATE PRESCRIPTION
  app.post("/prescriptions" , { preHandler: isAuthenticated }, async (request, reply) => {

    const { patientId, items } = request.body as any;
    console.log("Received prescription creation request for patient DNI:", patientId);
    try {

      const doctorId = (request as any).user.id;

      console.log("Doctor ID from token:", doctorId);

      const prescription = await createPrescriptionService({
        doctorId,
        patientDni: patientId,
        items
      });

      return reply.status(201).send({
        status: "success",
        prescription
      });

    } catch (error: any) {

      return reply.status(400).send({
        status: "fail",
        message: error.message
      });

    }

  });


  // GET PATIENT PRESCRIPTIONS
  app.get("/prescriptions/patient", { preHandler: isAuthenticated }, async (request, reply) => {

    try {

      const patientId = (request as any).user.id;

      const prescriptions = await getPatientPrescriptionsService(patientId);

      return reply.status(200).send({
        status: "success",
        prescriptions
      });

    } catch (error: any) {

      return reply.status(500).send({
        status: "fail",
        message: error.message
      });

    }

  });


  // GET DOCTOR PRESCRIPTIONS
  app.get("/prescriptions/doctor", { preHandler: isAuthenticated }, async (request, reply) => {

    try {

      const doctorId = (request as any).user.id;

      const prescriptions = await getDoctorPrescriptionsService(doctorId);

      return reply.status(200).send({
        status: "success",
        prescriptions
      });

    } catch (error: any) {

      return reply.status(500).send({
        status: "fail",
        message: error.message
      });

    }

  });

};