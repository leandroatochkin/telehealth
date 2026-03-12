    import { FastifyInstance } from "fastify";
    import { AvailabilityService } from "../services/availability.service.js";
    import { isAuthenticated } from "../middleware/auth.middleware.js";
    import { prisma } from "../lib/prisma.js";


    const availabilityService = new AvailabilityService();

    export const availabilityController = async (
    app: FastifyInstance
    ) => {
    app.get<{
    Params: { professionalId: string };
    Querystring: { date: string };
    }>(
    "/professionals/:professionalId/available-slots",
    { preHandler: isAuthenticated },
    async (request, reply) => {
        try {
        const { professionalId } = request.params;
        const { date } = request.query;

        console.log("Request: ", professionalId, date)

        const slots = await availabilityService.getAvailableSlots(
            professionalId,
            date
        );

        return reply.send({
            status: "success",
            data: slots,
        });
        } catch (error: any) {
        return reply.status(400).send({
            status: "fail",
            message: error.message,
        });
        }
    }
    );
    app.get<{}>(
    "/professionals",
    { preHandler: isAuthenticated },
    async (request, reply) => {
        try {

        const professionals = await availabilityService.getProfessionals();

        return reply.send({
            status: "success",
            data: professionals,
        });
        } catch (error: any) {
        return reply.status(400).send({
            status: "fail",
            message: error.message,
        });
        }
    }
    );

    app.post<{
  Body: {
    date: string;
    startTime: string;
    endTime: string;
    isRecurring?: boolean;
    duration?: number;
  };
    }>(
    "/availability",
    { preHandler: isAuthenticated },
    async (request, reply) => {
        if (!request.user) {
        return reply.status(401).send({ message: "Unauthorized" });
        }

        const { role, id: userId } = request.user;

        if (role !== "PROFESSIONAL") {
        return reply.status(403).send({
            status: "fail",
            message: "Only professionals can set availability",
        });
        }

        const { date, startTime, endTime, isRecurring, duration } = request.body;

        // Calculamos el día de la semana (0-6)
        const dayOfWeek = new Date(date).getDay();

        const availability = await prisma.availability.create({
        data: {
            professionalId: userId,
            dayOfWeek,
            startTime,
            endTime,
            // LÓGICA CLAVE: 
            // Si es recurrente, guardamos NULL para que aplique a todos los meses.
            // Si NO es recurrente, guardamos la fecha específica.
            date: isRecurring ? null : new Date(date),
            duration: duration || 30, // Duración en minutos, por defecto 30
        },
        });

        return reply.send({
        status: "success",
        data: availability,
        });
    }
    );

    app.delete<{
  Querystring: { 
    id?: string; 
    date?: string; 
    dayOfWeek?: string; 
    type: 'single' | 'daily' | 'weekly' 
  };
}>(
  "/availability",
  { preHandler: isAuthenticated },
  async (request, reply) => {
    const { id, date, dayOfWeek, type } = request.query;
    const professionalId = request.user?.id;

    try {
      if (type === 'single' && id) {
        await availabilityService.deleteAvailabilityById(id, professionalId ?? '');
      } 
      else if (type === 'daily' && date) {
        await availabilityService.deleteDailyAvailability(professionalId ?? '', date);
      } 
      else if (type === 'weekly' && dayOfWeek) {
        await availabilityService.deleteWeeklyAvailability(professionalId ?? '', parseInt(dayOfWeek));
      }

      return reply.send({ status: "success", message: "Disponibilidad eliminada" });
    } catch (error: any) {
      return reply.status(400).send({ status: "fail", message: error.message });
    }
  }
);
    };