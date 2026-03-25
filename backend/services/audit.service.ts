import { prisma } from "../lib/prisma.js";

export const auditService = {
  // 1. Buscar todos los chats donde participe un doctor o un paciente
  // Retorna una lista de canales únicos con los nombres de los participantes
  getConversationsByUserId: async (userId: string) => {
    const backups = await prisma.chatBackup.findMany({
      where: {
        OR: [
          { senderId: userId }, // Enviado por él
          { channelId: { contains: userId.substring(0, 15) } } // O el canal contiene su ID
        ]
      },
      distinct: ['channelId'],
      select: {
        channelId: true,
      }
    });

    // Para cada canal, buscamos quiénes son los participantes (basado en senderName del backup)
    const results = await Promise.all(backups.map(async (b) => {
      const lastMsg = await prisma.chatBackup.findFirst({
        where: { channelId: b.channelId },
        orderBy: { createdAt: 'desc' }
      });

      return {
        channelId: b.channelId,
        lastActive: lastMsg?.createdAt,
        preview: lastMsg?.text.substring(0, 50) + "..."
      };
    }));

    return results;
  },

  // 2. Exportar el historial de ChatBackup a formato texto
  exportChatToText: async (channelId: string) => {
    const messages = await prisma.chatBackup.findMany({
      where: { channelId },
      orderBy: { createdAt: 'asc' }
    });

    if (messages.length === 0) return "No hay mensajes grabados en este chat.";

    let report = `REPORTE DE AUDITORÍA DE CHAT\n`;
    report += `ID DEL CANAL: ${channelId}\n`;
    report += `FECHA DE EXPORTACIÓN: ${new Date().toLocaleString()}\n`;
    report += `--------------------------------------------------\n\n`;

    messages.forEach(m => {
      const date = new Date(m.createdAt).toLocaleString();
      report += `[${date}] ${m.senderName.toUpperCase()}: ${m.text}\n`;
    });

    return report;
  }
};  