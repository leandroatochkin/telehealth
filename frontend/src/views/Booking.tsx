import { Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { fetchAvailableSlots, createAppointment, fetchProfessionals } from "../api/appointments.api";
import DateSelector from "../components/DateSelector";
import SlotList from "../components/SlotList";
import { notify } from "../lib/notifications";
import { useNavigate } from "react-router-dom"; // Added for navigation
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Added for the back button

export default function BookingPage() {
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // Hook for back button
  const { slots, loading, professionals } = useAppSelector((state) => state.appointments);
  const { token, user } = useAppSelector((state) => state.auth);
  const { colors, shadows } = useAppSelector((state) => state.theme);


  useEffect(() => {
  if (token) {
    dispatch(fetchProfessionals({ token }));
  }
}, [dispatch, token]);
  console.log(professionals)

  const [date, setDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // In a real app, you'd get this from the URL params or a professional list
  const professionalId = "c38be2c6-9863-49d9-9493-748cbad3b397";
  


  const handleDateChange = (newDate: Date | null, profId: string = selectedProfessionalId) => {
    setDate(newDate);
    if (!newDate || !token || !profId) return;
    dispatch(fetchAvailableSlots({ professionalId: profId, date: newDate.toISOString(), token }));
  };

  const handleProfessionalChange = (e: any) => {
  const newId = e.target.value;
  setSelectedProfessionalId(newId);
  if (date) {
    handleDateChange(date, newId);
  }
};

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !token || !user || !selectedProfessionalId) return;

    const startTime = new Date(selectedSlot);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 min duration

    const result = await dispatch(createAppointment({
      professionalId: selectedProfessionalId,
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
    <Box 
      sx={{ 
        width: "100vw", 
        minHeight: "100dvh", // Changed height to minHeight for mobile scrolling
        backgroundColor: colors.background, 
        display: "flex", 
        flexDirection: { xs: "column", md: "row" }, // Row on Desktop, Column on Mobile
        gap: 3, 
        //p: { xs: 2, md: 3 } // Responsive padding
      }}
    >
      {/* LEFT COLUMN / TOP ON MOBILE: BACK BUTTON & CALENDAR */}
      <Box 
        sx={{ 
          flex: { xs: "none", md: 0.5 }, 
          display: "flex", 
          flexDirection: "column", 
          gap: 2 
        }}
      >
      <Box sx={{ backgroundColor: colors.surface, p: 2, borderRadius: 3, boxShadow: shadows.md }}>
        <FormControl fullWidth size="small">
          <InputLabel id="select-professional-label">Médico / Profesional</InputLabel>
          <Select
            labelId="select-professional-label"
            value={selectedProfessionalId}
            label="Médico / Profesional"
            onChange={handleProfessionalChange}
          >
            {professionals.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} {p.surname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
        {/* BACK TO DASHBOARD BUTTON */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard/patient")}
          sx={{
            alignSelf: "flex-start",
            color: colors.textPrimary,
            textTransform: "none",
            fontWeight: "bold"
          }}
        >
          Volver al Panel
        </Button>

        <Box 
          sx={{ 
            backgroundColor: colors.surface, 
            borderRadius: 3, 
            boxShadow: shadows.lg,
            overflow: "hidden" // Ensures calendar doesn't break border radius
          }}
        >
          <DateSelector value={date} onChange={handleDateChange} />
        </Box>
      </Box>

      {/* RIGHT COLUMN / BOTTOM ON MOBILE: SLOT LIST */}
      <Box 
        sx={{ 
          flex: { xs: "none", md: 0.5 }, 
          backgroundColor: colors.surface, 
          borderRadius: 3, 
          boxShadow: shadows.lg, 
          p: 2,
          minHeight: { xs: "300px", md: "auto" }, // Ensures area is visible on mobile
          maxHeight: { md: "calc(100vh - 48px)" }, // Scrollable slots on desktop
          overflowY: "auto"
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ mb: 2, color: colors.textPrimary, textAlign: "center", fontWeight: "bold" }}
        >
          {date ? `Turnos para el ${date.toLocaleDateString("es-AR")}` : "Seleccione un fecha"}
        </Typography>

        {loading ? (
          <Box sx={{ height: "100%", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <SlotList slots={slots} appointments={[]} onSelect={(slot) => setSelectedSlot(slot)} />
        )}
      </Box>

      {/* CONFIRMATION DIALOG */}
      <Dialog 
        open={Boolean(selectedSlot)} 
        onClose={() => setSelectedSlot(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirmar Turno</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Desea reservar el turno para el día{" "}
            <strong>{selectedSlot && new Date(selectedSlot).toLocaleDateString()}</strong> a las{" "}
            <strong>{selectedSlot && new Date(selectedSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedSlot(null)}>Cancelar</Button>
          <Button onClick={handleConfirmBooking} variant="contained" color="primary">Confirmar Reserva</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}