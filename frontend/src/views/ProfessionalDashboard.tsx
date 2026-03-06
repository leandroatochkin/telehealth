import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useAppSelector } from "../lib/hooks";

import TodayAppointments from "../components/TodayAppointments";
import ProfessionalAvailabilityPage from "./ProfessionalAvailability";
import PrescriptionModal from "../components/PrescriprionModal";
import PatientHistory from "../components/PatientHistory";

export default function ProfessionalDashboard() {

  const { colors, shadows } = useAppSelector(state => state.theme);

  const [view, setView] = useState<
    "appointments" | "availability" | "history"
  >("appointments");

  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

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

        <Typography variant="h6">
          Professional Panel
        </Typography>

        <Button onClick={() => setView("appointments")}>
          Today Appointments
        </Button>

        <Button onClick={() => setView("availability")}>
          Set Availability
        </Button>

        <Button onClick={() => setPrescriptionOpen(true)}>
          Digital Prescription
        </Button>

        <Button onClick={() => setView("history")}>
          Patient History
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