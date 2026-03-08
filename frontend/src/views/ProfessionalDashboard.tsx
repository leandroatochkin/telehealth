import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { useNavigate } from "react-router-dom";
import TodayAppointments from "../components/TodayAppointments";
import ProfessionalAvailabilityPage from "./ProfessionalAvailability";
import PrescriptionModal from "../components/PrescriptionModal";
import PatientHistory from "../components/PatientHistory";
import { logout } from "../store/slices/auth.slice";

export default function ProfessionalDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { colors, shadows } = useAppSelector(state => state.theme);

  const [view, setView] = useState<
    "appointments" | "availability" | "history"
  >("appointments");

  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  const handleLogout = () => {
      dispatch(logout());
      navigate("/auth/login");
    };
  

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

      </Box>

      <PrescriptionModal
        open={prescriptionOpen}
        onClose={() => setPrescriptionOpen(false)}
      />

    </Box>
  );
}