import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma.js";

export const generateHistoryPdf = async (patientId: string, entryId?: string) => {
  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    include: {
      patientHistory: {
        include: {
          // If entryId is provided, we only fetch that specific entry
          entries: {
            where: entryId ? { id: entryId } : {},
            orderBy: { date: "desc" },
          },
        },
      },
    },
  });

  if (!patient) throw new Error("Patient not found");
  
  const entries = patient.patientHistory?.entries || [];
  if (entryId && entries.length === 0) throw new Error("Entry not found");

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  return { doc, patient, entries };
};