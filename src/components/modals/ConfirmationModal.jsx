/**
 * @file ConfirmationModal.jsx
 * @description Theme-aware confirmation prompt modal for destructive or critical actions (e.g., deletion, state revocation).
 * @architecture Used across administration, member management, and settings views before executing irreversible operations.
 * @agent_note Operates at extreme z-index (`z-[10000000]`) with backdrop blur to ensure it renders above all drawers and tables. Supports dark mode palette adaptation.
 */

import React from "react";
import { useTheme } from "@mui/material/styles";

/**
 * @component ConfirmationModal
 * @description Renders a themed confirmation dialog prompt with cancel and red confirm action buttons.
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether the confirmation prompt is active
 * @param {Function} props.onClose - Callback triggered when the user cancels or closes the dialog
 * @param {Function} props.onConfirm - Callback triggered when the user confirms the action
 * @param {string} props.message - Descriptive text explaining the action being confirmed
 * @state None - Controlled component reading MUI theme mode
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[10000000] flex items-center justify-center backdrop-blur-sm">
      <div 
        style={{ 
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderColor: theme.palette.divider 
        }}
        className="p-6 rounded-lg shadow-2xl border max-w-sm w-full mx-4"
      >
        <h3 className="text-lg font-semibold mb-6">{message}</h3>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            style={{ 
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
              color: theme.palette.text.primary
            }}
            className="px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ 
              backgroundColor: "#ca0019"
            }}
            className="px-4 py-2 text-white rounded font-medium hover:opacity-90 transition-opacity"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
