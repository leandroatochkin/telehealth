import { 
  Box, CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, Typography, FormControl, InputLabel, 
  Select, MenuItem, Stack 
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { fetchAvailableSlots, createAppointment, fetchProfessionals } from "../api/appointments.api";
import DateSelector from "../components/DateSelector";
import SlotList from "../components/SlotList";
import { notify } from "../lib/notifications";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatIcon from '@mui/icons-material/Chat'; // Icono para el chat
import PatientChatModal from "../components/AdminChatModal"; // Modal de chat para pacientes
import { useCreateChatClient } from "stream-chat-react";
import type { UserResponse } from "@stream-io/video-react-sdk";

export default function BookingPage() {
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState(false); // Estado para abrir el chat
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { slots, loading, professionals } = useAppSelector((state) => state.appointments);
  const { token, user } = useAppSelector((state) => state.auth); // Asumo que chatClient está en auth
  const { colors, shadows } = useAppSelector((state) => state.theme);


      const streamToken = useAppSelector((state) => state.auth.streamToken);
      const apiKey = import.meta.env.VITE_STREAM_API_KEY;
  
        const chatClient = useCreateChatClient({
          apiKey,
          tokenOrProvider: streamToken as string,
          userData: {
            id: user?.id ?? "",
            name: user?.name ?? "",
          } as UserResponse,
        });

  useEffect(() => {
    if (token) {
      dispatch(fetchProfessionals(token));
    }
  }, [dispatch, token]);

  const [date, setDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

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
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
                                         
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
      if (date) handleDateChange(date);
    } else {
      notify(result.payload as string || "Error al reservar", "error");
    }
  };

  return (
    <Box sx={{ width: "100vw", minHeight: "100dvh", backgroundColor: colors.background, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
      
      {/* COLUMNA IZQUIERDA: SELECTOR Y CALENDARIO */}
      <Box sx={{ flex: { xs: "none", md: 0.5 }, display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
        
        <Box sx={{ backgroundColor: colors.surface, p: 2, borderRadius: 3, boxShadow: shadows.md }}>
          <Stack spacing={2}>
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

            {/* BOTÓN DE CHAT CONTEXTUAL: Solo aparece si hay un profesional seleccionado */}
            {selectedProfessionalId && (
              <Button
                variant="outlined"
                startIcon={<ChatIcon />}
                onClick={() => setIsChatOpen(true)}
                sx={{ 
                  textTransform: "none", 
                  borderColor: colors.primary, 
                  color: colors.primary,
                  "&:hover": { borderWidth: 2 } 
                }}
              >
                Consultar por Chat
              </Button>
            )}
          </Stack>
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard/patient")}
          sx={{ alignSelf: "flex-start", color: colors.textPrimary, textTransform: "none", fontWeight: "bold" }}
        >
          Volver al Panel
        </Button>

        <Box sx={{ backgroundColor: colors.surface, borderRadius: 3, boxShadow: shadows.lg, overflow: "hidden" }}>
          <DateSelector value={date} onChange={handleDateChange} />
        </Box>
      </Box>

      {/* COLUMNA DERECHA: SLOTS */}
      <Box sx={{ flex: { xs: "none", md: 0.5 }, backgroundColor: colors.surface, borderRadius: 3, boxShadow: shadows.lg, p: 2, overflowY: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary, textAlign: "center", fontWeight: "bold" }}>
          {date ? `Turnos para el ${date.toLocaleDateString("es-AR")}` : "Seleccione un fecha"}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>
        ) : (
          <SlotList slots={slots} appointments={[]} onSelect={(slot) => setSelectedSlot(slot)} />
        )}
      </Box>

      {/* MODAL DE CONFIRMACIÓN DE TURNO */}
      <Dialog open={Boolean(selectedSlot)} onClose={() => setSelectedSlot(null)} fullWidth maxWidth="xs">
        <DialogTitle>Confirmar Turno</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Desea reservar el turno para el día <strong>{selectedSlot && new Date(selectedSlot).toLocaleDateString()}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedSlot(null)}>Cancelar</Button>
          <Button onClick={handleConfirmBooking} variant="contained" color="primary">Confirmar Reserva</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE CHAT PARA EL PACIENTE */}
      <PatientChatModal 
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatClient={chatClient} // Asegúrate de que esto venga de tu store
        user={user} 
        professionalId={selectedProfessionalId} // Se conecta al médico elegido arriba
      />

    </Box>
  );
}