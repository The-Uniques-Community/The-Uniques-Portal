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
import { toast } from "react-toastify";
import { Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useThemeContext } from "@/theme/ThemeProvider";
import ConfirmationModal from "@/utils/Modal/ConfirmationModal";
import logo from "@/assets/logos/theuniquesCommunity.png";
import uniques_white from "@/assets/logos/uniqueswhite.png";
import { AccountBalance } from "@mui/icons-material";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark Mode Icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light Mode Icon
import AnnouncementIcon from '@mui/icons-material/Announcement';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SchoolIcon from "@mui/icons-material/School";
import BarChartIcon from "@mui/icons-material/BarChart";
import ClassIcon from "@mui/icons-material/Class";
import Diversity3Icon from "@mui/icons-material/Diversity3";

// Navigation items with full paths
const ADMIN_NAVIGATION = [
  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "members-overview", title: "Members", icon: <GroupIcon /> },
  { segment: "events-overview", title: "Events", icon: <EventIcon /> },
  { segment: "projects-overview", title: "Projects", icon: <AccountTreeIcon /> },
  { segment: "accounts", title: "Accounts", icon: <AccountBalance /> },
  { segment: "enquiry", title: "Enquiry", icon: <AnnouncementIcon /> },
  { segment: "trainers", title: "Trainers", icon: <SchoolIcon /> },
  { segment: "leave-management", title: "Leave Management", icon: <CalendarMonthIcon /> },
  { segment: "uniques360", title: "Uniques 360", icon: <AssignmentTurnedInIcon /> },
  { segment: "stats", title: "Stats", icon: <BarChartIcon /> },
  { segment: "batches", title: "Batches", icon: <ClassIcon /> },
  { segment: "community", title: "Community", icon: <Diversity3Icon /> },
];

function Branding() {
  const { isDarkMode } = useThemeContext()
  return (
    <Box
      component="img"
      src={isDarkMode ? uniques_white : logo}
      alt="Placera Logo"
      sx={{ width: 120, mr: 2 }}
    />
  );
}

function DashboardLayoutAppBar() {
  const { isDarkMode, toggleTheme } = useThemeContext(); // Access dark mode state and toggle function
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Retrieve the saved active item from localStorage on mount
  const savedActiveItem = localStorage.getItem("activeItem") || "";
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(savedActiveItem);

  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const onConfirm = () => {
    fetch("https://theuniquesportal-server.vercel.app/auth/logout", {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        localStorage.removeItem("activeItem");
        localStorage.removeItem("role");
        toast.success("Logged out successfully");
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
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
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        message={"You sure you want to log out?"}
      />
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
            height: isMobile ? "100vh" : "96vh",
            marginTop: isMobile ? 0 : "16px",
            marginLeft: isMobile ? 0 : "16px",
            backgroundColor: theme.palette.background.drawer,
            borderRadius: isMobile ? "0 16px 16px 0" : "8px",
            overflowX: "hidden",
            overflowY: "auto",
            overscrollBehavior: "contain",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            transition: "width 0.3s",
            boxSizing: "border-box",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            pt: 2,
            pb: 1,
          }}
        >
          {(drawerOpen || isMobile) && (
            <Box sx={{ width: 140 }}>
              <img src={uniques_white} alt="Logo" style={{ maxWidth: "100%" }} />
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

        <List sx={{ padding: 2 }}>
          {ADMIN_NAVIGATION.map((item) => {
            const isActive = activeItem === item.title;

            return (
              <ListItem
                button
                key={item.title}
                onClick={() => handleNavigation(item.segment, item.title)}
                sx={{
                  backgroundColor: isActive
                    ? theme.palette.action.hover
                    : "inherit",
                  color: isActive
                    ? theme.palette.primary.light
                    : theme.palette.primary.light,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.primary.dark,
                  },
                  padding: "10px",
                  borderRadius: "8px",
                  marginY: "4px",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? theme.palette.primary.dark : "inherit",
                    minWidth: "40px",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText
                    primary={item.title}
                    sx={{
                      color: isActive ? theme.palette.primary.dark : "inherit",
                    }}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
        <List sx={{ padding: 2, marginTop: "auto" }}>
          <ListItem
            button
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
              marginY: "4px",
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
          </ListItem>
          <ListItem
            button
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
              marginY: "4px",
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
          </ListItem>
        </List>
      </Drawer>

      <AppBar
        position="fixed"
        sx={{
          backgroundColor: theme.palette.background.appBar,
          boxShadow: "none !important",
          height: 56,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          left: isMobile ? 0 : drawerOpen ? 256 : 91,
          width: isMobile ? "100%" : `calc(100% - ${drawerOpen ? 256 : 91}px)`,
          marginTop: isMobile ? 0 : "16px",
          transition: "left 0.3s, width 0.3s",
        }}
      >
        <Toolbar sx={{ minHeight: "56px !important", px: { xs: 1.5, sm: 2 } }}>
          {isMobile && !drawerOpen && (
            <IconButton edge="start" aria-label="menu" onClick={toggleDrawer} sx={{ mr: 1 }}>
              <MenuIcon sx={{ color: theme.palette.primary.main }} />
            </IconButton>
          )}
          {(!drawerOpen || isMobile) && <Branding />}
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          mt: { xs: 7, sm: 8 },
          ml: isMobile ? 0 : drawerOpen ? "272px" : "107px",
          width: isMobile ? "100%" : `calc(100% - ${drawerOpen ? 272 : 107}px)`,
          maxWidth: "100vw",
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "margin-left 0.3s, width 0.3s",
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
