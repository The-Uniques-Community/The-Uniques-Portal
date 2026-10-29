/**
 * @file index.jsx
 * @description Portal login screen providing credential-based email authentication and Google OAuth popup flows with role-based routing.
 * @architecture Entry authentication view, dispatching user state to Redux userSlice, saving credentials in authUtils, and navigating via getRoleDashboard.
 * @agent_note Listens for window postMessage events sent from Google OAuth popup window containing token and user profile payloads.
 */

/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import GoogleIcon from "@mui/icons-material/Google";
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
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "@/assets/logos/theuniquesCommunity.png";
import loginImage from "@/assets/img/login/login.svg";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import bg from "@/assets/img/login/bg.png";
import { BASE_URL } from "@/config";
import { getRoleDashboard } from "@/routes/paths";
import authService from "@/services/authService";
import { storeAuth } from "@/utils/authUtils";

/**
 * @component Login
 * @description Portal authentication view with email/password form and Google OAuth popup integration.
 * @state {boolean} showPassword - Password visibility toggle state
 * @api {POST} /auth/login (via authService.emailLogin) - Validates credentials and returns JWT session
 * @api {GET} /auth/google - Backend redirect initiator for Google OAuth handshake
 */
const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  /**
   * @desc Toggles visibility of the password input between text and password types.
   */
  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  /**
   * @desc Prevents mouse-down default action to retain input focus when toggling password view.
   * @param {React.MouseEvent} event - Mouse down event
   */
  const handleMouseDownPassword = (event) => event.preventDefault();

  // Listen for the message from the popup. The backend sends token, role, and user.
  useEffect(() => {
    const receiveMessage = (event) => {
      if (event.data && (event.data.role || event.data.token)) {
        const { token, role, user } = event.data;
        const normalizedRole = (role || user?.role || "member").toLowerCase();
        const userData = user || { role: normalizedRole };

        if (token) {
          storeAuth({ token, role: normalizedRole, user: userData });
        }
        dispatch(setUser({ ...userData, role: normalizedRole }));
        toast.success("Logged in successfully");
        navigate(getRoleDashboard(normalizedRole), { replace: true });
      }
    };

    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, [navigate, dispatch]);

  // Google login using a popup
  /**
   * @desc Opens a centered popup window pointing to the backend Google OAuth initiation route.
   */
  const handleGoogleLogin = () => {
    const googleLoginUrl = `${BASE_URL}/auth/google`;
    const width = 500;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    window.open(
      googleLoginUrl,
      "Google Login",
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        height: "100vh",
        gap: 4,
        px: 2,
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Left Column: Logo, Heading, Form */}
      <Box
        sx={{
          maxWidth: 500,
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <img src={logo} alt="Logo" style={{ width: 190, height: "auto" }} />
        </Box>

        <Button
          onClick={handleGoogleLogin}
          fullWidth
          variant="outlined"
          sx={{
            mt: 2,
            height: "46px",
            borderColor: theme.palette.primary.dark,
            color: theme.palette.primary.dark,
            textTransform: "none",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
              borderColor: theme.palette.primary.dark,
              color: theme.palette.common.white,
            },
          }}
          startIcon={<GoogleIcon sx={{ color: "inherit" }} />}
        >
          Sign in with Google
        </Button>

        {/* Divider */}
        <div className="flex justify-center items-center my-4">
          <div className="border-t border-gray-300 border-solid w-1/4"></div>
          <div className="mx-2 text-gray-500">OR</div>
          <div className="border-t border-gray-300 border-solid w-1/4"></div>
        </div>

        <Typography
          variant="h5"
          sx={{ fontSize: 30 }}
          color={theme.palette.primary.dark}
          gutterBottom
        >
          Login with{" "}
          <span style={{ color: theme.palette.primary.main }}>Email</span>
        </Typography>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={Yup.object({
            email: Yup.string()
              .email("Invalid email")
              .required("Email is required"),
            password: Yup.string()
              .min(6, "Password must be at least 6 characters")
              .required("Password is required"),
          })}
          onSubmit={async (values, { setErrors, setSubmitting }) => {
            try {
              const data = await authService.emailLogin(values);
              toast.success("Logged in successfully");
              const userRole = (data.role || data.member?.role || "").toLowerCase();
              navigate(getRoleDashboard(userRole), { replace: true });
            } catch (error) {
              const errorMsg =
                error.data?.message ||
                error.data?.error ||
                error.response?.data?.message ||
                error.message ||
                "Login failed";
              toast.error(errorMsg);
              setErrors({ submit: errorMsg });
            } finally {
              setSubmitting(false);
            }
          }}
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
            <form noValidate onSubmit={handleSubmit} style={{ width: "100%" }}>
              <FormControl
                fullWidth
                error={Boolean(touched.email && errors.email)}
                sx={{ mb: 2 }}
              >
                <InputLabel htmlFor="outlined-adornment-email-login">
                  Email
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-email-login"
                  type="email"
                  value={values.email}
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  label="Email"
                  sx={{ height: "56px", fontSize: "1rem" }}
                />
                {touched.email && errors.email && (
                  <FormHelperText error>{errors.email}</FormHelperText>
                )}
              </FormControl>

              <FormControl
                fullWidth
                error={Boolean(touched.password && errors.password)}
                sx={{ mb: 2 }}
              >
                <InputLabel htmlFor="outlined-adornment-password-login">
                  Password
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password-login"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  autoComplete="on"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        size="large"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                  sx={{ height: "56px", fontSize: "1rem" }}
                />
                {touched.password && errors.password && (
                  <FormHelperText error>{errors.password}</FormHelperText>
                )}
              </FormControl>

              {/* Forget Password Link */}
              <Box sx={{ mb: 2, textAlign: "right" }}>
                <Link
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/forget-password");
                  }}
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              {errors.submit && (
                <FormHelperText error sx={{ mb: 2 }}>
                  {errors.submit}
                </FormHelperText>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{ mt: 1, height: "46px" }}
              >
                Sign In
              </Button>
            </form>
          )}
        </Formik>
      </Box>

      {/* Right Column: Image */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={loginImage}
          alt="Login Illustration"
          style={{ width: "100%", maxWidth: 500 }}
        />
      </Box>
    </Box>
  );
};

export default Login;
