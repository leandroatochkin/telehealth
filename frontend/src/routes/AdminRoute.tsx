import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../lib/hooks";

export default function AdminRoute() {
  const token = useAppSelector((state) => state.auth.token);
  const userRole = useAppSelector((state) => state.auth.user?.role);

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (userRole !== "ADMIN") {
    return <Navigate to="/dashboard/patient" replace />;
  }

  return <Outlet />;
}