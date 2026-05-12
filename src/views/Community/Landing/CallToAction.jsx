import { useState } from 'react';
import DoubleQuotes from '@/assets/img/Community/Sample1.png';
import ApplicationForm from '@/components/ApplicationForm';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default function Example() {
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isLearnMoreModalOpen, setIsLearnMoreModalOpen] = useState(false);

    const benefits = (
        <div className="space-y-4 text-gray-600">
            <h3 className="text-xl font-semibold text-gray-900">Benefits of being a Campus Ambassador:</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li>Official certification and recognition</li>
                <li>Exclusive networking opportunities</li>
                <li>Leadership skill development</li>
                <li>Access to premium events and workshops</li>
                <li>Mentorship from industry professionals</li>
                <li>Performance-based incentives</li>
                <li>Career guidance and support</li>
                <li>Brand merchandise and goodies</li>
            </ul>
            <p className="mt-4">
                Join our community of passionate student leaders and help shape the future of technology and innovation on your campus!
            </p>
        </div>
    );

    return (
        <div className="bg-white">
            <div className="container mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8 overflow-hidden block sm:hidden md:block">
                <div className="relative isolate overflow-hidden bg-black px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
                    <svg
                        viewBox="0 0 1024 1024"
                        aria-hidden="true"
                        className="absolute top-1/2 left-1/2 -z-10 size-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
                    >
                        <circle r={512} cx={512} cy={512} fill="url(#red-gradient)" fillOpacity="0.7" />
                        <defs>
                            <radialGradient id="red-gradient">
                                <stop stopColor="#FF0000" />
                                <stop offset={1} stopColor="#8B0000" />
                            </radialGradient>
                        </defs>
                    </svg>
                    <div className="mx-auto max-w-md text-left lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                        <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
                            Become a Campus Ambassador Today!
                        </h2>
                        <p className="mt-6 text-lg/8 text-pretty text-gray-300">
                            Join our exclusive program, represent our brand, and gain incredible experience while building your leadership skills.
                        </p>
                        <div className="mt-10 flex items-center justify-start gap-x-6 lg:justify-start">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsApplyModalOpen(true);
                                }}
                                className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Apply Now
                            </a>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsLearnMoreModalOpen(true);
                                }}
                                className="text-sm/6 font-semibold text-white"
                            >
                                Learn more <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                    <div className="relative flex justify-center items-center mt-16 h-80 lg:mt-8">
                        <img
                            alt="Campus Ambassador Program"
                            src={DoubleQuotes}
                            width="100%"
                            height="auto"
                            className="absolute top-0 left-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                title="Campus Ambassador Application"
            >
                <ApplicationForm onClose={() => setIsApplyModalOpen(false)} />
            </Modal>

            <Modal
                isOpen={isLearnMoreModalOpen}
                onClose={() => setIsLearnMoreModalOpen(false)}
                title="Campus Ambassador Program"
            >
                {benefits}
            </Modal>
        </div>
    );
}
