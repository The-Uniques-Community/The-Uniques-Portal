/**
 * @file CommunityModal.jsx
 * @description Generic lightweight dialog modal overlay with close button, title banner, and arbitrary children/content rendering.
 * @architecture Used in community views and public sections for pop-up announcements, guidelines, and message dialogues.
 * @agent_note Returns `null` when `isOpen` is falsy. Handles backdrop overlay with `fixed inset-0 bg-black bg-opacity-50 z-50`.
 */

import React from 'react';

/**
 * @component Modal
 * @description Renders a centered modal dialog box with backdrop blur and header close action.
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Controls visibility of the modal dialog
 * @param {Function} props.onClose - Callback invoked when the close 'X' button is clicked
 * @param {string} props.title - Title header text for modal
 * @param {React.ReactNode} props.content - Body content or elements to display inside modal
 * @state None - Controlled presentation component
 */
const Modal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-[#212B36]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="text-[#383838]">
                    {content}
                </div>
            </div>
        </div>
    );
};

export default Modal;
