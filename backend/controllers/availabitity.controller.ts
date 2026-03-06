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

    app.post<{
    Body: {
        dayOfWeek: number;
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

        if (role !== "professional") {
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

        const availability = await prisma.availability.create({
        data: {
            professionalId: userId,
            ...request.body,
        },
        });

        return reply.send({
        status: "success",
        data: availability,
        });
    }
    );
    };