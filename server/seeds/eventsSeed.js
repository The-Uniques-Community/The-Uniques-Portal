/**
 * @file events.js
 * @description Static seed data and mock configurations for historical, completed, and upcoming community events.
 * @architecture Seed data definitions used across database bootstrap scripts and mock event services.
 * @agent_note Contains pre-configured event payloads with guest speakers, descriptions, banners, and default event categories.
 */
const cc = null;
const cc2 = null;
const memberIds = {};

/**
 * Array of upcoming event configurations
 * @type {Array<Object>}
 */
const commingEvents = [
    {
      id: 8,
      chapter: "The Uniques | SVIET",
      headerImage: cc2,
      logo: cc,
      name: "Code Crusade 0.3",
      date: "20 August 2024",
      venue: "SVIET Campus",
      overview:
        "Welcome to Code Crusade, an introductory event for freshers to gain hands-on programming experience and enhance logical reasoning. Dive into languages like Python and C++, engage in practical sessions, and tackle real-world problems with guidance from experienced mentors. Participate in workshops, compete in coding contests, and test your skills through problem-solving challenges. The winner will receive direct entry into the esteemed batch, The Uniques. Join us to sharpen your coding skills, enhance logical reasoning, and connect with a vibrant community.",
      speakers: [],
      form: null,
      eventType: [
        "IntroToCoding",
        "FreshersEvent",
        "HandsOnProgramming",
        "LogicalReasoning",
        "Python",
        "CodingWorkshops",
        "ProblemSolving",
        "Mentorship",
        "CodingContests",
        "RealWorldCoding",
        "ProgrammingSkills",
        "TechCommunity",
      ],
      guest_type: "Chief Guest",
      partners: [],
    },
  ];




  /**
   * Array of seed event configurations representing historical community conferences, workshops, and hackathons
   * @type {Array<Object>}
   */
  export const events = [
    {
      eventName: "Linkedin Learning MOU signing",
      eventDate: new Date("2026-09-25T10:00:00.000Z"),
      eventTime: "",
      eventStatus: "completed",
      eventVenue: "Auditorium",
      eventType: "Seminar",
      eventOrganizerBatch: "The Uniques 4.0",
      eventDescription: "Formal MOU signing ceremony with Linkedin Learning empowering student developers with verified certifications, technical skill pathways, and direct placement opportunities.",
      eventBanner: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "IdeaJam",
      eventDate: new Date("2026-09-08T10:00:00.000Z"),
      eventTime: "10:00",
      eventStatus: "completed",
      eventVenue: "U Zone",
      eventType: "Ideathon",
      eventOrganizerBatch: "The Uniques 4.0",
      eventDescription: "High-energy innovation brainstorm challenge where student teams ideate, draft product roadmaps, and pitch scalable prototypes to senior technical architects.",
      eventBanner: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Induction Program",
      eventDate: new Date("2026-07-21T10:00:00.000Z"),
      eventTime: "10:00",
      eventStatus: "completed",
      eventVenue: "U-Zone Lab 1",
      eventType: "Others",
      eventOrganizerBatch: "The Uniques 4.0",
      eventDescription: "Comprehensive welcoming orientation for newly recruited cohort members outlining development tracks, code review standards, and technical growth milestones.",
      eventBanner: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Placement Celebration",
      eventDate: new Date("2026-07-09T10:00:00.000Z"),
      eventTime: "10:00",
      eventStatus: "completed",
      eventVenue: "U-Zone Lab 1",
      eventType: "Meetup",
      eventOrganizerBatch: "The Uniques 4.0",
      eventDescription: "Annual community celebration honoring graduating members who achieved exceptional placement packages in top multinational technology companies.",
      eventBanner: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Cloud Study Jams Swag Distribution 2026",
      eventDate: new Date("2026-04-23T15:00:00.000Z"),
      eventTime: "15:00",
      eventStatus: "completed",
      eventVenue: "U - Zone",
      eventType: "Seminar",
      eventOrganizerBatch: "The Uniques 3.0",
      eventDescription: "Official swag recognition ceremony celebrating students who completed Google Cloud architecture and serverless development badges during the Study Jams.",
      eventBanner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Global Futures Summit 3.0 - Industry & HR Perspective 2025",
      eventDate: new Date("2026-04-11T10:00:00.000Z"),
      eventTime: "10:00",
      eventStatus: "completed",
      eventVenue: "SVIET Auditorium",
      eventType: "Conference",
      eventOrganizerBatch: "The Uniques 4.0",
      eventDescription: "Flagship conference featuring senior HR executives and technical leaders discussing next-generation engineering competencies and market hiring shifts.",
      eventBanner: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Ideate 3.0",
      eventDate: new Date("2026-04-10T09:00:00.000Z"),
      eventTime: "09:00",
      eventStatus: "completed",
      eventVenue: "SVIET Auditorium",
      eventType: "Hackathon",
      eventOrganizerBatch: "The Uniques 3.0",
      eventDescription: "36-hour sprint hackathon where student teams design and ship working technological prototypes solving education, healthcare, and campus logistics problems.",
      eventBanner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Agentic Systems with ADK",
      eventDate: new Date("2026-04-09T09:00:00.000Z"),
      eventTime: "09:00",
      eventStatus: "completed",
      eventVenue: "SVIET Auditorium",
      eventType: "Workshop",
      eventOrganizerBatch: "The Uniques 4.0",
      eventDescription: "Hands-on workshop exploring autonomous AI agents, tool invocation protocols, state management, and real-time agentic workflows using modern ADKs.",
      eventBanner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Bharat TechXperience 3.0",
      eventDate: new Date("2026-04-03T10:00:00.000Z"),
      eventTime: "10:00",
      eventStatus: "completed",
      eventVenue: "SVGOI Campus",
      eventType: "Hackathon",
      eventOrganizerBatch: "The Uniques 3.0",
      eventDescription: "National technology summit hosting coding hackathons, technical speaker panels, and project showcase exhibitions with participants across universities.",
      eventBanner: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "JS Trend Talk",
      eventDate: new Date("2025-08-12T11:00:00.000Z"),
      eventTime: "11:00",
      eventStatus: "completed",
      eventVenue: "U - Zone",
      eventType: "Workshop",
      eventOrganizerBatch: "The Uniques 3.0",
      eventDescription: "Interactive session examining contemporary JavaScript runtime benchmarks, server-side streaming paradigms, and full-stack React framework architectures.",
      eventBanner: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Global Futures Summit 2.0 - Industry & HR Perspective 2025",
      eventDate: new Date("2025-03-08T10:30:00.000Z"),
      eventTime: "10:30",
      eventStatus: "completed",
      eventVenue: "SVIET Auditorium",
      eventType: "Meetup",
      eventOrganizerBatch: "The Uniques 3.0",
      eventDescription: "Second edition symposium focused on tech recruitment trends, AI-augmented development skills, and leadership readiness for software engineers.",
      eventBanner: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Bharat TechXperience Hackathon 2.0",
      eventDate: new Date("2025-03-08T10:00:00.000Z"),
      eventTime: "10:00",
      eventStatus: "completed",
      eventVenue: "SVIET Auditorium",
      eventType: "Hackathon",
      eventOrganizerBatch: "The Uniques 2.0",
      eventDescription: "Intensive 24-hour hackathon delivering web and cloud computing solutions designed to streamline local business operations and community services.",
      eventBanner: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Youth Empowerment Summit - Building the Vision of Viksit Bharat By 2047",
      eventDate: new Date("2024-11-25T14:00:00.000Z"),
      eventTime: "14:00",
      eventStatus: "completed",
      eventVenue: "SVIET Auditorium",
      eventType: "Seminar",
      eventOrganizerBatch: "The Uniques 3.0",
      eventDescription: "Youth leadership convention empowering students with actionable strategies for technology innovation, research publication, and startup incubation.",
      eventBanner: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "MOU Signing Ceremony - Larsen & Turbo",
      eventDate: new Date("2024-10-25T10:00:00.000Z"),
      eventTime: "10:00",
      eventStatus: "completed",
      eventVenue: "SVIET Auditorium",
      eventType: "Meetup",
      eventOrganizerBatch: "The Uniques 2.0",
      eventDescription: "Strategic academic-industrial agreement signing ceremony with Larsen & Toubro for student technical development, internships, and enterprise exposure.",
      eventBanner: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Alum Talks",
      eventDate: new Date("2024-10-21T10:00:00.000Z"),
      eventTime: "10:00",
      eventStatus: "completed",
      eventVenue: "SVIET Auditorium",
      eventType: "Seminar",
      eventOrganizerBatch: "The Uniques 2.0",
      eventDescription: "Alumni mentorship talk featuring veteran Uniques engineers discussing system architecture design, career longevity, and interviewing principles.",
      eventBanner: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Empower & Excel - Expert Aptitude Session",
      eventDate: new Date("2024-09-24T02:30:00.000Z"),
      eventTime: "02:30",
      eventStatus: "completed",
      eventVenue: "SVIET Auditorium",
      eventType: "Seminar",
      eventOrganizerBatch: "The Uniques 2.0",
      eventDescription: "Comprehensive aptitude masterclass sharpening analytical problem solving, logical reasoning speed, and technical assessment readiness.",
      eventBanner: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Launching Futures: Elevate-2024",
      eventDate: new Date("2024-09-11T10:00:00.000Z"),
      eventTime: "",
      eventStatus: "completed",
      eventVenue: "Sviet Auditorium",
      eventType: "Meetup",
      eventOrganizerBatch: "The Uniques 2.0",
      eventDescription: "Inaugural conclave for Elevate 2024 introducing inter-wing collaboration, dynamic community workshops, and leadership trajectories for students.",
      eventBanner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      eventGuests: [],
      eventMembers: [],
    },
    {
      eventName: "Elevate 2024",
      eventDescription: "Elevate 2024 was a dynamic 3-day event organized by Swami Vivekanand Group of Institutes in collaboration with The Uniques Community. Designed to inspire growth, innovation, and leadership, the event brought together students, industry experts, and educators under one roof. The event featured insightful panel discussions, engaging workshops, and impactful sessions led by renowned speakers such as Ashneer Grover and Vivek Atray. Participants had the opportunity to explore the latest trends in technology, entrepreneurship, and personal development through interactive sessions and hands-on activities. Elevate 2024 also hosted the IDEAJAM Student Innovation Challenge, which encouraged students to present their creative solutions to real-world problems. With cultural events like Band Night and a Stand-Up Comedy Show, the event was not just about learning but also about celebrating creativity and teamwork. Elevate 2024 successfully empowered students with career insights, leadership skills, and the motivation to pursue their ambitions.",
      eventBanner: "https://utfs.io/f/BCPfHUjwOM0EeXmOPAFI2rGjF7Ry85U1EJsK3m9xSPDTOfVv",
      eventDate: new Date("2024-09-15"),
      eventTime: "10:00 AM - 6:00 PM",
      eventVenue: "SVIET Campus",
      eventOrganizer: memberIds.ankurGill, // In real implementation, this would be an actual Member document ID
      eventMembers: [], // In real implementation, this would be an array of Member document IDs
      eventGuests: [
        {
          guestName: "Ashneer Grover",
          guestImage: "https://utfs.io/f/BCPfHUjwOM0EAboRLpyE6swI4fQEyuxPzDCXjiST58OVvKMk",
          guestCompany: "",
          guestDesignation: "Founder of BharatPe, Crickpe, and Shark at Shark Tank India",
        },
        {
          guestName: "Madhuri Jain Grover",
          guestImage: "",
          guestCompany: "",
          guestDesignation: "Co-Founder Third Unicorn | CrickPe",
        },
        {
          guestName: "Dr. Anupam Goel",
          guestImage: "",
          guestCompany: "Max Hospital, Mohali",
          guestDesignation: "Advanced Laparoscopic & Robotic Surgeon, Expert in Renal Access Surgery",
        },
        {
          guestName: "Mr. Sanjeev Demra",
          guestImage: "",
          guestCompany: "Infosys",
          guestDesignation: "Delivery Management, Cybersecurity Expert, IAM Specialist",
        }
      ],
      eventType: "Conference", // Selected from enum options
      eventStatus: "completed"
    },
    {
      eventName: "Aptitude Expert Session",
      eventDescription: "On September 24, 2024, SVIET, in collaboration with The Uniques Community, hosted an insightful Expert Session featuring Lokesh Mathur, Head of AIMERZ.ai and former AVP at upGrad. The session aimed to provide students with essential career insights, enhance their aptitude, and motivate them for personal and professional growth. Such initiatives equip students with practical knowledge and inspire them to be prepared for future challenges.",
      eventBanner: "https://utfs.io/f/BCPfHUjwOM0EjHjvbJuXSOUztKbNx4lAfoc97Hsw0CBhqy52",
      eventDate: new Date("2024-09-24"),
      eventTime: "11:00 AM - 1:00 PM",
      eventVenue: "SVIET Campus",
      eventOrganizer: memberIds.ankurGill,
      eventMembers: [],
      eventGuests: [
        {
          guestName: "Lokesh Mathur",
          guestImage: "https://utfs.io/f/BCPfHUjwOM0EWzccXJLZmw7VGO4BWgFJqD9SdMXUz5nCsvxc",
          guestCompany: "AIMERZ.ai",
          guestDesignation: "17+ Years of Experience in Shaping Futures for tomorrow Ex-AVP, upGrad",
        },
        {
          guestName: "Ankur Gill",
          guestImage: "https://utfs.io/f/674ba343-38c5-4095-a861-0b2aced3584e-n1bot4.jpeg",
          guestCompany: "SVIET",
          guestDesignation: "Director of Operations",
        }
      ],
      eventType: "Seminar",
      eventStatus: "completed"
    },
    {
      eventName: "Code Crusade 0.3",
      eventDescription: "Welcome to Code Crusade, an introductory event for freshers to gain hands-on programming experience and enhance logical reasoning. Dive into languages like Python and C++, engage in practical sessions, and tackle real-world problems with guidance from experienced mentors. Participate in workshops, compete in coding contests, and test your skills through problem-solving challenges. The winner will receive direct entry into the esteemed batch, The Uniques. Join us to sharpen your coding skills, enhance logical reasoning, and connect with a vibrant community.",
      eventBanner: "", // Placeholder - replace with actual image URL
      eventDate: new Date("2024-08-20"),
      eventTime: "9:00 AM - 5:00 PM",
      eventVenue: "SVIET Campus",
      eventOrganizer: memberIds.vishalGarg,
      eventMembers: [],
      eventGuests: [
        {
          guestName: "Taniya Singh",
          guestImage: "https://utfs.io/f/BCPfHUjwOM0EVnxryyBQIsJjdDliaXKbT7r0E9CvzPmO3p4g",
          guestCompany: "SVIET",
          guestDesignation: "The Uniques 3.0",
        },
        {
          guestName: "Kapil Kumar Gupta",
          guestImage: "https://utfs.io/f/BCPfHUjwOM0ES5PrYMQlKos3Vt9EqrLj2y7aIh4Nf5FY8pcS",
          guestCompany: "SVIET",
          guestDesignation: "The Uniques 3.0",
        },
        {
          guestName: "Neha Singh",
          guestImage: "https://utfs.io/f/BCPfHUjwOM0EUaMYusGLHtRf0rbekawNTGy7cSEx4QmoCil2",
          guestCompany: "SVIET",
          guestDesignation: "The Uniques 3.0",
        }
      ],
      eventType: "Workshop",
      eventStatus: "completed"
    },
    {
      eventName: "Global Future Summit 2024",
      eventDescription: "The Global Future Summit 2024, featuring a dynamic panel discussion led by HR experts and industry leaders on the latest technology trends. Gain insights into the future of work, innovation, and talent development. Explore how cutting-edge technologies are reshaping industries and workforce dynamics. Don't miss this opportunity to be part of shaping the global future!",
      eventBanner: "https://media.licdn.com/dms/image/D5622AQEEj3rY4VRJYA/feedshare-shrink_2048_1536/0/1711181295676?e=1715212800&v=beta&t=biU5tSaDzVZaV1pV-xeNvlSmvUY9ZilyuZ1C0ZLtnT8",
      eventDate: new Date("2024-03-23"),
      eventTime: "10:00 AM - 4:00 PM",
      eventVenue: "SVIET Auditorium",
      eventOrganizer: memberIds.pranav,
      eventMembers: [],
      eventGuests: [
        {
          guestName: "Pranav Kumar",
          guestImage: "https://gdgchandigarh.com/assets/organizers/Pranav.png",
          guestCompany: "Nagarro",
          guestDesignation: "Senior Engineer",
        },
        {
          guestName: "Harsh Logani",
          guestImage: "https://media.licdn.com/dms/image/D4D03AQHFVnHYuXhvyA/profile-displayphoto-shrink_100_100/0/1698305288670?e=1718236800&v=beta&t=82odK-drFsH8AENFN2sTy4FzPWQ3hdGoSYsbIgjXGW4",
          guestCompany: "Escalon",
          guestDesignation: "Manager HR",
        },
        {
          guestName: "Deepti Negi",
          guestImage: "https://media.licdn.com/dms/image/D4D03AQEu2auoBqUR9Q/profile-displayphoto-shrink_200_200/0/1698170865921?e=1718236800&v=beta&t=vKfPqW_uohrQ6G5AqNV156yxBnwD2H428_IZgD2JXBg",
          guestCompany: "Spectraforce",
          guestDesignation: "Sr. Manager- Human Resource",
        }
      ],
      eventType: "Conference",
      eventStatus: "completed"
    },
    {
      eventName: "Google Ideate Ideathon",
      eventDescription: "Gear up for the Google Ideate Ideathon 2024! Join us in showcasing innovative ideas that push the boundaries of technology. Collaborate with like-minded individuals, present your groundbreaking concepts, and vie for recognition. Unleash your creativity and be part of shaping the future. Don't miss this chance to make your mark on the world of innovation!",
      eventBanner: "https://media.licdn.com/dms/image/D4D22AQEL6ULQQjmG6A/feedshare-shrink_2048_1536/0/1698642601892?e=1715212800&v=beta&t=_2O83ldmUbezl9BKWB342FaqhWalhWZPeTA_9BBRyN0",
      eventDate: new Date("2024-02-17"),
      eventTime: "9:00 AM - 6:00 PM",
      eventVenue: "SVIET Campus",
      eventOrganizer: memberIds.pranav,
      eventMembers: [],
      eventGuests: [
        {
          guestName: "Gaurav Mahipal",
          guestImage: "https://media.licdn.com/dms/image/D5603AQEVP9NUGo4_6g/profile-displayphoto-shrink_200_200/0/1708107118265?e=1718236800&v=beta&t=eYMDWLyYegqsi3zo1fw0S4CytI57G5N-_HFIGCBNg8E",
          guestCompany: "Veritos InfoSolutions Pvt Ltd",
          guestDesignation: "Managing Director",
        },
        {
          guestName: "Harish Kumar",
          guestImage: "https://media.licdn.com/dms/image/C5603AQHf7VJG-0wVug/profile-displayphoto-shrink_800_800/0/1644000811499?e=1718236800&v=beta&t=Q5foIfAxuxeIMLbyGskDzoV1i6Ic3BMGBJeIwgZkNwQ",
          guestCompany: "Paras Technologies",
          guestDesignation: "Founder & CEO",
        }
      ],
      eventType: "Ideathon",
      eventStatus: "completed"  
    },
    {
      eventName: "Google I/O Extended 2023",
      eventDescription: "Google Developers Group Chandigarh(GDG Chandigarh) is back with its most awaited event of the year, Google IO Extended Chandigarh '23. Join us for a day of learning, networking, and fun at Google Cloud Community Day at SVIET (Swami Vivekanand Institute of Engineering & Technology) on 27th May 2023! Google I/O Extended is a series of community-led tech meetups that bring the knowledge and excitement of Google I/O to developers on a city level, all around the globe. Google I/O Extended events are typically held in the days leading up to or following Google I/O, and they feature a variety of talks, workshops, and activities related to Google's latest developer products and technologies. Google I/O Extended events are a great opportunity for developers to learn about the latest Google technologies, to network with other developers, and to get help and support from Google experts. If you're a developer who is interested in learning more about Google's latest technologies, I encourage you to be a part of this great event.",
      eventBanner: "https://res.cloudinary.com/startup-grind/image/upload/c_limit,dpr_2,f_auto,g_center,h_1440,q_auto:good,w_2048/v1/gcs/platform-data-goog/event_wrapup/DSC05771.JPG",
      eventDate: new Date("2023-05-27"),
      eventTime: "9:00 AM - 5:00 PM",
      eventVenue: "SVIET Auditorium",
      eventOrganizer: memberIds.loveleen,
      eventMembers: [memberIds.pranav, memberIds.aashi],
      eventGuests: [
        {
          guestName: "Loveleen Kaur",
          guestImage: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/Copy%2520of%2520WTM%2520IWD%25202024%2520-%2520Profile%2520Avatar%2520%25282%2529.jpg",
          guestCompany: "Astrotalk",
          guestDesignation: "Senior Software Engineer",
        },
        {
          guestName: "Pranav Kumar",
          guestImage: "https://gdgchandigarh.com/assets/organizers/Pranav.png",
          guestCompany: "Nagarro",
          guestDesignation: "Senior Engineer",
        },
        {
          guestName: "Aashi Dutt",
          guestImage: "https://gdgchandigarh.com/assets/organizers/Aashi.jpeg",
          guestCompany: "MedEnGauge Healthcare Pvt Ltd",
          guestDesignation: "Co-Founder",
        }
      ],
      eventType: "Conference",
      eventStatus: "completed"
    },
    {
      eventName: "Bharat TechXperience Hackathon",
      eventDescription: "A dynamic two-day event fostering innovation and collaboration among tech enthusiasts nationwide. Join us for an immersive journey of coding, problem-solving, and creativity to shape the future of technology in India. Unleash your potential and make an impact",
      eventBanner: "https://media.licdn.com/dms/image/D4D22AQEL6ULQQjmG6A/feedshare-shrink_2048_1536/0/1698642601892?e=1715212800&v=beta&t=_2O83ldmUbezl9BKWB342FaqhWalhWZPeTA_9BBRyN0",
      eventDate: new Date("2023-10-28"),
      eventTime: "9:00 AM (Day 1) - 5:00 PM (Day 2)",
      eventVenue: "SVIET Campus",
      eventOrganizer: memberIds.loveleen,
      eventMembers: [memberIds.pranav, memberIds.aashi],
      eventGuests: [
        {
          guestName: "Loveleen Kaur",
          guestImage: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/Copy%2520of%2520WTM%2520IWD%25202024%2520-%2520Profile%2520Avatar%2520%25282%2529.jpg",
          guestCompany: "Astrotalk",
          guestDesignation: "Senior Software Engineer",
        },
        {
          guestName: "Pranav Kumar",
          guestImage: "https://gdgchandigarh.com/assets/organizers/Pranav.png",
          guestCompany: "Nagarro",
          guestDesignation: "Senior Engineer",
        }
      ],
      eventType: "Hackathon",
      eventStatus: "completed"
    },
    {
      eventName: "Success Mantra",
      eventDescription: "The CEO/Founder of #ChaiThela, Mr. Pankaj Judge, shared his life-changing journey during Talk Show: Success Mantra, as a way to enhance the entrepreneurship skills of our students. His journey helps students understand what it takes to be successful. An inspiring session on Success Mantra with Mr. Pankaj Judge, the visionary founder of Chai Thela. Learn firsthand from his journey of turning a humble chai stall into a thriving business empire. Discover the secrets behind his success and gain valuable insights to fuel your own entrepreneurial endeavors. Don't miss this opportunity to unlock the keys to success!",
      eventBanner: "https://pbs.twimg.com/media/FqSl9vhaAAE0Vlu?format=jpg&name=4096x4096",
      eventDate: new Date("2023-03-03"),
      eventTime: "11:00 AM - 1:00 PM",
      eventVenue: "SVIET Campus",
      eventOrganizer: memberIds.ankurGill,
      eventMembers: [],
      eventGuests: [
        {
          guestName: "Pankaj Judge",
          guestImage: "https://tse1.mm.bing.net/th?id=OIP.kqSfv6D6R9Fw6DcN_mCppgAAAA&pid=Api&P=0&h=220",
          guestCompany: "Chai Thela",
          guestDesignation: "CEO",
        }
      ],
      eventType: "Talk Show",
      eventStatus: "completed"
    },
    {
      eventName: "Expert Talk on Firebase",
      eventDescription: "An expert talk by Pranav Kumar Verma on Firebase. Explore the power of Firebase with insights from Pranav, an experienced developer. Learn how to leverage its features for seamless app development and real-time data synchronization. Don't miss this chance to level up your Firebase skills!",
      eventBanner: "https://pranav-s-portfolio.web.app/assets/events/Workshops/SVIET/img1.jpg",
      eventDate: new Date("2023-04-13"),
      eventTime: "2:00 PM - 4:00 PM",
      eventVenue: "U-Zone",
      eventOrganizer: memberIds.pranav,
      eventMembers: [],
      eventGuests: [
        {
          guestName: "Pranav Kumar",
          guestImage: "https://gdgchandigarh.com/assets/organizers/Pranav.png",
          guestCompany: "Nagarro",
          guestDesignation: "Senior Engineer",
        }
      ],
      eventType: "Seminar",
      eventStatus: "completed"
    },
    {
      eventName: "Drive into the world of blockchain",
      eventDescription: "An expert talk on blockchain technology by Udayveer Singh. Join Udayveer and industry leaders as they explore the latest advancements in blockchain, including decentralized finance (DeFi), NFTs, and smart contracts. Gain deep insights into how blockchain is reshaping industries and learn from the forefront of innovation in this rapidly evolving field.",
      eventBanner: "https://utfs.io/f/33b5ab2e-eb5b-4448-a249-d823fc3d6b7f-ch8zt2.jpg",
      eventDate: new Date("2023-04-01"),
      eventTime: "11:00 AM - 1:00 PM",
      eventVenue: "SVIET Auditorium",
      eventOrganizer: memberIds.ankurGill,
      eventMembers: [],
      eventGuests: [
        {
          guestName: "Udayveer Singh",
          guestImage: "https://utfs.io/f/b1c7ae51-6297-4347-bb3c-f0c4a76efda7-hqsv6i.jpeg",
          guestCompany: "Antier Solutions",
          guestDesignation: "Blockchain Engineer",
        }
      ],
      eventType: "Seminar",
      eventStatus: "completed"
    },
    {
      eventName: "TechSynergy | The Global Spectrum",
      eventDescription: "AN INITIATIVE TAKEN BY THE UNIQUES COMMUNITY FOR THE INTERNATIONAL STUDENTS. The Uniques Community is excited to launch TechSynergy The Global Spectrum, a 5-DAY IMMERSIVE WORKSHOP FOR NEWLY WELCOMED INTERNATIONAL STUDENTS. This initiative offers hands-on training in cutting-edge technologies, skill development, and practical experience. Join us to bridge the gap between education and industry, and take the first step towards a successful career in tech!",
      eventBanner: "", // Replace with actual image URL
      eventDate: new Date("2024-08-12"), // Approximate date based on "August, 2024"
      eventTime: "10:00 AM - 4:00 PM",
      eventVenue: "SVIET Campus",
      eventOrganizer: memberIds.ankurGill,
      eventMembers: [],
      eventGuests: [
        {
          guestName: "Martin Kariuki",
          guestImage: "https://media.licdn.com/dms/image/v2/D4E03AQFVs9daCB5Zxg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1721228570208?e=1729123200&v=beta&t=Ty0F7kvNZD9Vyd0-X0GALd15yRtR8rcdvr5-VlIiFFM",
          guestCompany: "SVIET",
          guestDesignation: "Member: The Uniques 3.0",
        },
        {
          guestName: "Anesu Muganhira",
          guestImage: "https://media.licdn.com/dms/image/v2/D5603AQHrk3bG6w_f5g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1719554441936?e=1729123200&v=beta&t=hZRibUSdVhv69HZAm0Iw9J1RsuRXEww5VxFTSQ0_27s",
          guestCompany: "SVIET",
          guestDesignation: "Member: The Uniques 3.0",
        },
        {
          guestName: "Enoch Owen",
          guestImage: "https://media.licdn.com/dms/image/v2/D5635AQHvL_PHsssSAg/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1721637739363?e=1724396400&v=beta&t=rqBOpPEz_2YEZSH_BbZCAjKZK-KwfP_csjTBGc-6YfE",
          guestCompany: "SVIET",
          guestDesignation: "Member: The Uniques 3.0",
        }
      ],
      eventType: "Workshop",
      eventStatus: "completed"
    },
    {
      eventName: "Code Quest",  
      eventDescription: "Code Quest is an in-house hackathon designed to foster creativity, technical prowess, and a competitive spirit among students. With the motto Craft. Code. Conquer. this event aims to provide participants with an immersive experience mirroring real-world hackathons. It is specifically tailored for students from the Uniques 2.0, Uniques 3.0, and Super60 batches, offering them a platform to enhance their competitive and technical skills.",
      eventBanner: "https://utfs.io/f/fbba036f-3ccd-4d8d-aacd-d888c32f822a-vlrxtb.jpg",
      eventDate: new Date("2023-04-23"),
      eventTime: "9:00 AM - 8:00 PM",
      eventVenue: "SVIET Campus",
      eventOrganizer: memberIds.ankurGill,
      eventMembers: [memberIds.vishalGarg],
      eventGuests: [
        {
          guestName: "Ankur Gill",
          guestImage: "https://utfs.io/f/674ba343-38c5-4095-a861-0b2aced3584e-n1bot4.jpeg",
          guestCompany: "SVIET",
          guestDesignation: "Director of Operations",
        },
        {
          guestName: "Vishal Garg",
          guestImage: "https://utfs.io/f/94494773-7502-429c-84f6-425ec7293aeb-dhym4t.jpg",
          guestCompany: "SVIET",
          guestDesignation: "Director Secretarial",
        }
      ],
      eventType: "Hackathon",
      eventStatus: "completed"
    }
  ];

export default commingEvents;