export interface CreateAppointmentBody {
  professionalId: string;
  patientId: string;
  startTime: string;
  endTime: string;
}

export interface AppointmentParams {
  id: string;
}