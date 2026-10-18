/**
 * @file TableSkeleton.jsx
 * @description Flexible data table skeleton preserving row height and column geometry without layout shift.
 */

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import BaseSkeleton from "./BaseSkeleton";

/**
 * TableSkeleton
 * @param {Object} props
 * @param {number} [props.rows=6]
 * @param {number} [props.columns=5]
 * @param {boolean} [props.hasAvatar=true]
 * @param {boolean} [props.hasActions=true]
 * @param {boolean} [props.insideTable=false] - Whether to render TableRows only (for embedding in existing TableBody)
 */
const TableSkeleton = ({
  rows = 6,
  columns = 5,
  hasAvatar = true,
  hasActions = true,
  insideTable = false,
}) => {
  const rowList = Array.from({ length: rows });
  const colList = Array.from({ length: columns });

  const renderRow = (rowIdx) => (
    <TableRow key={rowIdx} sx={{ height: 64 }}>
      {colList.map((_, colIdx) => {
        // First column: avatar + name
        if (colIdx === 0 && hasAvatar) {
          return (
            <TableCell key={colIdx}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <BaseSkeleton variant="circular" width={36} height={36} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <BaseSkeleton variant="text" width={110} height={20} />
                  <BaseSkeleton variant="text" width={70} height={14} />
                </Box>
              </Box>
            </TableCell>
          );
        }

        // Last column: action button skeletons
        if (colIdx === columns - 1 && hasActions) {
          return (
            <TableCell key={colIdx} align="right">
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <BaseSkeleton variant="circular" width={28} height={28} />
                <BaseSkeleton variant="circular" width={28} height={28} />
              </Box>
            </TableCell>
          );
        }

        // Middle column status pill (e.g., column 3 or 4)
        if (colIdx === columns - 2) {
          return (
            <TableCell key={colIdx}>
              <BaseSkeleton variant="rounded" width={75} height={24} sx={{ borderRadius: "12px" }} />
            </TableCell>
          );
        }

        // Generic text cell
        return (
          <TableCell key={colIdx}>
            <BaseSkeleton variant="text" width={`${55 + ((rowIdx * 13 + colIdx * 17) % 35)}%`} height={20} />
          </TableCell>
        );
      })}
    </TableRow>
  );

  if (insideTable) {
    return <>{rowList.map((_, idx) => renderRow(idx))}</>;
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "action.hover", height: 52 }}>
            {colList.map((_, idx) => (
              <TableCell key={idx}>
                <BaseSkeleton variant="text" width={80} height={20} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{rowList.map((_, idx) => renderRow(idx))}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSkeleton;
