import React from 'react';

export default function ServiceFilters() {
  return (
    <div className="flex flex-row flex-wrap md:flex-nowrap items-center gap-4 mb-0 w-full">
      <input
        type="text"
        placeholder="Search services..."
        className="px-4 py-2 border-2 border-gray-100 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors duration-200 w-full md:w-64"
      />
      <select className="px-4 py-2 border-2 border-gray-100 rounded-lg bg-white text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors duration-200 w-full md:w-48">
        <option>All Categories</option>
        <option>Tutoring</option>
        <option>Home Repair</option>
        <option>Design</option>
        <option>Gardening</option>
        <option>Tech Support</option>
        <option>Fitness</option>
      </select>
      <select className="px-4 py-2 border-2 border-gray-100 rounded-lg bg-white text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors duration-200 w-full md:w-40">
        <option>Any Price</option>
        <option>Under $20</option>
        <option>$20 - $50</option>
        <option>Over $50</option>
      </select>
      <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg w-full md:w-auto">
        Filter
      </button>
    </div>
  );
}
