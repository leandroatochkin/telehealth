import React, { useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { forgotPassword, resetPassword } from "../api/auth.api";
import { useNavigate, Link } from "react-router-dom";
import { clearError, resetResetFlow } from "../store/slices/auth.slice";

// Combined interface for both steps
interface ResetFormValues {
  email: string;
  otp?: string;
  password?: string;
}

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error, resetSent, pendingEmail } = useAppSelector((state) => state.auth);
  const { colors, shadows, fontWeights } = useAppSelector((state) => state.theme);

  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(resetResetFlow());
    };
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    defaultValues: {
      email: pendingEmail || "",
    },
  });

  const onSubmit = (data: ResetFormValues) => {
    if (!resetSent) {
      dispatch(forgotPassword({ email: data.email }));
    } else {
      dispatch(
        resetPassword({
          email: pendingEmail!,
          otp: data.otp!,
          password: data.password!,
        })
      ).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          navigate("/auth/login");
        }
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: colors.surface,
            padding: 4,
            borderRadius: 3,
            boxShadow: shadows.lg,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: fontWeights.semibold,
              color: colors.textPrimary,
              mb: 2,
            }}
          >
            {resetSent ? "Nueva Contraseña" : "Recuperar Contraseña"}
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, color: colors.textSecondary }}>
            {resetSent
              ? `Ingrese el código enviado a ${pendingEmail} y su nueva contraseña.`
              : "Ingrese su email para recibir un código de recuperación."}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {!resetSent ? (
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                {...register("email", { required: "Email is required" })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Código OTP"
                  margin="normal"
                  {...register("otp", { required: "El código es obligatorio" })}
                  error={!!errors.otp}
                  helperText={errors.otp?.message}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Nueva Contraseña"
                  type="password"
                  margin="normal"
                  {...register("password", { 
                    required: "La contraseña es obligatoria",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" }
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </>
            )}

            <Box mt={3}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  backgroundColor: colors.primary,
                  fontWeight: fontWeights.medium,
                  textTransform: "none",
                  borderRadius: 2,
                  boxShadow: shadows.sm,
                  "&:hover": {
                    backgroundColor: colors.accent,
                    boxShadow: shadows.md,
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "#ffffff" }} />
                ) : resetSent ? (
                  "Actualizar Contraseña"
                ) : (
                  "Enviar Código"
                )}
              </Button>
            </Box>
          </form>

          <Box mt={3} sx={{ textAlign: "center" }}>
            <Link
              to="/auth/login"
              style={{
                color: colors.primary,
                fontWeight: fontWeights.medium,
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              Volver al Login
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}