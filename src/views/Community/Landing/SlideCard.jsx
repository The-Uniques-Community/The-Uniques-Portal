import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import img from "next/img";

// Sample testimonial data
const testimonials = [
    {
        id: 1,
        quote:
            "Being an ambassador has been an incredible journey! The opportunity to organize events and lead a community of like-minded individuals has helped me grow both personally and professionally. The mentorship from regional leads has been invaluable in shaping my leadership skills.",
        name: "Michael Thompson",
        title: "Lead Ambassador",
        avatar: "/placeholder.svg?height=60&width=60",
    },
    {
        id: 2,
        quote:
            "The Uniques Community has provided me with a platform to connect with developers and industry experts. Hosting events and engaging with my peers has enhanced my communication skills, and I love being part of a network that fosters innovation and collaboration.",
        name: "Sarah Johnson",
        title: "Community Organizer",
        avatar: "/placeholder.svg?height=60&width=60",
    },
    {
        id: 3,
        quote:
            "As an ambassador, I’ve learned the importance of teamwork and event planning. Organizing workshops and reporting activities have strengthened my ability to lead and manage a core team effectively. The experience has been nothing short of rewarding!",
        name: "David Williams",
        title: "Technical Lead",
        avatar: "/placeholder.svg?height=60&width=60",
    },
    {
        id: 4,
        quote:
            "One of the best aspects of being an ambassador is the chance to make a real impact. Whether it's mentoring aspiring developers or planning tech events, I've gained valuable experience that will stay with me throughout my career.",
        name: "Emily Chen",
        title: "Event Coordinator",
        avatar: "/placeholder.svg?height=60&width=60",
    },
    {
        id: 5,
        quote:
            "The Uniques Community has helped me develop leadership skills while allowing me to engage with the local developer community. The experience of participating in campaigns and networking with professionals has been incredibly beneficial for my career.",
        name: "Robert Miller",
        title: "Program Ambassador",
        avatar: "/placeholder.svg?height=60&width=60",
    },
];


export default function TestimonialCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const nextSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        // Short delay before changing the active index to allow for animation
        setTimeout(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
            // Allow time for the animation to complete
            setTimeout(() => setIsAnimating(false), 400);
        }, 300);
    };

    const prevSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        // Short delay before changing the active index to allow for animation
        setTimeout(() => {
            setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
            // Allow time for the animation to complete
            setTimeout(() => setIsAnimating(false), 400);
        }, 300);
    };

    // Auto-rotate slides every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Calculate indices for visible cards
    const getVisibleIndices = () => {
        const prevIndex = (activeIndex - 1 + testimonials.length) % testimonials.length;
        const nextIndex = (activeIndex + 1) % testimonials.length;
        return { prevIndex, activeIndex, nextIndex };
    };

    const { prevIndex, nextIndex } = getVisibleIndices();

    return (
        <div className="container mx-auto">
            <div className="w-full max-w-6xl mx-auto px-4 py-16">
                <h2 className="text-center text-5xl font-bold mb-16">
                    <span className="text-gray-900">Benifits </span>
                    <span className="text-gray-400">You will </span>
                    <span className="text-gray-900">Get</span>
                </h2>

                <div className="relative h-[500px]">
                    {/* Carousel Track */}
                    <div className="relative w-full h-full">
                        {/* Previous Card */}
                        <div
                            className="absolute top-1/2 left-0 w-[350px] sm:w-[250px] md:w-[350px] transform-gpu transition-all duration-700 ease-out z-10 opacity-70"
                            style={{
                                transform: `translateY(-50%) translateX(${isAnimating ? "0%" : "5%"}) rotate(-6deg) perspective(1000px) rotateY(10deg)`,
                                transformOrigin: "center right",
                            }}
                        >
                            <TestimonialCard testimonial={testimonials[prevIndex]} variant="light" />
                        </div>

                        {/* Active Card */}
                        <div
                            className="absolute top-1/2 left-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 transform-gpu transition-all duration-700 ease-out z-20"
                            style={{
                                transform: `translateY(-50%) translateX(-50%) ${isAnimating ? "scale(0.98)" : "scale(1)"}`,
                            }}
                        >
                            <TestimonialCard testimonial={testimonials[activeIndex]} variant="highlight" />
                        </div>

                        {/* Next Card */}
                        <div
                            className="absolute top-1/2 right-0 w-[350px] sm:w-[250px] md:w-[350px] transform-gpu transition-all duration-700 ease-out z-10 opacity-70"
                            style={{
                                transform: `translateY(-50%) translateX(${isAnimating ? "0%" : "-5%"}) rotate(6deg) perspective(1000px) rotateY(-10deg)`,
                                transformOrigin: "center left",
                            }}
                        >
                            <TestimonialCard testimonial={testimonials[nextIndex]} variant="light" />
                        </div>
                    </div>

                    {/* Curved Navigation Line */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-16 mt-8">
                        <svg width="100%" height="100%" viewBox="0 0 256 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Curved background line */}
                            <path
                                d="M16 24C48 8 96 0 128 0C160 0 208 8 240 24"
                                stroke="#E5E7EB"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />

                            {/* Active position indicator */}
                            {testimonials.map((_, index) => {
                                // Calculate position along the curve
                                const percentage = index / (testimonials.length - 1);
                                const cx = 16 + percentage * 224;
                                const cy = 24 - Math.sin(Math.PI * percentage) * 24;

                                return (
                                    <circle
                                        key={index}
                                        cx={cx}
                                        cy={cy}
                                        r={index === activeIndex ? 4 : 3}
                                        fill={index === activeIndex ? "#ca0019" : "white"}
                                        stroke={index === activeIndex ? "#ca0019" : "#E5E7EB"}
                                        strokeWidth="2"
                                        className="transition-all duration-500"
                                    />
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-center mt-8 space-x-4">
                    <button
                        onClick={prevSlide}
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 flex justify-center items-center rounded-full bg-gray-50 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                        disabled={isAnimating}
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="sr-only">Previous testimonial</span>
                    </button>
                    <button
                        onClick={nextSlide}
                        variant="default"
                        size="icon"
                        className="w-10 h-10 flex justify-center items-center rounded-full bg-[#ca0017] hover:bg-[#ca0023] text-white"
                        disabled={isAnimating}
                    >
                        <ChevronRight className="h-5 w-5" />
                        <span className="sr-only">Next testimonial</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function TestimonialCard({ testimonial, variant = "light" }) {
    const isHighlight = variant === "highlight";

    return (
        <div
            className={`rounded-3xl p-6 shadow-lg transition-all duration-500 h-full ${isHighlight ? "bg-[#ca0019] text-white ring-2 ring-red-500" : "bg-white text-gray-800"
                }`}
            style={{
                boxShadow: isHighlight
                    ? "0 10px 25px -5px rgba(224, 0, 45, 0.6), 0 8px 10px -6px rgba(224, 0, 45, 0.1)"
                    : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
        >
            <div className="relative h-full flex flex-col">
                <div className="flex-grow">
                    <p className="text-lg leading-relaxed mb-4">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center mt-4">
                    <div className="flex-shrink-0 mr-3">
                        <div className="h-12 w-12 rounded-full overflow-hidden">
                            <img
                                src={testimonial.avatar || "/placeholder.svg"}
                                alt={testimonial.name}
                                width={48}
                                height={48}
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">{testimonial.name}</h4>
                        <p className={isHighlight ? "text-amber-100" : "text-gray-600"}>{testimonial.title}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
