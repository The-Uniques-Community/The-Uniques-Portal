import React from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import { Link } from "react-router";


export default function Banner(props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundImage: `url(${props.img})`,
        backgroundSize: "cover",
        backgroundColor: "#ca0019",
        py: { xs: "30px", md: "26px" },
        px: { xs: "30px", md: "64px" },
        borderRadius: "10px",
        my: "16px",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontSize: { xs: "20px", md: "32px" },
          color: "white",
          mb: "14px",
          fontWeight: 700,
          lineHeight: { xs: "32px", md: "42px" },
          maxWidth: {
            xs: "100%",
            md: "64%",
            lg: "46%",
            xl: "70%",
            "2xl": "50%",
            "3xl": "42%",
          },
        }}
      >
        Manage members through this dashboard
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "#E3DAFF",
          fontWeight: 500,
          mb: "40px",
          lineHeight: "28px",
          maxWidth: {
            xs: "100%",
            md: "64%",
            lg: "40%",
            xl: "56%",
            "2xl": "46%",
            "3xl": "34%",
          },
        }}
      >
        Manage all your Services in one place
      </Typography>

      <Stack direction="row" alignItems="center" spacing={4}>
        <Link to="members-overview">
        <Button
          variant="contained"
          sx={{
            backgroundColor: "white",
            color: "black",
            fontWeight: 500,
            fontSize: "14px",
            py: "10px",
            px: "27px",
            ":hover": { backgroundColor: "#f4f4f4" },
          }}
          >
            Manage Students
        </Button>
          </Link>
        <Link to="events-overview" underline="none">
          <Typography
            variant="body2"
            sx={{ color: "white", fontWeight: 500 }}
          >
            Manage Events
          </Typography>
        </Link>
      </Stack>
    </Box>
  );
}
