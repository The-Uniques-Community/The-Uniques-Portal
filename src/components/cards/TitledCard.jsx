/**
 * @file TitledCard.jsx
 * @description 3D physics-based tilt image card powered by Framer Motion springs, featuring cursor-following tooltip caption and layered 3D depth.
 * @architecture Used for rich media showcases and featured projects with 3D perspective transforms.
 * @agent_note Implements CSS 3D transforms (`[perspective:800px]`, `preserve-3d`, `translateZ`) coupled with Framer Motion spring values.
 */

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * @desc Framer Motion physics spring configuration constants for realistic momentum and damping.
 */
const springValues = {
    damping: 30,
    stiffness: 100,
    mass: 2,
};

/**
 * @component TiltedCard
 * @description Renders a 3D tilting card responding to mouse trajectory with smooth spring physics, depth layer, and dynamic floating tooltip.
 * @param {Object} props - Component properties
 * @param {string} props.imageSrc - Source URL of the display image
 * @param {string} [props.altText="Tilted card image"] - Image alternative text description
 * @param {string} [props.captionText=""] - Text displayed inside mouse-following tooltip
 * @param {string} [props.containerHeight="300px"] - Container CSS height
 * @param {string} [props.containerWidth="100%"] - Container CSS width
 * @param {string} [props.imageHeight="300px"] - Inner image CSS height
 * @param {string} [props.imageWidth="300px"] - Inner image CSS width
 * @param {number} [props.scaleOnHover=1.1] - Scale multiplier applied during hover
 * @param {number} [props.rotateAmplitude=14] - Maximum tilt rotation amplitude in degrees
 * @param {boolean} [props.showMobileWarning=true] - Whether to display warning text on small screens
 * @param {boolean} [props.showTooltip=true] - Whether to show the floating figcaption tooltip
 * @param {React.ReactNode} [props.overlayContent=null] - Optional JSX element elevated on the 3D Z-plane
 * @param {boolean} [props.displayOverlayContent=false] - Whether to render overlay content
 * @state {number} lastY - Previous vertical mouse coordinate used to calculate rotational velocity for figcaption
 */
export default function TiltedCard({
    imageSrc,
    altText = "Tilted card image",
    captionText = "",
    containerHeight = "300px",
    containerWidth = "100%",
    imageHeight = "300px",
    imageWidth = "300px",
    scaleOnHover = 1.1,
    rotateAmplitude = 14,
    showMobileWarning = true,
    showTooltip = true,
    overlayContent = null,
    displayOverlayContent = false,
}) {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useMotionValue(0), springValues);
    const rotateY = useSpring(useMotionValue(0), springValues);
    const scale = useSpring(1, springValues);
    const opacity = useSpring(0);
    const rotateFigcaption = useSpring(0, {
        stiffness: 350,
        damping: 30,
        mass: 1,
    });

    const [lastY, setLastY] = useState(0);

    /**
     * @desc Calculates 3D tilt angles and tooltip positions from mouse event coordinates.
     * @param {React.MouseEvent<HTMLElement>} e - Mouse event
     */
    function handleMouse(e) {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;

        const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
        const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

        rotateX.set(rotationX);
        rotateY.set(rotationY);

        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);

        const velocityY = offsetY - lastY;
        rotateFigcaption.set(-velocityY * 0.6);
        setLastY(offsetY);
    }

    /**
     * @desc Resets scale and opacity springs on mouse enter.
     */
    function handleMouseEnter() {
        scale.set(scaleOnHover);
        opacity.set(1);
    }

    /**
     * @desc Restores default upright rotation, scale, and opacity on mouse leave.
     */
    function handleMouseLeave() {
        opacity.set(0);
        scale.set(1);
        rotateX.set(0);
        rotateY.set(0);
        rotateFigcaption.set(0);
    }

    return (
        <figure
            ref={ref}
            className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"
            style={{
                height: containerHeight,
                width: containerWidth,
            }}
            onMouseMove={handleMouse}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {showMobileWarning && (
                <div className="absolute top-4 text-center text-sm block sm:hidden">
                    This effect is not optimized for mobile. Check on desktop.
                </div>
            )}

            <motion.div
                className="relative [transform-style:preserve-3d]"
                style={{
                    width: imageWidth,
                    height: imageHeight,
                    rotateX,
                    rotateY,
                    scale,
                }}
            >
                <motion.img
                    src={imageSrc}
                    alt={altText}
                    className="absolute top-0 left-0 object-cover rounded-[15px] will-change-transform [transform:translateZ(0)]"
                    style={{
                        width: imageWidth,
                        height: imageHeight,
                    }}
                />

                {displayOverlayContent && overlayContent && (
                    <motion.div
                        className="absolute top-0 left-0 z-[2] will-change-transform [transform:translateZ(30px)]"
                    >
                        {overlayContent}
                    </motion.div>
                )}
            </motion.div>

            {showTooltip && (
                <motion.figcaption
                    className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] opacity-0 z-[3] hidden sm:block"
                    style={{
                        x,
                        y,
                        opacity,
                        rotate: rotateFigcaption,
                    }}
                >
                    {captionText}
                </motion.figcaption>
            )}
        </figure>
    );
}
