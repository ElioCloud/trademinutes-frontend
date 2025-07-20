'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';

// The static users array is removed. We'll fetch from the backend instead.

const filterOptions = ['Skills', 'Price', 'Location', 'Level', 'Languages'];

export default function UserGrid() {
  const [filters, setFilters] = useState({
    Skills: '',
    Price: '',
    Location: '',
    Level: '',
    Languages: '',
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const USERS_PER_PAGE = 8;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Realtime polling for top users
  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8080';
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/auth/users/top?page=${page}&limit=${USERS_PER_PAGE}`);
        if (!res.ok) throw new Error('Failed to fetch top users');
        const data = await res.json();
        const usersArr = Array.isArray(data) ? data : (data.data || []);
        setUsers(usersArr);
        // Calculate total pages if count is available
        if (typeof data.count === 'number') {
          setTotalPages(Math.max(1, Math.ceil(data.count / USERS_PER_PAGE)));
        } else {
          setTotalPages(1);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page]);

  return (
    <section className="mt-10 px-4">
      {/* Filters & Pagination */}
      <div className="flex flex-wrap gap-3 mb-10 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {filterOptions.map((filter) => (
            <div key={filter} className="relative">
              <button className="px-4 py-2 rounded-md border text-sm text-black bg-white flex items-center gap-1">
                {filter} <span className="text-lg">▾</span>
              </button>
              {/* Optional dropdown content can go here */}
            </div>
          ))}
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            className="p-2 rounded-full border disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous Page"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-700 min-w-[2rem] text-center">{page}</span>
          <button
            className="p-2 rounded-full border disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next Page"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center text-gray-400 py-8">Loading top users...</div>
      )}
      {error && (
        <div className="text-center text-red-500 py-8">{error}</div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="border rounded-xl bg-white p-5 flex flex-col items-center text-center relative"
          >
            {/* Online Dot */}
            <span className="absolute top-4 right-4 w-3 h-3 rounded-full bg-green-500" />

            {/* Avatar */}
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
              {(() => {
                // Try avatar, ProfilePictureURL, profilePictureURL, fallback
                const pic = user.avatar && user.avatar.trim() !== ''
                  ? user.avatar
                  : user.ProfilePictureURL && user.ProfilePictureURL.trim() !== ''
                    ? user.ProfilePictureURL
                    : user.profilePictureURL && typeof user.profilePictureURL === 'string' && user.profilePictureURL.trim() !== ''
                      ? user.profilePictureURL
                      : "/categories-banner.png";
                return (
                  <Image
                    src={pic}
                    alt={user.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                );
              })()}
            </div>

            {/* Name & Role */}
            <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{user.role}</p>

            {/* Rating */}
            <p className="text-sm text-yellow-500 font-medium mb-2">
              ⭐ {user.rating}{' '}
              <span className="text-gray-400">({user.reviews} reviews)</span>
            </p>

            {/* Skills */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {(user.skills || []).map((skill: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs bg-pink-100 text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Location / Rate / Success */}
            <div className="w-full border-t pt-4 flex justify-between text-xs text-gray-600">
              <div>
                <p className="text-gray-400">Location</p>
                <p>{user.location}</p>
              </div>
              <div>
                <p className="text-gray-400">Rate</p>
                <p>{user.rate}</p>
              </div>
              <div>
                <p className="text-gray-400">Job Success</p>
                <p>{user.success}</p>
              </div>
            </div>

            {/* Profile Button */}
            <Link
              href={`/users/${user.id || user.ID}`}
              className="mt-5 px-4 py-2 text-sm rounded-md bg-green-100 text-green-800 font-medium inline-block text-center"
            >
              View Profile ↗
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}