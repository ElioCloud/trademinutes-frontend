"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  latitude: number;
  longitude: number;
  avatar: string;
  credits: number;
  taskTitle?: string;
}

// User-focused filter options
const filterOptions = [
  { key: 'rating', label: 'Rating', options: ['4.5+', '4.0+', '3.5+', 'Any'] },
  { key: 'credits', label: 'Credits', options: ['0-50', '51-100', '101-200', '200+'] },
  { key: 'distance', label: 'Distance', options: ['< 5km', '< 10km', '< 20km', 'Any'] },
  { key: 'availability', label: 'Availability', options: ['Online', 'In-person', 'Both'] },
  { key: 'experience', label: 'Experience', options: ['New', 'Experienced', 'Expert'] }
];

// 👤 Helper: avatar icon for marker with enhanced styling
const createAvatarIcon = (url: string) => {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  return L.divIcon({
    html: `<div style="
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: url('${url}') center/cover no-repeat;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 3px white;
      border: 2px solid #3b82f6;
      transition: all 0.3s ease;
      cursor: pointer;
    "></div>`,
    className: "custom-marker",
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
};

export default function UsersNearby() {
  const [center, setCenter] = useState<[number, number]>([43.6532, -79.3832]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    rating: 'Any',
    credits: 'Any',
    distance: 'Any',
    availability: 'Any',
    experience: 'Any'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => null,
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [isClient]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
        
        // Use the existing public tasks endpoint to get users with location data
        const response = await fetch(`${API_BASE_URL}/api/tasks/public`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        const tasks = data.data || data || [];
        
        // Extract unique users from tasks with valid coordinates
        const userMap = new Map<string, User>();
        
        tasks.forEach((task: any) => {
          if (task.Author && 
              task.Latitude && 
              task.Longitude && 
              !isNaN(task.Latitude) && 
              !isNaN(task.Longitude) &&
              task.Latitude !== 0 &&
              task.Longitude !== 0) {
            
            const authorId = task.Author.ID || task.Author.id;
            
            if (!userMap.has(authorId)) {
              userMap.set(authorId, {
                id: authorId,
                name: task.Author.Name || task.Author.name || 'Unknown User',
                email: task.Author.Email || task.Author.email || '',
                location: task.Location || 'Unknown Location',
                latitude: task.Latitude,
                longitude: task.Longitude,
                avatar: task.Author.Avatar || task.Author.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                credits: task.Credits || 0,
                taskTitle: task.Title
              });
            }
          }
        });
        
        const uniqueUsers = Array.from(userMap.values());
        setUsers(uniqueUsers);
        setFilteredUsers(uniqueUsers);
        
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Apply filters when filters or users change
  useEffect(() => {
    let filtered = [...users];

    // Apply rating filter (simulated - would need real rating data)
    if (filters.rating !== 'Any') {
      const minRating = parseFloat(filters.rating.replace('+', ''));
      // For now, we'll simulate ratings based on credits
      filtered = filtered.filter(user => user.credits >= minRating * 20);
    }

    // Apply credits filter
    if (filters.credits !== 'Any') {
      const [min, max] = filters.credits.split('-').map(Number);
      if (filters.credits === '200+') {
        filtered = filtered.filter(user => user.credits >= 200);
      } else {
        filtered = filtered.filter(user => user.credits >= min && user.credits <= max);
      }
    }

    // Apply distance filter (simulated - would need real distance calculation)
    if (filters.distance !== 'Any') {
      const maxDistance = parseInt(filters.distance.match(/\d+/)?.[0] || '20');
      // For now, we'll show all users since we don't have real distance calculation
      // In a real implementation, you'd calculate distance from user's location
    }

    // Apply availability filter (simulated - would need real availability data)
    if (filters.availability !== 'Any') {
      // For now, we'll show all users since we don't have real availability data
    }

    // Apply experience filter (simulated - would need real experience data)
    if (filters.experience !== 'Any') {
      // For now, we'll simulate experience based on credits
      if (filters.experience === 'New') {
        filtered = filtered.filter(user => user.credits < 50);
      } else if (filters.experience === 'Experienced') {
        filtered = filtered.filter(user => user.credits >= 50 && user.credits < 150);
      } else if (filters.experience === 'Expert') {
        filtered = filtered.filter(user => user.credits >= 150);
      }
    }

    setFilteredUsers(filtered);
  }, [filters, users]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      rating: 'Any',
      credits: 'Any',
      distance: 'Any',
      availability: 'Any',
      experience: 'Any'
    });
  };

  if (!isClient) {
    return (
      <div className="w-full h-[70vh] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-gray-700 text-lg font-medium">Loading interactive map...</p>
            <p className="text-gray-500 text-sm mt-2">Preparing your local community view</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[70vh] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-gray-700 text-lg font-medium">Discovering nearby users...</p>
            <p className="text-gray-500 text-sm mt-2">Finding service providers in your area</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[70vh] rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 to-pink-100 border border-red-200">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-700 text-lg font-medium mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-full h-[70vh] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-medium mb-2">No users found nearby</p>
            <p className="text-gray-500 text-sm">Users will appear here once they create tasks with location</p>
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-blue-700 text-sm font-medium">💡 Tip: Create a task with your location to appear on the map!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden bg-white shadow-2xl border border-gray-200">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Nearby Service Providers</h3>
            <p className="text-sm text-gray-600">{filteredUsers.length} of {users.length} users found</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-20 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Filter Users</h4>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {filterOptions.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{filter.label}</label>
                <select
                  value={filters[filter.key as keyof typeof filters]}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="w-full h-full" style={{ marginTop: showFilters ? '140px' : '80px' }}>
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom
          className="w-full h-full z-0"
          style={{ marginTop: '0' }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredUsers.map((user) => {
            const avatarIcon = createAvatarIcon(user.avatar);
            if (!avatarIcon) return null;

            return (
              <Marker
                key={user.id}
                position={[user.latitude, user.longitude]}
                icon={avatarIcon}
                eventHandlers={{
                  click: () => setSelectedUser(user),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-4 w-72 bg-white rounded-xl shadow-xl border border-gray-200">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={56}
                          height={56}
                          className="rounded-full object-cover border-2 border-blue-200"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-base">{user.name}</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {user.location}
                        </p>
                      </div>
                    </div>

                    {user.taskTitle && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Current Task
                        </p>
                        <p className="text-sm text-blue-700 mt-1">{user.taskTitle}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{user.credits}</p>
                        <p className="text-xs text-gray-600">Credits</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">✓</p>
                        <p className="text-xs text-gray-600">Available</p>
                      </div>
                    </div>

                    <Link
                      href={`/users/${user.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <span>View Profile</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Controls Overlay */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
          <button 
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
                  () => null,
                  { enableHighAccuracy: true, timeout: 5000 }
                );
              }
            }}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            title="Center on my location"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Count Badge */}
      <div className="absolute top-30 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">{filteredUsers.length} nearby</span>
          </div>
        </div>
      </div>
    </div>
  );
}
