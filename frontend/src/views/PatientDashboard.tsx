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
import { fetchPatientAppointments } from "../api/appointments/appointments.api";
import AdminChatModal from "../components/AdminChatModal";
import type { UserResponse } from "@stream-io/video-react-sdk";
import { notify } from "../lib/notifications";

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
          Patient Panel
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
          Book Appointment
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
          Dashboard
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
            Upcoming Appointment
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
                Professional: {upcoming.professional?.username}
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
                Time: {new Date(upcoming.startTime).toLocaleTimeString()}
              </Typography>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: colors.primary,
                  textTransform: "none",
                }}
                onClick={() => handleJoinCall(upcoming)}
              >
                Join Video Call
              </Button>
            </Box>
          ) : (
            <Typography
            sx={{
                  backgroundColor: colors.primary,
                }}
            >No upcoming appointments</Typography>
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
      </Box>
    </Box>
  );
}