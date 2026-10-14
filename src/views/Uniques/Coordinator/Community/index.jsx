import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Divider,
  Stack,
  Chip,
  IconButton,
} from "@mui/material";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LinkIcon from "@mui/icons-material/Link";
import { useThemeContext } from "@/theme/ThemeProvider";
import {
  getStoredBenefitsCards,
  saveStoredBenefitsCards,
  resetStoredBenefitsCards,
  DEFAULT_BENEFITS_CARDS,
} from "@/utils/community/communityBenefitsData";

// Canvas image optimizer to keep storage small and responsive
const optimizeImageForStorage = (file, maxWidth = 800, quality = 0.85) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

const CoordinatorCommunity = () => {
  const { isDarkMode } = useThemeContext();
  const fileInputRef = useRef(null);

  const [cards, setCards] = useState(() => getStoredBenefitsCards());
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);

  // Form field states for currently selected card
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [quote, setQuote] = useState("");
  const [avatar, setAvatar] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrlValue, setImageUrlValue] = useState("");
  const [previewTheme, setPreviewTheme] = useState("red"); // "red" or "light"

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Load cards on mount
  useEffect(() => {
    setCards(getStoredBenefitsCards());
  }, []);

  // Sync form inputs when switching card
  useEffect(() => {
    if (cards[selectedCardIndex]) {
      const current = cards[selectedCardIndex];
      setName(current.name || "");
      setTitle(current.title || "");
      setQuote(current.quote || "");
      setAvatar(current.avatar || "");
    }
  }, [selectedCardIndex, cards]);

  // Process chosen or dropped image
  const processSelectedFile = async (file) => {
    if (!file) return;

    const isImage =
      (file.type && file.type.startsWith("image/")) ||
      /\.(jpg|jpeg|png|webp|svg|gif|bmp|ico)$/i.test(file.name || "");

    if (!isImage) {
      setSnackbar({
        open: true,
        message: "Please choose a valid image file (JPG, PNG, WEBP, SVG).",
        severity: "warning",
      });
      return;
    }

    try {
      const optimized = await optimizeImageForStorage(file);
      if (optimized) {
        setAvatar(optimized);
        setSnackbar({
          open: true,
          message: "Photo loaded! Click 'Save Changes' to update this card.",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Error reading image:", err);
      const reader = new FileReader();
      reader.onload = (e) => setAvatar(e.target.result);
      reader.readAsDataURL(file);
      setSnackbar({
        open: true,
        message: "Photo loaded! Click 'Save Changes' to update this card.",
        severity: "info",
      });
    }
  };

  // Handle native file input (without accept attribute to avoid Windows/Brave explorer hanging)
  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Clipboard paste (Ctrl+V) handler
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              processSelectedFile(file);
              break;
            }
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [selectedCardIndex]);

  const handleApplyUrl = () => {
    if (!imageUrlValue.trim()) return;
    setAvatar(imageUrlValue.trim());
    setImageUrlValue("");
    setShowUrlInput(false);
    setSnackbar({
      open: true,
      message: "Image URL applied! Click 'Save Changes' to update this card.",
      severity: "info",
    });
  };

  // Save current card changes
  const handleSave = () => {
    if (!cards[selectedCardIndex]) return;

    const updatedCard = {
      ...cards[selectedCardIndex],
      name: name.trim() || cards[selectedCardIndex].name,
      title: title.trim() || cards[selectedCardIndex].title,
      quote: quote.trim() || cards[selectedCardIndex].quote,
      avatar: avatar || cards[selectedCardIndex].avatar,
      customAvatar: Boolean(
        avatar &&
        (avatar.startsWith("data:") ||
          avatar.startsWith("http://") ||
          avatar.startsWith("https://"))
      ),
    };

    const updatedList = [...cards];
    updatedList[selectedCardIndex] = updatedCard;

    saveStoredBenefitsCards(updatedList);
    setCards(updatedList);

    setSnackbar({
      open: true,
      message: `Card ${selectedCardIndex + 1} (${updatedCard.name}) updated successfully! Changes are live on the website.`,
      severity: "success",
    });
  };

  // Reset to default
  const handleResetCurrent = () => {
    const defaultCard = DEFAULT_BENEFITS_CARDS[selectedCardIndex];
    if (defaultCard) {
      setName(defaultCard.name);
      setTitle(defaultCard.title);
      setQuote(defaultCard.quote);
      setAvatar(defaultCard.avatar);

      const updatedList = [...cards];
      updatedList[selectedCardIndex] = { ...defaultCard };
      saveStoredBenefitsCards(updatedList);
      setCards(updatedList);

      setSnackbar({
        open: true,
        message: `Card ${selectedCardIndex + 1} reset to default values.`,
        severity: "info",
      });
    }
  };

  const handleResetAll = () => {
    const defaults = resetStoredBenefitsCards();
    setCards(defaults);
    const first = defaults[selectedCardIndex] || defaults[0];
    setName(first.name);
    setTitle(first.title);
    setQuote(first.quote);
    setAvatar(first.avatar);

    setSnackbar({
      open: true,
      message: "All 5 cards reset to default values.",
      severity: "info",
    });
  };

  const currentCard = cards[selectedCardIndex] || {};

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh" }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "12px",
              backgroundColor: "rgba(202, 0, 25, 0.12)",
              color: "#CA0019",
            }}
          >
            <Diversity3Icon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Community - Benefits You will Get
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Edit the 5 cards (Description, Name, Designation, and Photo) shown in the community benefits carousel.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* 5 Card Selector Tabs */}
      <Card
        sx={{
          mb: 3.5,
          borderRadius: "14px",
          backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ p: 2, pb: 0, borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Select Card to Edit:
            </Typography>
            <Chip label="5 Cards Fixed" size="small" sx={{ fontWeight: 600, bgcolor: "rgba(202,0,25,0.1)", color: "#CA0019" }} />
          </Stack>

          <Tabs
            value={selectedCardIndex}
            onChange={(e, val) => setSelectedCardIndex(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
              },
              "& .Mui-selected": {
                color: "#CA0019 !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#CA0019",
              },
            }}
          >
            {cards.map((c, idx) => (
              <Tab
                key={c.id || idx}
                label={`Card ${idx + 1}: ${c.name || "Member"}`}
              />
            ))}
          </Tabs>
        </Box>
      </Card>

      {/* Main Grid: Form Editor on Left, Live Preview on Right */}
      <Grid container spacing={3}>
        {/* Left: Card Editor */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: "16px",
              p: 3,
              backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
              border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
              Edit Card {selectedCardIndex + 1} Data
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="Member Name"
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kumar Sujal"
                helperText="Name displayed on the card footer"
              />

              <TextField
                label="Designation / Role"
                fullWidth
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Technical Lead, Graphics Lead"
                helperText="Title/role displayed under the member's name"
              />

              {/* Photo Upload Area */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Member Photo
                </Typography>
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    p: 2,
                    borderRadius: "12px",
                    border: isDragging
                      ? "2px dashed #CA0019"
                      : isDarkMode
                      ? "1px dashed rgba(255,255,255,0.2)"
                      : "1px dashed rgba(0,0,0,0.15)",
                    backgroundColor: isDragging
                      ? "rgba(202, 0, 25, 0.08)"
                      : isDarkMode
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(0,0,0,0.02)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Dedicated hidden file input WITHOUT accept attribute to prevent Windows Explorer freezing */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileInputChange}
                  />

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: "rgba(0,0,0,0.1)",
                        flexShrink: 0,
                        cursor: "pointer",
                        border: "2px solid #CA0019",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "scale(1.08)" },
                      }}
                      title="Click to browse photo"
                    >
                      <img
                        src={avatar}
                        alt={name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Button
                          variant="contained"
                          onClick={() => fileInputRef.current?.click()}
                          startIcon={<CloudUploadIcon />}
                          size="small"
                          sx={{
                            backgroundColor: "#CA0019",
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "8px",
                            "&:hover": { backgroundColor: "#a60014" },
                          }}
                        >
                          Upload Photo
                        </Button>

                        <Button
                          variant="text"
                          size="small"
                          onClick={() => setShowUrlInput((prev) => !prev)}
                          sx={{
                            color: "#CA0019",
                            textTransform: "none",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                          }}
                        >
                          {showUrlInput ? "Hide URL" : "Enter Image URL"}
                        </Button>
                      </Stack>

                      <Typography variant="caption" display="block" color="text.secondary">
                        Drag & drop photo, paste (Ctrl+V), or click to upload
                      </Typography>
                    </Box>
                  </Box>

                  {/* URL Input */}
                  {showUrlInput && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="https://example.com/avatar.jpg"
                        value={imageUrlValue}
                        onChange={(e) => setImageUrlValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyUrl();
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleApplyUrl}
                        disabled={!imageUrlValue.trim()}
                        sx={{
                          borderColor: "#CA0019",
                          color: "#CA0019",
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Apply
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Box>

              {/* Description / Quote */}
              <TextField
                label="Description / Quote"
                fullWidth
                multiline
                rows={5}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Enter member's testimonial and experience..."
                helperText="Main testimonial text displayed inside the card"
              />

              {/* Actions */}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<RestartAltIcon />}
                  onClick={handleResetCurrent}
                  sx={{ textTransform: "none", borderRadius: "10px" }}
                >
                  Reset This Card
                </Button>

                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    backgroundColor: "#CA0019",
                    color: "#fff",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 3,
                    "&:hover": { backgroundColor: "#a60014" },
                  }}
                >
                  Save Changes
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Right: Live Preview */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: "16px",
              p: 3,
              backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
              border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <VisibilityIcon sx={{ color: "#CA0019", fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Live Card Preview
                </Typography>
              </Stack>

              {/* Toggle preview style */}
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant={previewTheme === "red" ? "contained" : "outlined"}
                  onClick={() => setPreviewTheme("red")}
                  sx={{
                    fontSize: "0.75rem",
                    textTransform: "none",
                    backgroundColor: previewTheme === "red" ? "#CA0019" : "transparent",
                    borderColor: "#CA0019",
                    color: previewTheme === "red" ? "#fff" : "#CA0019",
                    "&:hover": {
                      backgroundColor: previewTheme === "red" ? "#a60014" : "rgba(202,0,25,0.08)",
                    },
                  }}
                >
                  Active (Red)
                </Button>
                <Button
                  size="small"
                  variant={previewTheme === "light" ? "contained" : "outlined"}
                  onClick={() => setPreviewTheme("light")}
                  sx={{
                    fontSize: "0.75rem",
                    textTransform: "none",
                    backgroundColor: previewTheme === "light" ? "#333" : "transparent",
                    color: previewTheme === "light" ? "#fff" : "inherit",
                  }}
                >
                  Side Card
                </Button>
              </Stack>
            </Stack>

            {/* Rendered Preview Card exactly matching the public layout */}
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "420px",
                  borderRadius: "20px",
                  p: 3.5,
                  minHeight: "360px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow:
                    previewTheme === "red"
                      ? "0 20px 40px -15px rgba(202, 0, 25, 0.4)"
                      : "0 10px 30px rgba(0,0,0,0.08)",
                  background:
                    previewTheme === "red"
                      ? "linear-gradient(135deg, #CA0019 0%, #A00014 100%)"
                      : isDarkMode
                      ? "#242424"
                      : "#ffffff",
                  color:
                    previewTheme === "red"
                      ? "#ffffff"
                      : isDarkMode
                      ? "#ffffff"
                      : "#1f2937",
                  border:
                    previewTheme === "red"
                      ? "none"
                      : isDarkMode
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Quote */}
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                    opacity: previewTheme === "red" ? 0.95 : 0.85,
                    mb: 3,
                  }}
                >
                  "{quote || "Enter testimonial description..."}"
                </Typography>

                {/* Footer with avatar and name */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, pt: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid #ffffff",
                      flexShrink: 0,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <img
                      src={avatar}
                      alt={name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        color:
                          previewTheme === "red"
                            ? "#ffffff"
                            : isDarkMode
                            ? "#ffffff"
                            : "#111827",
                      }}
                    >
                      {name || "Member Name"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.82rem",
                        color:
                          previewTheme === "red"
                            ? "rgba(255,255,255,0.8)"
                            : "text.secondary",
                      }}
                    >
                      {title || "Designation"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="center">
              <Button
                variant="text"
                color="inherit"
                size="small"
                onClick={handleResetAll}
                sx={{ textTransform: "none", color: "text.secondary", fontSize: "0.8rem" }}
              >
                Reset All 5 Cards to Initial Community Defaults
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "10px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CoordinatorCommunity;
