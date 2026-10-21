/**
 * @file SearchFilterBar.jsx
 * @description Debounced search input toolbar with clear button, loading indicator, and slots for filter selects.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stack,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export const SearchFilterBar = ({
  search = '',
  onSearchChange,
  placeholder = 'Search by name, email, or keyword...',
  loading = false,
  filterSlot = null,
  actionSlot = null,
  sx = {},
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        mb: 2.5,
        ...sx,
      }}
    >
      <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 280 } }}>
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress size={16} sx={{ mr: 0.5 }} />
                ) : search ? (
                  <IconButton
                    size="small"
                    onClick={() => onSearchChange('')}
                    edge="end"
                    aria-label="clear search"
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                ) : null}
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#fcfcfc',
            },
          }}
        />
      </Box>

      {(filterSlot || actionSlot) && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          flexWrap="wrap"
        >
          {filterSlot}
          {actionSlot}
        </Stack>
      )}
    </Box>
  );
};

SearchFilterBar.propTypes = {
  search: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  loading: PropTypes.bool,
  filterSlot: PropTypes.node,
  actionSlot: PropTypes.node,
  sx: PropTypes.object,
};

export default SearchFilterBar;
