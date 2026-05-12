import React from "react";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import { Box, Container, Stack, Chip, Typography } from "@mui/material";

const CelebrationComponent = ({
    title = "Uniques’ Odyssey → Idea to Impact ✦",
    subtitle = "Over 200+",
    chipLabel = "Design Blocks",
    backgroundColor = "#f1f4f9",
    highlightColor = "#ca0019",
}) => {
    return (
        <Box
            className="MuiBox-root rounded-b-[50px]"
            sx={{
                overflow: "hidden",
                background: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 60"><text x="0" y="25" fill="%23E6E8EE" font-size="60px">.</text></svg>') 0px 0px / 30px 30px ${backgroundColor}`,
                padding: "2rem 0",
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={4} alignItems="center" sx={{
                    paddingTop: "40px",
                    paddingBottom: "40px",
                    borderBottomLeftRadius: "40px",
                    borderBottomRightRadius: "40px",
                }}>
                    {/* Chip Section */}
                    <Chip
                        variant="outlined"
                        label={
                            <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="center" spacing={1}>
                                <Typography variant="caption" sx={{ fontSize: { xs: "0.6rem", sm: "0.75rem" } }}>{subtitle}</Typography>
                                <Chip
                                    sx={{
                                        backgroundColor: highlightColor,
                                        height: "20px",
                                        padding: "0 8px",
                                        "& .MuiChip-icon": { color: "white", fill: "white", width: 16, height: 16 },
                                    }}
                                    icon={<Person2OutlinedIcon sx={{ width: 16, height: 16, stroke: "white", color: "white", fill: "white" }} />}
                                    label={<Typography variant="caption" className="text-white" sx={{ fontSize: { xs: "0.6rem", sm: "0.75rem" } }}>{chipLabel}</Typography>}
                                    variant="filled"
                                />
                            </Stack>
                        }
                        sx={{ width: "100%", maxWidth: "250px", margin: "0 auto", padding: { xs: "0.25rem", sm: "0.5rem" }, fontSize: "0.75rem", borderWidth: "1px" }}
                    />

                    {/* Heading Section */}
                    <Typography align="center" sx={{ fontSize: "45px", lineHeight: "1.5", maxWidth: "800px" }}>{title}</Typography>

                    {/* Wave Section */}
                    <Box>
                        <Stack className="wave" role="presentation">
                            <svg viewBox="0 0 122 10" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "80%", height: "auto" }}>
                                <path opacity="0.4" d="M1.46484 6.83613L4.45387 3.7103C7.74598 0.267505 13.38 0.760513 16.0241 4.72277L16.5428 5.50001C19.2423 9.54539 25.1877 9.54539 27.8873 5.5V5.5C30.5869 1.45461 36.5322 1.45461 39.2318 5.5V5.5C41.9314 9.54539 47.8768 9.54539 50.5764 5.5V5.5C53.2759 1.45461 59.2213 1.45461 61.9209 5.5V5.5C64.6205 9.54539 70.5658 9.54539 73.2654 5.5V5.5C75.965 1.45461 81.9104 1.45461 84.61 5.5V5.5C87.3096 9.54539 93.2549 9.54539 95.9545 5.5V5.5C98.6541 1.45461 104.599 1.45461 107.299 5.5V5.5C109.999 9.54539 115.944 9.54539 118.644 5.5L120.534 2.66667" stroke={highlightColor} strokeLinecap="round" />
                            </svg>
                        </Stack>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};

export default CelebrationComponent;
