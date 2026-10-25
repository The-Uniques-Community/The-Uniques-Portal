/**
 * @file eventsData.js
 * @description Canonical events dataset, localStorage synchronization, and resilient fallback handler.
 * Conforms to The Uniques Portal Events schema and matches screenshot configurations.
 */

import { BASE_URL } from "@/config";

const EVENTS_STORAGE_KEY = "tu_events_data";

export const INITIAL_EVENTS = [
  {
    _id: "evt-001",
    id: "evt-001",
    eventName: "Linkedin Learning MOU signing",
    eventDate: "2026-09-25T10:00:00.000Z",
    eventTime: "",
    eventStatus: "completed",
    eventVenue: "Auditorium",
    eventType: "Seminar",
    eventOrganizerBatch: "The Uniques 4.0",
    eventDescription:
      "Formal MOU signing ceremony with Linkedin Learning empowering student developers with verified certifications, technical skill pathways, and direct placement opportunities.",
    eventBanner: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [
      {
        guestName: "Linkedin Academic Lead",
        guestCompany: "LinkedIn Corporation",
        guestDesignation: "Enterprise Partnerships Director",
      },
    ],
    eventMembers: [],
  },
  {
    _id: "evt-002",
    id: "evt-002",
    eventName: "IdeaJam",
    eventDate: "2026-09-08T10:00:00.000Z",
    eventTime: "10:00",
    eventStatus: "completed",
    eventVenue: "U Zone",
    eventType: "Ideathon",
    eventOrganizerBatch: "The Uniques 4.0",
    eventDescription:
      "High-energy innovation brainstorm challenge where student teams ideate, draft product roadmaps, and pitch scalable prototypes to senior technical architects.",
    eventBanner: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [
      {
        guestName: "Ankur Gill",
        guestCompany: "SVGOI",
        guestDesignation: "Director of Operations",
      },
    ],
    eventMembers: [],
  },
  {
    _id: "evt-003",
    id: "evt-003",
    eventName: "Induction Program",
    eventDate: "2026-07-21T10:00:00.000Z",
    eventTime: "10:00",
    eventStatus: "completed",
    eventVenue: "U-Zone Lab 1",
    eventType: "Others",
    eventOrganizerBatch: "The Uniques 4.0",
    eventDescription:
      "Comprehensive welcoming orientation for newly recruited cohort members outlining development tracks, code review standards, and technical growth milestones.",
    eventBanner: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-004",
    id: "evt-004",
    eventName: "Placement Celebration",
    eventDate: "2026-07-09T10:00:00.000Z",
    eventTime: "10:00",
    eventStatus: "completed",
    eventVenue: "U-Zone Lab 1",
    eventType: "Meetup",
    eventOrganizerBatch: "The Uniques 4.0",
    eventDescription:
      "Annual community celebration honoring graduating members who achieved exceptional placement packages in top multinational technology companies.",
    eventBanner: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-005",
    id: "evt-005",
    eventName: "Cloud Study Jams Swag Distribution 2026",
    eventDate: "2026-04-23T15:00:00.000Z",
    eventTime: "15:00",
    eventStatus: "completed",
    eventVenue: "U - Zone",
    eventType: "Seminar",
    eventOrganizerBatch: "The Uniques 3.0",
    eventDescription:
      "Official swag recognition ceremony celebrating students who completed Google Cloud architecture and serverless development badges during the Study Jams.",
    eventBanner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-006",
    id: "evt-006",
    eventName: "Global Futures Summit 3.0 - Industry & HR Perspective 2025",
    eventDate: "2026-04-11T10:00:00.000Z",
    eventTime: "10:00",
    eventStatus: "completed",
    eventVenue: "SVIET Auditorium",
    eventType: "Conference",
    eventOrganizerBatch: "The Uniques 4.0",
    eventDescription:
      "Flagship conference featuring senior HR executives and technical leaders discussing next-generation engineering competencies and market hiring shifts.",
    eventBanner: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-007",
    id: "evt-007",
    eventName: "Ideate 3.0",
    eventDate: "2026-04-10T09:00:00.000Z",
    eventTime: "09:00",
    eventStatus: "completed",
    eventVenue: "SVIET Auditorium",
    eventType: "Hackathon",
    eventOrganizerBatch: "The Uniques 3.0",
    eventDescription:
      "36-hour sprint hackathon where student teams design and ship working technological prototypes solving education, healthcare, and campus logistics problems.",
    eventBanner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-008",
    id: "evt-008",
    eventName: "Agentic Systems with ADK",
    eventDate: "2026-04-09T09:00:00.000Z",
    eventTime: "09:00",
    eventStatus: "completed",
    eventVenue: "SVIET Auditorium",
    eventType: "Workshop",
    eventOrganizerBatch: "The Uniques 4.0",
    eventDescription:
      "Hands-on workshop exploring autonomous AI agents, tool invocation protocols, state management, and real-time agentic workflows using modern ADKs.",
    eventBanner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-009",
    id: "evt-009",
    eventName: "Bharat TechXperience 3.0",
    eventDate: "2026-04-03T10:00:00.000Z",
    eventTime: "10:00",
    eventStatus: "completed",
    eventVenue: "SVGOI Campus",
    eventType: "Hackathon",
    eventOrganizerBatch: "The Uniques 3.0",
    eventDescription:
      "National technology summit hosting coding hackathons, technical speaker panels, and project showcase exhibitions with participants across universities.",
    eventBanner: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-010",
    id: "evt-010",
    eventName: "JS Trend Talk",
    eventDate: "2025-08-12T11:00:00.000Z",
    eventTime: "11:00",
    eventStatus: "completed",
    eventVenue: "U - Zone",
    eventType: "Workshop",
    eventOrganizerBatch: "The Uniques 3.0",
    eventDescription:
      "Interactive session examining contemporary JavaScript runtime benchmarks, server-side streaming paradigms, and full-stack React framework architectures.",
    eventBanner: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-011",
    id: "evt-011",
    eventName: "Global Futures Summit 2.0 - Industry & HR Perspective 2025",
    eventDate: "2025-03-08T10:30:00.000Z",
    eventTime: "10:30",
    eventStatus: "completed",
    eventVenue: "SVIET Auditorium",
    eventType: "Meetup",
    eventOrganizerBatch: "The Uniques 3.0",
    eventDescription:
      "Second edition symposium focused on tech recruitment trends, AI-augmented development skills, and leadership readiness for software engineers.",
    eventBanner: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-012",
    id: "evt-012",
    eventName: "Bharat TechXperience Hackathon 2.0",
    eventDate: "2025-03-08T10:00:00.000Z",
    eventTime: "10:00",
    eventStatus: "completed",
    eventVenue: "SVIET Auditorium",
    eventType: "Hackathon",
    eventOrganizerBatch: "The Uniques 2.0",
    eventDescription:
      "Intensive 24-hour hackathon delivering web and cloud computing solutions designed to streamline local business operations and community services.",
    eventBanner: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-013",
    id: "evt-013",
    eventName: "Youth Empowerment Summit - Building the Vision of Viksit Bharat By 2047",
    eventDate: "2024-11-25T14:00:00.000Z",
    eventTime: "14:00",
    eventStatus: "completed",
    eventVenue: "SVIET Auditorium",
    eventType: "Seminar",
    eventOrganizerBatch: "The Uniques 3.0",
    eventDescription:
      "Youth leadership convention empowering students with actionable strategies for technology innovation, research publication, and startup incubation.",
    eventBanner: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-014",
    id: "evt-014",
    eventName: "MOU Signing Ceremony - Larsen & Turbo",
    eventDate: "2024-10-25T10:00:00.000Z",
    eventTime: "10:00",
    eventStatus: "completed",
    eventVenue: "SVIET Auditorium",
    eventType: "Meetup",
    eventOrganizerBatch: "The Uniques 2.0",
    eventDescription:
      "Strategic academic-industrial agreement signing ceremony with Larsen & Toubro for student technical development, internships, and enterprise exposure.",
    eventBanner: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-015",
    id: "evt-015",
    eventName: "Alum Talks",
    eventDate: "2024-10-21T10:00:00.000Z",
    eventTime: "10:00",
    eventStatus: "completed",
    eventVenue: "SVIET Auditorium",
    eventType: "Seminar",
    eventOrganizerBatch: "The Uniques 2.0",
    eventDescription:
      "Alumni mentorship talk featuring veteran Uniques engineers discussing system architecture design, career longevity, and interviewing principles.",
    eventBanner: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-016",
    id: "evt-016",
    eventName: "Empower & Excel - Expert Aptitude Session",
    eventDate: "2024-09-24T02:30:00.000Z",
    eventTime: "02:30",
    eventStatus: "completed",
    eventVenue: "SVIET Auditorium",
    eventType: "Seminar",
    eventOrganizerBatch: "The Uniques 2.0",
    eventDescription:
      "Comprehensive aptitude masterclass sharpening analytical problem solving, logical reasoning speed, and technical assessment readiness.",
    eventBanner: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
  {
    _id: "evt-017",
    id: "evt-017",
    eventName: "Launching Futures: Elevate-2024",
    eventDate: "2024-09-11T10:00:00.000Z",
    eventTime: "",
    eventStatus: "completed",
    eventVenue: "Sviet Auditorium",
    eventType: "Meetup",
    eventOrganizerBatch: "The Uniques 2.0",
    eventDescription:
      "Inaugural conclave for Elevate 2024 introducing inter-wing collaboration, dynamic community workshops, and leadership trajectories for students.",
    eventBanner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    budget: null,
    eventGuests: [],
    eventMembers: [],
  },
];

const normalizeEvent = (evt) => ({
  _id: evt._id || evt.id || `evt-${Date.now()}`,
  id: evt.id || evt._id || `evt-${Date.now()}`,
  eventName: evt.eventName || "Untitled Event",
  eventDate: evt.eventDate || new Date().toISOString(),
  eventTime: evt.eventTime || "",
  eventStatus: (evt.eventStatus || "completed").toLowerCase(),
  eventVenue: evt.eventVenue || "Auditorium",
  eventType: evt.eventType || "Seminar",
  eventOrganizerBatch: evt.eventOrganizerBatch || "The Uniques 4.0",
  eventDescription: evt.eventDescription || "",
  eventBanner: evt.eventBanner || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  budget: evt.budget || null,
  eventGuests: Array.isArray(evt.eventGuests) ? evt.eventGuests : [],
  eventMembers: Array.isArray(evt.eventMembers) ? evt.eventMembers : [],
});

export const getStoredEvents = () => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    let parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => {
        const initialMatch = INITIAL_EVENTS.find(
          (init) =>
            String(init._id) === String(item._id) ||
            String(init.id) === String(item.id) ||
            init.eventName?.toLowerCase().trim() === item.eventName?.toLowerCase().trim()
        );
        return normalizeEvent({
          ...(initialMatch || {}),
          ...item,
        });
      });
    }
    return [];
  } catch (e) {
    console.error("Failed to parse stored events:", e);
    return [];
  }
};

