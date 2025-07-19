import React from 'react';
import { FiHome, FiBookOpen, FiMonitor, FiHeart, FiUsers, FiHelpCircle, FiImage, FiGift } from 'react-icons/fi';
import Link from 'next/link';

const categories = [
  {
    name: 'Household Help',
    icon: <FiHome className="w-8 h-8" />,
    skills: '1,247 skills',
    examples: 'Cleaning, Cooking, Repairs & More'
  },
  {
    name: 'Tutoring & Study',
    icon: <FiBookOpen className="w-8 h-8" />,
    skills: '892 skills',
    examples: 'Math, Science, Language & More'
  },
  {
    name: 'Tech Help',
    icon: <FiMonitor className="w-8 h-8" />,
    skills: '1,156 skills',
    examples: 'Computer Setup, Software & More'
  },
  {
    name: 'Fitness & Wellness',
    icon: <FiHeart className="w-8 h-8" />,
    skills: '634 skills',
    examples: 'Yoga, Personal Training & More'
  },
  {
    name: 'Pet Care',
    icon: <FiUsers className="w-8 h-8" />,
    skills: '745 skills',
    examples: 'Dog Walking, Pet Sitting & More'
  },
  {
    name: 'Elderly Assistance',
    icon: <FiHelpCircle className="w-8 h-8" />,
    skills: '567 skills',
    examples: 'Companionship, Care & More'
  },
  {
    name: 'Creative Services',
    icon: <FiImage className="w-8 h-8" />,
    skills: '1,023 skills',
    examples: 'Design, Art, Photography & More'
  },
  {
    name: 'Volunteering',
    icon: <FiGift className="w-8 h-8" />,
    skills: '456 skills',
    examples: 'Community Service & More'
  }
];

export default function CategoriesGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Browse services by category
            </h2>
            <p className="text-gray-600 text-lg">
              Get some Inspirations from 1800+ skills
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link 
              key={category.name}
              href={`/services/search?category=${encodeURIComponent(category.name)}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-green-300 transition-all duration-300 cursor-pointer group block"
            >
              {/* Icon */}
              <div className="mb-4">
                <div className="text-gray-600 group-hover:text-green-600 transition-colors">
                  {category.icon}
                </div>
              </div>

              {/* Skills Count */}
              <p className="text-sm text-gray-500 mb-2">
                {category.skills}
              </p>

              {/* Category Name */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {category.name}
              </h3>

              {/* Examples */}
              <p className="text-sm text-gray-600">
                {category.examples}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
