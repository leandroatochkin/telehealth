import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { useNavigate } from "react-router-dom";
import TodayAppointments from "../components/TodayAppointments";
import ProfessionalAvailabilityPage from "./ProfessionalAvailability";
import PrescriptionModal from "../components/PrescriptionModal";
import PatientHistory from "../components/PatientHistory";
import ProfessionalChatCenter from "./ChatCenter";
import { logout } from "../store/slices/auth.slice";
import { useCreateChatClient } from "stream-chat-react";
import type { UserResponse } from "@stream-io/video-react-sdk";

export default function ProfessionalDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { colors, shadows } = useAppSelector(state => state.theme);

  const [view, setView] = useState<
    "appointments" | "availability" | "history" | "chat"
  >("appointments");

  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  const handleLogout = () => {
      dispatch(logout());
      navigate("/auth/login");
    }

    const streamToken = useAppSelector((state) => state.auth.streamToken);
    const user = useAppSelector((state) => state.auth.user);
    const apiKey = import.meta.env.VITE_STREAM_API_KEY;

      const chatClient = useCreateChatClient({
        apiKey,
        tokenOrProvider: streamToken as string,
        userData: {
          id: user?.id ?? "",
          name: user?.name ?? "",
        } as UserResponse,
      });
  
  

  return (

    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: colors.background
      }}
    >

      {/* SIDEBAR */}

      <Box
        sx={{
          width: 280,
          backgroundColor: colors.surface,
          boxShadow: shadows.md,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >

        <Typography 
        variant="h6"
        sx={{
          color: colors.textPrimary
        }}
        >
          Panel del Profesional
        </Typography>

        <Button onClick={() => setView("appointments")}>
          Turnos de Hoy
        </Button>

        <Button onClick={() => setView("availability")}>
          Establecer Disponibilidad
        </Button>

        <Button onClick={() => setPrescriptionOpen(true)}>
          Receta Digital
        </Button>

        <Button onClick={() => setView("history")}>
          Historial de Pacientes
        </Button>

        <Button onClick={() => setView("chat")}>
          Mensajería y Soporte
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleLogout}
          sx={{
            borderColor: colors.danger,
            color: colors.danger,
          }}
        >
          Salir
        </Button>

      </Box>

      {/* CONTENT */}

      <Box
        sx={{
          flex: 1,
          p: 4
        }}
      >

        {view === "appointments" && <TodayAppointments />}

        {view === "availability" && <ProfessionalAvailabilityPage />}

        {view === "history" && <PatientHistory />}

        {view === "chat" && (
            <ProfessionalChatCenter 
              chatClient={chatClient} // Asegúrate de pasar el cliente inicializado
              user={user} 
            />
          )}

      </Box>

      <PrescriptionModal
        open={prescriptionOpen}
        onClose={() => setPrescriptionOpen(false)}
      />

    </Box>
  );
}