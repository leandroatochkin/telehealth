import { Box, Button, Typography } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { notify } from "../lib/notifications";
import { useEffect } from "react";
import { fetchPatientAppointments } from "../api/appointments.api";

export default function TodayAppointments() {
    const dispatch = useAppDispatch();
  
  const { appointments } = useAppSelector(
    (state) => state.appointments
  );

  const { token } = useAppSelector((state) => state.auth);
  const { colors } =
    useAppSelector((state) => state.theme);

   useEffect(() => {
      if (!token) return;
  
      dispatch(fetchPatientAppointments({ token }));
    }, [token]);

  const handleJoin = (callId: string) => {

    notify("Joining video call...", "info");

    // navigate to video page
    console.log("Join call", callId);
  };

  return (

    <Box>

      <Typography
        variant="h5"
        sx={{ mb: 3 }}
      >
        Today's Appointments
      </Typography>

      {appointments.map((appt) => (

        <Box
          key={appt.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            mb: 2,
            borderRadius: 2,
            backgroundColor: "#fff",
            boxShadow: 1
          }}
        >

          <Box>

            <Typography
            variant="body2"
            sx={{
                color: colors.textSecondary,
            }}
            >
              {appt.patient?.username}
            </Typography>

            <Typography 
            variant="body2"
            sx={{
                color: colors.textSecondary,
            }}
            >
              {appt.startTime} - {appt.endTime}
            </Typography>

          </Box>

          <Button
            variant="contained"
            onClick={() => handleJoin(appt.callId)}
          >
            Unirse a la Videollamada
          </Button>

        </Box>

      ))}

    </Box>
  );
}