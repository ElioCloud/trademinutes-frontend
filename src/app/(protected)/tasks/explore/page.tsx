"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import ServiceGrid from "@/components/ServiceGrid";
import ServiceFilters from "@/components/ServiceFilters";
import TaskMap from "@/components/tasks/TasksMap";
import { FiGrid, FiMap, FiUser, FiPlusCircle, FiSearch } from "react-icons/fi";
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';

interface Task {
  id: number;
  Title: string;
  Description: string;
  Location: string;
  Latitude: number;
  longitude: number;
  LocationType: string;
  Credits: number;
  Availability: any[];
  Type?: string;
  Status?: string;
  Author?: {
    id: string;
    Name: string;
    Email: string;
  };
}

// Transform API task to ServiceGrid format
const transformTaskToService = (task: any) => ({
  id: task._id || task.id || task.ID, // Ensure id is set for navigation
  category: task.Type || 'General',
  title: task.Title,
  rating: 4.8, // Default rating since API doesn't provide it
  reviews: Math.floor(Math.random() * 50) + 10, // Mock reviews
  user: task.Author?.Name || 'Anonymous',
  avatar: 'https://images.pexels.com/photos/277576/pexels-photo-277576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Default avatar
  price: task.Credits,
  image: 'https://cdn.pixabay.com/photo/2016/11/19/13/06/bed-1839184_1280.jpg', // Default image
});

// Dynamically import TaskMap to avoid SSR issues
const DynamicTaskMap = dynamic(() => import("@/components/tasks/TasksMap"), {
  ssr: false,
});

export default function Page() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  // Filter states
  const [deliveryTime, setDeliveryTime] = useState("");
  const [budget, setBudget] = useState("");
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }
      
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
        const res = await fetch(`${API_BASE_URL}/api/tasks/get/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        const tasks = json.data || json;
        // Transform tasks to service format
        const transformedServices = tasks.map(transformTaskToService);
        setServices(transformedServices);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Failed to load services. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <ProtectedLayout>
      {/* Hero Title & Search Bar */}
      <div className="flex flex-col items-center justify-center py-12 px-2 md:px-0 w-full">
        {/* Search Bar */}
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow flex flex-col md:flex-row items-center p-4 gap-2">
          <div className="flex items-center flex-1 min-h-[48px]">
            <FiSearch className="w-6 h-6 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search For Help or Services"
              className="w-full text-lg text-gray-700 outline-none placeholder-gray-400 bg-transparent min-h-[48px]"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search for help or services"
            />
          </div>
          <div className="w-full md:w-56 border-l md:border-l border-gray-200 md:pl-4 min-h-[48px] flex items-center">
            <select
              className="w-full text-lg bg-white text-gray-700 outline-none min-h-[44px] rounded-xl px-2"
              value={category}
              onChange={e => setCategory(e.target.value)}
              aria-label="Category"
            >
              <option value="">Category</option>
              <option>Home Repair</option>
              <option>Language Exchange</option>
              <option>Fitness & Wellness</option>
              <option>Household Help</option>
              <option>Tutoring & Study</option>
              <option>Pet Care</option>
              <option>Tech Help</option>
              <option>Creative Skills</option>
            </select>
          </div>
          <button
            className="w-full md:w-40 bg-emerald-500 text-white text-lg font-semibold py-3 rounded-xl hover:bg-emerald-600 transition min-h-[48px] flex items-center justify-center"
            onClick={() => {
              if (search.trim()) {
                router.push(`/services/search?q=${encodeURIComponent(search)}`);
              }
            }}
            aria-label="Search"
          >
            Search
          </button>
        </div>
        <div className="text-sm text-gray-400 mt-3">Popular: Gardening, Dog Walking, Coding Help, Resume Review, Piano Lessons</div>
      </div>
      {/* Filters and View Toggle in a single line */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        {/* Filters left */}
        {/* Removed duplicate <ServiceFilters /> to keep only the top search bar with the green button */}
        {/* View Toggle right */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1 mt-4 md:mt-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiGrid size={16} />
            Grid View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiMap size={16} />
            Map View
          </button>
        </div>
      </div>
      {/* Service Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-600 py-20">Loading services...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-20">{error}</div>
        ) : viewMode === 'grid' ? (
          <ServiceGrid items={services} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <DynamicTaskMap tasks={services} />
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
