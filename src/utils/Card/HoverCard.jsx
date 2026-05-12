import React from "react";

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
