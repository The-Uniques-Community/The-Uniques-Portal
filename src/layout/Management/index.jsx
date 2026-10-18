/**
 * @file index.jsx
 * @description Unified Management Layout Shell for both Admin (/admin) and Coordinator (/coordinator) portals.
 * Features URL-based reactive active navigation detection, theme switching, mobile responsive drawer,
 * and centralized session termination using authService.
 */

import React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountBalance from "@mui/icons-material/AccountBalance";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SchoolIcon from "@mui/icons-material/School";
import BarChartIcon from "@mui/icons-material/BarChart";
import ClassIcon from "@mui/icons-material/Class";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import { toast } from "react-toastify";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useThemeContext } from "@/theme/ThemeProvider";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import authService from "@/services/authService";
import logo from "@/assets/logos/theuniquesCommunity.png";
import uniques_white from "@/assets/logos/uniqueswhite.png";

const MANAGEMENT_NAVIGATION = [
  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "members-overview", title: "Members", icon: <GroupIcon /> },
  { segment: "events-overview", title: "Events", icon: <EventIcon /> },
  { segment: "projects-overview", title: "Projects", icon: <AccountTreeIcon /> },
  { segment: "accounts", title: "Accounts", icon: <AccountBalance /> },
  { segment: "enquiry", title: "Enquiry", icon: <AnnouncementIcon /> },
  { segment: "leave-management", title: "Leave Management", icon: <CalendarMonthIcon /> },
  { segment: "profile", title: "Profile", icon: <PersonIcon /> },
  { segment: "trainers", title: "Trainers", icon: <SchoolIcon /> },
  { segment: "uniques360", title: "Uniques 360", icon: <AssignmentTurnedInIcon /> },
  { segment: "stats", title: "Stats", icon: <BarChartIcon /> },
  { segment: "batches", title: "Batches", icon: <ClassIcon /> },
  { segment: "community", title: "Community", icon: <Diversity3Icon /> },
];

function Branding() {
  const { isDarkMode } = useThemeContext();
  return (
    <Box
      component="img"
      src={isDarkMode ? uniques_white : logo}
      alt="The Uniques Logo"
      sx={{ width: 120, mr: 2 }}
    />
  );
}

export default function ManagementLayout({ role: explicitRole }) {
  const { isDarkMode, toggleTheme } = useThemeContext();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isCoordinator = explicitRole
    ? explicitRole === "coordinator"
    : location.pathname.startsWith("/coordinator");
  const basePath = isCoordinator ? "/coordinator" : "/admin";

  // Determine active item based on current URL
  const getActiveItemFromPath = React.useCallback(() => {
    const pathSegments = location.pathname.split("/");
    const currentSegment = pathSegments[2] || "";
    const activeNav = MANAGEMENT_NAVIGATION.find(
      (item) => item.segment === currentSegment
    );
    return activeNav ? activeNav.title : "Dashboard";
  }, [location.pathname]);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(getActiveItemFromPath());
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setActiveItem(getActiveItemFromPath());
  }, [getActiveItemFromPath]);

  const onConfirmLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("activeItem");
      toast.success("Logged out successfully");
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsOpen(false);
  };

  const handleNavigation = (segment, itemTitle) => {
    setActiveItem(itemTitle);
    const targetPath = segment ? `${basePath}/${segment}` : basePath;
    navigate(targetPath);
    if (isMobile) setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: isDarkMode ? "#121212" : "#ca0019",
          borderBottom: "1px solid",
          borderColor: isDarkMode ? "rgba(255, 255, 255, 0.12)" : "transparent",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setDrawerOpen(!drawerOpen)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Branding />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <IconButton color="inherit" onClick={() => setIsOpen(true)}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: "border-box",
            bgcolor: isDarkMode ? "#1a1a1a" : "#fff",
            borderRight: "1px solid",
            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", py: 2 }}>
          <List>
            {MANAGEMENT_NAVIGATION.map((item) => {
              const isSelected = activeItem === item.title;
              return (
                <ListItem
                  button
                  key={item.title}
                  onClick={() => handleNavigation(item.segment, item.title)}
                  sx={{
                    mb: 0.5,
                    mx: 1,
                    borderRadius: "8px",
                    bgcolor: isSelected
                      ? isDarkMode
                        ? "rgba(202, 0, 25, 0.25)"
                        : "rgba(202, 0, 25, 0.08)"
                      : "transparent",
                    color: isSelected ? "#ca0019" : "inherit",
                    "&:hover": {
                      bgcolor: isDarkMode
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(202, 0, 25, 0.04)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected ? "#ca0019" : isDarkMode ? "#fff" : "rgba(0, 0, 0, 0.54)",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "0.9rem",
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - 240px)` },
          minHeight: "100vh",
          bgcolor: isDarkMode ? "background.default" : "#fbfbfb",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={onConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your operational management portal?"
      />
    </Box>
  );
}

ManagementLayout.propTypes = {
  role: PropTypes.oneOf(["admin", "coordinator"]),
};
