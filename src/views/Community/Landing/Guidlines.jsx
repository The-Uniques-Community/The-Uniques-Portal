import React, { useState } from 'react';
import Effect from "@/assets/img/Community/effect.png";
// import Modal from "@/utils/Modal/Community"

const cardData = [
    {
        id: 1,
        title: 'Innovation Challenges',
        description:
            'Run corporate challenges & hackathons to develop innovative solutions that will transform your business.',
        modalContent: (
            <div>
                <p className="mb-4">Our Innovation Challenges program helps organizations:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Organize and run successful hackathons</li>
                    <li>Connect with talented developers and innovators</li>
                    <li>Transform business challenges into opportunities</li>
                    <li>Implement winning solutions effectively</li>
                    <li>Track and measure innovation outcomes</li>
                </ul>
                <p className="mt-4">Join our community of innovators and start your journey towards digital transformation.</p>
            </div>
        ),
        buttonText: 'Learn More',
        cardBg: 'bg-white',
        iconBg: 'bg-[#9bc8ff]',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 55 52" fill="none">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M28.1286 0.176242C27.8732 0.0600954 27.5959 0 27.3154 0C27.0348 0 26.7575 0.0600954 26.5021 0.176242L16.1975 4.86696L27.3075 9.92696L38.4254 4.86303L28.1286 0.176242ZM14.3511 20.3377V8.33981L25.3511 13.3487V26.6077L15.4943 22.1252C15.1511 21.9691 14.8601 21.7176 14.656 21.4006C14.4519 21.0837 14.3433 20.7147 14.3432 20.3377H14.3511ZM29.2796 46.7062V33.5848L39.6982 38.3305V51.5895L29.8532 47.107C29.6382 47.0092 29.4465 46.8734 29.2796 46.7062ZM43.6268 51.5973V38.3305L54.6386 33.3177V45.3195C54.6385 45.6964 54.5299 46.0654 54.3258 46.3824C54.1217 46.6994 53.8307 46.9509 53.4875 47.107L43.6268 51.5973ZM25.3432 33.5848V46.722C25.1798 46.882 24.9897 47.0123 24.7814 47.107L14.9207 51.5973V38.3305L25.3432 33.5848ZM10.9921 38.3305V51.5895L1.15107 47.107C0.807907 46.9509 0.516903 46.6994 0.312797 46.3824C0.108691 46.0654 0.000104388 45.6964 0 45.3195V33.3216L11 38.3305H10.9921ZM29.2718 26.6155V13.3448L40.2836 8.33196V20.3377C40.2835 20.7147 40.1749 21.0837 39.9708 21.4006C39.7667 21.7176 39.4757 21.9691 39.1325 22.1252L29.2718 26.6155ZM40.8532 25.162C41.1086 25.0458 41.3859 24.9857 41.6664 24.9857C41.947 24.9857 42.2243 25.0458 42.4796 25.162L52.7725 29.8448L41.6546 34.9087L30.5564 29.8448L40.8571 25.1541L40.8532 25.162ZM12.1511 25.162C12.4064 25.0458 12.6837 24.9857 12.9643 24.9857C13.2448 24.9857 13.5221 25.0458 13.7775 25.162L24.0704 29.8448L12.9564 34.9127L1.85036 29.8448L12.1511 25.162Z"
                    fill="#000000"
                />
            </svg>
        ),
    },
    {
        id: 2,
        title: 'Product Evangelism',
        description: 'Ignite customer excitement and drive product adoption through strategic evangelism.',
        modalContent: (
            <div>
                <p className="mb-4">Discover how Product Evangelism can:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Boost customer engagement</li>
                    <li>Increase product adoption rates</li>
                    <li>Build a loyal customer base</li>
                    <li>Enhance brand reputation</li>
                </ul>
                <p className="mt-4">Learn more about our strategies to make your product a market leader.</p>
            </div>
        ),
        buttonText: 'View More',
        cardBg: 'bg-white',
        iconBg: 'bg-red-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 49 52" fill="none">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.02347 2.0139H20.4695C21.0347 2.0139 21.4929 2.49444 21.4929 3.0873V23.4819C21.4929 24.0747 21.0347 24.5553 20.4695 24.5553H1.02347C0.458196 24.5553 0 24.0747 0 23.4819V3.0873C0 2.49444 0.458196 2.0139 1.02347 2.0139ZM37.121 0.314372L48.7002 12.4585C49.0999 12.8777 49.0999 13.5573 48.7002 13.9765L37.1209 26.1206C36.7213 26.5398 36.0733 26.5398 35.6735 26.1206L24.0943 13.9765C23.6946 13.5573 23.6946 12.8777 24.0943 12.4585L35.6736 0.314372C36.0733 -0.104791 36.7213 -0.104791 37.121 0.314372ZM1.02347 28.8489H20.4695C21.0347 28.8489 21.4929 29.3294 21.4929 29.9223V50.3168C21.4929 50.9097 21.0347 51.3902 20.4695 51.3902H1.02347C0.458196 51.3902 0 50.9097 0 50.3168V29.9223C0 29.3294 0.458196 28.8489 1.02347 28.8489ZM26.6103 28.8489H46.0563C46.6216 28.8489 47.0798 29.3294 47.0798 29.9223V50.3168C47.0798 50.9097 46.6216 51.3902 46.0563 51.3902H26.6103C26.045 51.3902 25.5868 50.9097 25.5868 50.3168V29.9223C25.5868 29.3294 26.045 28.8489 26.6103 28.8489Z"
                    fill="#F36547"
                />
            </svg>
        ),
    },
    {
        id: 3,
        title: 'Startup Pitches',
        description: 'Connect with students globally to identify the brightest young minds and their game-changing ideas.',
        modalContent: (
            <div>
                <p className="mb-4">Startup Pitches provide:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Access to innovative ideas</li>
                    <li>Opportunities to collaborate with young talent</li>
                    <li>Insights into emerging trends</li>
                    <li>Support for entrepreneurial growth</li>
                </ul>
                <p className="mt-4">Be part of the next big thing in the startup ecosystem.</p>
            </div>
        ),
        buttonText: 'View More',
        cardBg: 'bg-white',
        iconBg: 'bg-green-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 52 52" fill="none">
                <g clipPath="url(#clip0_679_4738)">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M24.3174 38.1197L13.8803 27.6825C15.028 25.7622 16.172 23.7751 17.3048 21.7991C21.0786 15.2397 24.7631 8.83624 28.2174 5.50453C37.5923 -3.87033 50.4326 1.56739 50.4326 1.56739C50.4326 1.56739 55.8666 14.4077 46.4954 23.7825C43.1897 27.2071 36.8866 30.8397 30.3754 34.5837C28.3474 35.7537 26.3008 36.9311 24.3174 38.1197Z"
                        fill="#8AD5C5"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_679_4738">
                        <rect width="52" height="52" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        ),
    },
    {
        id: 4,
        title: 'Student Challenges',
        description: 'Explore innovative ideas from student minds.',
        modalContent: (
            <div>
                <p className="mb-4">Student Challenges enable:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Engagement with creative students</li>
                    <li>Discovery of groundbreaking ideas</li>
                    <li>Opportunities for mentorship</li>
                    <li>Support for academic innovation</li>
                </ul>
                <p className="mt-4">Join us in shaping the future of innovation.</p>
            </div>
        ),
        buttonText: 'View More',
        cardBg: 'bg-white',
        iconBg: 'bg-yellow-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 54 54" fill="none">
                <g>
                    <path
                        d="M20.25 24.0237L22.583 28.6875H17.917L20.25 24.0237ZM48.9375 11.8125V45.5625C48.9377 45.8503 48.8643 46.1334 48.7243 46.3848C48.5842 46.6362 48.3822 46.8477 48.1375 46.999C47.8927 47.1504 47.6133 47.2366 47.3257 47.2495C47.0382 47.2624 46.7522 47.2016 46.4948 47.0728L40.5 44.0733L34.5052 47.0728C34.2707 47.1901 34.0122 47.2512 33.75 47.2512C33.4878 47.2512 33.2293 47.1901 32.9948 47.0728L27 44.0733L21.0052 47.0728C20.7707 47.1901 20.5122 47.2512 20.25 47.2512C19.9878 47.2512 19.7293 47.1901 19.4948 47.0728L13.5 44.0733L7.50516 47.0728C7.24779 47.2016 6.96176 47.2624 6.67425 47.2495C6.38675 47.2366 6.10733 47.1504 5.86254 46.999C5.61776 46.8477 5.41576 46.6362 5.27573 46.3848C5.1357 46.1334 5.06229 45.8503 5.0625 45.5625V11.8125C5.0625 10.9174 5.41808 10.0589 6.05101 9.42601C6.68395 8.79308 7.54239 8.4375 8.4375 8.4375H45.5625C46.4576 8.4375 47.316 8.79308 47.949 9.42601C48.5819 10.0589 48.9375 10.9174 48.9375 11.8125Z"
                        fill="#FCB137"
                    />
                </g>
            </svg>
        ),
    },
    {
        id: 5,
        title: 'Tech Innovation',
        description: 'Foster a culture of innovation with cutting-edge technology solutions.',
        modalContent: (
            <div>
                <p className="mb-4">Tech Innovation helps you:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Stay ahead in the tech landscape</li>
                    <li>Adopt innovative solutions</li>
                    <li>Drive digital transformation</li>
                    <li>Enhance operational efficiency</li>
                </ul>
                <p className="mt-4">Discover how technology can revolutionize your business.</p>
            </div>
        ),
        buttonText: 'Discover',
        cardBg: 'bg-white',
        iconBg: 'bg-purple-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#6B46C1" strokeWidth="4" />
                <path d="M20 32h24M32 20v24" stroke="#6B46C1" strokeWidth="4" strokeLinecap="round" />
            </svg>
        ),
    },
];

