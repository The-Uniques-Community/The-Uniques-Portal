import React, { useState } from "react";
import { Lock, Storage, Layers, SyncAlt } from "@mui/icons-material";
import sv from "@/assets/trainingmodel/sv.png";
import Filter3Icon from "@mui/icons-material/Filter3";
import Filter2Icon from "@mui/icons-material/Filter2";
import Filter1Icon from "@mui/icons-material/Filter1";
import Filter4Icon from "@mui/icons-material/Filter4";
import { Tabs, Tab, Box, Typography, Fade, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

// Import images for each year (you should replace these with actual images)
import firstYearImg from "../../../../assets/img/Community/Training1.png"; // Replace with your actual image path
import secondYearImg from "../../../../assets/img/Community/Training2.png"; // Replace with your actual image path
import thirdYearImg from "../../../../assets/img/Community/Training2.png"; // Replace with your actual image path
import fourthYearImg from "../../../../assets/img/Community/Training4.png"; // Replace with your actual image path
import ltImg from "../../../../assets/img/Community/Training5.png";
 // Replace with your actual image path

// Styled component for custom tab style
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.9rem",
  minWidth: "auto",
  padding: "12px 16px",
  color: "gray",
  "&.Mui-selected": {
    color: "#ca0019",
  },
}));

// TabPanel component for content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`phase-tabpanel-${index}`}
      aria-labelledby={`phase-tab-${index}`}
      {...other}
    >
      <Fade in={value === index} timeout={800}>
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Fade>
    </div>
  );
}

const FourPhase = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabData = [
    {
      title: "First Year",
      subtitle: "Technical & Soft Skills",
      icon: <Filter1Icon fontSize="large" style={{ color: "white" }} />,
      description:
        "Master advanced image editing, responsive front-end development, digital marketing, and UI/UX design while developing communication and interview skills.",
      image: firstYearImg,
      focusAreas: [
        "Advanced image editing and digital design",
        "Responsive front-end development",
        "UI/UX design principles",
        "Communication and interview skills"
      ]
    },
    {
      title: "Second Year",
      subtitle: "Programming & Data Management",
      icon: <Filter2Icon fontSize="large" style={{ color: "white" }} />,
      description:
        "Develop robust backend logic, manage databases, and explore data structures. Specialize in Digital Marketing or Java programming in the third semester.",
      image: secondYearImg,
      focusAreas: [
        "Backend development and logic",
        "Database management systems",
        "Data structures and algorithms",
        "Specialization tracks: Digital Marketing or Java"
      ]
    },
    {
      title: "Third Year",
      subtitle: "Cutting-Edge Technologies",
      icon: <Filter3Icon fontSize="large" style={{ color: "white" }} />,
      description:
        "Gain hands-on experience in designing scalable applications, real-world problem-solving, and collaborative development projects.",
      image: thirdYearImg,
      focusAreas: [
        "Scalable application architecture",
        "Real-world problem-solving",
        "Collaborative development methodologies",
        "Industry-focused projects"
      ]
    },
    {
      title: "Fourth Year",
      subtitle: "Professional Readiness",
      icon: <Filter4Icon fontSize="large" style={{ color: "white" }} />,
      description:
        "Prepare for careers with mock interviews, aptitude tests, and personality development. Explore Blockchain, DApps, and emerging technologies.",
      image: fourthYearImg,
      focusAreas: [
        "Career preparation and interview skills",
        "Aptitude and personality development", 
        "Blockchain and decentralized applications",
        "Emerging technologies exploration"
      ]
    },
    {
      title: "L&T Courses",
      subtitle: "Specialized Training",
      icon: <Lock fontSize="large" style={{ color: "white" }} />,
      description:
        "Specialized training in Machine Learning, Java & Spring, Blockchain Legal Consulting, and Microsoft Power BI to enhance career prospects.",
      image: ltImg,
      focusAreas: [
        "Machine Learning certification",
        "Java & Spring Boot specialization",
        "Blockchain Legal Consulting",
        "Microsoft Power BI data analytics"
      ]
    },
  ];

  return (
    <div className="bg-white text-gray-900 py-14 px-6 lg:px-12">
      <div className="max-w-screen-xl mx-auto">
        <div
          className="relative"
          style={{
            backgroundImage: `url(${sv})`,
            backgroundSize: 180,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom right",
          }}
        >
          <div className="mb-12">
            <h4 className="text-sm uppercase text-gray-500 mb-2">
              About Our Community
            </h4>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">
              The <span className="text-[#ca0019]">Uniques</span> Community – Learn,
              Build, and Grow Together.
            </h2>
            <p className="text-gray-600 max-w-3xl">
              The Uniques Community is a community where everyone is welcome. We help
              students bridge the gap between theory and practice and grow their
              knowledge by providing a peer-to-peer learning environment, conducting
              workshops, organizing study jams, and building solutions for local businesses.
            </p>
          </div>
  
          <div className="my-10">
            <h3 className="text-3xl lg:text-4xl font-bold mb-6">Program Structure</h3>
          </div>
  
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="primary"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#ca0019',
                  borderRadius: '4px',
                }
              }}
            >
              {tabData.map((tab, index) => (
                <StyledTab key={index} label={tab.title} id={`phase-tab-${index}`} />
              ))}
            </Tabs>
          </Box>
  
          {/* Tab Content */}
          {tabData.map((tab, index) => (
            <TabPanel key={index} value={activeTab} index={index}>
              <Grid container spacing={4} alignItems="center">
                {/* Left - Image */}
                <Grid item xs={12} md={5}>
                  <Fade in={activeTab === index} timeout={1000}>
                    <Box
                      sx={{
                        height: "100%",
                        minHeight: "280px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      
                      }}
                    >
                      <img
                        src={tab.image}
                        alt={`${tab.title} illustration`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    </Box>
                  </Fade>
                </Grid>
  
                {/* Right - Content */}
                <Grid item xs={12} md={7}>
                  <Fade in={activeTab === index} timeout={1200}>
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-full bg-[#ca0019] text-white">
                          {tab.icon}
                        </div>
                        <div>
                          <Typography variant="h5" fontWeight="bold">
                            {tab.title}
                          </Typography>
                          <Typography variant="subtitle1" color="text.secondary">
                            {tab.subtitle}
                          </Typography>
                        </div>
                      </div>
  
                      <Typography variant="body1" className="text-gray-700 text-base mb-4">
                        {tab.description}
                      </Typography>
  
                      <div className="bg-gray-100 rounded-xl p-5 mt-4 shadow-sm">
                        <Typography variant="h6" className="font-semibold mb-3">
                          Key Focus Areas:
                        </Typography>
                        <ul className="list-disc pl-5 text-gray-800 space-y-1 text-sm">
                          {tab.focusAreas.map((area, i) => (
                            <li key={i}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Fade>
                </Grid>
              </Grid>
            </TabPanel>
          ))}
        </div>
      </div>
    </div>
  );
  
};

export default FourPhase;
