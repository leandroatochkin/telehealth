import { prisma } from "../lib/prisma.js";

export const getSystemSetting = async (key: string): Promise<string> => {
  // 1. Intentar buscar en la DB
  const setting = await prisma.systemSetting.findUnique({
    where: { key }
  });

  // 2. Si existe, devolvemos el valor de la DB
  if (setting) return setting.value;

  // 3. Si no existe, usamos la variable de entorno del .env
  return process.env[key] || "";
};

export const updateSystemSetting = async (key: string, value: string) => {
  return await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
};