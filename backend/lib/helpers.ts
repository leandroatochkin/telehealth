import {prisma} from "../lib/prisma.js";

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function assertNoOverlap(
  doctorId: string,
  startTime: Date,
  endTime: Date
) {
  const overlapping = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: {
        in: ["scheduled", "active"],
      },
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });

  if (overlapping) {
    throw new Error("Doctor has overlapping appointment");
  }
}