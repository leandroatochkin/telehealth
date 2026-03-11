import { FastifyInstance } from "fastify";
import { HistoryService } from "../services/history.service.js";
import { isAuthenticated, verifyProfessional } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { AIService } from "../services/ai.service.js";


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
      const { id } = request.user;

      // 1. Fetch professional data from Prisma to get the actual name/surname
      const doctorProfile = await prisma.user.findUnique({
        where: { id },
        select: { name: true, surname: true }
      });

      if (!doctorProfile) {
        return reply.status(404).send({ status: "fail", message: "Professional profile not found" });
      }

      // 2. Format the doctor's name
      const fullName = `Dr. ${doctorProfile.surname}, ${doctorProfile.name}`;

      // 3. Pass the retrieved data to the service
      const entry = await service.addEntry(
        request.params.patientId, 
        id, 
        fullName, 
        request.body
      );

      return reply.send({ status: "success", data: entry });
    } catch (error: any) {
      return reply.status(400).send({ status: "fail", message: error.message });
    }
});

app.post("/ai/analyze", { preHandler: isAuthenticated }, async (req: any, reply) => {
  try {
    const service = new AIService();
    const result = await service.generateDiagnostic(req.body.details, req.body.diagnostics);
    return reply.send(result);
  } catch (error: any) {
    // LOG THE ACTUAL ERROR TO YOUR TERMINAL
    console.error("AI Error Details:", error.message);
    console.error("AI Error Code:", error.status); // This will likely be 402 or 429
    
    return reply.status(500).send({ 
      message: "AI Service Unavailable", 
      details: error.message // Temporarily send this to the front-end to debug
    });
  }
});

};