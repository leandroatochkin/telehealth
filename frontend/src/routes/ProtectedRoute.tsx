import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../lib/hooks";

export default function ProtectedRoute() {
  const token = useAppSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}