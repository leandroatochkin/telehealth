import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAvailableSlots,
  fetchPatientAppointments,
  fetchAppointmentsByPatient
} from "../../api/appointments/appointments.api";

type Slot = {
  start: string;
  end: string;
};

type Appointment = {
  id: string;
  startTime: string;
  endTime: string;
  callId: string;
  professionalId: string;
  professional: Professional | null;
  patient: Patient
};

type Patient = {
    username: string;
}

interface AppointmentState {
  slots: Slot[];
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}

type Professional = {
    username: string;
    email: string;
}


const initialState: AppointmentState = {
  slots: [],
  appointments: [],
  loading: false,
  error: null,
};

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      /*
      AVAILABLE SLOTS
      */
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = action.payload.slots;
      })

      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /*
      PATIENT APPOINTMENTS
      */
      .addCase(fetchPatientAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPatientAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data || [];
      })

      .addCase(fetchPatientAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAppointmentsByPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAppointmentsByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data || [];
      })

      .addCase(fetchAppointmentsByPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default appointmentsSlice.reducer;