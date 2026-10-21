/**
 * @file AsyncMemberSearch.jsx
 * @description Debounced server-side Autocomplete for member selection.
 * Replaces unbounded /api/admin/member queries in dialogs.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import memberService from '@/services/memberService';

export const AsyncMemberSearch = ({
  value = null,
  onChange,
  label = 'Select Member',
  placeholder = 'Type member name, admno, or email...',
  excludeIds = [],
  disabled = false,
  size = 'small',
  error = false,
  helperText = '',
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchMatchingMembers = async () => {
      setLoading(true);
      try {
        const response = await memberService.getAdminMembers({
          search: inputValue.trim(),
          limit: 20,
          signal: controller.signal,
        });

        if (active) {
          const list = response?.data || response?.members || [];
          const filtered = list.filter((m) => !excludeIds.includes(m._id || m.id));
          setOptions(filtered);
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Failed to search members:', err);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchMatchingMembers();
    }, 300);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [inputValue, excludeIds]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      options={options}
      loading={loading}
      disabled={disabled}
      isOptionEqualToValue={(option, val) => (option._id || option.id) === (val._id || val.id)}
      getOptionLabel={(option) => option.fullName || option.name || ''}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option._id || option.id} sx={{ gap: 1.5, py: 1 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
            {option.fullName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {option.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.email} {option.admno ? `• ${option.admno}` : ''} {option.batch ? `• ${option.batch}` : ''}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          size={size}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

AsyncMemberSearch.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  excludeIds: PropTypes.arrayOf(PropTypes.string),
  disabled: PropTypes.bool,
  size: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
};

export default AsyncMemberSearch;
