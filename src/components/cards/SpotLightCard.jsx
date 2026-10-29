/**
 * @file SpotLightCard.jsx
 * @description Dynamic cursor-tracking spotlight card that projects a smooth radial glow following mouse movement.
 * @architecture Used to wrap interactive cards or call-to-action blocks to provide modern micro-interactions.
 * @agent_note Calculates relative coordinates via `getBoundingClientRect()`. Fades in/out on enter/leave and respects focus/blur events for keyboard accessibility.
 */

import { useRef, useState } from "react";

/**
 * @component SpotlightCard
 * @description Interactive wrapper card that renders an animated radial gradient glow centered at the user's cursor position.
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child elements rendered inside the spotlight container
 * @param {string} [props.className=""] - Additional CSS class names for outer container customization
 * @param {string} [props.spotlightColor="rgb(255,190,190,0.25)"] - CSS color string for radial gradient center
 * @state {boolean} isFocused - Whether the element currently has keyboard focus
 * @state {{x: number, y: number}} position - Current cursor position relative to the container boundary
 * @state {number} opacity - Current opacity of the spotlight overlay (0 to 0.6)
 */
const SpotlightCard = ({ children, className = "", spotlightColor = "rgb(255,190,190,0.25)" }) => {
    const divRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    /**
     * @desc Updates the local cursor coordinate state relative to card bounding rect.
     * @param {React.MouseEvent<HTMLDivElement>} e - Mouse move event
     */
    const handleMouseMove = (e) => {
        if (!divRef.current || isFocused) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    /**
     * @desc Activates spotlight overlay on focus.
     */
    const handleFocus = () => {
        setIsFocused(true);
        setOpacity(0.6);
    };

    /**
     * @desc Deactivates spotlight overlay on blur.
     */
    const handleBlur = () => {
        setIsFocused(false);
        setOpacity(0);
    };

    /**
     * @desc Shows spotlight on mouse enter.
     */
    const handleMouseEnter = () => {
        setOpacity(0.6);
    };

    /**
     * @desc Hides spotlight on mouse leave.
     */
    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative w-full rounded-3xl bg-white overflow-hidden p-8 shadow-slate-200 shadow-lg ${className}`}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
                style={{
                    opacity,
                    background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 50%)`,
                }}
            />
            {children}
        </div>
    );
};

export default SpotlightCard;
