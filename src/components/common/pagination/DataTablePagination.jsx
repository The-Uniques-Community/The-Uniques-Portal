/**
 * @file DataTablePagination.jsx
 * @description Standard MUI pagination toolbar with record range counter, rows per page, and page buttons.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Pagination,
  Stack,
  useTheme,
  FormControl,
} from '@mui/material';

export const DataTablePagination = ({
  page = 1,
  limit = 10,
  total = 0,
  pages = 1,
  onPageChange,
  onLimitChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  loading = false,
  sx = {},
}) => {
  const theme = useTheme();

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  const handlePageChange = (event, newPage) => {
    if (onPageChange && newPage !== page) {
      onPageChange(newPage);
    }
  };

  const handleRowsChange = (event) => {
    if (onLimitChange) {
      onLimitChange(Number(event.target.value));
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3 },
        py: 1.5,
        gap: { xs: 2, sm: 1 },
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : '#fafafa',
        ...sx,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontSize: '13px',
          fontWeight: 500,
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        {total > 0
          ? `Showing ${startRecord}–${endRecord} of ${total} records`
          : 'No records found'}
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
            Rows per page:
          </Typography>
          <FormControl size="small" variant="outlined">
            <Select
              value={limit}
              onChange={handleRowsChange}
              disabled={loading}
              sx={{
                fontSize: '13px',
                height: 32,
                '& .MuiSelect-select': { py: 0.5, px: 1 },
              }}
            >
              {rowsPerPageOptions.map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: '13px' }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Pagination
          count={Math.max(1, pages)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
          size="small"
          showFirstButton
          showLastButton
          disabled={loading || total === 0}
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
            },
          }}
        />
      </Stack>
    </Box>
  );
};

DataTablePagination.propTypes = {
  page: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  loading: PropTypes.bool,
  sx: PropTypes.object,
};

export default DataTablePagination;
