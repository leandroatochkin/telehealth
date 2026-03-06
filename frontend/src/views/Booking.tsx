import { Box, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { fetchAvailableSlots } from "../api/appointments/appointments.api";
import DateSelector from "../components/DateSelector";
import SlotList from "../components/SlotList";

export default function BookingPage() {
  const dispatch = useAppDispatch();

  const { slots, loading } = useAppSelector(
    (state) => state.appointments
  );

  const { token } = useAppSelector((state) => state.auth);

  const { colors, shadows } = useAppSelector(
    (state) => state.theme
  );

  const [date, setDate] = useState<Date | null>(null);

  const professionalId = "professional-id-placeholder";

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);

    if (!newDate || !token) return;

    dispatch(
      fetchAvailableSlots({
        professionalId,
        date: newDate.toISOString(),
        token,
      })
    );
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100dvh",
        backgroundColor: colors.background,
        display: "flex",
        gap: 3,
      }}
    >
      {/* DATE SELECTOR */}
      <Box
        sx={{
          flex: 0.5,
          backgroundColor: colors.surface,
          borderRadius: 3,
          boxShadow: shadows.lg,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <DateSelector value={date} onChange={handleDateChange} />
      </Box>

      {/* SLOT LIST */}
      <Box
        sx={{
          flex: 0.5,
          backgroundColor: colors.surface,
          borderRadius: 3,
          boxShadow: shadows.lg,
          overflowY: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <SlotList
            slots={slots}
            onSelect={(slot) => console.log("selected", slot)}
          />
        )}
      </Box>
    </Box>
  );
}