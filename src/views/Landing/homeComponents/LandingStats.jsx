import React from "react";
import { Box, Typography } from "@mui/material";
import { ViewList, Language, Group, Email } from "@mui/icons-material";
import project from "@/assets/img/project.jpg";
import { useTheme } from "@mui/material/styles";
import Button from "@/utils/Buttons/Button";
const stats = [
  { icon: <ViewList fontSize="large" />, number: "1,394", label: "Successful Projects" },
  { icon: <Language fontSize="large" />, number: "477", label: "Happy Clients" },
  { icon: <Group fontSize="large" />, number: "~10K", label: "Monthly Visitors" },
  { icon: <Email fontSize="large" />, number: "3k", label: "Email Subscribers" },
];

const LandingStats = () => {
    const theme = useTheme();
  return (
    <div className="bg-black/20 grid lg:grid-cols-2 my-5 md:grid-cols-1 grid-cols-1 gap-6 lg:gap-10 text-white  py-10 px-5 md:px-20">
      <div>
        <img src={project} className="w-full object-cover object-center h-full rounded-tr-full" alt="" />
      </div>
      <div className="max-w-screen-lg mx-auto self-center">
        {/* Title Section */}
        <div className="mb-10">
          <h1 className="lg:text-4xl text-slate-800 md:text-3xl text-3xl font-bold mb-2 leading-tight">
            Make beautiful landing pages using Rareblocks.
          </h1>
          
        </div>

        {/* Stats Section */}
        <div>
          <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-6 lg:gap-10">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-800 rounded-md p-5 gap-4 shadow-md transition hover:shadow-lg"
              >
                {/* Icon */}
                <Box className="text-gray-300">{stat.icon}</Box>
                {/* Text */}
                <div>
                  <Typography variant="h5" className="font-bold">
                    {stat.number}
                  </Typography>
                  <Typography variant="body2" className="text-gray-400">
                    {stat.label}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex justify-end">

          <Button
          path="/lol"
          color={theme.palette.primary.dark}
          bgColor={theme.palette.primary.light}
          border={4}
          borderColor={theme.palette.primary.dark}
      iconColor={"white"}
        >
          <span>Know More</span>
        </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingStats;
