import {
  Container,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { useAppSelector } from "../lib/hooks";
import { useNavigate } from "react-router-dom";
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

export default function HomePage() {
  const navigate = useNavigate();
  
  // Obtenemos el tema desde tu slice de Redux para mantener consistencia visual
  const { colors, shadows, fontWeights } = useAppSelector(
    (state) => state.theme
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: "center",
            padding: { xs: 3, md: 6 },
            backgroundColor: colors.surface,
            borderRadius: 4,
            boxShadow: shadows.lg,
          }}
        >
          {/* Logo o Icono Tematizado */}
          <Box
            sx={{
              display: "inline-flex",
              p: 2,
              borderRadius: "50%",
              backgroundColor: `${colors.primary}15`, // Color primario con 15% opacidad
              mb: 3,
            }}
          >
            <MedicalServicesIcon sx={{ fontSize: 60, color: colors.primary }} />
            
          </Box>
          <Typography
          variant="h3"
            component="h1"
            sx={{
              fontWeight: fontWeights.bold,
              color: colors.textPrimary,
              fontSize: { xs: "2rem", md: "3.5rem" },
              mb: 2,
              lineHeight: 1.2,
            }}
          >
                {import.meta.env.VITE_COMPANY_NAME}
            </Typography>

          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: fontWeights.bold,
              color: colors.textPrimary,
              fontSize: { xs: "2rem", md: "3.5rem" },
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            Tu Salud, <br />
            <span style={{ color: colors.primary }}>A un click de distancia</span>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: colors.textSecondary,
              fontSize: { xs: "1rem", md: "1.2rem" },
              mb: 5,
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Conecta con los mejores profesionales desde la comodidad de tu hogar. 
            Consultas seguras, rápidas y totalmente digitales.
          </Typography>

          {/* Botones Adaptables (Mobile-First) */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{ width: "100%", maxWidth: "400px", mx: "auto" }}
          >
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate("/auth/login")}
              sx={{
                backgroundColor: colors.primary,
                fontWeight: fontWeights.semibold,
                textTransform: "none",
                borderRadius: 2.5,
                py: 1.5,
                boxShadow: shadows.md,
                "&:hover": {
                  backgroundColor: colors.accent,
                },
              }}
            >
              Iniciar Sesión
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate("/auth/signup")}
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                fontWeight: fontWeights.semibold,
                textTransform: "none",
                borderRadius: 2.5,
                py: 1.5,
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  backgroundColor: `${colors.primary}05`,
                },
              }}
            >
              Crear Cuenta
            </Button>
          </Stack>

          <Box mt={6}>
            <Typography
              variant="caption"
              sx={{ color: colors.textSecondary, fontStyle: "italic" }}
            >
              Únase a más de 10,000 pacientes que ya confían en nosotros.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}