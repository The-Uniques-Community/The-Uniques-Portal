import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Typography,
  IconButton,
  InputAdornment,
  Step,
  Stepper,
  StepLabel,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  Email,
  Security,
  LockReset,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "@/config";
import logo from "@/assets/logos/theuniquesCommunity.png";
import bg from "@/assets/img/login/bg.png";

const ForgetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0); // Key to force form reset

  const steps = ["Enter Email", "Verify OTP", "Reset Password"];

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  // Reset form states
  const resetFormStates = () => {
    setResetKey(prev => prev + 1);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (values, { setErrors, setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/auth/password-reset/send-otp`, {
        email: values.email,
      });

      if (response.data.success) {
        setEmail(values.email);
        setActiveStep(1);
        resetFormStates(); // Reset form states
        resetForm(); // Reset Formik form
        toast.success("OTP sent to your email successfully!");
      } else {
        setErrors({ email: response.data.message || "Failed to send OTP" });
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Network error. Please try again.";
      setErrors({ email: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (values, { setErrors, setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/auth/password-reset/verify-otp`, {
        email,
        otp: values.otp,
      });

      if (response.data.success) {
        setActiveStep(2);
        resetFormStates(); // Reset form states
        resetForm(); // Reset Formik form
        toast.success("OTP verified successfully!");
      } else {
        setErrors({ otp: response.data.message || "Invalid OTP" });
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Network error. Please try again.";
      setErrors({ otp: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (values, { setErrors, setSubmitting }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/auth/password-reset/reset-password`, {
        email,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      if (response.data.success) {
        toast.success("Password reset successfully!");
        // Reset all states before navigation
        setActiveStep(0);
        setEmail("");
        resetFormStates();
        navigate("/auth/login");
      } else {
        setErrors({ submit: response.data.message || "Failed to reset password" });
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Network error. Please try again.";
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/auth/password-reset/resend-otp`, {
        email,
      });

      if (response.data.success) {
        toast.success("New OTP sent to your email!");
      } else {
        toast.error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Network error. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 0:
        return <Email />;
      case 1:
        return <Security />;
      case 2:
        return <LockReset />;
      default:
        return <Email />;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Formik
            key={`step0-${resetKey}`} // Force remount when resetKey changes
            initialValues={{ email: "" }}
            validationSchema={Yup.object({
              email: Yup.string()
                .email("Invalid email address")
                .required("Email is required"),
            })}
            onSubmit={handleSendOTP}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              touched,
              values,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit}>
                <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
                  Enter Your Email Address
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
                  We'll send you an OTP to reset your password
                </Typography>

                <FormControl
                  fullWidth
                  error={Boolean(touched.email && errors.email)}
                  sx={{ mb: 3 }}
                >
                  <InputLabel>Email Address</InputLabel>
                  <OutlinedInput
                    name="email"
                    type="email"
                    value={values.email}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    label="Email Address"
                    startAdornment={
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    }
                  />
                  {touched.email && errors.email && (
                    <FormHelperText>{errors.email}</FormHelperText>
                  )}
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting || loading}
                  sx={{ mb: 2, height: 48 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Send OTP"}
                </Button>
              </form>
            )}
          </Formik>
        );

      case 1:
        return (
          <Formik
            key={`step1-${resetKey}`} // Force remount when resetKey changes
            initialValues={{ otp: "" }}
            validationSchema={Yup.object({
              otp: Yup.string()
                .length(6, "OTP must be 6 digits")
                .matches(/^\d+$/, "OTP must contain only numbers")
                .required("OTP is required"),
            })}
            onSubmit={handleVerifyOTP}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              touched,
              values,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit}>
                <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
                  Verify OTP
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
                  Enter the 6-digit OTP sent to {email}
                </Typography>

                <FormControl
                  fullWidth
                  error={Boolean(touched.otp && errors.otp)}
                  sx={{ mb: 3 }}
                >
                  <InputLabel>Enter OTP</InputLabel>
                  <OutlinedInput
                    name="otp"
                    type="text"
                    value={values.otp}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    label="Enter OTP"
                    inputProps={{ maxLength: 6 }}
                    startAdornment={
                      <InputAdornment position="start">
                        <Security />
                      </InputAdornment>
                    }
                  />
                  {touched.otp && errors.otp && (
                    <FormHelperText>{errors.otp}</FormHelperText>
                  )}
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting || loading}
                  sx={{ mb: 2, height: 48 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Verify OTP"}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={handleResendOTP}
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  Resend OTP
                </Button>
              </form>
            )}
          </Formik>
        );

      case 2:
        return (
          <Formik
            key={`step2-${resetKey}`} // Force remount when resetKey changes
            initialValues={{ newPassword: "", confirmPassword: "" }}
            validationSchema={Yup.object({
              newPassword: Yup.string()
                .min(6, "Password must be at least 6 characters")
                .required("New password is required"),
              confirmPassword: Yup.string()
                .oneOf([Yup.ref("newPassword")], "Passwords must match")
                .required("Please confirm your password"),
            })}
            onSubmit={handleResetPassword}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              touched,
              values,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit}>
                <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
                  Reset Your Password
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
                  Enter your new password
                </Typography>

                <FormControl
                  fullWidth
                  error={Boolean(touched.newPassword && errors.newPassword)}
                  sx={{ mb: 3 }}
                >
                  <InputLabel>New Password</InputLabel>
                  <OutlinedInput
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={values.newPassword}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    label="New Password"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {touched.newPassword && errors.newPassword && (
                    <FormHelperText>{errors.newPassword}</FormHelperText>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                  sx={{ mb: 3 }}
                >
                  <InputLabel>Confirm Password</InputLabel>
                  <OutlinedInput
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={values.confirmPassword}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    label="Confirm Password"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <FormHelperText>{errors.confirmPassword}</FormHelperText>
                  )}
                </FormControl>

                {errors.submit && (
                  <FormHelperText error sx={{ mb: 2 }}>
                    {errors.submit}
                  </FormHelperText>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting || loading}
                  sx={{ mb: 2, height: 48 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Reset Password"}
                </Button>
              </form>
            )}
          </Formik>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 500,
          width: "100%",
          p: 4,
          borderRadius: 3,
          boxShadow:1
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <img src={logo} alt="Logo" style={{ width: 150, height: "auto", marginBottom: 16, boxShadow:0 }} />
          
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/auth/login")}
            sx={{ mb: 2 }}
          >
            Back to Login
          </Button>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel icon={getStepIcon(index)}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        {renderStepContent()}
      </Paper>
    </Box>
  );
};

export default ForgetPassword;
