import axios from "axios";
import { BASE_URL } from "@/config";
import communityOrganizerImg from "@/assets/img/Community/testimonials/community-organizer.webp";
import technicalLeadImg from "@/assets/img/Community/testimonials/technical-lead.webp";
import graphicsLeadImg from "@/assets/img/Community/testimonials/graphics-lead.webp";
import eventCoordinatorImg from "@/assets/img/Community/testimonials/event-coordinator.webp";
import socialMediaLeadImg from "@/assets/img/Community/testimonials/social-media-lead.webp";

export const DEFAULT_BENEFITS_CARDS = [
  {
    id: 1,
    quote:
      "Leading this community has been an empowering experience! Driving community culture, bringing passionate minds together, and building an inclusive environment has transformed how I lead teams. Seeing members learn, collaborate, and grow under our collective initiatives is the most rewarding feeling.",
    name: "Vaishanavi Bajpai",
    title: "Community Organizer",
    avatar: communityOrganizerImg,
  },
  {
    id: 2,
    quote:
      "As Technical Lead, steering hands-on hackathons, coding bootcamps, and real-world tech architectures has taken my engineering mindset to new heights. Mentoring developers and solving complex technical roadblocks with such an innovative peer group has sharpened both my coding and architectural skills.",
    name: "Kumar Sujal",
    title: "Technical Lead",
    avatar: technicalLeadImg,
  },
  {
    id: 3,
    quote:
      "Designing the visual identity and creative branding for the community has elevated my design perspective. From crafting striking event visuals and UI assets to ensuring consistent brand storytelling across every touchpoint, this role has helped me push creative boundaries and master digital aesthetics.",
    name: "Vasu Malhotra",
    title: "Graphics Lead",
    avatar: graphicsLeadImg,
  },
  {
    id: 4,
    quote:
      "Orchestrating large-scale tech conferences and seamless workshops taught me the art of precision planning and crisis management. Managing speaker coordination, stage logistics, and audience experiences in real-time has made me a confident leader capable of executing flawless events.",
    name: "Laxmi Rajput",
    title: "Event Coordinator",
    avatar: eventCoordinatorImg,
  },
  {
    id: 5,
    quote:
      "Amplifying our community's voice and building viral digital campaigns has been exhilarating! Driving social engagement, spotlighting student achievements, and strategically growing our reach across platforms has unlocked master-level content strategy and community marketing skills for me.",
    name: "Nishant",
    title: "Social Media Lead",
    avatar: socialMediaLeadImg,
  },
];

const STORAGE_KEY = "tu_community_benefits_cards";

export const getStoredBenefitsCards = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [...DEFAULT_BENEFITS_CARDS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return DEFAULT_BENEFITS_CARDS.map((defaultCard, index) => {
        const stored = parsed[index];
        if (!stored) return defaultCard;
        return {
          id: defaultCard.id,
          name: stored.name || defaultCard.name,
          title: stored.title || defaultCard.title,
          quote: stored.quote || defaultCard.quote,
          avatar: stored.customAvatar ? stored.avatar : (stored.avatar || defaultCard.avatar),
          customAvatar: Boolean(stored.customAvatar),
        };
      });
    }
    return [...DEFAULT_BENEFITS_CARDS];
  } catch (err) {
    console.error("Error reading stored benefits cards:", err);
    return [...DEFAULT_BENEFITS_CARDS];
  }
};

export const fetchBenefitsCards = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/community-benefits`);
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      const cards = response.data.data.map((stored, idx) => {
        const defaultCard = DEFAULT_BENEFITS_CARDS[idx] || {};
        return {
          id: stored.cardId || defaultCard.id || idx + 1,
          name: stored.name || defaultCard.name,
          title: stored.title || defaultCard.title,
          quote: stored.quote || defaultCard.quote,
          avatar: stored.customAvatar ? stored.avatar : (stored.avatar || defaultCard.avatar),
          customAvatar: Boolean(stored.customAvatar),
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      window.dispatchEvent(new CustomEvent("community-benefits-updated", { detail: cards }));
      return cards;
    }
  } catch (err) {
    console.warn("Could not fetch community benefits cards from server, using cached:", err?.message || err);
  }
  return getStoredBenefitsCards();
};

export const saveStoredBenefitsCards = async (cards) => {
  try {
    const toSave = cards.slice(0, 5).map((card, idx) => {
      const defaultCard = DEFAULT_BENEFITS_CARDS[idx] || {};
      const isCustom = Boolean(
        card.avatar &&
        typeof card.avatar === "string" &&
        (card.avatar.startsWith("data:") ||
          card.avatar.startsWith("http://") ||
          card.avatar.startsWith("https://") ||
          card.avatar.startsWith("blob:"))
      );

      return {
        id: card.id || defaultCard.id || idx + 1,
        cardId: card.id || defaultCard.id || idx + 1,
        name: card.name || defaultCard.name,
        title: card.title || defaultCard.title,
        quote: card.quote || defaultCard.quote,
        avatar: isCustom ? card.avatar : "",
        customAvatar: isCustom,
      };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    window.dispatchEvent(
      new CustomEvent("community-benefits-updated", { detail: getStoredBenefitsCards() })
    );
    await axios.post(`${BASE_URL}/api/community-benefits/update`, { cards: toSave });
    return true;
  } catch (err) {
    console.error("Error saving community benefits cards:", err);
    return false;
  }
};

export const resetStoredBenefitsCards = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("community-benefits-updated", { detail: DEFAULT_BENEFITS_CARDS })
    );
    return DEFAULT_BENEFITS_CARDS;
  } catch (err) {
    console.error("Error resetting community benefits cards:", err);
    return DEFAULT_BENEFITS_CARDS;
  }
};
