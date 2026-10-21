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
import { Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useThemeContext } from "@/theme/ThemeProvider";
import logo from "@/assets/logos/theuniquesCommunity.png";
import uniques_white from "@/assets/logos/uniqueswhite.png";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark Mode Icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light Mode Icon

const ConfirmationModal = lazy(() => import("@/components/modals/ConfirmationModal"));

// Navigation items with relative paths
const STUDENT_NAVIGATION = [
  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "create-blog", title: "Create Blog", icon: <BookIcon /> },
  { segment: "uniques360", title: "Uniques 360", icon: <AssignmentTurnedInIcon /> },
  { segment: "leave-management", title: "Leave Management", icon: <CalendarMonthIcon /> },
];

import { BASE_URL } from "@/config";
import authService from "@/services/authService";

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

function DashboardLayoutAppBar() {
  const { isDarkMode, toggleTheme } = useThemeContext(); // Access dark mode state and toggle function
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          width: isMobile ? "auto" : drawerOpen ? 240 : 75,
          flexShrink: 0,
          zIndex: '2000',
          ml: 2, // Adds margin-left to create space
          "& .MuiDrawer-paper": {
            width: isMobile ? "auto" : drawerOpen ? 240 : 75,
            height: "96vh",
            marginTop: "16px",
            marginLeft: "16px", // Adds spacing between the drawer and the edge
            backgroundColor: theme.palette.background.drawer,
            borderRadius: "8px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.3s",
            boxSizing: "border-box",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {drawerOpen && !isMobile && (
            <Box sx={{ width: 150 }}>
              <img src={uniques_white} alt="Logo" />
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: drawerOpen ? "flex-end" : "center",
              p: 1,
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
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
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

      <AppBar
        position="fixed"
        sx={{
          backgroundColor: theme.palette.background.appBar,
          boxShadow: "none !important",
          height: 56,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          left: isMobile ? 0 : drawerOpen ? 256 : 91,
          width: isMobile ? "100%" : `calc(100% - ${drawerOpen ? 256 : 91}px)`,
          marginTop: "16px", // Adds space between AppBar and top
          transition: "left 0.3s, width 0.3s",
        }}
      >
        <Toolbar>
          {isMobile && !drawerOpen && (
            <IconButton edge="start" aria-label="menu" onClick={toggleDrawer}>
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
          p: 3,
          mt: 8,
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
