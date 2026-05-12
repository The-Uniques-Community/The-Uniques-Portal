"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { Card, Button } from "@mui/material"
import { Users, GraduationCap, UserCheck } from "lucide-react"

const sections = [
    { title: "Ready? Let's Start!", color: "text-blue-900" },
    {
        title: "Mentors",
        icon: <Users />,
        description: "Connect with experienced professionals who can guide your journey.",
        color: "bg-blue-900 text-white",
    },
    {
        title: "Alumni",
        icon: <GraduationCap />,
        description: "Learn from graduates who've successfully navigated their careers.",
        color: "bg-yellow-400 text-black",
    },
    {
        title: "Student",
        icon: <UserCheck />,
        description: "Connect with current students for insider tips and advice.",
        color: "bg-amber-400 text-black",
    },
]

const FlightPathAnimation = () => {
    const containerRef = useRef(null)
    const [activeSection, setActiveSection] = useState(0)

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

        // Cleanup previous animations
        const cleanup = () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
            gsap.killTweensOf("#motionSVG");
        };
        cleanup();

        // Set initial position
        gsap.set("#motionSVG", {
            xPercent: -50,
            yPercent: -50,
            transformOrigin: "center center"
        });

        // Create timeline with ScrollTrigger
        const tl = gsap.timeline({
            paused: true,  // Start paused
            defaults: { ease: "none" }
        });

        // Add the motion path animation to timeline
        tl.to("#motionSVG", {
            motionPath: {
                path: "#motionPath",
                align: "#motionPath",
                alignOrigin: [0, 0.2],
                autoRotate: true
            },
            immediateRender: true
        });

        // Create ScrollTrigger
        ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: 1,
            pin: true,
            animation: tl,
            onUpdate: (self) => {
                const sectionIndex = Math.floor(self.progress * 3);
                setActiveSection(Math.min(sectionIndex, 2));
            },
        });

        return cleanup;
    }, []);

    return (
      <>
      
     
      </>  


    );
};

export default FlightPathAnimation;

