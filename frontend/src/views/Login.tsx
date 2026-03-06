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
import { fetchStreamToken, loginUser } from "../api/auth/auth.api";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

interface FormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error, token } = useAppSelector(
    (state) => state.auth
  );

  const { colors, shadows, fontWeights } = useAppSelector(
    (state) => state.theme
  );

  useEffect(() => {
    if (token) {
      dispatch(fetchStreamToken());
      navigate("/dashboard");
    }
  }, [token, dispatch, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    dispatch(loginUser(data));
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
            Login to Telehealth
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
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
              label="Password"
              type="password"
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
                  "Login"
                )}
              </Button>
            </Box>
          </form>

          <Box mt={3}>
            <Typography
              variant="body2"
              sx={{
                color: colors.textSecondary,
                fontWeight: fontWeights.regular,
              }}
            >
              Don’t have an account?{" "}
              <Link
                to="/auth/signup"
                style={{
                  color: colors.primary,
                  fontWeight: fontWeights.medium,
                  textDecoration: "none",
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}