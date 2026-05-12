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
      form: <EventRegister onClose={onOpen} />,
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




  export const events = [
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