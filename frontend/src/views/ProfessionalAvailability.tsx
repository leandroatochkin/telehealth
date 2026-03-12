import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  FormControlLabel, 
  Switch,
  Divider,
  Stack,
} from "@mui/material";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";

import DateSelector from "../components/DateSelector";
import SlotList from "../components/SlotList";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import {
  createAvailability,
  fetchAvailableSlots,
  fetchProfessionalAppointmentsByDate,
  deleteAvailability
} from "../api/appointments.api";

import { notify } from "../lib/notifications";

export default function ProfessionalAvailabilityPage() {
  const dispatch = useAppDispatch();

  const { token } = useAppSelector((state) => state.auth);

  const user = useAppSelector((state) => state.auth.user);

  const { slots, appointments, loading } = useAppSelector(
    (state) => state.appointments
  );


  const { colors, shadows, fontWeights } =
    useAppSelector((state) => state.theme);

  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [isRecurring, setIsRecurring] = useState(false);
  const [duration, setDuration] = useState(30);

  const handleDateChange = (newDate: Date | null) => {
  setDate(newDate);
  if (!newDate || !token) return;

  const dateIso = newDate.toISOString();

  // 1. Fetch the empty/available slots
  dispatch(fetchAvailableSlots({ professionalId: user?.id ?? "", date: dateIso, token }));

  // 2. Fetch the booked appointments
  dispatch(fetchProfessionalAppointmentsByDate({ professionalId: user?.id ?? "", date: dateIso, token }));
};

const handleCreateSlots = async () => {
  if (!date || !token) {
    notify("Por favor seleccione una fecha", "warning");
    return;
  }

  try {
    const resultAction = await dispatch(
      createAvailability({
        date: date.toISOString(),
        startTime,
        endTime,
        token,
        isRecurring,
        duration 
      })
    );

    if (createAvailability.fulfilled.match(resultAction)) {
      notify(isRecurring ? "Horario semanal configurado" : "Turnos generados", "success");
      
      // Refresco de datos
      const dateIso = date.toISOString();
      const professionalId = user?.id ?? "";
      dispatch(fetchAvailableSlots({ professionalId, date: dateIso, token }));
      dispatch(fetchProfessionalAppointmentsByDate({ professionalId, date: dateIso, token }));
    } else {
      notify("Error al crear turnos", "error");
    }
  } catch (error) {
    notify("Error de red", "error");
  }
};

const handleDeleteDaily = async () => {
  if (!date) return;
  if (window.confirm("¿Borrar toda la disponibilidad de este día específico?")) {
    await dispatch(deleteAvailability({ 
      type: 'daily', 
      date: date.toISOString(), 
      token 
    }));
    // Refrescar
    handleDateChange(date);
  }
};

const handleDeleteWeekly = async () => {
  if (!date) return;
  const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
  if (window.confirm(`¿Borrar la configuración recurrente de todos los ${dayName}?`)) {
    await dispatch(deleteAvailability({ 
      type: 'weekly', 
      dayOfWeek: date.getDay(), 
      token 
    }));
    handleDateChange(date);
  }
};

return (
    <Box sx={{ display: "flex", gap: 3, backgroundColor: colors.background }}>
      {/* COLUMNA CALENDARIO (Sin cambios) */}
      <Box sx={{ flex: 1, backgroundColor: colors.surface, borderRadius: 3, boxShadow: shadows.lg, padding: 3 }}>
        <Typography sx={{ fontWeight: fontWeights.semibold, mb: 2, color: colors.textPrimary }}>
          Seleccione el día
        </Typography>
        <DateSelector value={date} onChange={handleDateChange} />
      </Box>

      {/* COLUMNA EDITOR Y LISTADO */}
      <Box sx={{ flex: 1.5, backgroundColor: colors.surface, borderRadius: 3, boxShadow: shadows.lg, padding: 3, display: "flex", flexDirection: "column" }}>
        <Typography sx={{ fontWeight: fontWeights.semibold, mb: 3, color: colors.textPrimary }}>
          Gestión de Disponibilidad
        </Typography>

        {/* INPUTS DE TIEMPO Y SWITCH (Tu lógica existente) */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField type="time" label="Comienza" value={startTime} onChange={(e) => setStartTime(e.target.value)} fullWidth />
          <TextField type="time" label="Finaliza" value={endTime} onChange={(e) => setEndTime(e.target.value)} fullWidth />
        </Box>

        <FormControlLabel
          control={<Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} color="primary" />}
          label={<Typography sx={{ fontSize: '0.85rem', color: colors.textPrimary }}>Repetir semanalmente</Typography>}
          sx={{ mb: 1 }}
        />

        <Box sx={{ mb: 2 }}>
          <TextField
            select
            fullWidth
            label="Duración del turno"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            SelectProps={{ native: true }}
          >
            <option value={15}>15 minutos</option>
            <option value={20}>20 minutos</option>
            <option value={30}>30 minutos</option>
            <option value={45}>45 minutos</option>
            <option value={60}>60 minutos</option>
          </TextField>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleCreateSlots}
          disabled={loading || !date}
          sx={{ backgroundColor: colors.primary, mb: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : "Generar Bloque de Turnos"}
        </Button>

        <Divider sx={{ mb: 3 }} />

        {/* LISTADO DE TURNOS */}
        <Typography sx={{ fontWeight: fontWeights.semibold, mb: 2, color: colors.textPrimary }}>
          Agenda para el {date?.toLocaleDateString()}
        </Typography>

        <Box sx={{ flex: 1, overflowY: "auto", minHeight: '300px', mb: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
          ) : (
            <SlotList
              slots={slots}
              appointments={appointments}
              onSelect={(slot) => console.log("slot", slot)}
            />
          )}
        </Box>

        {/* SECCIÓN DE ELIMINACIÓN MASIVA */}
        {date && (
          <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${colors.background}` }}>
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 1 }}>
              ACCIONES DE LIMPIEZA
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteSweepIcon />}
                onClick={handleDeleteDaily}
                fullWidth
              >
                Limpiar Día
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CalendarMonthIcon />}
                onClick={handleDeleteWeekly}
                fullWidth
              >
                Borrar Recurrencia
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}