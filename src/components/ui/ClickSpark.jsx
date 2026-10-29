/**
 * @file ClickSpark.jsx
 * @description Interactive canvas particle wrapper that emits radiating spark lines whenever the user clicks within the container.
 * @architecture Used to wrap interactive buttons, cards, or hero sections to add playful micro-animations.
 * @agent_note Automatically syncs canvas resolution via `ResizeObserver` and pauses animation when the browser tab is hidden to conserve GPU/CPU cycles.
 */

import { useRef, useEffect, useCallback } from "react";

/**
 * @component ClickSpark
 * @description Canvas-based particle effect that explodes custom spark particles radially from the mouse click coordinate.
 * @param {Object} props - Component properties
 * @param {string} [props.sparkColor="#fff"] - Stroke color of the sparks
 * @param {number} [props.sparkSize=10] - Initial length of each spark streak
 * @param {number} [props.sparkRadius=15] - Distance sparks travel from origin point
 * @param {number} [props.sparkCount=8] - Number of radial spark lines generated per click
 * @param {number} [props.duration=400] - Duration of the spark animation in milliseconds
 * @param {"linear"|"ease-in"|"ease-in-out"|"ease-out"} [props.easing="ease-out"] - Easing curve algorithm
 * @param {number} [props.extraScale=1.0] - Distance scale multiplier
 * @param {React.ReactNode} props.children - Child elements enclosed within the sparkable region
 * @state Manages particle lists (`sparksRef`), animation frame handles, and canvas resizing
 */
const ClickSpark = ({
    sparkColor = "#fff",
    sparkSize = 10,
    sparkRadius = 15,
    sparkCount = 8,
    duration = 400,
    easing = "ease-out",
    extraScale = 1.0,
    children
}) => {
    const canvasRef = useRef(null);
    const sparksRef = useRef([]);
    const startTimeRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        if (!parent) return;

        let resizeTimeout;

        const resizeCanvas = () => {
            const { width, height } = parent.getBoundingClientRect();
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
        };

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };

        const ro = new ResizeObserver(handleResize);
        ro.observe(parent);

        resizeCanvas();

        return () => {
            ro.disconnect();
            clearTimeout(resizeTimeout);
        };
    }, []);

    /**
     * @desc Easing interpolation function mapping linear progress (0-1) to an eased value.
     * @param {number} t - Normalized progress [0, 1]
     * @returns {number} Eased progress multiplier
     */
    const easeFunc = useCallback(
        (t) => {
            switch (easing) {
                case "linear":
                    return t;
                case "ease-in":
                    return t * t;
                case "ease-in-out":
                    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                default:
                    return t * (2 - t);
            }
        },
        [easing]
    );

    const isAnimatingRef = useRef(false);
    const animFrameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const draw = (timestamp) => {
            if (document.hidden) {
                isAnimatingRef.current = false;
                return;
            }

            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            sparksRef.current = sparksRef.current.filter((spark) => {
                const elapsed = timestamp - spark.startTime;
                if (elapsed >= duration) {
                    return false;
                }

                const progress = elapsed / duration;
                const eased = easeFunc(progress);

                const distance = eased * sparkRadius * extraScale;
                const lineLength = sparkSize * (1 - eased);

                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

                ctx.strokeStyle = sparkColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                return true;
            });

            if (sparksRef.current.length > 0) {
                animFrameRef.current = requestAnimationFrame(draw);
            } else {
                isAnimatingRef.current = false;
                startTimeRef.current = null;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        const startAnimation = () => {
            if (isAnimatingRef.current) return;
            isAnimatingRef.current = true;
            startTimeRef.current = null;
            animFrameRef.current = requestAnimationFrame(draw);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (animFrameRef.current) {
                    cancelAnimationFrame(animFrameRef.current);
                }
                isAnimatingRef.current = false;
            } else if (sparksRef.current.length > 0) {
                startAnimation();
            }
        };

        // Expose startAnimation to canvas container
        canvas.__startSparkAnimation = startAnimation;
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
            isAnimatingRef.current = false;
        };
    }, [
        sparkColor,
        sparkSize,
        sparkRadius,
        sparkCount,
        duration,
        easeFunc,
        extraScale,
    ]);

    /**
     * @desc Spawns a burst of spark particles radiating out from the click coordinate.
     * @param {React.MouseEvent<HTMLDivElement>} e - Click event
     */
    const handleClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const now = performance.now();
        const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
            x,
            y,
            angle: (2 * Math.PI * i) / sparkCount,
            startTime: now,
        }));

        sparksRef.current.push(...newSparks);
        if (canvas.__startSparkAnimation) {
            canvas.__startSparkAnimation();
        }
    };

    return (
        <div className="relative w-full h-full" onClick={handleClick} >
            <canvas
                ref={canvasRef}
                className="w-full z-[9999] h-full block absolute top-0 left-0 select-none pointer-events-none"
            />
            {children}
        </div>
    );
};

export default ClickSpark;
