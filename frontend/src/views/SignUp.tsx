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
import { signupUser, type SignupInput } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error, pendingEmail } = useAppSelector(
    (state) => state.auth
  );

  const { colors, shadows, fontWeights } = useAppSelector(
    (state) => state.theme
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>();

  const onSubmit = (data: SignupInput) => {
    dispatch(signupUser(data));
  };

  useEffect(() => {
    if (pendingEmail) {
      navigate("/auth/verify");
    }
  }, [pendingEmail, navigate]);

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
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: fontWeights.semibold,
              color: colors.textPrimary,
              mb: 2,
            }}
          >
            Crear Cuenta
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              {...register("username", { required: "Username is required" })}
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              {...register("email", { required: "Email is required" })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              type="password"
              label="Password"
              margin="normal"
              {...register("password", { required: "Password is required" })}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              margin="normal"
              {...register("passwordConfirm", {
                required: "Please confirm password",
              })}
              error={!!errors.passwordConfirm}
              helperText={errors.passwordConfirm?.message}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

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
                  <CircularProgress
                    size={24}
                    sx={{ color: "#ffffff" }}
                  />
                ) : (
                  "Sign Up"
                )}
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </Box>
  );
}