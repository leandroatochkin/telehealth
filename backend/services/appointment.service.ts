import { prisma } from "../lib/prisma.js";
import { assertNoOverlap } from "../lib/helpers.js";

export class AppointmentService {
  async create(data: {
    professionalId: string;
    patientId: string;
    startTime: Date;
    endTime: Date;
  }) {
    await assertNoOverlap(
      data.professionalId,
      data.startTime,
      data.endTime
    );

    return prisma.appointment.create({
      data,
    });
  }

  async joinCall(appointmentId: string, user: any) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) throw new Error("Not found");

    const now = new Date();

    // must be participant
    if (
      user.id !== appointment.professionalId &&
      user.id !== appointment.patientId
    ) {
      throw new Error("Unauthorized");
    }

    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled" ||
      appointment.status === "no_show"
    ) {
      throw new Error("Appointment closed");
    }

    // NO SHOW LOGIC
    const fiveMinutesAfterStart = new Date(
      appointment.startTime.getTime() + 5 * 60 * 1000
    );

    if (
      appointment.status === "scheduled" &&
      now > fiveMinutesAfterStart &&
      !appointment.professionalJoinedAt
    ) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "no_show" },
      });

      throw new Error("Professional no-show");
    }

    // PATIENT RULES
    if (user.role === "patient") {
      const fiveMinutesBeforeStart = new Date(
        appointment.startTime.getTime() - 5 * 60 * 1000
      );

      if (now < fiveMinutesBeforeStart)
        throw new Error("Too early");

      if (now > appointment.endTime)
        throw new Error("Appointment ended");
    }

    // DOCTOR RULES
    if (user.role === "doctor") {
      if (now < appointment.startTime)
        throw new Error("Cannot start early");
    }

    // update join times
    if (user.role === "doctor" && !appointment.professionalJoinedAt) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          professionalJoinedAt: now,
          status: "active",
        },
      });
    }

    if (user.role === "patient" && !appointment.patientJoinedAt) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          patientJoinedAt: now,
        },
      });
    }

    return {
      callId: `appointment_${appointment.id}`,
    };
  }

  async endAppointment(id: string, user: any) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) throw new Error("Not found");

    if (user.id !== appointment.professionalId)
      throw new Error("Only professional can end");

    return prisma.appointment.update({
      where: { id },
      data: {
        status: "completed",
        endedAt: new Date(),
      },
    });
  }

async getUpcoming(user: any) {
  const now = new Date();

  const whereClause: any = {
    status: { in: ["scheduled", "active"] },
    startTime: { gte: now },
  };

  if (user.role === "PROFESSIONAL") {
    whereClause.professionalId = user.id;
  } else if (user.role === "PATIENT") {
    whereClause.patientId = user.id;
  } else {
    throw new Error("Invalid user role");
  }

  return prisma.appointment.findMany({
    where: whereClause,
    orderBy: {
      startTime: "asc",
    },
    include: {
      // Include professional info if current user is a patient
      professional: {
        select: {
          username: true,
          email: true,
        }
      },
      patient: {
        select: {
          username: true,
        }
      }
    },
  });
}

async getByProfessionalAndDate(professionalId: string, date: string) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.appointment.findMany({
    where: {
      professionalId,
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { not: "cancelled" }, // Don't show cancelled ones on the slot list
    },
    include: {
      patient: {
        select: {
          name: true,
          surname: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
  });
}


}