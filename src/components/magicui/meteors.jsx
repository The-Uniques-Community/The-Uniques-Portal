/**
 * @file meteors.jsx
 * @description MagicUI animated meteor shower effect generating angled shooting star streaks with glowing fading tails.
 * @architecture Used in hero backgrounds, futuristic cards, or celebratory sections to provide dynamic ambiance.
 * @agent_note Relies on Tailwind CSS keyframe animation `animate-meteor` and CSS variable `--angle` for custom trajectory angles.
 */

"use client";;
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

/**
 * @component Meteors
 * @description Generates random animated meteor trails falling across the container at a specified angle.
 * @param {Object} props - Component properties
 * @param {number} [props.number=20] - Number of meteor streaks to generate
 * @param {number} [props.minDelay=0.2] - Minimum delay before animation start in seconds
 * @param {number} [props.maxDelay=1.2] - Maximum delay before animation start in seconds
 * @param {number} [props.minDuration=2] - Minimum animation travel duration in seconds
 * @param {number} [props.maxDuration=10] - Maximum animation travel duration in seconds
 * @param {number} [props.angle=215] - Falling trajectory angle in degrees
 * @param {string} [props.className] - Additional CSS class names applied to meteor head
 * @state {Array<Object>} meteorStyles - Generated randomized position, delay, and duration inline style objects
 */
export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className
}) => {
  const [meteorStyles, setMeteorStyles] = useState([]);

  useEffect(() => {
    const styles = [...new Array(number)].map(() => ({
      "--angle": angle + "deg",
      top: -5,
      left: `calc(-50% + ${Math.floor(Math.random() * window.innerWidth)}px)`,
      animationDelay: Math.random() * (maxDelay - minDelay) + minDelay + "s",
      animationDuration:
        Math.floor(Math.random() * (maxDuration - minDuration) + minDuration) +
        "s",
    }));
    setMeteorStyles(styles);
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle]);

  return (
    <>
      {[...meteorStyles].map((style, idx) => (
        // Meteor Head
        (<span
          key={idx}
          style={{ ...style }}
          className={cn(
            "pointer-events-none absolute size-0.5 rotate-[var(--angle)] animate-meteor rounded-full bg-red-500 shadow-[0_0_0_1px_#ffffff10]",
            className
          )}>
          {/* Meteor Tail */}
          <div
            className="pointer-events-none absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-red-500 to-transparent" />
        </span>)
      ))}
    </>
  );
};
