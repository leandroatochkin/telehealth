import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Drawer
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

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
  const [currentTime, setCurrentTime] = useState<Date>(new Date());  
  const [mobileOpen, setMobileOpen] = useState<boolean>(false); // Mobile sidebar state

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
  console.log("User in Dashboard:", user); // Debug log to check user data
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
      "Solo puedes unirte a la llamada 5 minutos antes de que comience. Por favor, regresa más tarde.", 
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
        notify("Receta expirada o no disponible", "error");
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
      notify("Error al descargar la receta", "error");
    }
  };

const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Reusable Sidebar content
  const sidebarContent = (
    <>
      {/* CLOSE BUTTON FOR MOBILE */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end', mb: 1 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon sx={{ color: colors.textPrimary }} />
        </IconButton>
      </Box>

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
        onClick={() => { navigate("/booking"); setMobileOpen(false); }}
        sx={{
          backgroundColor: colors.primary,
          textTransform: "none",
          borderRadius: 2,
          mb: 2
        }}
      >
        Agendar un turno
      </Button>

      <Button
        fullWidth
        variant="outlined"
        onClick={() => { setSupportOpen(true); setMobileOpen(false); }}
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
          mt: 'auto', // Pushes logout to the bottom
          mb: 2
        }}
      >
        Salir
      </Button>
    </>
  );

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100dvh", // Use minHeight for scrolling
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // Stack on mobile
        backgroundColor: colors.background,
      }}
    >
      {supportOpen && (
        <AdminChatModal
          open={supportOpen}
          onClose={() => setSupportOpen(false)}
          chatClient={chatClient}
          userId={user.id}
        />
      )}

      {/* MOBILE HEADER (Only visible on small screens) */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          padding: 2,
          backgroundColor: colors.surface,
          boxShadow: shadows.sm,
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <IconButton onClick={handleDrawerToggle} sx={{ color: colors.textPrimary }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2, color: colors.textPrimary }}>
          Panel del Paciente
        </Typography>
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 280, backgroundColor: colors.surface, paddingRight: 3, paddingLeft: 3, boxShadow: shadows.md },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* DESKTOP SIDEBAR */}
      <Box
        sx={{
          width: 280,
          backgroundColor: colors.surface,
          boxShadow: shadows.md,
          padding: 3,
          display: { xs: "none", md: "flex" }, // Hide on mobile
          flexDirection: "column",
          gap: 2,
          //height: "100vh",
          position: "sticky",
          top: 0,
        }}
      >
        {sidebarContent}
      </Box>

      {/* MAIN CONTENT */}
      <Box
        sx={{
          flex: 1,
          padding: { xs: 2, md: 4 }, // Adaptive padding
          display: "flex",
          flexDirection: "column",
          gap: 3,
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: fontWeights.semibold,
            color: colors.textPrimary,
          }}
        >
          Bienvenido, {user?.name + " " + user?.surname || "Paciente"}!
        </Typography>

        {/* UPCOMING APPOINTMENT */}
        <Box
          sx={{
            backgroundColor: colors.surface,
            borderRadius: 3,
            boxShadow: shadows.lg,
            padding: { xs: 3, md: 4 },
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
              <Typography sx={{ color: colors.textSecondary }}>
                Profesional: {upcoming.professional?.username}
              </Typography>
              <Typography sx={{ color: colors.textSecondary }}>
                Date: {new Date(upcoming.startTime).toLocaleDateString()}
              </Typography>
              <Typography
                sx={{
                  mb: 2,
                  color: colors.textSecondary,
                }}
              >
                Hora: {new Date(upcoming.startTime).toLocaleTimeString()}
              </Typography>

              <Button
                variant="contained"
                fullWidth={window.innerWidth < 900} // Dynamic full width
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
                p: 2,
                borderRadius: 1,
                color: "#fff",
                backgroundColor: colors.primary,
              }}
            >
              No tiene turnos próximos. Agende uno para ver los detalles aquí.
            </Typography>
          )}
        </Box>

        {/* APPOINTMENT HISTORY */}
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
            Historial de turnos
          </Typography>
          {/* <Typography color="text.secondary">History will appear here.</Typography> */}
        </Box>

        {/* PRESCRIPTIONS */}
        <Box
          sx={{
            backgroundColor: colors.surface,
            borderRadius: 3,
            boxShadow: shadows.lg,
            padding: 4,
            maxHeight: "325px",
            overflowY: "scroll",
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
            <Typography color="text.secondary">No tiene recetas disponibles.</Typography>
          ) : (
            Array.isArray(prescriptions?.prescriptions) &&
            prescriptions.prescriptions.map((p: any) => {
              console.log("Prescription item:", p);
              const age = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
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
                  <Typography sx={{ fontWeight: 600, color: colors.textPrimary }}>
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
                    fullWidth={window.innerWidth < 600}
                    disabled={expired}
                    onClick={() => handleDownloadPrescription(p.id)}
                  >
                    {expired ? "Vencida" : "Descargar Receta"}
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