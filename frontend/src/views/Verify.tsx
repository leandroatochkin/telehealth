import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { verifyAccount, resendOtp } from "../api/auth/auth.api";
import { useNavigate } from "react-router-dom";

export default function VerifyPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error, pendingEmail, verified, resendLoading } =
    useAppSelector((state) => state.auth);

  const { colors, shadows, fontWeights } = useAppSelector(
    (state) => state.theme
  );

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Redirect when verified
  useEffect(() => {
    if (verified) {
      navigate("/auth/login");
    }
  }, [verified, navigate]);

  if (!pendingEmail) {
    return (
      <Box
        sx={{
          width: "100vw",
          minHeight: "100vh",
          backgroundColor: colors.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>
          No email found. Please sign up again.
        </Typography>
      </Box>
    );
  }

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      dispatch(
        verifyAccount({
          email: pendingEmail,
          otp: newOtp.join(""),
        })
      );
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    dispatch(resendOtp(pendingEmail));
    setTimer(60);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
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
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: fontWeights.semibold,
              color: colors.textPrimary,
            }}
          >
            Verify Your Email
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: colors.textSecondary,
              fontWeight: fontWeights.regular,
            }}
          >
            Enter the 6-digit code sent to{" "}
            <strong>{pendingEmail}</strong>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* OTP BOXES */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mb: 3,
            }}
          >
            {otp.map((digit, index) => (
              <TextField
                key={index}
                value={digit}
                inputRef={(el) => (inputRefs.current[index] = el)}
                onChange={(e) =>
                  handleChange(e.target.value, index)
                }
                onKeyDown={(e) => handleKeyDown(e, index)}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: "center",
                    fontSize: "22px",
                    fontWeight: fontWeights.medium,
                  },
                }}
                sx={{
                  width: 55,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&.Mui-focused fieldset": {
                      borderColor: colors.primary,
                    },
                  },
                }}
              />
            ))}
          </Box>

          {/* Manual verify fallback */}
          <Button
            variant="contained"
            disabled={loading}
            onClick={() =>
              dispatch(
                verifyAccount({
                  email: pendingEmail,
                  otp: otp.join(""),
                })
              )
            }
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
              "Verify"
            )}
          </Button>

          {/* RESEND SECTION */}
          <Box mt={3}>
            {timer > 0 ? (
              <Typography
                variant="body2"
                sx={{ color: colors.textSecondary }}
              >
                Resend code in {timer}s
              </Typography>
            ) : (
              <Button
                onClick={handleResend}
                disabled={resendLoading}
                sx={{
                  color: colors.accent,
                  fontWeight: fontWeights.medium,
                  textTransform: "none",
                }}
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}