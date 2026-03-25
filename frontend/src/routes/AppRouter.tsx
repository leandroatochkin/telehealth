import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../views/Login";
import SignupPage from "../views/SignUp";
import VerifyPage from "../views/Verify";
import VideoStream from "../views/Video";
import ProtectedRoute from "./ProtectedRoute";
import PatientRoute from "./PatientRoutes";
import ProfessionalRoute from "./ProfessionalRoutes";
import AdminRoute from "./AdminRoute";
import BookingPage from "../views/Booking";
import ProfessionalDashboard from "../views/ProfessionalDashboard";
import PatientDashboardPage from "../views/PatientDashboard";
import ForgotPasswordPage from "../views/ForgotPassword";
import HomePage from "../views/Home";
import AdminDashboard from "../views/AdminDashboard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
      
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/verify" element={<VerifyPage />} />
        

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
          <Route path="/video/:id" element={<VideoStream />} />
        </Route>

        <Route element={<PatientRoute />}>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/dashboard/patient" element={<PatientDashboardPage />} />
        </Route>

        <Route element={<ProfessionalRoute />}>
          <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Route>

        {/* DEFAULT ROUTE */}
        {/* <Route path="/" element={<Navigate to="/dashboard" />} /> */}

        {/* 404 */}
        <Route path="*" element={<h1>404 Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}