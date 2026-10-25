import React from "react";
import { useLocation } from "react-router-dom";
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
import EventIcon from "@mui/icons-material/Event";
import AccountBalance from "@mui/icons-material/AccountBalance";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LogoutIcon from "@mui/icons-material/Logout";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { toast } from "react-toastify";
import { Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useThemeContext } from "@/theme/ThemeProvider";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import authService from "@/services/authService";
import logo from "@/assets/logos/theuniquesCommunity.png";
import uniques_white from "@/assets/logos/uniqueswhite.png";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { UserIcon } from "lucide-react";
import SchoolIcon from "@mui/icons-material/School";
import BarChartIcon from "@mui/icons-material/BarChart";
import ClassIcon from "@mui/icons-material/Class";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

// Navigation items with paths relative to /coordinator
const STUDENT_NAVIGATION = [
  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "members-overview", title: "Members", icon: <GroupIcon /> },
  { segment: "events-overview", title: "Events", icon: <EventIcon /> },
  { segment: "projects-overview", title: "Projects", icon: <AccountTreeIcon /> },
  { segment: "success-stories", title: "Success Stories", icon: <AutoStoriesIcon /> },
  { segment: "accounts", title: "Accounts", icon: <AccountBalance /> },
  { segment: "enquiry", title: "Enquiry", icon: <AnnouncementIcon /> },
  { segment: "leave-management", title: "Leave Management", icon: <CalendarMonthIcon /> },
  { segment: "profile", title: "Profile", icon: <UserIcon /> },
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

function CoordinatorLayout() {
  const { isDarkMode, toggleTheme } = useThemeContext();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isProjectsPage = location.pathname.includes("project");

  // Determine active item based on current URL
  const getActiveItemFromPath = React.useCallback(() => {
    const pathSegments = location.pathname.split("/");
    const currentSegment = pathSegments[2] || "";
    const activeNav = STUDENT_NAVIGATION.find((item) => item.segment === currentSegment);
    return activeNav ? activeNav.title : "Dashboard";
  }, [location.pathname]);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(getActiveItemFromPath());
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setActiveItem(getActiveItemFromPath());
  }, [getActiveItemFromPath]);

  const onClose = () => setIsOpen(false);

  const onConfirm = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("activeItem");
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsOpen(false);
  };

  const handleNavigation = (segment, itemTitle) => {
    setActiveItem(itemTitle);
    localStorage.setItem("activeItem", itemTitle);
    const targetPath = segment ? `/coordinator/${segment}` : "/coordinator";
    navigate(targetPath);
    if (isMobile) setDrawerOpen(false);
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
              <ListItem key={item.title} disablePadding sx={{ marginY: "4px" }}>
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
          <ListItem disablePadding sx={{ marginY: "4px" }}>
            <ListItemButton
              onClick={toggleTheme}
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
                  primary={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                />
              )}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ marginY: "4px" }}>
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
            {isMobile && (
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
          p: { xs: 1.5, sm: 2, md: 3 },
          mt: isProjectsPage ? { xs: 0, md: 2 } : { xs: 7, sm: 8 },
          ml: isMobile ? 0 : drawerOpen ? "272px" : "107px",
          width: isMobile ? "100%" : `calc(100% - ${drawerOpen ? 272 : 107}px)`,
          maxWidth: "100vw",
          overflowX: "hidden",
          transition: "margin-left 0.3s",
        }}
      >
        <Outlet />
      </Box>
    </>
  );
}

CoordinatorLayout.propTypes = {
  window: PropTypes.func,
};

export default CoordinatorLayout;
