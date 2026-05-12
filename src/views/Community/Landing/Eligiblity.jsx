import React from 'react';
import SpotlightCard from '@/utils/Card/SpotLightCard';
import profileImg from '@/assets/img/Community/Sample1.png';

const SevenCardsLayout = () => {
    return (
        <div>
            <h2 className="text-center text-5xl font-bold my-24">
                <span className="text-gray-900">Exciting </span>
                <span className="text-[#ca0019]">Perks </span>
                <span className="text-gray-900">for You</span>
            </h2>
            <div className="container mx-auto flex items-center justify-center">
                <div className="grid w-full rounded-xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

                    <div className="relative flex items-center justify-center">
                        <SpotlightCard spotlightColor="rgba(191, 0, 0, 0.50)">
                            <span className="relative text-gray-200 text-7xl font-bold z-0 select-none">01</span>
                            <div className="relative z-10 w-full rounded-xl h-auto p-4 flex flex-col">
                                <h3 className="font-bold text-lg">Exclusive Events</h3>
                                <p className="text-sm mt-1">Get access to members-only workshops, webinars, and meetups.</p>
                            </div>
                        </SpotlightCard>
                    </div>

                    <div />

                    <div className="relative flex items-center justify-center">
                        <SpotlightCard spotlightColor="rgba(191, 0, 0, 0.50)">
                            <span className="relative text-gray-200 text-7xl font-bold z-0 select-none">02</span>
                            <div className="relative z-10 w-full rounded-xl h-auto p-4 flex flex-col">
                                <h3 className="font-bold text-lg">Networking</h3>
                                <p className="text-sm mt-1">Connect with industry experts, mentors, and like-minded peers.</p>
                            </div>
                        </SpotlightCard>
                    </div>

                    <div className="relative flex items-center justify-center">
                        <span className="absolute text-[#ca0019] text-8xl right-14 font-bold z-0 select-none">03</span>
                    </div>

                    <div className="relative flex items-center justify-center">
                        <SpotlightCard spotlightColor="rgba(191, 0, 0, 0.50)">
                            <span className="relative text-gray-200 text-7xl font-bold z-0 select-none">04</span>
                            <div className="relative z-10 w-full rounded-xl h-auto p-4 flex flex-col">
                                <h3 className="font-bold text-lg">Skill Development</h3>
                                <p className="text-sm mt-1">Participate in hands-on projects and learning opportunities.</p>
                            </div>
                        </SpotlightCard>
                    </div>

                    <div className="relative flex items-center justify-center">
                        <span className="absolute text-[#ca0019] text-8xl left-14 font-bold z-0 select-none">05</span>
                    </div>

                    <div className="relative flex items-center justify-center">
                        <SpotlightCard spotlightColor="rgba(191, 0, 0, 0.50)">
                            <span className="relative text-gray-200 text-7xl font-bold z-0 select-none">06</span>
                            <div className="relative z-10 w-full rounded-xl h-auto p-4 flex flex-col">
                                <h3 className="font-bold text-lg">Recognition</h3>
                                <p className="text-sm mt-1">Get featured on our platforms and earn rewards for contributions.</p>
                            </div>
                        </SpotlightCard>
                    </div>

                    <div />

                    <div className="relative flex items-center justify-center">
                        <SpotlightCard spotlightColor="rgba(191, 0, 0, 0.50)">
                            <span className="relative text-gray-200 text-7xl font-bold z-0 select-none">07</span>
                            <div className="relative z-10 w-full rounded-xl h-auto p-4 flex flex-col">
                                <h3 className="font-bold text-lg">Exclusive Merchandise</h3>
                                <p className="text-sm mt-1">Receive branded goodies, T-shirts, and special gifts.</p>
                            </div>
                        </SpotlightCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SevenCardsLayout;
