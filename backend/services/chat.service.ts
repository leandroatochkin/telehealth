import { prisma } from "../lib/prisma.js";

interface BackupMessageInput {
  channelId: string;
  text: string;
  streamMessageId: string;
  userId: string;
}

export const backupMessageService = async ({
  channelId,
  text,
  streamMessageId,
  userId,
}: BackupMessageInput) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, surname: true, username: true }
    });

    const fullName = user?.name && user?.surname 
      ? `${user.name} ${user.surname}` 
      : (user?.username || "Usuario Desconocido");

    // 2. Intentamos crear el backup
    return await prisma.chatBackup.create({
      data: {
        streamMessageId,
        channelId,
        senderId: userId,
        senderName: fullName,
        text,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return await prisma.chatBackup.findUnique({
        where: { streamMessageId }
      });
    }
    throw error;
  }
};