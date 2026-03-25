import { Box, Button, Typography, Divider } from "@mui/material";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/auth.slice";
import AdminInfrastructure from "../components/AdminInfrastructure";
import ChatAudit from "../components/ChatAudit";
import AdminUserManagement from "../components/UserManagement";
import AnalyticsDashboard from "../components/AnalytiticsDashboard";

// Componentes que vamos a crear

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { colors, shadows } = useAppSelector(state => state.theme);

  const [view, setView] = useState<
    "stats" | "users" | "chats" | "infrastructure"
  >("stats");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: colors.background,
      }}
    >
      {/* SIDEBAR */}
      <Box
        sx={{
          width: 280,
          backgroundColor: colors.surface,
          boxShadow: shadows.md,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: colors.textPrimary, mb: 2, fontWeight: 'bold' }}>
          Panel de Control Admin
        </Typography>

        <Button 
          variant={view === "stats" ? "contained" : "text"} 
          onClick={() => setView("stats")}
          sx={{ justifyContent: 'flex-start' }}
        >
          Estadísticas Globales
        </Button>

        <Button 
          variant={view === "users" ? "contained" : "text"} 
          onClick={() => setView("users")}
          sx={{ justifyContent: 'flex-start' }}
        >
          Gestión de Usuarios
        </Button>

        <Button 
          variant={view === "chats" ? "contained" : "text"} 
          onClick={() => setView("chats")}
          sx={{ justifyContent: 'flex-start' }}
        >
          Auditoría de Chats
        </Button>

        <Button 
          variant={view === "infrastructure" ? "contained" : "text"} 
          onClick={() => setView("infrastructure")}
          sx={{ justifyContent: 'flex-start' }}
        >
          Infraestructura y APIs
        </Button>

        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ mb: 2 }} />
          <Button
            fullWidth
            variant="outlined"
            onClick={handleLogout}
            sx={{
              borderColor: colors.danger,
              color: colors.danger,
              '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.04)', borderColor: colors.danger }
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Box>

      {/* CONTENT AREA */}
      <Box
        sx={{
          flex: 1,
          p: 4,
          overflowY: "auto", // Importante para que el contenido scrollee si es largo
        }}
      >
        {view === "stats" && <AnalyticsDashboard />}
        {view === "users" && <AdminUserManagement />}
        {view === "chats" && <ChatAudit />} 
        {view === "infrastructure" && <AdminInfrastructure />} 
      </Box>
    </Box>
  );
}