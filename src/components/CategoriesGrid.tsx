import React from 'react';
import { FaLaptopCode, FaPalette, FaBullhorn, FaFileAlt, FaMicrophone, FaPlay, FaRuler, FaChartBar } from 'react-icons/fa';

const categories = [
  {
    name: 'Development & IT',
    icon: <FaLaptopCode className="w-8 h-8" />,
    skills: '1,853 skills',
    examples: 'Software Engineer, Web / Mobile Developer & More'
  },
  {
    name: 'Design & Creative',
    icon: <FaPalette className="w-8 h-8" />,
    skills: '1,247 skills',
    examples: 'UI/UX Designer, Graphic Designer & More'
  },
  {
    name: 'Digital Marketing',
    icon: <FaBullhorn className="w-8 h-8" />,
    skills: '892 skills',
    examples: 'SEO Specialist, Social Media Manager & More'
  },
  {
    name: 'Writing & Translation',
    icon: <FaFileAlt className="w-8 h-8" />,
    skills: '1,156 skills',
    examples: 'Content Writer, Translator & More'
  },
  {
    name: 'Music & Audio',
    icon: <FaMicrophone className="w-8 h-8" />,
    skills: '634 skills',
    examples: 'Voice Over Artist, Music Producer & More'
  },
  {
    name: 'Video & Animation',
    icon: <FaPlay className="w-8 h-8" />,
    skills: '745 skills',
    examples: 'Video Editor, Animator & More'
  },
  {
    name: 'Engineering & Architecture',
    icon: <FaRuler className="w-8 h-8" />,
    skills: '1,023 skills',
    examples: 'Civil Engineer, Architect & More'
  },
  {
    name: 'Finance & Accounting',
    icon: <FaChartBar className="w-8 h-8" />,
    skills: '567 skills',
    examples: 'Financial Analyst, Accountant & More'
  }
];

export default function CategoriesGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Browse talent by category
            </h2>
            <p className="text-gray-600 text-lg">
              Get some Inspirations from 1800+ skills
            </p>
          </div>
          <a 
            href="/services/category" 
            className="text-green-600 hover:text-green-700 font-medium text-lg transition-colors"
          >
            All Categories →
          </a>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div 
              key={category.name}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-green-300 transition-all duration-300 cursor-pointer group"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-green-50 border-2 border-green-200 rounded-full mb-4 group-hover:bg-green-100 group-hover:border-green-300 transition-colors">
                <div className="text-green-600 group-hover:text-green-700">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
