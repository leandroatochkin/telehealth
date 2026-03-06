import { prisma } from "../lib/prisma.js";

interface PrescriptionItemInput {
  drugName: string;
  genericName?: string;
  concentration?: string;
  form?: string;
  presentation?: string;
  quantity: number;
}

interface CreatePrescriptionInput {
  doctorId: string;
  patientDni: string;
  items: PrescriptionItemInput[];
}

export const createPrescriptionService = async ({
  doctorId,
  patientDni,
  items
}: CreatePrescriptionInput) => {
  console.log("Creating prescription for patient DNI:", patientDni);
  const patient = await prisma.user.findUnique({
    where: { dni: patientDni }
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  const doctor = await prisma.user.findUnique({
    where: { id: doctorId }
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const prescription = await prisma.prescription.create({
    data: {
      doctorId,
      patientId: patient.id,
      patientNameSnapshot: `${patient.name} ${patient.surname}` || "Unknown Patient",
      doctorNameSnapshot: `${doctor.name} ${doctor.surname}` || "Unknown Doctor",
      items: {
        create: items
      }
    },
    include: {
      items: true
    }
  });

  return prescription;
};

export const getPatientPrescriptionsService = async (patientId: string) => {

  return prisma.prescription.findMany({
    where: { patientId },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

};

export const getDoctorPrescriptionsService = async (doctorId: string) => {

  return prisma.prescription.findMany({
    where: { doctorId },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

};