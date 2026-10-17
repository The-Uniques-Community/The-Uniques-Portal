import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import InceptionTab from "../../../Landing/homComponents/InceptionTab";
import useMediaQuery from "@mui/material/useMediaQuery";
import WebDevTab from "../../homComponents/WebDevTab";
import MernTab from "../../homComponents/MernTab";
import AndroidTab from "../../homComponents/AndroidTab";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2">{children}</Typography>
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
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

export default function TrainingTabs() {
  const [value, setValue] = React.useState(0);
  const isSmallScreen = useMediaQuery("(max-width: 1024px)");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="flex justify-center items-center bg-white py-8">
      <div className="w-[85%] flex flex-col items-center">
    
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
      

        <Box sx={{ width: "100%", bgcolor: "white", display: "flex", justifyContent: "center" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="Training Rounds"
            variant="standard"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
         
            }}
          >
            <Tab
              icon={<SettingsIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={<span className="text-xs">Round-I</span>}
              sx={{ minWidth: "150px", textAlign: "center", borderRadius:10 }}
              {...a11yProps(0)}
            />
            <Tab
              icon={<SettingsIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={<span className="text-xs">Round-II</span>}
              sx={{ minWidth: "150px", textAlign: "center", borderRadius:10  }}
              {...a11yProps(1)}
            />
            <Tab
              icon={<SettingsIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={<span className="text-xs">Round-III</span>}
              sx={{ minWidth: "150px", textAlign: "center", borderRadius:10  }}
              {...a11yProps(2)}
            />
            <Tab
              icon={<SettingsIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={<span className="text-xs">Round-IV</span>}
              sx={{ minWidth: "150px", textAlign: "center", borderRadius:10  }}
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={value} index={0}>
          <div className="scale-90">
            <InceptionTab />
          </div>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <div className="scale-90">
            <WebDevTab />
          </div>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <div className="scale-90">
            <MernTab />
          </div>
        </TabPanel>
        <TabPanel value={value} index={3}>
          <div className="scale-90">
            <AndroidTab />
          </div>
        </TabPanel>
      </div>
    </div>
  );
}
