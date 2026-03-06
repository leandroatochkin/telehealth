import { FastifyInstance } from "fastify";
import { generatePrescriptionPdf } from "../services/prescriptionPdf.service.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

export const prescriptionPdfController = async (app: FastifyInstance) => {

  app.get(
    "/prescriptions/:id/pdf",
    { preHandler: isAuthenticated },
    async (request: any, reply) => {

      const { id } = request.params;
      const patientId = request.user.id;

      try {

        const { doc, prescription, qr } =
          await generatePrescriptionPdf(id, patientId);

        reply.header("Content-Type", "application/pdf");
        reply.header(
          "Content-Disposition",
          `attachment; filename=receta-${id}.pdf`
        );

      

        reply.header("Content-Type", "application/pdf");
        reply.header(
          "Content-Disposition",
          `attachment; filename=receta-${id}.pdf`
        );

        // TITLE
        doc
          .fontSize(20)
          .text("RECETA MÉDICA DIGITAL", { align: "center" });

        doc.moveDown();

        // DOCTOR
        doc.fontSize(12).text("Profesional", { underline: true });

        doc.text(
          `Dr. ${prescription.doctor.name} ${prescription.doctor.surname}`
        );

        doc.text(
          `M.P.: ${prescription.doctor.medicalLicense ?? "N/A"}`
        );

        doc.moveDown();

        // PATIENT
        doc.fontSize(12).text("Paciente", { underline: true });

        doc.text(
          `${prescription.patient.name} ${prescription.patient.surname}`
        );

        doc.text(`DNI: ${prescription.patient.dni}`);

        doc.moveDown();

        doc.text(
          `Fecha: ${new Date(
            prescription.createdAt
          ).toLocaleDateString()}`
        );

        doc.moveDown();

        // RP SECTION (ANMAT format)
        doc.fontSize(14).text("Rp/", { underline: true });

        doc.moveDown();

        prescription.items.forEach((item: any, i: number) => {

          doc.fontSize(12).text(
            `${i + 1}) ${item.genericName ?? item.drugName}`
          );

          if (item.concentration)
            doc.text(`   Concentración: ${item.concentration}`);

          if (item.form)
            doc.text(`   Forma: ${item.form}`);

          if (item.presentation)
            doc.text(`   Presentación: ${item.presentation}`);

          doc.text(`   Cantidad: ${item.quantity}`);

          doc.moveDown();
        });

        doc.moveDown();

        doc.text("Firma y sello del profesional:");

        doc.moveDown();

        // QR
        const qrBuffer = Buffer.from(
          qr.replace(/^data:image\/png;base64,/, ""),
          "base64"
        );

        doc.image(qrBuffer, {
          fit: [120, 120],
          align: "right",
        });

        doc.moveDown();

        doc
          .fontSize(10)
          .text(
            "Receta válida por 30 días desde la fecha de emisión.",
            { align: "center" }
          );

        doc
          .fontSize(9)
          .text(
            "Validar autenticidad escaneando el código QR.",
            { align: "center" }
          );

        doc.end();

        return reply.send(doc);

      } catch (error: any) {

        return reply.status(400).send({
          status: "fail",
          message: error.message,
        });

      }
    }
  );
};