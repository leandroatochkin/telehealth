// components/SlotList.tsx
import { Box, Button, Typography, Paper } from "@mui/material";

type Props = {
  slots: string[];
  appointments?: any[]; // The list of booked appointments
  onSelect: (slot: string) => void;
};

export default function SlotList({ slots, appointments, onSelect }: Props) {
  const hasContent = (appointments && appointments.length > 0) || slots.length > 0;

  if (!hasContent) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 2 }}>
        <Typography variant="body2" color="textSecondary">
          No hay turnos configurados para esta fecha.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* OCUPADOS */}
      {appointments && appointments.length > 0 && (
        <Box>
          <Typography variant="caption" sx={{ color: "error.main", fontWeight: "bold", letterSpacing: 1 }}>
            CITAS PROGRAMADAS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {appointments.map((app) => (
              <Paper
                key={app.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  backgroundColor: "#fff1f0",
                  border: "1px solid #ffa39e",
                  borderRadius: 2,
                  minWidth: "140px",
                }}
              >
                <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>
                  {new Date(app.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {app.patient?.username || "Paciente"}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* DISPONIBLES */}
      <Box>
        <Typography variant="caption" sx={{ color: "success.main", fontWeight: "bold", letterSpacing: 1 }}>
          TURNOS LIBRES
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {slots.map((slot) => (
            <Button
              key={slot}
              variant="outlined"
              color="success"
              onClick={() => onSelect(slot)}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                minWidth: '80px',
                '&:hover': { backgroundColor: '#f6ffed' }
              }}
            >
              {new Date(slot).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}