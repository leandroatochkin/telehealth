import { createSlice } from "@reduxjs/toolkit";
import {
  createPrescription,
  fetchDoctorPrescriptions,
  fetchPatientPrescriptions,
  identifyPatient
} from "../../api/prescriptions.api";

interface Patient {
  dni: string;
  name: string;
  surname: string;
}

interface PrescriptionItem {
  drugName: string;
  genericName?: string;
  concentration?: string;
  form?: string;
  presentation?: string;
  quantity: number;
}


interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  items: PrescriptionItem[];
  createdAt: string;
}

interface PrescriptionDTO {
  success: string;
  prescriptions: Prescription[];
}


interface PrescriptionState {
  prescriptions: PrescriptionDTO | null;
  loading: boolean;
  error: string | null;
  patient: Patient | null;
}

const initialState: PrescriptionState = {
  prescriptions: null,
  loading: false,
  error: null,
  patient: null
};

const prescriptionsSlice = createSlice({
  name: "prescriptions",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    builder

      // CREATE
      .addCase(createPrescription.pending, (state) => {
        state.loading = true;
      })

      .addCase(createPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions?.prescriptions.unshift(action.payload);
      })

      .addCase(createPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // PATIENT
      .addCase(fetchPatientPrescriptions.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchPatientPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })

      .addCase(fetchPatientPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // DOCTOR
      .addCase(fetchDoctorPrescriptions.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchDoctorPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })

      .addCase(fetchDoctorPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

            .addCase(identifyPatient.pending, (state) => {
        state.loading = true;
        state.patient = null;
      })
      .addCase(identifyPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patient = action.payload;
      })
      .addCase(identifyPatient.rejected, (state) => {
        state.loading = false;
      })
  }
});

export default prescriptionsSlice.reducer;