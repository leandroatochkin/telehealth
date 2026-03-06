import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";

import DateSelector from "../components/DateSelector";
import SlotList from "../components/SlotList";

import {
  createAvailability,
  fetchAvailableSlots,
  fetchProfessionalAppointmentsByDate,
} from "../api/appointments.api";

export default function ProfessionalAvailabilityPage() {
  const dispatch = useAppDispatch();

  const { token } = useAppSelector((state) => state.auth);

  const user = useAppSelector((state) => state.auth.user);

  const { slots, appointments, loading } = useAppSelector(
    (state) => state.appointments
  );

  console.log("Slots in Availability Page:", slots); // Debug log to check slot data

  const { colors, shadows, fontWeights } =
    useAppSelector((state) => state.theme);

  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");

  const handleDateChange = (newDate: Date | null) => {
  setDate(newDate);
  if (!newDate || !token) return;

  const dateIso = newDate.toISOString();

  // 1. Fetch the empty/available slots
  dispatch(fetchAvailableSlots({ professionalId: user?.id ?? "", date: dateIso, token }));

  // 2. Fetch the booked appointments
  dispatch(fetchProfessionalAppointmentsByDate({ professionalId: user?.id ?? "", date: dateIso, token }));
};

  const handleCreateSlots = () => {
    if (!date || !token) return;

    dispatch(
      createAvailability({
        date: date.toISOString(),
        startTime,
        endTime,
        token,
      })
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        backgroundColor: colors.background,
      }}
    >
      {/* CALENDAR */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: 3,
          boxShadow: shadows.lg,
          padding: 3,
        }}
      >
        <Typography
          sx={{
            fontWeight: fontWeights.semibold,
            mb: 2,
            color: colors.textPrimary,
          }}
        >
          Seleccione el día
        </Typography>

        <DateSelector value={date} onChange={handleDateChange} />
      </Box>

      {/* SLOT EDITOR */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: 3,
          boxShadow: shadows.lg,
          padding: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          sx={{
            fontWeight: fontWeights.semibold,
            mb: 3,
            color: colors.textPrimary,
          }}
        >
          Crear Rango de Turnos
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
          }}
        >
          <TextField
            type="time"
            label="Comienza"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
          />

          <TextField
            type="time"
            label="Finaliza "
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            fullWidth
          />
        </Box>

        <Button
          variant="contained"
          onClick={handleCreateSlots}
          sx={{
            backgroundColor: colors.primary,
            fontWeight: fontWeights.medium,
            textTransform: "none",
            borderRadius: 2,
            mb: 4,
          }}
        >
          Generar Turnos de 30min
        </Button>

        <Typography
          sx={{
            fontWeight: fontWeights.semibold,
            mb: 2,
            color: colors.textPrimary,
          }}
        >
          Turnos Disponibles  
        </Typography>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : (
            <SlotList
              slots={slots}
              appointments={appointments}
              onSelect={(slot) => console.log("slot", slot)}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}