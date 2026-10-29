/**
 * @file index.jsx
 * @description Student member dashboard layout providing member navigation links, responsive drawer, theme toggle, and nested route outlet.
 * @architecture Layout container for authenticated member views (Dashboard, Create Blog, Uniques 360, Leave Management). Integrates with ThemeProvider, authService, and React Router Outlet.
 * @agent_note Uses localStorage ("activeItem") to restore active menu state across reloads. Sidebar list incorporates `data-lenis-prevent="true"` and wheel event cancellation to avoid interfering with Lenis smooth scrolling.
 */

import React, { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookIcon from '@mui/icons-material/Book';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LogoutIcon from "@mui/icons-material/Logout";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { toast } from "react-toastify";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useThemeContext } from "@/theme/ThemeProvider";
import logo from "@/assets/logos/theuniquesCommunity.png";
import uniques_white from "@/assets/logos/uniqueswhite.png";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark Mode Icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light Mode Icon

const ConfirmationModal = lazy(() => import("@/components/modals/ConfirmationModal"));

/**
 * @desc Navigation menu configuration for authenticated community members.
 * @type {Array<{segment: string, title: string, icon: React.ReactNode}>}
 */
const STUDENT_NAVIGATION = [
  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "create-blog", title: "Create Blog", icon: <BookIcon /> },
  { segment: "uniques360", title: "Uniques 360", icon: <AssignmentTurnedInIcon /> },
  { segment: "leave-management", title: "Leave Management", icon: <CalendarMonthIcon /> },
];

import { BASE_URL } from "@/config";
import authService from "@/services/authService";

/**
 * @component Branding
 * @description Renders light or dark themed community logo.
 * @state Consumes isDarkMode from ThemeContext.
 */
function Branding() {
  const { isDarkMode } = useThemeContext()
  return (
    <Box
      component="img"
      src={isDarkMode ? uniques_white : logo}
      alt="The Uniques Logo"
      sx={{ width: 120, mr: 2 }}
    />
  );
}

/**
 * @component DashboardLayoutAppBar
 * @description Primary student dashboard layout component rendering the collapsible sidebar drawer, glassmorphic top bar, and route Outlet.
 * @param {Object} props - Component properties.
 * @param {Function} [props.window] - Optional DOM window getter for iframe contexts.
 * @state {boolean} drawerOpen - Indicates whether the sidebar drawer is open.
 * @state {string} activeItem - Current active navigation title initialized from localStorage.
 * @state {boolean} isOpen - Controls visibility of the logout confirmation modal.
 * @api authService.logout - Revokes student session on confirmation.
 */
