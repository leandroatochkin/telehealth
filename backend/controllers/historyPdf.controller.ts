import { FastifyInstance } from "fastify";
import { generateHistoryPdf } from "../services/historyPdf.service.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

export const historyPdfController = async (app: FastifyInstance) => {
  app.get<{
    Params: { patientId: string };
    Querystring: { entryId?: string };
  }>(
    "/history/patient/:patientId/pdf",
    { preHandler: isAuthenticated },
    async (request, reply) => {
      const { patientId } = request.params;
      const { entryId } = request.query;

      try {
        const { doc, patient, entries } = await generateHistoryPdf(patientId, entryId);

        const filename = entryId ? `entrada-${entryId}.pdf` : `historia-${patient.dni}.pdf`;

        reply.header("Content-Type", "application/pdf");
        reply.header("Content-Disposition", `attachment; filename=${filename}`);

        // --- HEADER ---
        const title = entryId ? "REPORTE DE CONSULTA MÉDICA" : "HISTORIA CLÍNICA COMPLETA";
        doc.fontSize(18).text(title, { align: "center", characterSpacing: 1 });
        doc.moveDown();
        
        doc.fontSize(11).fillColor("#444").text("DATOS DEL PACIENTE", { underline: true });
        doc.fillColor("black").fontSize(12).text(`Nombre: ${patient.name} ${patient.surname}`);
        doc.text(`DNI: ${patient.dni}`);
        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#eee").stroke();
        doc.moveDown();

        // --- ENTRIES LOOP ---
        // --- ENTRIES LOOP ---
        entries.forEach((entry: any) => {
        if (doc.y > 700) doc.addPage();

        // Header of the entry background
        doc.rect(50, doc.y, 500, 20).fill("#f9f9f9");
        
        // Switch to Bold for the header text
        doc.fillColor("#333").fontSize(10)
            .font("Helvetica-Bold") // <--- Switch to Bold
            .text(`FECHA: ${new Date(entry.date).toLocaleDateString()} | PROFESIONAL: ${entry.doctorName}`, 55, doc.y - 14);
        
        doc.moveDown(1.5);

        // Switch back to Regular for labels/body, or Bold for specific labels
        doc.font("Helvetica-Bold").fillColor("black").fontSize(12).text("OBSERVACIONES Y EVOLUCIÓN:");
        
        doc.font("Helvetica").fontSize(11).text(entry.details, { align: 'justify', lineGap: 2 });
        
        doc.moveDown();
        
        if (entry.diagnostics && entry.diagnostics.length > 0) {
            doc.font("Helvetica-Bold").fontSize(11).text("DIAGNÓSTICOS: ", { continued: true });
            doc.font("Helvetica").text(`${entry.diagnostics.join(", ")}`); // continued: true follows with this
        }

        doc.moveDown(2);
        });

        // --- FOOTER ---
        const range = doc.bufferedPageRange();
        for (let i = 0; i < range.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).fillColor("grey").text(
            `Documento digital - Paciente: ${patient.surname} | Página ${i + 1} de ${range.count}`,
            50, 780, { align: "center" }
          );
        }

        doc.end();
        return reply.send(doc);

      } catch (error: any) {
        return reply.status(400).send({ status: "fail", message: error.message });
      }
    }
  );
};