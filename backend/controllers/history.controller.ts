import { FastifyInstance } from "fastify";
import { HistoryService } from "../services/history.service.js";
import { isAuthenticated, verifyProfessional } from "../middleware/auth.middleware.js";

const service = new HistoryService();

export const historyController = async (app: FastifyInstance) => {
  

  // 1. Search patient by DNI (Initial Search)
  app.get("/history/search/:dni", { preHandler: isAuthenticated }, async (request: any, reply) => {
    if (!verifyProfessional(request, reply)) return;

    try {
      const patient = await service.getPatientByDni(request.params.dni);
      return reply.send({ status: "success", data: patient });
    } catch (error: any) {
      return reply.status(404).send({ status: "fail", message: error.message });
    }
  });

  // 2. Get Paginated Entries (The new route)
  app.get("/history/:historyId/entries", { preHandler: isAuthenticated }, async (request: any, reply) => {
    if (!verifyProfessional(request, reply)) return;

    const { historyId } = request.params;
    const { page, limit, date, search } = request.query as any;

    try {
      const result = await service.getEntries(historyId, {
        page: Number(page || 1),
        limit: Number(limit || 15),
        date: date as string,
        search: search as string
      });

      return reply.send({ status: "success", data: result });
    } catch (error: any) {
      return reply.status(400).send({ status: "fail", message: error.message });
    }
  });

  // 3. Add new entry
  app.post("/history/:patientId/entries", { preHandler: isAuthenticated }, async (request: any, reply) => {
    if (!verifyProfessional(request, reply)) return;

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