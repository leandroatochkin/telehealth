import { FastifyInstance } from "fastify";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { findPatientForPrescription } from "../services/patientData.service.js";

export const patientDataController = async (
    app: FastifyInstance
    ) => {
    app.post<{
    Body: {
        dni: string;
    };
    }>(
    "/patient",
    { preHandler: isAuthenticated },
    async (request, reply) => {

        if (!request.user) {
            return reply.status(401).send({ message: "Unauthorized" });
            }

        const role = request.user.role;

        if (role !== "PROFESSIONAL") {
        return reply.status(403).send({
            status: "fail",
            message: "Only professionals can view patient data",
        });
        }

        const patientDni = request.body.dni;

        if (!patientDni) {
        return reply.status(400).send({
            status: "fail",
            message: "Patient DNI is required",
        });
        }

        

        try {
            const patient = await findPatientForPrescription(patientDni);
            if (!patient) {
                return reply.status(404).send({
                    status: "fail",
                    message: "Patient not found",
                });
            }

            return reply.send({
                status: "success",
                data: patient,
            })
            } catch (error: any) {
                return reply.status(400).send({
                    status: "fail",
                    message: error.message,
                });
            }
    });
}