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
    };
    }>(
    "/availability",
    { preHandler: isAuthenticated },
    async (request, reply) => {

        if (!request.user) {
            return reply.status(401).send({ message: "Unauthorized" });
            }

        const role = request.user.role;

        if (role !== "PROFESSIONAL") {
        return reply.status(403).send({
            status: "fail",
            message: "Only professionals can set availability",
        });
        }

        const userId = request.user.id;

        if (!userId) {
        return reply.status(400).send({
            status: "fail",
            message: "User ID is required",
        });
        }

        const dayOfWeek = new Date(request.body.date).getDay();

        const availability = await prisma.availability.create({
        data: {
          professionalId: userId,
          dayOfWeek, // Now this is included as an Integer
          startTime: request.body.startTime,
          endTime: request.body.endTime,
          // If your schema also has a 'date' field, include it:
          // date: new Date(date) 
        },
        });

        return reply.send({
        status: "success",
        data: availability,
        });
    }
    );
    };