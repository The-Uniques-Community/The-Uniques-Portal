import React from "react";
import { useTheme } from "@mui/material/styles";

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
