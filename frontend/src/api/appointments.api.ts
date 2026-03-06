import { createAsyncThunk } from "@reduxjs/toolkit";

// export const fetchProfessionalSlots = createAsyncThunk(
//   "appointments/fetchProfessionalSlots",
//   async ({ date, token }: any) => {
//     const res = await fetch(
//       `/api/appointments/professional-slots?date=${date}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return res.json();
//   }
// );

export const fetchPatientAppointments = createAsyncThunk(
  "appointments/fetchPatientAppointments",
  async ({ token }: any) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/patient`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  }
);

export const fetchAppointmentsByPatient = createAsyncThunk(
  "appointments/fetchAppointmentsByPatient",
  async ({ token, patientId }: any) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/patient?patientId=${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  "appointments/fetchAvailableSlots",
  async (
    {
      professionalId,
      date,
      token,
    }: { professionalId: string; date: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/professionals/${professionalId}/available-slots?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch slots");
      }

      return await res.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAvailability = createAsyncThunk(
  "appointments/createAvailability",
  async ({ date, startTime, endTime, token }: any) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date,
        startTime,
        endTime,
      }),
    });

    return res.json();
  }
);

export const fetchProfessionalAppointmentsByDate = createAsyncThunk(
  "appointments/fetchByDate",
  async ({ professionalId, date, token }: any, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments/professional/${professionalId}?date=${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      return data.data; // Assuming your backend returns { data: [...] }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  "appointments/create",
  async ({ professionalId, startTime, endTime, token }: any, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ professionalId, startTime, endTime }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);