import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { useNavigate } from "react-router-dom";
import { useCreateChatClient } from "stream-chat-react";
import { fetchPatientAppointments } from "../api/appointments.api";
import AdminChatModal from "../components/AdminChatModal";
import type { UserResponse } from "@stream-io/video-react-sdk";
import { notify } from "../lib/notifications";
import { fetchPatientPrescriptions } from "../api/prescriptions.api";
import { logout } from "../store/slices/auth.slice";

export default function PatientDashboardPage() {
  const [supportOpen, setSupportOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(new Date());  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { token } = useAppSelector((state) => state.auth);

  const { appointments, loading } = useAppSelector(
    (state) => state.appointments
  );

  // Update time every minute to keep the "5-minute check" accurate
    useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
    }, []);

  const { colors, shadows, fontWeights } =
    useAppSelector((state) => state.theme);

  const { prescriptions, loading: prescriptionsLoading } = useAppSelector(
    (state) => state.prescriptions
  );
  console.log("Prescriptions in Dashboard:", prescriptions); // Debug log to check prescription data
  const user = useAppSelector((state) => state.auth.user);
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
      if (!token) return;

      dispatch(fetchPatientAppointments({ token }));
      dispatch(fetchPatientPrescriptions({ token }));

    }, [token]);

  const upcoming = appointments?.[0];

  const handleJoinCall = (appointment: any) => {
  const startTime = new Date(appointment.startTime).getTime();
  const now = currentTime.getTime();
  
  // 5 minutes in milliseconds
  const fiveMinutes = 5 * 60 * 1000;

  if (now < startTime - fiveMinutes) {
    notify(
      "You can only join the call 5 minutes before the scheduled time.", 
      "warning"
    );
    return;
  }

  navigate(`/call/${appointment.callId || appointment.id}`);
};

const handleDownloadPrescription = async (id: string) => {
  try {

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/prescriptions/${id}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      notify("Prescription expired or unavailable", "error");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `prescription-${id}.pdf`;
    document.body.appendChild(a)
    a.click();
    a.remove()

  } catch (err) {
    notify("Failed to download prescription", "error");
  }
};

const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        backgroundColor: colors.background,
      }}
    >

       {
        supportOpen && (
            <AdminChatModal
                open={supportOpen}
                onClose={() => setSupportOpen(false)}
                chatClient={chatClient}
                userId={user.id}
            />
        )
       }
    
      {/* SIDEBAR */}
      <Box
        sx={{
          width: 280,
          backgroundColor: colors.surface,
          boxShadow: shadows.md,
          padding: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: fontWeights.semibold,
            color: colors.textPrimary,
            mb: 2,
          }}
        >
          Panel del Paciente
        </Typography>

        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate("/booking")}
          sx={{
            backgroundColor: colors.primary,
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Agendar un turno
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => setSupportOpen(true)}
          sx={{
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Chat
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

      {/* MAIN CONTENT */}
      <Box
        sx={{
          flex: 1,
          padding: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: fontWeights.semibold,
            color: colors.textPrimary,
          }}
        >
          Bienvenido, {user?.name}
        </Typography>

        {/* UPCOMING APPOINTMENT */}
        <Box
          sx={{
            backgroundColor: colors.surface,
            borderRadius: 3,
            boxShadow: shadows.lg,
            padding: 4,
          }}
        >
          <Typography
            sx={{
              fontWeight: fontWeights.semibold,
              color: colors.textPrimary,
              mb: 2,
            }}
          >
            Próximo Turno
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : upcoming ? (
            <Box>
              <Typography
                sx={{
                    color: colors.textSecondary,
                }}
              >
                Profesional: {upcoming.professional?.username}
              </Typography>
              <Typography
                sx={{
                    color: colors.textSecondary,
                }}
              >
                Date: {new Date(upcoming.startTime).toLocaleDateString()}
              </Typography>

              <Typography 
                    sx={{
                         mb: 2,
                         color: colors.textSecondary,
                         }}>
                Hora: {new Date(upcoming.startTime).toLocaleTimeString()}
              </Typography>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: colors.primary,
                  textTransform: "none",
                }}
                onClick={() => handleJoinCall(upcoming)}
              >
                Unirse a la Llamada de Video
              </Button>
            </Box>
          ) : (
            <Typography
            sx={{
                  backgroundColor: colors.primary,
                }}
            >
              No tiene turnos próximos. Agende uno para ver los detalles aquí.
            </Typography>
          )}
        </Box>

        {/* FUTURE: APPOINTMENT HISTORY */}
        <Box
          sx={{
            backgroundColor: colors.surface,
            borderRadius: 3,
            boxShadow: shadows.lg,
            padding: 4,
          }}
        >
          <Typography
            sx={{
              fontWeight: fontWeights.semibold,
              color: colors.textPrimary,
              mb: 2,
            }}
          >
            Appointment History
          </Typography>

          <Typography color="text.secondary">
            History will appear here.
          </Typography>
        </Box>

        {/* FUTURE: PRESCRIPTIONS */}
        {/* PRESCRIPTIONS */}
<Box
  sx={{
    backgroundColor: colors.surface,
    borderRadius: 3,
    boxShadow: shadows.lg,
    padding: 4,
  }}
>
  <Typography
    sx={{
      fontWeight: fontWeights.semibold,
      color: colors.textPrimary,
      mb: 2,
    }}
  >
    Recetas
  </Typography>

  {prescriptionsLoading ? (
    <CircularProgress />
  ) : prescriptions?.prescriptions.length === 0 ? (
    <Typography color="text.secondary">
      No tiene recetas disponibles.
    </Typography>
  ) : (
    Array.isArray(prescriptions?.prescriptions) && prescriptions.prescriptions.map((p: any) => {
      console.log("Prescription item:", p); // Debug log to check prescription data structure
      const age =
        (Date.now() - new Date(p.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);

      const expired = age > 30;

      return (
        <Box
          key={p.id}
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>
            Profesional: {p.doctorNameSnapshot}
          </Typography>

          <Typography color="text.secondary">
            Fecha: {new Date(p.createdAt).toLocaleDateString()}
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 1 }}>
            Medicamentos: {p.items.length}
          </Typography>

          <Button
            variant="contained"
            size="small"
            disabled={expired}
            onClick={() => handleDownloadPrescription(p.id)}
          >
            {expired ? "Expired" : "Download PDF"}
          </Button>
        </Box>
      );
    })
  )}
</Box>
      </Box>
    </Box>
  );
}