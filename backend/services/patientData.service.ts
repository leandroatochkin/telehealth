import { prisma } from "../lib/prisma.js";

export const findPatientForPrescription = async (dni: string) => {
  const patient = await prisma.user.findUnique({
    where: { dni },
    select: {
      id: true,
      name: true,
      surname: true,
      dni: true,
    },
  });
  if (!patient) throw new Error("Paciente no encontrado");
  return patient;
};