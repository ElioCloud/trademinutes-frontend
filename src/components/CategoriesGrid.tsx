"use client";

import {
  FiHome,        // Household help
  FiBookOpen,    // Tutoring & study
  FiHeart,       // Fitness & wellness

  FiTool,        // Home repair
  FiCpu,         // Tech help
  FiGlobe,
  FiPenTool,
  FiPlay,       // Language exchange
} from "react-icons/fi";

const categories = [
  {
    icon: <FiHome size={28} />,
    title: "Household Help",
    subtitle: "Cooking • Cleaning • Errands",
    desc: "1 200 active swaps",
  },
  {
    icon: <FiBookOpen size={28} />,
    title: "Tutoring & Study",
    subtitle: "Math • Languages • Exam Prep",
    desc: "950 active swaps",
  },
  {
    icon: <FiHeart size={28} />,
    title: "Fitness & Wellness",
    subtitle: "Yoga • Personal Training • Meditation",
    desc: "710 active swaps",
  },
  {
    icon: <FiPlay size={28} />,
    title: "Pet Care",
    subtitle: "Dog Walking • Grooming • Sitting",
    desc: "640 active swaps",
  },
  {
    icon: <FiTool size={28} />,
    title: "Home Repair",
    subtitle: "Handyman • Painting • Gardening",
    desc: "530 active swaps",
  },
  {
    icon: <FiCpu size={28} />,
    title: "Tech Help",
    subtitle: "Phone Setup • PC Fix • Smart Home",
    desc: "880 active swaps",
  },
  {
    icon: <FiPenTool size={28} />,
    title: "Creative Skills",
    subtitle: "Photography • Crafts • Music",
    desc: "770 active swaps",
  },
  {
    icon: <FiGlobe size={28} />,
    title: "Language Exchange",
    subtitle: "English • Spanish • French & More",
    desc: "620 active swaps",
  },
];

export default function CategoriesGrid({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold">Swap by Skill Category</h2>
            <p className="text-gray-500 mt-1">
              Inspiration from 1 800+ skill exchanges
            </p>
          </div>
          <button className="text-sm font-semibold text-gray-700 hover:text-black flex items-center">
            All Categories <span className="ml-1">→</span>
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 hover:shadow-lg transition p-6 rounded-xl"
          >
            <div className="bg-emerald-50 text-emerald-700 p-4 w-fit rounded-full">
              {cat.icon}
            </div>
            <h3 className="font-semibold text-lg">{cat.title}</h3>
            <p className="text-gray-500 text-sm">{cat.subtitle}</p>
            <p className="text-gray-400 text-xs">{cat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
