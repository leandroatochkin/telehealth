import { prisma } from "../lib/prisma.js";

export class AvailabilityService {
  async getAvailableSlots(
    professionalId: string,
    date: string
  ) {
    const targetDate = new Date(date);

    const dayOfWeek = targetDate.getDay();

    const availability = await prisma.availability.findMany({
      where: {
        professionalId,
        // Busca específicamente el día seleccionado o registros recurrentes sin fecha
        OR: [
          { date: targetDate },
          { AND: [{ dayOfWeek }, { date: null }] } 
        ]
      },
    });

    if (!availability.length) return [];

    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        startTime: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
        status: {
          in: ["scheduled", "active"],
        },
      },
    });

    const bookedTimes = appointments.map((a) =>
      a.startTime.toISOString()
    );

    const slots: string[] = [];

    for (const block of availability) {
      const [startHour, startMin] = block.startTime.split(":").map(Number);
      const [endHour, endMin] = block.endTime.split(":").map(Number);

      const slotStart = new Date(targetDate);
      slotStart.setHours(startHour ?? 0, startMin ?? 0, 0, 0);

      const slotEnd = new Date(targetDate);
      slotEnd.setHours(endHour ?? 0, endMin ?? 0, 0, 0);

      const step = block.duration || 30;

      while (slotStart < slotEnd) {
        const iso = slotStart.toISOString();

        if (!bookedTimes.includes(iso) && slotStart > new Date()) {
          slots.push(iso);
        }

        slotStart.setMinutes(slotStart.getMinutes() + step);
      }
    }

    return slots;
  }

  async getProfessionals() {
    const professionals = await prisma.user.findMany({
      where: {
        role: "PROFESSIONAL", // Make sure this matches your Enum or String in schema.prisma
      },
      select: {
        id: true,
        name: true,
        surname: true,
      },
    });

    return professionals;
  }

  async deleteAvailabilityById(id: string, professionalId: string) {
    return await prisma.availability.deleteMany({
      where: { id, professionalId },
    });
  }

  async deleteDailyAvailability(professionalId: string, date: string) {
    const targetDate = new Date(date);
    return await prisma.availability.deleteMany({
      where: {
        professionalId,
        date: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
      },
    });
  }

  async deleteWeeklyAvailability(professionalId: string, dayOfWeek: number) {
    return await prisma.availability.deleteMany({
      where: {
        professionalId,
        dayOfWeek,
        date: null, 
      },
    });
  }
}