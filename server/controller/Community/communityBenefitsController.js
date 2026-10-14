import BenefitCard from "../../models/community/communityBenefitsModel.js";

const DEFAULT_BENEFITS_CARDS = [
  {
    cardId: 1,
    quote:
      "Leading this community has been an empowering experience! Driving community culture, bringing passionate minds together, and building an inclusive environment has transformed how I lead teams. Seeing members learn, collaborate, and grow under our collective initiatives is the most rewarding feeling.",
    name: "Vaishanavi Bajpai",
    title: "Community Organizer",
    avatar: "/src/assets/img/Community/testimonials/community-organizer.webp",
  },
  {
    cardId: 2,
    quote:
      "As Technical Lead, steering hands-on hackathons, coding bootcamps, and real-world tech architectures has taken my engineering mindset to new heights. Mentoring developers and solving complex technical roadblocks with such an innovative peer group has sharpened both my coding and architectural skills.",
    name: "Kumar Sujal",
    title: "Technical Lead",
    avatar: "/src/assets/img/Community/testimonials/technical-lead.webp",
  },
  {
    cardId: 3,
    quote:
      "Designing the visual identity and creative branding for the community has elevated my design perspective. From crafting striking event visuals and UI assets to ensuring consistent brand storytelling across every touchpoint, this role has helped me push creative boundaries and master digital aesthetics.",
    name: "Vasu Malhotra",
    title: "Graphics Lead",
    avatar: "/src/assets/img/Community/testimonials/graphics-lead.webp",
  },
  {
    cardId: 4,
    quote:
      "Orchestrating large-scale tech conferences and seamless workshops taught me the art of precision planning and crisis management. Managing speaker coordination, stage logistics, and audience experiences in real-time has made me a confident leader capable of executing flawless events.",
    name: "Laxmi Rajput",
    title: "Event Coordinator",
    avatar: "/src/assets/img/Community/testimonials/event-coordinator.webp",
  },
  {
    cardId: 5,
    quote:
      "Amplifying our community's voice and building viral digital campaigns has been exhilarating! Driving social engagement, spotlighting student achievements, and strategically growing our reach across platforms has unlocked master-level content strategy and community marketing skills for me.",
    name: "Nishant",
    title: "Social Media Lead",
    avatar: "/src/assets/img/Community/testimonials/social-media-lead.webp",
  },
];

export const getBenefitsCards = async (req, res) => {
  try {
    let cards = await BenefitCard.find().sort({ cardId: 1 });
    if (!cards || cards.length === 0) {
      await BenefitCard.insertMany(DEFAULT_BENEFITS_CARDS);
      cards = await BenefitCard.find().sort({ cardId: 1 });
    }
    res.status(200).json({ success: true, data: cards });
  } catch (error) {
    console.error("Error fetching benefits cards:", error);
    res.status(500).json({ success: false, message: "Error fetching benefits cards", error: error.message });
  }
};

export const updateBenefitsCards = async (req, res) => {
  try {
    const { cards } = req.body;
    if (!Array.isArray(cards)) {
      return res.status(400).json({ success: false, message: "Cards must be an array" });
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardId = card.cardId || card.id || i + 1;
      await BenefitCard.findOneAndUpdate(
        { cardId },
        {
          cardId,
          name: card.name,
          title: card.title,
          quote: card.quote,
          avatar: card.avatar || "",
          customAvatar: Boolean(card.customAvatar),
        },
        { upsert: true, new: true }
      );
    }

    const allCards = await BenefitCard.find().sort({ cardId: 1 });
    res.status(200).json({ success: true, message: "Benefits cards updated", data: allCards });
  } catch (error) {
    console.error("Error updating benefits cards:", error);
    res.status(500).json({ success: false, message: "Error updating benefits cards", error: error.message });
  }
};
