import { Users, Sparkles, Zap, Rocket, Globe, Terminal } from "lucide-react"

export const batchesData= [
  {
    id: "batch1",
    name: "The Uniques 1.0",
    description:
      "The founding batch of The Uniques Community. These members laid the foundation for our community's growth and established our core values.",
    icon: <Users className="h-4 w-4" />,
    memberCount: 15,
    achievements: ["community-building", "foundation", "mentorship"],
  },
  {
    id: "batch2",
    name: "The Uniques 2.0",
    description:
      "The second generation of Uniques members who expanded our community's reach and introduced innovative projects and initiatives.",
    icon: <Sparkles className="h-4 w-4" />,
    memberCount: 20,
    achievements: ["innovation", "hackathon-winners", "open-source"],
  },
  {
    id: "batch3",
    name: "The Uniques 3.0",
    description:
      "This batch brought diverse skills and perspectives, strengthening our technical expertise and community engagement.",
    icon: <Zap className="h-4 w-4" />,
    memberCount: 25,
    achievements: ["technical-excellence", "community-growth", "workshops"],
  },
  {
    id: "batch4",
    name: "The Uniques 4.0",
    description:
      "Our fourth generation of talented members, bringing fresh ideas and energy while building on established traditions.",
    icon: <Rocket className="h-4 w-4" />,
    memberCount: 30,
    achievements: ["rapid-growth", "diverse-skills", "collaboration"],
  },
  {
    id: "batch5",
    name: "The Uniques 5.0",
    description:
      "Driving hands-on engineering, advanced full-stack development, and high-impact industry challenges.",
    icon: <Globe className="h-4 w-4" />,
    memberCount: 35,
    achievements: ["full-stack", "industry-readiness", "innovation"],
  },
  {
    id: "batch6",
    name: "The Uniques 6.0",
    description:
      "The newest cohort pushing technological boundaries with fresh perspectives, agility, and elite skills.",
    icon: <Terminal className="h-4 w-4" />,
    memberCount: 40,
    achievements: ["cutting-edge", "ai-solutions", "leadership"],
  },
]

