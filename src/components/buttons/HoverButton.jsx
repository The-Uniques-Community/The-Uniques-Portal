/**
 * @file HoverButton.jsx
 * @description Morphing "Learn More" call-to-action button with animated circular background expansion on hover.
 * @architecture Used in marketing sections and landing cards for secondary exploration prompts.
 * @agent_note Default export is named `LearnMoreButton`. Handles local hover state to expand circle to full width button with brand red fill.
 */

import { useState } from "react";

/**
 * @component LearnMoreButton
 * @description Animated interactive button that morphs a circular icon pill into a full-width colored background on hover.
 * @param {Object} props - Component properties
 * @param {Function} [props.onClick] - Click handler callback
 * @state {boolean} hovered - Tracks mouse hover state to trigger morphing expansion transition
 */
export default function LearnMoreButton({onClick}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className="relative flex items-center w-44 h-10 bg-transparent border-0 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <span
        className={`relative flex w-10 h-10 rounded-full transition-all duration-500 ease-out ${hovered ? 'w-full items-center justify-end pr-4 bg-[#ca0019]' : 'w-10 items-center justify-center bg-black'}`}
      >
        <span
          className="absolute w-2 h-2 border-t-2 border-r-2 border-white transform rotate-45"
        ></span>
      </span>
      <span
        className={`absolute left-14 text-sm font-bold uppercase transition-all duration-500 ease-out ${hovered ? 'text-white' : 'text-black'}`}
      >
        Learn More
      </span>
    </button>
  );
}
