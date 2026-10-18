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
import { TableSkeleton } from "@/components/common/skeletons";

const ModernTable = ({
  title,
  description,
  columns,
  data = [],
  renderRow,
  containerStyles = {},
  loading = false,
  skeletonRows = 6,
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
      <TableContainer
        className="hide-scrollbar"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        sx={{
          maxHeight: 520,
          overflowY: "auto",
          overscrollBehavior: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none !important",
            width: "0px !important",
            height: "0px !important",
            background: "transparent !important",
          },
        }}
      >
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
            {loading ? (
              <TableSkeleton
                rows={skeletonRows}
                columns={columns.length}
                insideTable={true}
              />
            ) : Array.isArray(data) && data.length > 0 ? (
              data.map((row, index) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 6, color: "text.secondary" }}
                >
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ModernTable;
