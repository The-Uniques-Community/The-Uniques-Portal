import React from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
} from "@mui/material";

const ModernTable = ({
  title,
  description,
  columns,
  data,
  renderRow,
  containerStyles = {},
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        ...containerStyles,
      }}
    >
      {/* Table Header Section */}
      {(title || description) && (
        <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
          {title && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "16px",
                color: "text.primary",
              }}
            >
              {title}
            </Typography>
          )}
          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontSize: "13px" }}
            >
              {description}
            </Typography>
          )}
        </Box>
      )}

      {/* Structured Content Grid Container */}
      <TableContainer sx={{ maxHeight: 520 }}>
        <Table stickyHeader size="small">
          <TableHead
            sx={{
              "& .MuiTableCell-head": {
                bgcolor: "action.hover",
                color: "text.primary",
                borderBottom: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{
                    fontWeight: 800,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    py: 1.5,
                    width: col.width,
                    ...col.headerStyles,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={row._id || index}
                hover
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  transition: "background-color 0.15s ease",
                }}
              >
                {renderRow(row)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ModernTable;
