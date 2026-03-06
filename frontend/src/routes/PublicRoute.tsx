import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../lib/hooks";

export default function PublicRoute() {
  const token = useAppSelector((state) => state.auth.token);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}