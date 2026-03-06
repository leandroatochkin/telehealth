import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import {prisma} from "../lib/prisma.js";

export const generatePrescriptionPdf = async (
  prescriptionId: string,
  patientId: string
) => {

  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      items: true,
      doctor: true,
      patient: true
    }
  });

  if (!prescription) throw new Error("Prescription not found");

  if (prescription.patientId !== patientId) {
    throw new Error("Unauthorized");
  }

  const age =
    (Date.now() - prescription.createdAt.getTime()) /
    (1000 * 60 * 60 * 24);

  if (age > 30) {
    throw new Error("Prescription expired");
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 50
  });

  const qrUrl = `https://yourdomain.com/prescription/validate/${prescription.id}`;
  const qr = await QRCode.toDataURL(qrUrl);

  return { doc, prescription, qr };
};