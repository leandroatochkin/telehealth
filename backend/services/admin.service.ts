import { prisma } from "../lib/prisma.js";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export const adminService = {
  getDashboardStats: async () => {
    const [totalPatients, totalProfessionals, appointmentsByStatus] = await Promise.all([
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.user.count({ where: { role: 'PROFESSIONAL' } }),
      prisma.appointment.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    const professionalPerformance = await prisma.user.findMany({
      where: { role: 'PROFESSIONAL' },
      select: {
        id: true,
        name: true,
        surname: true,
        _count: {
          select: { professionalAppointments: true }
        }
      },
      take: 10,
      orderBy: { professionalAppointments: { _count: 'desc' } }
    });

    return {
      users: { patients: totalPatients, professionals: totalProfessionals },
      appointments: appointmentsByStatus,
      topProfessionals: professionalPerformance
    };
  },

  listBackups: async () => {
    const backupDir = path.join(process.cwd(), './backups');
    console.log("Checking backup directory:", backupDir);
    if (!fs.existsSync(backupDir)) return [];
    return fs.readdirSync(backupDir).filter(file => file.endsWith('.sql.gz'));
  },

  getChatByUsers: async (professionalId: string, patientId: string) => {
    // Generamos los posibles IDs del canal (en caso de que el orden varíe)
    const shortId1 = patientId.substring(0, 15);
    const shortId2 = professionalId.substring(0, 15);
    
    const channelId = `chat_${shortId1}_${shortId2}`;
    // También podríamos buscar por un ID alternativo si el orden fuera al revés
    const alternativeId = `chat_${shortId2}_${shortId1}`;

    return await prisma.chatBackup.findMany({
      where: {
        OR: [
          { channelId: channelId },
          { channelId: alternativeId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
  },

  getAllUsers: async (page: number = 1, limit: number = 10, search: string = "") => {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { id: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { dni: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
        { surname: { contains: search, mode: 'insensitive' as const } },
        { username: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    };
  },

  updateUser: async (id: string, data: any) => {
    // 1. Validamos que el usuario exista antes de tocar nada
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new Error("Usuario no encontrado");

    // 2. Ejecutamos la actualización
    return await prisma.user.update({
      where: { id },
      data: {
        // Usamos nullish coalescing para mantener el valor actual si no viene en el body
        name: data.name ?? existingUser.name,
        surname: data.surname ?? existingUser.surname,
        dni: data.dni ?? existingUser.dni,
        role: (data.role) ?? existingUser.role,
        isVerified: data.isVerified ?? existingUser.isVerified,
        medicalLicense: data.medicalLicense ?? existingUser.medicalLicense,
        // Agregamos updatedAt manualmente si Prisma no lo hace automático
        updatedAt: new Date(),
      },
      // Seleccionamos lo que devolvemos para no mandar la password por accidente
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isVerified: true,
        name: true,
        surname: true,
        medicalLicense: true,
      }
    });
  },

  // D. OBTENER LISTA DE PACIENTES QUE SE HAN CHATEADO CON UN PROFESIONAL
  // Útil para llenar el select del frontend
  getPatientsByProfessional: async (professionalId: string) => {
    const backups = await prisma.chatBackup.findMany({
      where: { channelId: { contains: professionalId.substring(0, 15) } },
      select: { senderId: true, senderName: true },
      distinct: ['senderId'],
    });
    
    // Filtramos para devolver solo los que no son el profesional
    return backups.filter(b => b.senderId !== professionalId);
  }
}

export const createManualBackup = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `manual-backup-${timestamp}.sql.gz`;
  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const filePath = path.join(backupDir, filename);

  // IMPORTANTE: Ajusta estos valores según tu .env
  // Si no tienes contraseña en local, quita 'PGPASSWORD'
  const { DB_USER, DB_NAME, DB_PASSWORD, DB_HOST } = process.env;

  // Comando para PostgreSQL local:
  // dump | gzip > archivo.gz
  const command = `pg_dump -h ${DB_HOST || 'localhost'} -U ${DB_USER} ${DB_NAME} | gzip > "${filePath}"`;

  try {
    // Ejecutamos con la variable de entorno de password para que no pida login interactivo
    await execAsync(command, {
      env: { ...process.env, PGPASSWORD: DB_PASSWORD }
    });

    return { filename, success: true };
  } catch (error: any) {
    console.error("Error al generar backup manual:", error);
    throw new Error("No se pudo generar el backup: " + error.message);
  }
};