const DynamicCard = ({ card, onOpenModal }) => {
    const [persistentActive, setPersistentActive] = useState(false);
    const [hoverActive, setHoverActive] = useState(false);

    const active = persistentActive || hoverActive;

    const containerWidthClass = active ? 'lg:w-[19rem]' : 'lg:w-[12rem]';
    const containerBgClass = active ? card.iconBg : card.cardBg;
    const iconBgClass = active ? card.cardBg : card.iconBg;

    const handleClick = () => {
        setPersistentActive((prev) => !prev);
    };

    const handleButtonClick = (e) => {
        e.stopPropagation();
        onOpenModal(card);
    };

    return (
        <div
            onClick={handleClick}
            onMouseEnter={() => setHoverActive(true)}
            onMouseLeave={() => setHoverActive(false)}
            className={`group relative h-[22rem] py-4 px-4 overflow-hidden border-[.5px] border-[#E2E2E2]  transition-all duration-500 delay-150 ease-in-out cursor-pointer flex flex-col ${containerWidthClass} ${containerBgClass} transition-all ${card.id === 1 ? 'rounded-tl-[25px] rounded-bl-[25px]' : ''} ${card.id === 5 ? 'rounded-tr-[25px] rounded-br-[25px]' : ''}`}
        >
            <div className="grow">
                <div
                    className={`rounded-full w-[60px] h-[60px] flex justify-center items-center transition-colors duration-500 delay-150 ease-in-out ${iconBgClass}`}
                >
                    {card.icon}
                </div>
                <div className="text-[24px] text-[#212B36] mt-4 font-[500] transition-all duration-500 delay-150">
                    {card.title}
                </div>
                <p className="text-[16px] text-[#383838] mt-4 font-[400] line-clamp-4 transition-all duration-500 delay-150">
                    {card.description}
                </p>
            </div>
            <div className="mt-3 w-full">
                {active && (
                    <div className="flex items-center justify-center md:justify-start transition-all duration-500 delay-200">
                        <button
                            onClick={handleButtonClick}
                            className="w-32 z-10 mt-4 bg-[#3462ae] text-base text-white px-2 py-2 rounded-full flex items-center justify-center"
                        >
                            {card.buttonText}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="img"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                className="text-white text-xl -pl-1"
                            >
                                <path fill="currentColor" d="M5 17.59L15.59 7H9V5h10v10h-2V8.41L6.41 19z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
            <div className="absolute bottom-0 right-0 w-38 block transition-all duration-500 delay-150">
                <img src={Effect} alt="Effect" />
            </div>
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-3/4 max-w-lg">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <div>{content}</div>
                <button
                    onClick={onClose}
                    className="mt-4 bg-[#3462ae] text-white px-4 py-2 rounded-full"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

const Guidelines = () => {
    const [selectedCard, setSelectedCard] = useState(null);

    const handleOpenModal = (card) => {
        setSelectedCard(card);
    };

    const handleCloseModal = () => {
        setSelectedCard(null);
    };

    return (
        <div>
            <section className="mx-auto container py-10" id="whyH2s">
                <div className="pt-[30px] max-sm:mt-6 ">
                    <div className="w-full md:w-4/5 mx-auto">
                        <h2 className="max-sm:text-[24px] sm:text-[40px] text-[#212B36] text-left sm:mb-4 py-4">
                            Community Guidelines
                        </h2>
                        <p className="text-left mt-2 my-6 py-2 max-sm:text-[14px] md:text-[16px] font-[400] text-[#919EAB]">
                            Innovate effortlessly. Our leading innovation management platform and a network of 5 million innovators will help you find the perfect solutions and bring them to market faster.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center items-center lg:flex" id="card-container">
                        {cardData.map((card) => (
                            <div key={card.id} className="">
                                <DynamicCard card={card} onOpenModal={handleOpenModal} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Modal
                isOpen={selectedCard !== null}
                onClose={handleCloseModal}
                title={selectedCard?.title}
                content={selectedCard?.modalContent}
            />
        </div>
    );
};

export default Guidelines;
