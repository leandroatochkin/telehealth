import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../views/Login";
import SignupPage from "../views/SignUp";
import VerifyPage from "../views/Verify";
import DashboardPage from "../views/Dashboard";
import VideoStream from "../views/Video";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import PatientRoute from "./PatientRoutes";
import ProfessionalRoute from "./ProfessionalRoutes";
import BookingPage from "../views/Booking";
import ProfessionalDashboard from "../views/ProfessionalDashboard";
import PatientDashboardPage from "../views/PatientDashboard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route element={<PublicRoute />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/verify" element={<VerifyPage />} />
        </Route>

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/video" element={<VideoStream />} />
        </Route>

        <Route element={<PatientRoute />}>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/dashboard/patient" element={<PatientDashboardPage />} />
        </Route>

        <Route element={<ProfessionalRoute />}>
          <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
        </Route>

        {/* DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* 404 */}
        <Route path="*" element={<h1>404 Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}