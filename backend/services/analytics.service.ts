import { prisma } from "../lib/prisma.js";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import { es } from "date-fns/locale";

export const analyticsService = {
  getAppointmentStats: async () => {
    const now = new Date();
    
    // 1. Volumen Mensual (Últimos 6 meses)
    const monthlyVolume = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      
      const count = await prisma.appointment.count({
        where: {
          startTime: { gte: monthStart, lte: monthEnd }
        }
      });

      monthlyVolume.push({
        month: format(monthStart, 'MMM', { locale: es }),
        total: count
      });
    }

    // 2. Distribución de Estados (Mes Actual)
    const statusDistribution = await prisma.appointment.groupBy({
      by: ['status'],
      where: {
        startTime: {
          gte: startOfMonth(now),
          lte: endOfMonth(now)
        }
      },
      _count: { id: true }
    });

    const statusData = statusDistribution.map(item => ({
      name: item.status,
      value: item._count.id
    }));

    return { monthlyVolume, statusData };
  }
};