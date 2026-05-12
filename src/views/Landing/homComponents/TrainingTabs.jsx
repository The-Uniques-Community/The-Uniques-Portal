import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import InceptionTab from "./InceptionTab";
import useMediaQuery from "@mui/material/useMediaQuery";
import WebDevTab from "./WebDevTab";
import MernTab from "./MernTab";
import AndroidTab from "./AndroidTab";
import GenAiTab from "./GenAiTab";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function TrainingTabs() {
  const [value, setValue] = React.useState(0);
  const isSmallScreen = useMediaQuery("(max-width: 1024px)"); // Breakpoint for switching layout

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <div className="w-[85%] mx-auto flex flex-col align-middle justify-start">
        <div className="flex mb-5 items-center">
          <span className="border-l-2 border-[#ca0019] h-6 mr-3"></span>
          <h1 className="text-sm md:text-lg font-bold">TRAINING MODULES</h1>
        </div>
        <h1 className="text-2xl md:text-4xl font-semibold">
          Elevate Your Skills with
          <span className="text-[#ca0019] text-2xl md:text-5xl md:py-2 block mb-5">
            Expert-Led Programs
          </span>
        </h1>
      </div>

      <Box
        sx={{
          bgcolor: "background.paper",
          display: "flex",
          justifyContent: isSmallScreen ? "center" : "flex-start",
          flexDirection: isSmallScreen ? "column" : "row", // Change layout based on screen size
        }}
      >
        <Tabs
          orientation={isSmallScreen ? "horizontal" : "vertical"} // Switch orientation
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Responsive tabs example"
          sx={{
            borderRight: isSmallScreen ? 0 : 1,
            borderBottom: isSmallScreen ? 1 : 0,
            borderColor: "divider",
            margin: isSmallScreen ? 0 : 10,
          }}
        >
          <Tab
            sx={{ marginY: isSmallScreen ? 0 : 2 }}
            icon={<SettingsIcon />}
            iconPosition="start"
            label="Round-I"
            {...a11yProps(0)}
          />
          <Tab
            sx={{ marginY: isSmallScreen ? 0 : 2 }}
            icon={<SettingsIcon />}
            iconPosition="start"
            label="Round-II"
            {...a11yProps(1)}
          />
          <Tab
            sx={{ marginY: isSmallScreen ? 0 : 2 }}
            icon={<SettingsIcon />}
            iconPosition="start"
            label="Round-III"
            {...a11yProps(2)}
          />
          <Tab
            sx={{ marginY: isSmallScreen ? 0 : 2 }}
            icon={<SettingsIcon />}
            iconPosition="start"
            label="Round-IV"
            {...a11yProps(3)}
          />
          <Tab
            sx={{ marginY: isSmallScreen ? 0 : 2 }}
            icon={<SettingsIcon />}
            iconPosition="start"
            label="Round-V"
            {...a11yProps(4)}
          />
        </Tabs>
        <TabPanel value={value} index={0}>
          <Box>
            <InceptionTab />
          </Box>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Box>
            <WebDevTab />
          </Box>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Box>
            <MernTab />
          </Box>
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Box>
            <AndroidTab />
          </Box>
        </TabPanel>
        <TabPanel value={value} index={4}>
          <Box>
            <GenAiTab />
          </Box>
        </TabPanel>
      </Box>
    </div>
  );
}
