/**
 * @file HoverCard.jsx
 * @description Interactive accordion card featuring expanding columns on mouse hover with animated rotated text labels.
 * @architecture Used as an eye-catching interactive showcase component on landing or promotional pages.
 * @agent_note Uses flex-grow transitions (`hover:flex-[4]`) and CSS rotation transforms (`rotate-[-90deg]` to `group-hover:rotate-0`).
 */

import React from "react";

/**
 * @component HoverCard
 * @description Renders a dark-themed card containing 3 interactive vertical accordion panels that expand on hover.
 * @state None - CSS transition-driven interaction
 */
const HoverCard = () => {
  return (
    <div className="flex gap-1.5 p-1.5 w-[210px] h-[254px] rounded-md bg-[#212121]">
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="flex group flex-1 h-full cursor-pointer rounded-sm border border-[#ff5a91] bg-[#212121] transition-all duration-500 ease-in-out hover:flex-[4] items-center justify-center overflow-hidden"
          >
            <span className="text-[#ff568e] uppercase tracking-wide min-w-[14em] px-2 rotate-[-90deg] transition-all duration-500 group-hover:rotate-0 text-center">
              Hover Me
            </span>
          </div>
        ))}
    </div>
  );
};

export default HoverCard;
