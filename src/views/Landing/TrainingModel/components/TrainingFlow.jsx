import React from "react";

const steps = [
  {
    step: "01",
    title: "PROFESSIONAL TRAINER",
    subtitle: "Mentor Lead",
    desc: "Industry leaders guiding core technical direction",
  },
  {
    step: "02",
    title: "UNIQUES 1.0",
    subtitle: "The Pioneers",
    desc: "First batch setting standards of excellence",
  },
  {
    step: "03",
    title: "UNIQUES 2.0",
    subtitle: "The Bridge",
    desc: "Translating learning into peer mentorship",
  },
  {
    step: "04",
    title: "UNIQUES 3.0",
    subtitle: "The Future Leaders",
    desc: "Sustaining culture, skills & community growth",
  },
];

const TrainingFlow = () => {
  return (
    <div className="w-full py-8 px-4" aria-label="Training Culture Flow">
      <div className="flex flex-col md:flex-row items-center justify-center max-w-6xl mx-auto">
        {steps.map((item, index) => (
          <React.Fragment key={item.step}>
            {/* Step Circle Card */}
            <div className="relative group flex flex-col items-center">
              <div className="w-44 h-44 sm:w-48 sm:h-48 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full border-2 border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-md group-hover:shadow-xl group-hover:border-[#ca0019] group-hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center p-3 text-center z-10">
                <span className="bg-[#ca0019] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1 shadow-sm tracking-wider">
                  STEP {item.step}
                </span>
                <h4 className="text-xs sm:text-sm md:text-xs lg:text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider leading-tight px-1">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-xs font-semibold text-[#ca0019] mt-1">
                  {item.subtitle}
                </p>
                <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-[130px] leading-tight">
                  {item.desc}
                </p>
              </div>
            </div>

            {/* Connector Arrow (Desktop: Right arrow, Mobile: Down arrow) */}
            {index < steps.length - 1 && (
              <>
                {/* Desktop Arrow */}
                <div className="hidden md:flex items-center justify-center px-1 lg:px-3 text-[#ca0019] flex-shrink-0 animate-pulse">
                  <svg
                    className="w-6 h-6 lg:w-8 lg:h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>

                {/* Mobile Connector */}
                <div className="md:hidden flex items-center justify-center my-3 text-[#ca0019] animate-pulse">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M7 11l5 5m0 0l5-5m-5 5V4"
                    />
                  </svg>
                </div>
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TrainingFlow;
