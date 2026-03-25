import { prisma } from "../lib/prisma.js";
import { ApiProvider } from "@prisma/client";

export const logApiUsage = async (
  provider: ApiProvider, 
  totalTokens: number, 
  modelName?: string
) => {
  try {
    // Usamos createMany o simplemente create sin esperar (fire and forget) 
    // para no ralentizar la respuesta al usuario final
    prisma.apiUsage.create({
      data: {
        provider,
        totalTokens,
        modelName,
      }
    }).catch(err => console.error("Error logging usage:", err));
    
  } catch (error) {
    console.error("Critical usage logging error:", error);
  }
};