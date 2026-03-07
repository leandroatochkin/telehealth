import { FastifyInstance } from "fastify";
import { HistoryService } from "../services/history.service.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const service = new HistoryService();

export const historyController = async (app: FastifyInstance) => {
  // Search patient by DNI
  app.get("/history/search/:dni", { preHandler: isAuthenticated }, async (request: any, reply) => {


        if (!request.user) {
            return reply.status(401).send({ message: "Unauthorized" });
            }

        const role = request.user.role;

        if (role !== "PROFESSIONAL") {
        return reply.status(403).send({
            status: "fail",
            message: "Only professionals can view patient history",
        });
        }


    try {
      const patient = await service.getPatientByDni(request.params.dni);
      return reply.send({ status: "success", data: patient });
    } catch (error: any) {
      return reply.status(404).send({ status: "fail", message: error.message });
    }
  });

  // Add new entry
  app.post("/history/:patientId/entries", { preHandler: isAuthenticated }, async (request: any, reply) => {
    
    if (!request.user) {
            return reply.status(401).send({ message: "Unauthorized" });
            }

        const role = request.user.role;

        if (role !== "PROFESSIONAL") {
        return reply.status(403).send({
            status: "fail",
            message: "Only professionals can view patient history",
        });
        }

    try {

      const professional = request.user;
      const entry = await service.addEntry(
        request.params.patientId, 
        professional.id, 
        `Dr. ${professional.surname}`, 
        request.body
      );
      return reply.send({ status: "success", data: entry });
    } catch (error: any) {
      return reply.status(400).send({ status: "fail", message: error.message });
    }
  });
};