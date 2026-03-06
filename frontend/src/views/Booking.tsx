import { Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { fetchAvailableSlots, createAppointment } from "../api/appointments.api";
import DateSelector from "../components/DateSelector";
import SlotList from "../components/SlotList";
import { notify } from "../lib/notifications";

export default function BookingPage() {
  const dispatch = useAppDispatch();
  const { slots, loading } = useAppSelector((state) => state.appointments);
  const { token, user } = useAppSelector((state) => state.auth);
  const { colors, shadows } = useAppSelector((state) => state.theme);

  const [date, setDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // In a real app, you'd get this from the URL params or a professional list
  const professionalId = "c38be2c6-9863-49d9-9493-748cbad3b397"; 

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
    if (!newDate || !token) return;
    dispatch(fetchAvailableSlots({ professionalId, date: newDate.toISOString(), token }));
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !token || !user) return;

    const startTime = new Date(selectedSlot);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 min duration

    const result = await dispatch(createAppointment({
      professionalId,
      patientId: user.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      token
    }));

    if (createAppointment.fulfilled.match(result)) {
      notify("Turno reservado con éxito", "success");
      setSelectedSlot(null);
      // Refresh slots for that day
      if (date) handleDateChange(date);
    } else {
      notify(result.payload as string || "Error al reservar", "error");
    }
  };

  return (
    <Box sx={{ width: "100vw", height: "100dvh", backgroundColor: colors.background, display: "flex", gap: 3, p: 3 }}>
      <Box sx={{ flex: 0.5, backgroundColor: colors.surface, borderRadius: 3, boxShadow: shadows.lg }}>
        <DateSelector value={date} onChange={handleDateChange} />
      </Box>

      <Box sx={{ flex: 0.5, backgroundColor: colors.surface, borderRadius: 3, boxShadow: shadows.lg, p: 2 }}>
        {loading ? (
          <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><CircularProgress /></Box>
        ) : (
          <SlotList slots={slots} appointments={[]} onSelect={(slot) => setSelectedSlot(slot)} />
        )}
      </Box>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={Boolean(selectedSlot)} onClose={() => setSelectedSlot(null)}>
        <DialogTitle>Confirmar Turno</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Desea reservar el turno para el día{" "}
            <strong>{selectedSlot && new Date(selectedSlot).toLocaleDateString()}</strong> a las{" "}
            <strong>{selectedSlot && new Date(selectedSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSlot(null)}>Cancelar</Button>
          <Button onClick={handleConfirmBooking} variant="contained" color="primary">Confirmar Reserva</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}