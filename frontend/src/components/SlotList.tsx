// components/SlotList.tsx
import { Box, Button, Typography, Paper } from "@mui/material";

type Props = {
  slots: string[];
  appointments?: any[]; // The list of booked appointments
  onSelect: (slot: string) => void;
};

export default function SlotList({ slots, appointments, onSelect }: Props) {
  // Helper to find if an appointment exists for a specific slot time
  // const getAppointmentForSlot = (slotTime: string) => {
  //   return appointments.find((app) => new Date(app.startTime).toISOString() === slotTime);
  // };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* RENDER BOOKED SLOTS FIRST */}
      {appointments &&appointments.length > 0 && (
        <Box>
          <Typography variant="caption" sx={{ color: "error.main", fontWeight: "bold" }}>
            OCUPADOS (PACIENTES)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {appointments.map((app) => (
              <Paper
                key={app.id + Math.random()} // Use a unique key for each appointment
                sx={{
                  p: 1,
                  backgroundColor: "#ffebee",
                  border: "1px solid #ffcdd2",
                  minWidth: "120px",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {new Date(app.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Typography>
                <Typography variant="caption">{app.patient?.username || "Paciente"}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* RENDER AVAILABLE SLOTS */}
      <Box>
        <Typography variant="caption" sx={{ color: "success.main", fontWeight: "bold" }}>
          DISPONIBLES
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {slots.map((slot) => (
            <Button
              key={slot + Math.random()} // Use a unique key for each slot
              variant="outlined"
              color="success"
              onClick={() => onSelect(slot)}
            >
              {new Date(slot).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}