function DashboardLayoutAppBar() {
  const { isDarkMode, toggleTheme } = useThemeContext(); // Access dark mode state and toggle function
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isProjectsPage = location.pathname.includes("project");

  // Retrieve the saved active item from localStorage on mount
  const savedActiveItem = localStorage.getItem("activeItem") || "Dashboard";
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(savedActiveItem);

  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const onConfirm = async () => {
    try {
      await authService.logout();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsOpen(false);
  };

  const handleNavigation = (path, itemTitle) => {
    setActiveItem(itemTitle);
    localStorage.setItem("activeItem", itemTitle); // Save active item to localStorage
    navigate(path);
    if (isMobile) setDrawerOpen(false); // Close drawer on navigation in mobile view
  };

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  return (
    <>
      {isOpen && (
        <Suspense fallback={null}>
          <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            message={"You sure you want to log out?"}
          />
        </Suspense>
      )}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={toggleDrawer}
        data-lenis-prevent="true"
        PaperProps={{
          "data-lenis-prevent": "true",
        }}
        sx={{
          width: isMobile ? 260 : drawerOpen ? 240 : 75,
          flexShrink: 0,
          zIndex: 2000,
          ml: isMobile ? 0 : 2,
          "& .MuiDrawer-paper": {
            width: isMobile ? 260 : drawerOpen ? 240 : 75,
            height: isMobile ? "100vh" : "calc(100vh - 32px)",
            top: isMobile ? 0 : "16px",
            marginTop: 0,
            marginLeft: isMobile ? 0 : "16px",
            backgroundColor: theme.palette.background.drawer,
            borderRadius: isMobile ? "0 16px 16px 0" : "8px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            transition: "width 0.3s",
            boxSizing: "border-box",
            zIndex: "2000 !important",
            border: "none !important",
            boxShadow: "none !important",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            px: 2,
            pt: 2,
            pb: 1.5,
            minHeight: "56px",
            boxSizing: "border-box",
          }}
        >
          {(drawerOpen || isMobile) && (
            <Box sx={{ width: 140, display: "flex", alignItems: "center" }}>
              <img src={uniques_white} alt="Logo" style={{ maxWidth: "100%", height: "auto", display: "block" }} />
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <MenuIcon sx={{ color: theme.palette.primary.light }} />
            </IconButton>
          </Box>
        </Box>

        <List
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          sx={{
            padding: 2,
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
            overscrollBehavior: "contain",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {STUDENT_NAVIGATION.map((item) => {
            const isActive = activeItem === item.title;

            return (
              <ListItem
                key={item.title}
                disablePadding
                sx={{ marginY: "4px" }}
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.segment, item.title)}
                  sx={{
                    backgroundColor: isActive ? "white" : "inherit",
                    color: isActive ? "black" : "white",
                    padding: "10px",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "white !important",
                      color: "black !important",
                      "& .MuiListItemIcon-root, & .MuiListItemText-root, & .MuiTypography-root": {
                        color: "black !important",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    className="MuiListItemIcon-root"
                    sx={{
                      color: isActive ? "black" : "white",
                      minWidth: "40px",
                      transition: "color 0.3s",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {drawerOpen && (
                    <ListItemText
                      className="MuiListItemText-root"
                      primary={item.title}
                      sx={{
                        color: isActive ? "black" : "white",
                        transition: "color 0.3s",
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <List sx={{ padding: 2, flexShrink: 0, marginTop: "auto" }}>
          <ListItem
            disablePadding
            sx={{ marginY: "4px" }}
          >
            <ListItemButton
              onClick={toggleTheme} // Toggles between light and dark mode
              sx={{
                backgroundColor: "inherit",
                color: theme.palette.primary.light,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.dark,
                },
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: "40px !important",
                }}
              >
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </ListItemIcon>
              {drawerOpen && (
                <ListItemText
                  sx={{
                    color: "inherit",
                  }}
                  primary={
                    isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                />
              )}
            </ListItemButton>
          </ListItem>
          <ListItem
            disablePadding
            sx={{ marginY: "4px" }}
          >
            <ListItemButton
              onClick={() => {
                if (isMobile) {
                  setDrawerOpen(false);
                }
                setIsOpen(true);
              }}
              sx={{
                backgroundColor: "inherit",
                color: theme.palette.primary.light,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.dark,
                },
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: "40px",
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              {drawerOpen && (
                <ListItemText
                  sx={{
                    color: "inherit",
                  }}
                  primary="Logout"
                />
              )}
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {(!isProjectsPage || isMobile) && (
        <AppBar
          position={isProjectsPage ? "static" : "fixed"}
          elevation={0}
          sx={{
            top: isProjectsPage ? "auto" : 0,
            marginTop: 0,
            backgroundColor: isDarkMode
              ? "rgba(18, 18, 18, 0.92)"
              : "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid",
            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
            boxShadow: isDarkMode
              ? "0 4px 20px -2px rgba(0, 0, 0, 0.5)"
              : "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
            height: "56px !important",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            left: isMobile ? 0 : drawerOpen ? "272px" : "107px",
            width: isMobile ? "100%" : `calc(100% - ${drawerOpen ? 272 : 107}px)`,
            transition: "left 0.3s, width 0.3s",
          }}
        >
          <Toolbar sx={{ minHeight: "56px !important", px: { xs: 1.5, sm: 2 } }}>
            {isMobile && !drawerOpen && (
              <IconButton edge="start" aria-label="menu" onClick={toggleDrawer} sx={{ mr: 1 }}>
                <MenuIcon sx={{ color: theme.palette.primary.main }} />
              </IconButton>
            )}
            {(!drawerOpen || isMobile) && !isProjectsPage && <Branding />}
          </Toolbar>
        </AppBar>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: isProjectsPage ? { xs: 0, sm: 2 } : 8,
          ml: isMobile ? 0 : drawerOpen ? "272px" : "107px", // Adjusted for sidebar spacing
          transition: "margin-left 0.3s",
        }}
      >
        <Outlet />
      </Box>
    </>
  );
}

DashboardLayoutAppBar.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutAppBar;
