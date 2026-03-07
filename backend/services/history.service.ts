import { prisma } from "../lib/prisma.js";

export class HistoryService {
  async getPatientByDni(dni: string) {
    const patient = await prisma.user.findUnique({
      where: { dni },
      include: {
        patientHistory: {
          include: {
            entries: { orderBy: { date: 'desc' } }
          }
        }
      }
    });
    if (!patient) throw new Error("Patient not found");
    return patient;
  }

  async addEntry(patientId: string, doctorId: string, doctorName: string, data: any) {
    // Ensure history record exists for patient
    let history = await prisma.medicalHistory.findFirst({ where: { patientId } });
    if (!history) {
      history = await prisma.medicalHistory.create({ data: { patientId } });
    }

    return prisma.historyEntry.create({
      data: {
        medicalHistoryId: history.id,
        doctorId,
        doctorName,
        date: new Date(data.date),
        details: data.details,
        diagnostics: data.diagnostics,
      }
    });
  }
}