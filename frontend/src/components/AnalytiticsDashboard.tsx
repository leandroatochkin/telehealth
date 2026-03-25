import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Divider } from '@mui/material';
import { 
  CalendarMonth as CalendarIcon, 
  BarChart as ChartIcon, 
  Assignment as PrescriptionIcon,
  People as PeopleIcon 
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { fetchAppointmentStats } from '../api/admin.api';
import AppointmentStats from './AppointmentStats';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Al cargar el dashboard, traemos las stats iniciales
    if (token) dispatch(fetchAppointmentStats(token));
  }, [dispatch, token]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Aquí podrías disparar otros fetches según la pestaña
    // if (newValue === 1) dispatch(fetchMedicalStats(token));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Centro de Estadísticas
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Monitoreo en tiempo real del rendimiento de la plataforma.
        </Typography>
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<CalendarIcon />} iconPosition="start" label="Citas y Agendas" />
        <Tab icon={<PeopleIcon />} iconPosition="start" label="Usuarios y Actividad" disabled />
        <Tab icon={<PrescriptionIcon />} iconPosition="start" label="Reportes Médicos" disabled />
        <Tab icon={<ChartIcon />} iconPosition="start" label="Consumo API" disabled />
      </Tabs>

      {/* PESTAÑA 0: CITAS */}
      <CustomTabPanel value={activeTab} index={0}>
        <AppointmentStats />
      </CustomTabPanel>

      {/* PESTAÑA 1: PRÓXIMAMENTE */}
      <CustomTabPanel value={activeTab} index={1}>
        <Typography>Gráficos de Usuarios en desarrollo...</Typography>
      </CustomTabPanel>
    </Box>
  );
}