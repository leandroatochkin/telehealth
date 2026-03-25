import { Box, Paper, Typography, CircularProgress, useTheme } from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { useAppSelector } from '../lib/hooks';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AppointmentStats() {
  const { appointmentStats, loading } = useAppSelector(state => state.admin);
  const theme = useTheme();

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'grid', 
      // Definimos las columnas: 1 columna en móvil, 12 fracciones en desktop
      gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, 
      gap: 3,
      width: '100%'
    }}>
      
      {/* TARJETA 1: Gráfico de Barras (Ocupa 8 de 12 columnas) */}
      <Paper sx={{ 
        gridColumn: { xs: 'span 1', md: 'span 8' }, 
        p: 3, 
        borderRadius: 2, 
        height: 450,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Volumen de Citas (Últimos 6 meses)
        </Typography>
        <Box sx={{ flexGrow: 1, minHeight: 0 }}> {/* El Box evita que Recharts rompa el parent */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={appointmentStats.monthlyVolume} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
              <Bar dataKey="total" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* TARJETA 2: Gráfico de Torta (Ocupa 4 de 12 columnas) */}
      <Paper sx={{ 
        gridColumn: { xs: 'span 1', md: 'span 4' }, 
        p: 3, 
        borderRadius: 2, 
        height: 450,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Estados del Mes
        </Typography>
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={appointmentStats.statusData}
                cx="50%" cy="45%"
                innerRadius={70} outerRadius={100}
                paddingAngle={8} dataKey="value"
              >
                {appointmentStats.statusData.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" align="center" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

    </Box>
  );
}