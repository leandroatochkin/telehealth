import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { adminService, createManualBackup } from "../services/admin.service.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { getSystemSetting, updateSystemSetting } from "../services/config.service.js";
import fs from 'fs';
import path from 'path';
import { auditService } from "../services/audit.service.js";
import { analyticsService } from "../services/analytics.service.js";

export const adminController = async (app: FastifyInstance) => {
  
  // Hook Global para este controlador: Autentica y Verifica que sea ADMIN
  app.addHook('preHandler', async (request: any, reply: FastifyReply) => {
    await isAuthenticated(request, reply);
    
    if (request.user?.role !== 'ADMIN') {
      return reply.status(403).send({
        status: "fail",
        message: "Acceso denegado: Se requieren permisos de administrador"
      });
    }
  });

  // --- ESTADÍSTICAS ---
  app.get("/admin/stats", async (request, reply) => {
    const stats = await adminService.getDashboardStats();
    return { status: "success", data: stats };
  });

  // --- GESTIÓN DE CHATS ---
  
  // 1. Obtener pacientes que han hablado con un profesional (para el select del front)
  app.get("/admin/pro-patients/:professionalId", async (request: any, reply) => {
    const { professionalId } = request.params;
    const patients = await adminService.getPatientsByProfessional(professionalId);
    return { status: "success", data: patients };
  });

  // 2. Obtener historial de chat entre ambos
  app.get("/admin/chat-history", async (request: any, reply) => {
    const { professionalId, patientId } = request.query;

    if (!professionalId || !patientId) {
        return reply.status(400).send({ message: "Se requieren professionalId y patientId" });
    }

    try {
        const messages = await adminService.getChatByUsers(professionalId, patientId);
        return { status: "success", data: messages };
    } catch (error: any) {
        return reply.status(500).send({ status: "error", message: error.message });
    }
  });

  // --- INFRAESTRUCTURA ---
  app.get("/admin/backups", async (request, reply) => {
    const files = await adminService.listBackups();
    return { status: "success", data: files };
  });

  app.get("/admin/backups/download/:filename", async (request: any, reply) => {
  const { filename } = request.params;
  const filePath = path.join(process.cwd(), 'backups', filename);

  if (!fs.existsSync(filePath)) {
    return reply.status(404).send({ message: "Archivo no encontrado" });
  }

  const fileStream = fs.createReadStream(filePath);
  return reply
    .header('Content-Disposition', `attachment; filename=${filename}`)
    .type('application/gzip')
    .send(fileStream);
});

app.post("/admin/backups/create", async (request, reply) => {
  try {
    const result = await createManualBackup();
    return { 
      status: "success", 
      message: "Backup generado correctamente", 
      data: result 
    };
  } catch (error: any) {
    return reply.status(500).send({ 
      status: "error", 
      message: error.message 
    });
  }
});

  app.get("/admin/settings/stream", async (request, reply) => {
    const apiKey = await getSystemSetting("STREAM_API_KEY");
    const apiSecret = await getSystemSetting("STREAM_API_SECRET");

    return {
      status: "success",
      data: {
        apiKey: apiKey || "No configurada",
        // Solo mostramos los últimos 4 caracteres del secret por seguridad
        apiSecret: apiSecret ? `****${apiSecret.slice(-4)}` : "No configurada"
      }
    };
  });

  // POST: Actualizar llaves
  app.post("/admin/settings/stream", async (request: any, reply) => {
    const { apiKey, apiSecret } = request.body;

    if (!apiKey || !apiSecret) {
      return reply.status(400).send({
        status: "fail",
        message: "Se requieren tanto la API Key como el API Secret"
      });
    }

    try {
      // Guardamos ambas en la tabla SystemSetting
      await updateSystemSetting("STREAM_API_KEY", apiKey);
      await updateSystemSetting("STREAM_API_SECRET", apiSecret);

      return {
        status: "success",
        message: "Configuración de Stream actualizada correctamente"
      };
    } catch (error: any) {
      return reply.status(500).send({
        status: "error",
        message: "Error al guardar en la base de datos"
      });
    }
  });

  app.get("/admin/settings/gemini", async (request, reply) => {
  const geminiKey = await getSystemSetting("GEMINI_API_KEY");

  return {
    status: "success",
    data: {
      geminiKey: geminiKey ? `****${geminiKey.slice(-4)}` : "No configurada"
    }
  };
});

// POST: Actualizar Gemini Key
app.post("/admin/settings/gemini", async (request: any, reply) => {
  const { geminiKey } = request.body;

  if (!geminiKey) {
    return reply.status(400).send({
      status: "fail",
      message: "Se requiere la API Key de Gemini"
    });
  }

  try {
    await updateSystemSetting("GEMINI_API_KEY", geminiKey);

    return {
      status: "success",
      message: "API Key de Gemini actualizada correctamente"
    };
  } catch (error: any) {
    return reply.status(500).send({
      status: "error",
      message: "Error al guardar en la base de datos"
    });
  }
});

app.get("/admin/api-usage", async (request, reply) => {
  // Obtenemos el consumo de los últimos 7 días
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const usageStats = await prisma.apiUsage.groupBy({
    by: ['provider'],
    where: {
      createdAt: { gte: sevenDaysAgo }
    },
    _sum: {
      totalTokens: true
    },
    _count: {
      id: true
    }
  });

  return { status: "success", data: usageStats };
});

app.get("/admin/audit/list/:userId", async (request: any, reply) => {
  const { userId } = request.params;
  const data = await auditService.getConversationsByUserId(userId);
  return { status: "success", data };
});

// GET /admin/audit/export/:channelId -> Descarga el TXT
app.get("/admin/audit/export/:channelId", async (request: any, reply) => {
  const { channelId } = request.params;
  const text = await auditService.exportChatToText(channelId);

  return reply
    .header('Content-Type', 'text/plain')
    .header('Content-Disposition', `attachment; filename="AUDIT_${channelId}.txt"`)
    .send(text);
});

app.get("/admin/users", async (request: any, reply) => {
  const { page, limit, search } = request.query;
  const result = await adminService.getAllUsers(
    Number(page) || 1, 
    Number(limit) || 10, 
    search || ""
  );
  return { status: "success", data: result };
});

// PATCH /api/v1/admin/users/:id
app.patch("/admin/users/:id", async (request: any, reply) => {
  const { id } = request.params;
  const updateData = request.body;

  try {
    const updatedUser = await adminService.updateUser(id, updateData);
    
    return reply.send({
      status: "success",
      message: "Usuario actualizado correctamente",
      data: updatedUser
    });
  } catch (error: any) {
    // Manejo de errores de Prisma (P2002 es Constraint de Unique)
    if (error.code === 'P2002') {
      return reply.status(400).send({
        status: "fail",
        message: "El DNI o Email ya está en uso por otro usuario."
      });
    }

    return reply.status(500).send({
      status: "error",
      message: error.message || "Error interno al actualizar el usuario"
    });
  }
});

app.get("/admin/analytics/appointments", async (request, reply) => {
  const stats = await analyticsService.getAppointmentStats();
  return { status: "success", data: stats };
});
};