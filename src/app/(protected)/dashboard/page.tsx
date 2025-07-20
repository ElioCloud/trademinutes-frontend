"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { FaTasks, FaListAlt, FaBook, FaHashtag } from "react-icons/fa";
import { 
  FaHome, 
  FaMoon, 
  FaBolt, 
  FaCog,
  FaPlus,
  FaSearch,
  FaBell,
  FaCalendar,
  FaChartLine,
  FaInfo,
  FaChevronDown,
  FaUsers,
  FaCheck,
  FaClipboard,
  FaPlay,
  FaTrophy,
  FaMedal,
  FaStar,
  FaEnvelope,
  FaBookOpen,
  FaClipboardList,
  FaUserFriends,
  FaSignOutAlt,
  FaHeart,
  FaArrowRight,
  FaArrowLeft,
  FaEllipsisV,
  FaMailBulk,
  FaChartBar,
  FaDollarSign,
  FaHandshake,
  FaTools,
  FaShoppingCart,
  FaUserTie,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe
} from "react-icons/fa";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const Map = dynamic(() => import("@/components/OpenStreetMap"), { ssr: false });

// ─── added modal-related helper component ──────────────────────────────────────
function SkillTagInput({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div>
      <label className="text-sm font-medium block mb-1">
        Skills & Services
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-violet-100 text-violet-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-red-500 font-bold leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          placeholder="e.g. #WebDevelopment"
          className="flex-1 px-3 py-2 border rounded bg-white text-black"
        />
        <button
          onClick={addTag}
          className="bg-violet-600 text-white px-3 py-2 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────

// Define Service type for marketplace stats
type Service = {
  id?: string;
  ID?: string;
  Title?: string;
  title?: string;
  Price?: number;
  price?: number;
  Category?: string;
  category?: string;
  rating?: number;
  Rating?: number;
  reviewCount?: number;
  ReviewCount?: number;
  reviews?: number;
  Reviews?: number;
  Images?: string[]; // Add Images field for cover images
  Author?: {
    Name?: string;
    ProfilePictureURL?: string;
    Avatar?: string;
  };
  author?: {
    name?: string;
    profilePictureURL?: string;
    avatar?: string;
  };
};

// Define Task type for taskStats
type Task = {
  Title?: string;
  title?: string;
  Credits?: number;
  credits?: number;
};

export default function ProfileDashboardPage() {
  const [profile, setProfile] = useState<{
    Name: string;
    Email: string;
    university?: string;
    program?: string;
    yearOfStudy?: string;
    skills?: string[];
    Credits?: number;
    isProvider?: boolean;
    rating?: number;
    completedServices?: number;
    totalEarnings?: number;
    ProfilePictureURL?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ─── new state for modal steps ──────────────────────────────────────────────
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileStep, setProfileStep] = useState(1);
  const [formError, setFormError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [formData, setFormData] = useState({
    university: "",
    program: "",
    yearOfStudy: "",
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");

  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [showBonusDialog, setShowBonusDialog] = useState(false);
  const [creditsBefore, setCreditsBefore] = useState<number | null>(null);
  const [creditsAfter, setCreditsAfter] = useState<number | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_PROFILE_API_URL || "http://localhost:8081";

  const updateProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token");

    const res = await fetch(`${API_BASE}/api/profile/update-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        college: formData.university,
        program: formData.program,
        yearOfStudy: formData.yearOfStudy,
        skills: formData.skills,
      }),
    });

    // Check for authentication errors
    if (res.status === 401 || res.status === 403) {
      console.warn("❌ Token invalid for profile update — redirecting to login");
      localStorage.removeItem("token");
      router.push("/login");
      throw new Error("Authentication failed");
    }

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Update failed");
    }
  };

  // ────────────────────────────────────────────────────────────────────────────

  const router = useRouter();

  // Handle service card click to navigate to task view
  const handleServiceClick = (service: Service) => {
    const serviceId = service.id || service.ID;
    if (serviceId) {
      router.push(`/tasks/view/${serviceId}`);
    }
  };

  // --- Analytics state ---
  const [taskStats, setTaskStats] = useState<{ total: number; credits: number; recent: Task[] }>({ total: 0, credits: 0, recent: [] });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  
  // --- Marketplace Analytics state ---
  const [serviceStats, setServiceStats] = useState<{ total: number; earnings: number; recent: Service[] }>({ total: 0, earnings: 0, recent: [] });
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [marketplaceStats, setMarketplaceStats] = useState({
    totalServices: 0,
    activeProviders: 0,
    totalBookings: 0,
    averageRating: 4.5
  });

  // Real-time updates state
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  // Recent Activity state
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("❌ No token found — redirecting");
      router.push("/login");
      return;
    }

    console.log("✅ JWT token loaded from localStorage:", token);

    // Validate token format (basic check)
    const validateToken = (token: string) => {
      try {
        // Basic JWT format validation (header.payload.signature)
        const parts = token.split('.');
        if (parts.length !== 3) {
          return false;
        }
        // Check if parts are base64 encoded (including URL-safe characters)
        return parts.every(part => /^[A-Za-z0-9+/=_-]+$/.test(part));
      } catch {
        return false;
      }
    };

    if (!validateToken(token)) {
      console.error("❌ Invalid token format — redirecting to login");
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    // Helper function to handle API calls with authentication
    const apiCall = async (url: string, options: RequestInit = {}) => {
      const res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      // Check for authentication errors
      if (res.status === 401 || res.status === 403) {
        console.warn("❌ Token invalid or expired — redirecting to login");
        localStorage.removeItem("token");
        router.push("/login");
        throw new Error("Authentication failed");
      }

      return res;
    };

    const fetchProfile = async () => {
      try {
        const res = await apiCall(
          `${process.env.NEXT_PUBLIC_PROFILE_API_URL}/api/profile/get`
        );

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const rawText = await res.text();
          console.error("❌ Non-JSON response:", rawText);
          throw new Error("Invalid response format from server");
        }

        const data = await res.json();
        if (!res.ok) {
          console.error("❌ API error:", data);
          throw new Error(data.error || data.message || "Failed to fetch profile");
        }

        // Detailed debug logging
        console.log("=== Profile Data Debug ===");
        console.log("Raw profile data:", JSON.stringify(data, null, 2));

        // Handle case-sensitive field names from API
        const profileData = {
          university:
            data.university ||
            data.University ||
            data.college ||
            data.College ||
            "",
          program:
            data.program || data.Program || data.major || data.Major || "",
          yearOfStudy:
            data.yearOfStudy ||
            data.YearOfStudy ||
            data.year ||
            data.Year ||
            "",
        };

        // Check if the fields exist and are not empty strings
        const hasUniversity =
          profileData.university && profileData.university.trim() !== "";
        const hasProgram =
          profileData.program && profileData.program.trim() !== "";
        const hasYearOfStudy =
          profileData.yearOfStudy && profileData.yearOfStudy.trim() !== "";

        console.log("Processed field values:", profileData);

        console.log("Field status:", {
          hasUniversity,
          hasProgram,
          hasYearOfStudy,
        });

        setProfile({
          ...data,
          university: profileData.university,
          program: profileData.program,
          yearOfStudy: profileData.yearOfStudy,
          skills: Array.isArray(data.skills) && data.skills.length > 0
            ? data.skills
            : Array.isArray(data.Skills)
              ? data.Skills
              : [],
        });

        // Only show dialog if any required field is missing or empty
        if (!hasUniversity || !hasProgram || !hasYearOfStudy) {
          console.log("Showing profile dialog - Missing fields detected");
          setShowProfileDialog(true);
          setFormData((prev) => ({
            ...prev,
            university: profileData.university.trim(),
            program: profileData.program.trim(),
            yearOfStudy: profileData.yearOfStudy.trim(),
            skills: Array.isArray(data.skills) ? data.skills : [],
          }));
        } else {
          console.log("All fields present - Not showing dialog");
          setShowProfileDialog(false);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await apiCall(
          `${process.env.NEXT_PUBLIC_PROFILE_API_URL}/api/bookings/upcoming`
        );

        if (res.ok) {
          const data = await res.json();
          // Ensure data is an array before calling slice
          if (Array.isArray(data)) {
            setUpcomingBookings(data.slice(0, 5)); // Get next 5 bookings
          } else {
            console.warn("Bookings data is not an array:", data);
            setUpcomingBookings([]);
          }
        } else {
          console.warn("⚠️ Failed to fetch bookings:", res.status);
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Authentication failed") {
          return; // Already handled by apiCall
        }
        console.error("Error fetching bookings:", error);
      }
    };

    const fetchServices = async () => {
      try {
        // Fetch user's services
        const res = await apiCall(
          `${process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084"}/api/tasks/get/user`
        );

        if (res.ok) {
          const data = await res.json();
          const services = data && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          
          // Update service stats with real data
          setServiceStats({
            total: services.length,
            earnings: services.reduce((sum: number, service: any) => sum + (service.Credits || 0), 0),
            recent: services.slice(0, 3).map((service: any) => ({
              id: service.ID || service.id,
              ID: service.ID || service.id,
              Title: service.Title || service.title,
              Price: service.Credits || service.credits || service.Price || service.price,
              Category: service.Category || service.category || 'General',
              rating: service.rating || service.Rating || 4.5,
              reviewCount: service.reviewCount || service.ReviewCount || service.reviews || service.Reviews || Math.floor(Math.random() * 20) + 5,
              Images: service.Images || [], // Add Images field
              Author: service.Author || service.author || {
                Name: profile?.Name || 'Provider',
                ProfilePictureURL: service.Author?.Avatar || service.author?.avatar || profile?.ProfilePictureURL
              }
            }))
          });
        } else {
          console.warn("⚠️ Failed to fetch services:", res.status);
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Authentication failed") {
          return; // Already handled by apiCall
        }
        console.error("Error fetching services:", error);
      }
    };

    fetchProfile();
    fetchServices();

    // Fetch tasks
    const fetchTasks = async () => {
      try {
        const res = await apiCall(
          `${process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084"}/api/tasks/get/user`
        );

        if (res.ok) {
          const json = await res.json();
          let tasks: Task[] = [];
          if (json && Array.isArray(json.data)) {
            tasks = json.data;
          } else if (json && Array.isArray(json)) {
            tasks = json;
          }
          setTaskStats({
            total: tasks.length,
            credits: tasks.reduce((sum: number, t: Task) => sum + (t.Credits || 0), 0),
            recent: tasks.slice(0, 5),
          });
        } else {
          console.warn("⚠️ Failed to fetch tasks:", res.status);
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Authentication failed") {
          return; // Already handled by apiCall
        }
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();

    // Fetch upcoming appointments (realtime)
    let interval: NodeJS.Timeout;
    const fetchAppointments = async () => {
      try {
        // Get user ID from profile
        let userId;
        const profileRes = await apiCall(
          `${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8081'}/api/auth/profile`
        );
        
        if (!profileRes.ok) {
          console.warn("⚠️ Failed to fetch user profile for appointments:", profileRes.status);
          return;
        }
        
        const profileData = await profileRes.json();
        userId = profileData.ID || profileData.id;
        if (!userId) return;
        
        // Use the same API as the appointments page
        const res = await apiCall(
          `${process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084"}/api/bookings?role=owner&id=${userId}`
        );
        
        if (!res.ok) return;
        const json = await res.json();
        const bookings = (json && json.data) ? json.data : (json || []);
        // Ensure bookings is an array
        if (!Array.isArray(bookings)) {
          console.warn("Bookings is not an array:", bookings);
          setUpcomingAppointments([]);
          return;
        }
        // For each booking, fetch task details if needed
        const appointmentsWithTasks = await Promise.all(bookings.slice(0, 5).map(async (item: any, idx: number) => {
          let title = "(No title)";
          let dateStr = item.Timeslot?.date || null;
          let from = item.Timeslot?.timeFrom || null;
          let to = item.Timeslot?.timeTo || null;
          if (item.TaskID) {
            try {
              const taskRes = await apiCall(
                `${process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084"}/api/tasks/get/${item.TaskID}`
              );
              if (taskRes.ok) {
                const taskData = await taskRes.json();
                title = taskData.Title || taskData.title || title;
                // Fallback: If booking is missing date/time, use task availability[0]
                if (!dateStr || !from || !to) {
                  dateStr = taskData.Availability?.[0]?.Date || null;
                  from = taskData.Availability?.[0]?.TimeFrom || null;
                  to = taskData.Availability?.[0]?.TimeTo || null;
                }
              }
            } catch (error) {
              if (error instanceof Error && error.message === "Authentication failed") {
                return; // Already handled by apiCall
              }
            }
          }
          // If still missing, set to N/A
          dateStr = dateStr || "N/A";
          from = from || "-";
          to = to || "-";
          return {
            id: item.ID || idx,
            title,
            date: dateStr,
            time: `${from} - ${to}`,
          };
        }));
        setUpcomingAppointments(appointmentsWithTasks);
      } catch (err) {
        if (err instanceof Error && err.message === "Authentication failed") {
          return; // Already handled by apiCall
        }
        console.error("Error fetching appointments:", err);
        setUpcomingAppointments([]);
      }
    };
    fetchAppointments();
    interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);

    // Mock marketplace stats for demo
    setMarketplaceStats({
      totalServices: 1247,
      activeProviders: 89,
      totalBookings: 3421,
      averageRating: 4.5
    });

    // Listen for profile picture updates and refresh data
    const handleProfilePictureUpdate = () => {
      console.log("🔄 Profile picture updated - refreshing dashboard data");
      // Refresh profile and services to get updated profile pictures
      fetchProfile();
      fetchServices();
    };

    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate);

    // Set up real-time updates
    const updateInterval = setInterval(() => {
      if (isLive) {
        setLastUpdate(new Date());
        // Refresh data every 30 seconds
        fetchProfile();
        fetchServices();
        fetchBookings();
        fetchAppointments();
      }
    }, 30000);

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate);
    };
  }, [router, isLive]);

  // Fetch recent activities for the user
  useEffect(() => {
    const fetchActivities = async () => {
      setActivitiesLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const TASK_API_BASE = process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:8084';
        const REVIEW_API_BASE = process.env.NEXT_PUBLIC_REVIEW_API_URL || 'http://localhost:8086';
        
        // Get user ID first
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8084'}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!profileRes.ok) throw new Error('Failed to fetch user profile');
        const profileData = await profileRes.json();
        const userId = profileData.ID || profileData.id;
        
        if (!userId) throw new Error('User ID not found');

        const allActivities: any[] = [];

        // 1. Fetch bookings as owner (services provided)
        try {
          const ownerBookingsRes = await fetch(`${TASK_API_BASE}/api/bookings?role=owner&id=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (ownerBookingsRes.ok) {
            const ownerBookings = await ownerBookingsRes.json();
            const bookings = ownerBookings.data || ownerBookings || [];
            
            bookings.forEach((booking: any) => {
              const activity = {
                id: `booking-${booking.ID || booking.id}`,
                type: 'service_provided',
                title: booking.TaskTitle || booking.taskTitle || 'Service Provided',
                description: `Provided "${booking.TaskTitle || booking.taskTitle}" service`,
                status: booking.Status || booking.status,
                timestamp: booking.CreatedAt || booking.createdAt || new Date().toISOString(),
                credits: booking.Credits || booking.credits || 0,
                clientName: booking.BookerName || booking.bookerName || 'Client'
              };
              allActivities.push(activity);
            });
          }
        } catch (err) {
          console.log('Error fetching owner bookings:', err);
        }

        // 2. Fetch bookings as booker (services booked)
        try {
          const bookerBookingsRes = await fetch(`${TASK_API_BASE}/api/bookings?role=booker&id=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (bookerBookingsRes.ok) {
            const bookerBookings = await bookerBookingsRes.json();
            const bookings = bookerBookings.data || bookerBookings || [];
            
            bookings.forEach((booking: any) => {
              const activity = {
                id: `booked-${booking.ID || booking.id}`,
                type: 'service_booked',
                title: booking.TaskTitle || booking.taskTitle || 'Service Booked',
                description: `Booked "${booking.TaskTitle || booking.taskTitle}" service`,
                status: booking.Status || booking.status,
                timestamp: booking.CreatedAt || booking.createdAt || new Date().toISOString(),
                credits: booking.Credits || booking.credits || 0,
                providerName: booking.TaskOwnerName || booking.taskOwnerName || 'Provider'
              };
              allActivities.push(activity);
            });
          }
        } catch (err) {
          console.log('Error fetching booker bookings:', err);
        }

        // 3. Fetch completed services (tasks)
        try {
          const tasksRes = await fetch(`${TASK_API_BASE}/api/tasks/get/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            const tasks = tasksData.data || tasksData || [];
            
            tasks.forEach((task: any) => {
              if (task.status === 'completed' || task.Status === 'completed') {
                const activity = {
                  id: `task-${task.ID || task.id}`,
                  type: 'service_completed',
                  title: task.Title || task.title || 'Service Completed',
                  description: `Completed "${task.Title || task.title}" service`,
                  status: 'completed',
                  timestamp: task.UpdatedAt || task.updatedAt || new Date().toISOString(),
                  credits: task.Credits || task.credits || 0
                };
                allActivities.push(activity);
              }
            });
          }
        } catch (err) {
          console.log('Error fetching tasks:', err);
        }

        // 4. Fetch reviews received
        try {
          // Get user's tasks first
          const tasksRes = await fetch(`${TASK_API_BASE}/api/tasks/get/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            const tasks = tasksData.data || tasksData || [];
            const taskIds = tasks.map((task: any) => task.ID || task.id || task._id);
            
            // Fetch reviews for each task
            for (const taskId of taskIds) {
              if (!taskId) continue;
              
              const reviewsRes = await fetch(`${REVIEW_API_BASE}/api/reviews?taskId=${taskId}`, {
                signal: AbortSignal.timeout(3000)
              });
              
              if (reviewsRes.ok) {
                const reviews = await reviewsRes.json();
                const reviewsArray = Array.isArray(reviews) ? reviews : (reviews.data || []);
                
                reviewsArray.forEach((review: any) => {
                  const activity = {
                    id: `review-${review.id || review._id}`,
                    type: 'review_received',
                    title: 'Review Received',
                    description: `Received ${review.rating || 5}★ review for "${review.taskTitle || 'service'}"`,
                    status: 'completed',
                    timestamp: review.createdAt || review.CreatedAt || new Date().toISOString(),
                    rating: review.rating || 5,
                    comment: review.comment || review.Comment || ''
                  };
                  allActivities.push(activity);
                });
              }
            }
          }
        } catch (err) {
          console.log('Error fetching reviews:', err);
        }

        // Sort activities by timestamp (most recent first)
        allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Take only the most recent 10 activities
        const recentActivities = allActivities.slice(0, 10);
        
        console.log('Recent activities:', recentActivities);
        setActivities(recentActivities);
        
      } catch (err) {
        console.error('Error fetching activities:', err);
        setActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchActivities();
  }, []);

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

  // When profile modal opens, show credits dialog
  useEffect(() => {
    if (showProfileDialog && profile?.Credits !== undefined) {
      setCreditsBefore(profile.Credits);
      setShowCreditsDialog(true);
    }
  }, [showProfileDialog, profile]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] });
    }
    setSkillInput("");
  };

  const handleProfileSaved = async () => {
    setProfileSaved(true);
    setTimeout(async () => {
      setShowProfileDialog(false);
      setProfileSaved(false);
      // Fetch updated profile
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_PROFILE_API_URL}/api/profile/get`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Check for authentication errors
          if (res.status === 401 || res.status === 403) {
            console.warn("❌ Token invalid for profile refresh — redirecting to login");
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }
          
          if (res.ok) {
            const data = await res.json();
            setCreditsAfter(data.Credits);
            setProfile(data);
            setShowBonusDialog(true);
            setTimeout(() => setShowBonusDialog(false), 3000);
          }
        } catch (error) {
          console.error("Error refreshing profile:", error);
        }
      }
    }, 2000);
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex h-screen bg-white items-center justify-center">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="flex h-screen bg-white">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">

            {/* User Greeting Section */}


            {/* Performance Metrics */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">
                    {isLive ? 'Live' : 'Offline'} • Last updated: {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#FAF6ED] rounded-xl p-6 text-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Monthly Earnings</span>
                    <FaDollarSign className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">${profile?.totalEarnings || serviceStats.earnings || 0}</div>
                  <div className="text-sm text-gray-600">
                    {profile?.totalEarnings && profile.totalEarnings > 0 ? '+12% from last month' : 'Start earning today'}
                  </div>
                </div>
                
                <div className="bg-[#FAF6ED] rounded-xl p-6 text-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Services Completed</span>
                    <FaCheck className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{profile?.completedServices || serviceStats.total || 0}</div>
                  <div className="text-sm text-gray-600">This month</div>
                </div>
                
                <div className="bg-[#FAF6ED] rounded-xl p-6 text-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <FaStar className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{profile?.rating || marketplaceStats.averageRating}</div>
                  <div className="text-sm text-gray-600">
                    {profile?.rating ? `${Math.floor(Math.random() * 50) + 10} reviews` : 'No reviews yet'}
                  </div>
                </div>
                
                <div className="bg-[#FAF6ED] rounded-xl p-6 text-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Active Bookings</span>
                    <FaCalendar className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{upcomingAppointments.length || upcomingBookings.length || 0}</div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="flex items-center gap-3 p-4 bg-[#FAF6ED] hover:bg-[#F5F0E0] rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center">
                    <FaPlus className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Create Service</p>
                    <p className="text-sm text-gray-600">List your skills</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-3 p-4 bg-[#FAF6ED] hover:bg-[#F5F0E0] rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center">
                    <FaCalendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Book Service</p>
                    <p className="text-sm text-gray-600">Find providers</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-3 p-4 bg-[#FAF6ED] hover:bg-[#F5F0E0] rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center">
                    <FaEnvelope className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Messages</p>
                    <p className="text-sm text-gray-600">View conversations</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-3 p-4 bg-[#FAF6ED] hover:bg-[#F5F0E0] rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center">
                    <FaStar className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Reviews</p>
                    <p className="text-sm text-gray-600">Rate services</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Services */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Services</h3>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <FaArrowLeft className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {serviceStats.recent.length > 0 ? (
                  serviceStats.recent.slice(0, 3).map((service, index) => {
                    const gradients = [
                      'from-blue-400 to-blue-600',
                      'from-purple-400 to-purple-600', 
                      'from-green-400 to-green-600'
                    ];
                    const colors = [
                      { bg: 'bg-blue-100', text: 'text-blue-600' },
                      { bg: 'bg-purple-100', text: 'text-purple-600' },
                      { bg: 'bg-green-100', text: 'text-green-600' }
                    ];
                    const categories = ['TECHNOLOGY', 'DESIGN', 'WRITING'];
                    
                    return (
                      <div 
                        key={index} 
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                        onClick={() => handleServiceClick(service)}
                      >
                        <div className="h-32 relative">
                          {service.Images && service.Images.length > 0 ? (
                            <img
                              src={service.Images[0]}
                              alt={service.Title || service.title || 'Service'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${gradients[index % gradients.length]}`}></div>
                          )}
                          <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                        <div className="p-4">
                          <span className={`inline-block px-2 py-1 ${colors[index % colors.length].bg} ${colors[index % colors.length].text} text-xs font-semibold rounded mb-2`}>
                            {service.Category || service.category || categories[index % categories.length]}
                          </span>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {service.Title || service.title || 'Service Title'}
                          </h4>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {service.Author?.Avatar || service.Author?.ProfilePictureURL || service.author?.avatar || service.author?.profilePictureURL ? (
                                <img 
                                  src={service.Author?.Avatar || service.Author?.ProfilePictureURL || service.author?.avatar || service.author?.profilePictureURL} 
                                  alt={service.Author?.Name || service.author?.name || 'Provider'} 
                                  className="w-6 h-6 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold ${(service.Author?.Avatar || service.Author?.ProfilePictureURL || service.author?.avatar || service.author?.profilePictureURL) ? 'hidden' : ''}`}>
                                {(service.Author?.Name || service.author?.name || profile?.Name || 'P').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm text-gray-600">
                                {service.Author?.Name || service.author?.name || profile?.Name || 'Provider'}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              ${service.Price || service.price || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FaStar className="w-4 h-4 text-yellow-400" />
                            <span>
                              {service.rating || service.Rating || profile?.rating || 4.5} 
                              ({service.reviewCount || service.ReviewCount || service.reviews || service.Reviews || Math.floor(Math.random() * 20) + 5} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // No services message
                  <div className="col-span-full">
                    <div className="bg-[#FAF6ED] rounded-xl p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <FaClipboardList className="w-16 h-16 text-emerald-700" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h4>
                      <p className="text-gray-600 mb-4">You haven't created any service listings yet.</p>
                      <div className="flex justify-center">
                        <button
                          onClick={() => router.push('/tasks/explore')}
                          className="bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-800 hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <FaPlus className="text-lg" />
                          Create Your First Service
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

      
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">SERVICE</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">CLIENT</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">DATE</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">STATUS</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(upcomingAppointments.length > 0 || upcomingBookings.length > 0) ? (
                      [...upcomingAppointments, ...upcomingBookings].slice(0, 5).map((booking, index) => {
                        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
                        const statuses = [
                          { bg: 'bg-green-100', text: 'text-green-600', label: 'Confirmed' },
                          { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Pending' },
                          { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Scheduled' }
                        ];
                        
                        return (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 ${colors[index % colors.length]} rounded-full flex items-center justify-center`}>
                                  <FaTools className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {booking.title || booking.Title || 'Service'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    ${booking.price || booking.Price || Math.floor(Math.random() * 200) + 50}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                                <span className="text-sm text-gray-700">
                                  {booking.client || booking.Client || 'Client'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              <div className="flex items-center gap-1">
                                <FaCalendar className="w-3 h-3 text-gray-400" />
                                <span className="text-sm">
                                  {booking.date || booking.Date || 'TBD'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-1 ${statuses[index % statuses.length].bg} ${statuses[index % statuses.length].text} text-xs font-semibold rounded`}>
                                {statuses[index % statuses.length].label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button className={`w-8 h-8 ${colors[index % colors.length]} text-white rounded-full flex items-center justify-center hover:opacity-80`}>
                                <FaArrowRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      // Fallback when no bookings
                      <>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <FaTools className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Web Development</p>
                                <p className="text-xs text-gray-500">$150</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                              <span className="text-sm text-gray-700">John Smith</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            <div className="flex items-center gap-1">
                              <FaCalendar className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">Dec 15, 2024</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded">Confirmed</span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600">
                              <FaArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <FaTools className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Logo Design</p>
                                <p className="text-xs text-gray-500">$75</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                              <span className="text-sm text-gray-700">Lisa Brown</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            <div className="flex items-center gap-1">
                              <FaCalendar className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">Dec 18, 2024</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-semibold rounded">Pending</span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600">
                              <FaArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">View All Bookings</button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 bg-white shadow-sm p-4 overflow-y-auto flex-shrink-0">
          {/* Profile & Stats Section */}
          <div className="mb-8">
            
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {profile?.ProfilePictureURL ? (
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden border-4 border-blue-200">
                    <Image
                      src={profile.ProfilePictureURL}
                      alt={`${profile.Name}'s profile picture`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-blue-200">
                    <span className="text-white font-bold text-lg">
                      {profile?.Name?.charAt(0) || "J"}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{profile?.completedServices || 0} services completed</p>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Good Morning {profile?.Name?.split(' ')[0] || 'Jason'} 🔥</h4>
              <p className="text-sm text-gray-600">Keep growing your business!</p>
            </div>
          </div>



          {/* Recent Activity Section (dynamic) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <FaClock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-4">
              {activitiesLoading ? (
                <div className="text-gray-400">Loading...</div>
              ) : activities.length === 0 ? (
                <div className="text-gray-400">No recent activity.</div>
              ) : (
                activities.map((activity, idx) => (
                  <div key={activity.id || idx} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'service_completed' ? 'bg-green-500' :
                      activity.type === 'service_provided' ? 'bg-blue-500' :
                      activity.type === 'service_booked' ? 'bg-purple-500' :
                      activity.type === 'review_received' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      {activity.credits && (
                        <p className="text-xs text-emerald-600 font-medium">{activity.credits} credits</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <FaBell className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <p className="text-sm font-medium text-gray-900">Booking reminder</p>
                <p className="text-xs text-gray-600">Logo Design session in 2 hours</p>
                <p className="text-xs text-gray-500">10 minutes ago</p>
              </div>
              
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-sm font-medium text-gray-900">New message</p>
                <p className="text-xs text-gray-600">From Sarah Johnson</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
              
              <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                <p className="text-sm font-medium text-gray-900">Service request</p>
                <p className="text-xs text-gray-600">New inquiry for Web Development</p>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
              
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                <p className="text-sm font-medium text-gray-900">Payment pending</p>
                <p className="text-xs text-gray-600">$75 for Logo Design</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── new profile-completion dialog (2-step) ───────────────────────────── */}
      {showProfileDialog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-[#e0fce6] via-white to-[#bbf7d0] p-8 rounded-2xl shadow-2xl w-full max-w-xl space-y-6 text-[#1a1446] border border-[#22c55e]/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-[#22c55e] rounded-full">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="block">
                  <path d="M6 12.5l4 4 8-8" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Complete Your Profile
            </h2>
            {/* Step 1: Basic academic info */}
            {profileStep === 1 && (
              <div className="space-y-4">
                <div className="text-green-700 bg-green-50 border border-green-200 rounded-full px-4 py-2 font-medium text-center">
                  Complete your profile to get <span className="font-bold">200 bonus credits!</span>
                </div>
                {formError && (
                  <div className="text-red-600 text-sm mb-2 font-medium">{formError}</div>
                )}
                <input
                  type="text"
                  placeholder="College/University"
                  value={formData.university}
                  onChange={e => {
                    setFormData({ ...formData, university: e.target.value });
                    if (formError) setFormError("");
                  }}
                  className="w-full px-5 py-3 border border-gray-200 rounded-full bg-white text-[#1a1446] placeholder-gray-400 text-base focus:border-[#22c55e] outline-none"
                />
                <input
                  type="text"
                  placeholder="Program/Major"
                  value={formData.program}
                  onChange={e => {
                    setFormData({ ...formData, program: e.target.value });
                    if (formError) setFormError("");
                  }}
                  className="w-full px-5 py-3 border border-gray-200 rounded-full bg-white text-[#1a1446] placeholder-gray-400 text-base focus:border-[#22c55e] outline-none"
                />
                <input
                  type="text"
                  placeholder="Year of Study (e.g. 2nd Year BSc)"
                  value={formData.yearOfStudy}
                  onChange={e => {
                    setFormData({ ...formData, yearOfStudy: e.target.value });
                    if (formError) setFormError("");
                  }}
                  className="w-full px-5 py-3 border border-gray-200 rounded-full bg-white text-[#1a1446] placeholder-gray-400 text-base focus:border-[#22c55e] outline-none"
                />
                <div className="text-right">
                  <button
                    onClick={() => {
                      if (!formData.university || !formData.program || !formData.yearOfStudy) {
                        setFormError("All fields are required.");
                        return;
                      }
                      setFormError("");
                      setProfileStep(2);
                    }}
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-6 py-2 rounded-full font-semibold shadow-sm transition"
                  >
                    Next ➝
                  </button>
                </div>
              </div>
            )}
            {/* Step 2: Skills & interests */}
            {profileStep === 2 && (
              <div className="space-y-6">
                {formError && (
                  <div className="text-red-600 text-sm mb-2 font-medium">{formError}</div>
                )}
                <div>
                  <label className="text-sm font-medium block mb-1 text-[#15803d]">Skills & Services</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#e0fce6] text-[#15803d] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-[#22c55e]/30"
                      >
                        {tag}
                        <button
                          onClick={() => setFormData({ ...formData, skills: formData.skills.filter((t) => t !== tag) })}
                          className="text-[#22c55e] font-bold leading-none ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="e.g. #WebDevelopment"
                      className="flex-1 px-5 py-3 border border-gray-200 rounded-full bg-white text-[#1a1446] placeholder-gray-400 text-base focus:border-[#22c55e] outline-none"
                    />
                    <button
                      onClick={handleAddSkill}
                      className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-6 py-2 rounded-full font-semibold shadow-sm transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => {
                      setFormError("");
                      setProfileStep(1);
                    }}
                    className="text-sm text-[#22c55e] hover:underline font-medium px-4 py-2 rounded-full bg-[#f0fdf4]"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={async () => {
                      if (!formData.skills || formData.skills.length === 0) {
                        setFormError("Please add at least one skill.");
                        return;
                      }
                      try {
                        await updateProfile();
                        handleProfileSaved();
                      } catch (e) {
                        alert((e as Error).message);
                      }
                    }}
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-8 py-2 rounded-full font-semibold shadow-sm transition"
                  >
                    Save Profile
                  </button>
                </div>
              </div>
            )}
            {profileSaved && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-2 font-medium justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-8" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Profile saved! You have received <span className="font-bold ml-1">200 bonus credits.</span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {showBonusDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl px-8 py-8 flex flex-col items-center gap-4 min-w-[320px] max-w-[90vw]">
            <div className="text-lg font-semibold text-[#1a1446] text-center">Your new credits: <span className="font-bold">{creditsAfter}</span></div>
            <div className="text-gray-600 text-center">{creditsAfter && creditsBefore !== null && creditsAfter > creditsBefore ? "Bonus applied!" : "No bonus applied."}</div>
            <button onClick={() => setShowBonusDialog(false)} className="mt-4 bg-[#22c55e] hover:bg-[#16a34a] text-white px-6 py-2 rounded-full font-semibold">OK</button>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}

