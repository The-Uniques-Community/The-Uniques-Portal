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
import PublishIcon from "@mui/icons-material/Publish";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LogoutIcon from "@mui/icons-material/Logout";
import { toast } from "react-toastify";
import { Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useThemeContext } from "@/theme/ThemeProvider";
import ConfirmationModal from "@/utils/Modal/ConfirmationModal";
import logo from "@/assets/logos/theuniquesCommunity.png";
import uniques_white from "@/assets/logos/uniqueswhite.png";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark Mode Icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light Mode Icon

// Navigation items with full paths
const STUDENT_NAVIGATION = [
  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "JobPosting", title: "Post Job", icon: <PublishIcon /> },
  { segment: "profile", title: "Profile", icon: <AccountCircleIcon /> },
  { segment: "applicants", title: "Applicants", icon: <GroupIcon /> },
  {
    segment: "joboffers",
    title: "Manage Offers",
    icon: <AssignmentTurnedInIcon />,
  },
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Retrieve the saved active item from localStorage on mount
  const savedActiveItem = localStorage.getItem("activeItem") || "";
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(savedActiveItem);

  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const onConfirm = () => {
    fetch("http://localhost:5000/auth/logout", {
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
            overflowX: "hidden",
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

        <List sx={{ padding: 2 }}>
          {STUDENT_NAVIGATION.map((item) => {
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
            onClick={() => setIsOpen(true)}
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
