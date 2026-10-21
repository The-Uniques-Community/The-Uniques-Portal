/**
 * @file ModernTable.jsx
 * @description Standard table with integrated sticky headers, skeleton loaders,
 * optional toolbar slot, and integrated DataTablePagination.
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { TableSkeleton } from "@/components/common/skeletons";
import DataTablePagination from "@/components/common/pagination/DataTablePagination";

const ModernTable = ({
  title,
  description,
  columns,
  data = [],
  renderRow,
  containerStyles = {},
  loading = false,
  skeletonRows = 6,
  toolbar = null,
  headerAction = null,
  pagination = null,
  emptyMessage = "No records found",
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
      {(title || description || headerAction) && (
        <Box
          sx={{
            p: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box>
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
          {headerAction && <Box>{headerAction}</Box>}
        </Box>
      )}

      {toolbar && (
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          {toolbar}
        </Box>
      )}

      <TableContainer
        className="hide-scrollbar"
        sx={{
          maxHeight: 560,
          overflowX: "auto",
          overflowY: "auto",
          maxWidth: "100%",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
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
            ) : !Array.isArray(data) || data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{ py: 6, px: 2, textAlign: "center" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row._id || row.id || index}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {renderRow(row, index)}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <DataTablePagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          pages={pagination.pages}
          onPageChange={pagination.onPageChange}
          onLimitChange={pagination.onLimitChange}
          loading={loading}
        />
      )}
    </Paper>
  );
};

ModernTable.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(["left", "center", "right"]),
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      headerStyles: PropTypes.object,
    })
  ).isRequired,
  data: PropTypes.array,
  renderRow: PropTypes.func.isRequired,
  containerStyles: PropTypes.object,
  loading: PropTypes.bool,
  skeletonRows: PropTypes.number,
  toolbar: PropTypes.node,
  headerAction: PropTypes.node,
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onLimitChange: PropTypes.func,
  }),
  emptyMessage: PropTypes.string,
};

export default ModernTable;
