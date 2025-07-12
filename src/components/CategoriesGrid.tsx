import React from 'react';
import Link from 'next/link';

const categories = [
  { name: 'Tutoring', icon: '📚', description: 'Academic support and learning' },
  { name: 'Home Repair', icon: '🔧', description: 'Maintenance and fixes' },
  { name: 'Design', icon: '🎨', description: 'Creative and visual work' },
  { name: 'Gardening', icon: '🌱', description: 'Plants and outdoor care' },
  { name: 'Tech Support', icon: '💻', description: 'Computer and device help' },
  { name: 'Fitness', icon: '🏋️', description: 'Health and wellness' },
  { name: 'Cooking', icon: '👨‍🍳', description: 'Meal preparation and recipes' },
  { name: 'Pet Care', icon: '🐕', description: 'Animal care and walking' },
  { name: 'Music', icon: '🎵', description: 'Lessons and performances' },
  { name: 'Photography', icon: '📸', description: 'Photo and video services' },
  { name: 'Language', icon: '🗣️', description: 'Translation and teaching' },
  { name: 'Cleaning', icon: '🧹', description: 'House and office cleaning' },
  { name: 'Transportation', icon: '🚗', description: 'Rides and deliveries' },
  { name: 'Childcare', icon: '👶', description: 'Babysitting and care' },
  { name: 'Art & Crafts', icon: '🎭', description: 'Creative projects' },
  { name: 'Writing', icon: '✍️', description: 'Content and editing' },
  { name: 'Event Planning', icon: '🎉', description: 'Party and event coordination' },
  { name: 'Massage', icon: '💆', description: 'Therapy and relaxation' },
  { name: 'Plumbing', icon: '🔧', description: 'Pipe and fixture repair' },
  { name: 'Electrical', icon: '⚡', description: 'Wiring and electrical work' },
  { name: 'Carpentry', icon: '🔨', description: 'Woodwork and construction' },
  { name: 'Painting', icon: '🎨', description: 'Interior and exterior paint' },
  { name: 'Yoga', icon: '🧘', description: 'Meditation and flexibility' },
];

interface CategoriesGridProps {
  isCategoryPage?: boolean;
}

export default function CategoriesGrid({ isCategoryPage = false }: CategoriesGridProps) {
  // Show all categories on category page, first 6 on homepage
  const displayCategories = isCategoryPage ? categories : categories.slice(0, 6);

  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isCategoryPage ? 'All Categories' : 'Explore Popular Categories'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {isCategoryPage 
              ? 'Browse through our comprehensive list of categories to find the perfect match for your skills or discover help in areas you need.'
              : 'Find the perfect match for your skills or discover help in areas you need. Our community covers a wide range of services and expertise.'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {displayCategories.map((cat) => (
            <button 
              key={cat.name} 
              className="group flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors duration-300">
                <span className="text-2xl">{cat.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                {cat.description}
              </p>
            </button>
          ))}
        </div>
        
        {!isCategoryPage && (
          <div className="text-center mt-12">
            <Link href="/services/category">
              <button className="bg-emerald-600 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-700 transition-colors duration-300 shadow-md hover:shadow-lg">
                View All Categories
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
