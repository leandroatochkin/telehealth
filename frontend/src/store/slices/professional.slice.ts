import { createSlice } from "@reduxjs/toolkit";


interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  start: string;
  end: string;
  callId: string;
}

interface ProfessionalState {
  todayAppointments: Appointment[];
  selectedPatientId: string | null;
  loading: boolean;
}

const initialState: ProfessionalState = {
  todayAppointments: [],
  selectedPatientId: null,
  loading: false,
};

const professionalSlice = createSlice({
  name: "professional",
  initialState,
  reducers: {

    setTodayAppointments(state, action) {
      state.todayAppointments = action.payload;
    },

    setSelectedPatient(state, action) {
      state.selectedPatientId = action.payload;
    },

  },
});

export const {
  setTodayAppointments,
  setSelectedPatient
} = professionalSlice.actions;

export default professionalSlice.reducer;