export const getEventById = (id) => {
  const all = getStoredEvents();
  return (
    all.find((e) => String(e._id) === String(id) || String(e.id) === String(id)) || null
  );
};

export const getPaginatedStoredEvents = (params = {}) => {
  const allEvents = getStoredEvents();
  let filtered = [...allEvents];

  if (params.search) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (e) =>
        e.eventName?.toLowerCase().includes(q) ||
        e.eventVenue?.toLowerCase().includes(q) ||
        e.eventType?.toLowerCase().includes(q) ||
        e.eventOrganizerBatch?.toLowerCase().includes(q)
    );
  }

  if (params.status && params.status !== "All") {
    filtered = filtered.filter(
      (e) => (e.eventStatus || "").toLowerCase() === params.status.toLowerCase()
    );
  }

  // Priority sorting: ongoing (1), upcoming (2), completed (3)
  const statusPriority = { ongoing: 1, upcoming: 2, completed: 3 };
  filtered.sort((a, b) => {
    const pDiff = (statusPriority[a.eventStatus] || 3) - (statusPriority[b.eventStatus] || 3);
    if (pDiff !== 0) return pDiff;
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);
    return dateB - dateA; // newest first
  });

  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Number(params.limit) || 9);
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return {
    success: true,
    events: paginatedData,
    currentPage: page,
    totalPages: pages,
    count: paginatedData.length,
    total,
    totalOngoing: filtered.filter((e) => e.eventStatus === "ongoing").length,
    totalUpcoming: filtered.filter((e) => e.eventStatus === "upcoming").length,
    totalCompleted: filtered.filter((e) => e.eventStatus === "completed").length,
    totalBudget: 0,
  };
};

export const getPaginatedEvents = async (params = {}) => {
  try {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    const page = params.page || 1;
    const limit = params.limit || 9;
    const response = await fetch(`${BASE_URL}/api/events?page=${page}&limit=${limit}`, {
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.success && Array.isArray(data.events) && data.events.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Backend /api/events unreachable, serving stored events:", err?.message || err);
  }
  return getPaginatedStoredEvents(params);
};

export const deleteStoredEvent = async (id) => {
  try {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    await fetch(`${BASE_URL}/api/events/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).catch(() => {});
  } catch (e) {
    // ignore backend error and proceed with local sync
  }

  if (typeof window !== "undefined") {
    const all = getStoredEvents();
    const updated = all.filter((e) => String(e._id) !== String(id) && String(e.id) !== String(id));
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
  }
  return true;
};
