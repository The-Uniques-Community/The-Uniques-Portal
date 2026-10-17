import React from "react";
import {
  Container,
  Stack,
  Typography,
  Grid,
  Paper,
  Box,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faStar } from "@fortawesome/free-solid-svg-icons";
import Button from "@/utils/Buttons/Button";
import { useTheme } from "@mui/material";

const CultureOfInnovation = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="xl" className="py-16 px-4 md:px-16">
      <Stack spacing={6} className="text-center">
        <Typography variant="h2" className="text-gray-900 font-bold">
          Culture of Innovation
        </Typography>
        <Typography variant="h6" className="text-gray-600 max-w-2xl mx-auto">
          Join a team that embraces forward-thinking ideas, fosters innovation, and cultivates an environment where your creativity can flourish.
        </Typography>
      </Stack>

      <Grid container spacing={4} className="mt-10">
        {/* Teamwork Card */}
        <Grid item xs={12} sm={6}>
          <Paper elevation={0} className="p-6 rounded-2xl bg-gray-100">
            <Stack spacing={2}>
              <Box className="text-gray-700 text-4xl">
                <FontAwesomeIcon icon={faUsers} />
              </Box>
              <Typography variant="h5" className="font-semibold text-gray-900">
                Teamwork
              </Typography>
              <Typography variant="body1" className="text-gray-600">
                We embrace varied perspectives and backgrounds, creating an inclusive environment.
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Inclusivity Card */}
        <Grid item xs={12} sm={6}>
          <Paper elevation={0} className="p-6 rounded-2xl bg-gray-100">
            <Stack spacing={2}>
              <Box className="text-gray-700 text-4xl">
                <FontAwesomeIcon icon={faStar} />
              </Box>
              <Typography variant="h5" className="font-semibold text-gray-900">
                Inclusivity
              </Typography>
              <Typography variant="body1" className="text-gray-600">
                We celebrate diversity and foster a sense of belonging for all team members.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Growth Section */}
      <Grid container spacing={4} className="mt-10 items-center">
        <Grid item xs={12} md={6}>
          <Stack spacing={4}>
            <Typography variant="h5" className="font-semibold text-gray-900">
              Growth
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Our culture prioritizes continuous learning, encouraging personal and professional development.
            </Typography>
            <Button
              color={"white"}
              bgColor={"#ca0019"}
              border={4}
              borderColor={"#ca0019"}
              iconColor={"black"}
            >
              Know More
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            className="w-full h-64 rounded-2xl bg-cover bg-center"
            style={{
              backgroundImage: "url('/assets/images/graphics/default/feature23-light.png')",
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default CultureOfInnovation;
