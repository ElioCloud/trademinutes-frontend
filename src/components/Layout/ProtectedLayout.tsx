"use client";

import { useEffect, useState, ReactNode, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../common/Sidebar";
import { NotificationBell } from "../common/Sidebar";
import { useSession } from "next-auth/react";
import { FiPlusCircle } from "react-icons/fi";

interface LayoutProps {
  children: ReactNode;
  headerName?: string;
}

interface RealTimeActivity {
  user: string;
  title: string;
  category: string;
  avatar: string;
  id?: string; // Added id for clickability
}

export default function ProtectedLayout({ children, headerName }: LayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [realTimeActivities, setRealTimeActivities] = useState<RealTimeActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setIsDarkMode(saved === "dark");
  }, [isDarkMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Fetch real-time activities
  useEffect(() => {
    const fetchRealTimeActivities = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingActivities(false);
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
        
        // Transform tasks to activity format
        const activities: RealTimeActivity[] = tasks.slice(0, 10).map((task: any) => ({
          user: task.Author?.Name || 'Anonymous',
          title: task.Title || 'Untitled Task',
          category: task.Category || 'General',
          avatar: task.Author?.Avatar || 'https://images.pexels.com/photos/277576/pexels-photo-277576.jpeg?auto=compress&fit=facearea&w=64&h=64&facepad=2',
          id: task.ID || task.id || task._id // Ensure correct ID is used
        }));
        setRealTimeActivities(activities);
      } catch (err) {
        console.error("Failed to fetch real-time activities:", err);
        // Fallback to mock data if API fails
        setRealTimeActivities([
          { user: "Sarah Kim", title: "Dog Walking", category: "Pet Care", avatar: "https://images.pexels.com/photos/277576/pexels-photo-277576.jpeg?auto=compress&fit=facearea&w=64&h=64&facepad=2", id: "1" },
          { user: "Daniel Ortiz", title: "Math Tutoring", category: "Tutoring", avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&fit=facearea&w=64&h=64&facepad=2", id: "2" },
          { user: "Ayesha Patel", title: "Yoga Session", category: "Fitness", avatar: "https://images.pexels.com/photos/721979/pexels-photo-721979.jpeg?auto=compress&fit=facearea&w=64&h=64&facepad=2", id: "3" },
          { user: "Michael Chen", title: "PC Setup", category: "Tech Help", avatar: "https://images.pexels.com/photos/573570/pexels-photo-573570.jpeg?auto=compress&fit=facearea&w=64&h=64&facepad=2", id: "4" },
          { user: "Emma Davis", title: "House Cleaning", category: "Household Help", avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&fit=facearea&w=64&h=64&facepad=2", id: "5" },
        ]);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchRealTimeActivities();
    
    // Refresh activities every 30 seconds
    const interval = setInterval(fetchRealTimeActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white text-black min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-6 ">
        <TopBar realTimeActivities={realTimeActivities} loadingActivities={loadingActivities} />
        {children}
      </main>
    </div>
  );
}

// TopBar component for search and profile dropdown
function TopBar({ realTimeActivities, loadingActivities }: { realTimeActivities: RealTimeActivity[], loadingActivities: boolean }) {
  const { data: session } = useSession();
  const userImage: string | undefined = typeof session?.user?.image === 'string' ? session.user.image : undefined;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RealTimeActivity[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    if (dropdownOpen || showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, showSearchResults]);

  // Real-time search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = realTimeActivities.filter(activity => 
      activity.title.toLowerCase().includes(query) ||
      activity.user.toLowerCase().includes(query) ||
      activity.category.toLowerCase().includes(query)
    );

    setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
    setShowSearchResults(true);
  }, [searchQuery, realTimeActivities]);

  const handleSearchResultClick = (activity: RealTimeActivity) => {
    // Navigate to the task/service page
    if (activity.id) {
      router.push(`/tasks/view/${activity.id}`);
    }
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) return;
      
      try {
        // Fetch auth profile for user ID and credits
        const authRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8080'}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (authRes.ok) {
          const authData = await authRes.json();
          setProfileUserId(authData.ID || authData.id || null);
          setCredits(authData.Credits ?? authData.credits ?? null);
          setUserName(authData.Name || authData.name || "User");
        }
        
        // Fetch profile data for profile picture
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_PROFILE_API_URL || 'http://localhost:8081'}/api/profile/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfilePicture(profileData.ProfilePictureURL || null);
          if (!userName || userName === "User") {
            setUserName(profileData.Name || "User");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();
  }, [userName]);

  const userId = session?.user?.id;

  return (
          <div className="flex items-center mb-6 gap-8 w-full bg-white">
        {/* Enhanced Search Bar */}
        <div className="flex-1 max-w-2xl" ref={searchRef}>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() !== "" && setShowSearchResults(true)}
              placeholder="Search tasks, services, users, or categories..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleSearchResultClick(result)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <img 
                      src={result.avatar} 
                      alt={result.user} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{result.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{result.user}</span>
                        <span>•</span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                          {result.category}
                        </span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
            
            {/* No Results Message */}
            {showSearchResults && searchQuery.trim() !== "" && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                <p className="text-gray-500 text-center">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right controls: Notification, profile */}
        <div className="flex items-center gap-4 ml-auto">
          {credits !== null && (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm border border-green-300">
              Credits: {credits}
            </span>
          )}
          <NotificationBell userId={profileUserId || undefined} />
          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-gray-200 shadow-sm hover:bg-emerald-50 transition-colors"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              {profilePicture ? (
                <img src={profilePicture} alt={`${userName}'s profile picture`} className="w-8 h-8 rounded-full object-cover" />
              ) : userImage && userImage !== "" ? (
                <img src={userImage} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">Signed in</p>
                </div>
                <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-emerald-50">Profile</a>
                <a href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-emerald-50">Settings</a>
                <button type="button" onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }