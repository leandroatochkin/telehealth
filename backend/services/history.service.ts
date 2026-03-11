import { prisma } from "../lib/prisma.js";

export class HistoryService {
  async getPatientByDni(dni: string) {
    const patient = await prisma.user.findUnique({
      where: { dni },
      select: { 
        id: true,
        dni: true,
        name: true,
        surname: true,
        email: true,
        patientHistory: true, // This includes the history relation
      }, 
    });
    if (!patient) throw new Error("Patient not found");
    return patient;
  }

  async getEntries(historyId: string, params: { 
    page: number, 
    limit: number, 
    date?: string, 
    search?: string 
  }) {
    const { page, limit, date, search } = params;
    const skip = (page - 1) * limit;

    const whereClause: any = { medicalHistoryId: historyId };

    // Date Filter
    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      whereClause.date = { gte: start, lte: end };
    }

    // Text Search (Details or Diagnostics)
    if (search) {
      whereClause.OR = [
        { details: { contains: search, mode: 'insensitive' } },
        { diagnostics: { has: search } } // Note: 'has' works for exact matches in arrays
      ];
    }

    // Execute count and findMany in parallel
    const [total, entries] = await Promise.all([
      prisma.historyEntry.count({ where: whereClause }),
      prisma.historyEntry.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { date: 'desc' }
      })
    ]);

    return { total, entries, totalPages: Math.ceil(total / limit) };
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