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
  Title?: string;
  title?: string;
  Price?: number;
  price?: number;
  Category?: string;
  category?: string;
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

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Update failed");
    }
  };

  // ────────────────────────────────────────────────────────────────────────────

  const router = useRouter();

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

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROFILE_API_URL}/api/profile/get`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const rawText = await res.text();
          throw new Error(rawText || "Invalid response format");
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unauthorized");

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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROFILE_API_URL}/api/bookings/upcoming`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setUpcomingBookings(data.slice(0, 5)); // Get next 5 bookings
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchProfile();

    // Fetch tasks
    fetch(`${process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084"}/api/tasks/get/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(json => {
        let tasks: Task[] = [];
        if (json && Array.isArray(json.data)) {
          tasks = json.data;
        } else if (Array.isArray(json)) {
          tasks = json;
        }
        setTaskStats({
          total: tasks.length,
          credits: tasks.reduce((sum: number, t: Task) => sum + (t.Credits || 0), 0),
          recent: tasks.slice(0, 5),
        });
      });

    // Fetch upcoming appointments (realtime)
    let interval: NodeJS.Timeout;
    const fetchAppointments = async () => {
      try {
        // Get user ID from profile
        let userId;
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8081'}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) return;
        const profileData = await profileRes.json();
        userId = profileData.ID || profileData.id;
        if (!userId) return;
        // Use the same API as the appointments page
        const res = await fetch(`${process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084"}/api/bookings?role=owner&id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const bookings = (json.data || json || []);
        // For each booking, fetch task details if needed
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
        const tokenHeader = { Authorization: `Bearer ${token}` };
        const appointmentsWithTasks = await Promise.all(bookings.slice(0, 5).map(async (item: any, idx: number) => {
          let title = "(No title)";
          let dateStr = item.Timeslot?.date || null;
          let from = item.Timeslot?.timeFrom || null;
          let to = item.Timeslot?.timeTo || null;
          if (item.TaskID) {
            try {
              const taskRes = await fetch(`${API_BASE_URL}/api/tasks/get/${item.TaskID}`, { headers: tokenHeader });
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
            } catch {}
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

    // Mock service stats for demo
    setServiceStats({
      total: 12,
      earnings: 2840,
      recent: [
        { Title: "Web Development", Price: 150, Category: "Technology" },
        { Title: "Logo Design", Price: 75, Category: "Design" },
        { Title: "Content Writing", Price: 50, Category: "Writing" }
      ]
    });
  }, [router]);

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_PROFILE_API_URL}/api/profile/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCreditsAfter(data.Credits);
          setProfile(data);
          setShowBonusDialog(true);
          setTimeout(() => setShowBonusDialog(false), 3000);
        }
      }
    }, 2000);
  };

  if (loading) return null;

  return (
    <ProtectedLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">


            {/* Performance Metrics */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">Monthly Earnings</span>
                    <FaDollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">$2,840</div>
                  <div className="text-sm opacity-90">+12% from last month</div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">Services Completed</span>
                    <FaCheck className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-sm opacity-90">This month</div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">Average Rating</span>
                    <FaStar className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">4.8</div>
                  <div className="text-sm opacity-90">24 reviews</div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">Active Bookings</span>
                    <FaCalendar className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">5</div>
                  <div className="text-sm opacity-90">Upcoming</div>
                </div>
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
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                    <button className="absolute top-3 right-3 text-white hover:text-red-400">
                      <FaHeart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded mb-2">TECHNOLOGY</span>
                    <h4 className="font-semibold text-gray-900 mb-2">Professional Web Development Services</h4>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <span className="text-sm text-gray-600">Sarah Johnson</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">$150</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaStar className="w-4 h-4 text-yellow-400" />
                      <span>4.8 (24 reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-600 relative">
                    <button className="absolute top-3 right-3 text-white hover:text-red-400">
                      <FaHeart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded mb-2">DESIGN</span>
                    <h4 className="font-semibold text-gray-900 mb-2">Creative Logo & Brand Identity Design</h4>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <span className="text-sm text-gray-600">Mike Chen</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">$75</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaStar className="w-4 h-4 text-yellow-400" />
                      <span>4.9 (18 reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 relative">
                    <button className="absolute top-3 right-3 text-white hover:text-red-400">
                      <FaHeart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded mb-2">WRITING</span>
                    <h4 className="font-semibold text-gray-900 mb-2">Professional Content Writing & SEO</h4>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <span className="text-sm text-gray-600">Emma Davis</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">$50</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaStar className="w-4 h-4 text-yellow-400" />
                      <span>4.7 (31 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

      
            <div className="bg-white rounded-xl shadow-sm p-6">
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
                  </tbody>
                </table>
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">View All Bookings</button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white shadow-sm p-6 overflow-y-auto flex-shrink-0">
          {/* Profile & Stats Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Stats</h3>
              <FaEllipsisV className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">
                    {profile?.Name?.charAt(0) || "J"}
                  </span>
                </div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{profile?.completedServices || 0} services completed</p>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Good Morning {profile?.Name?.split(' ')[0] || 'Jason'} 🔥</h4>
              <p className="text-sm text-gray-600">Keep growing your business!</p>
            </div>

            {/* Earnings Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">Monthly Earnings</h5>
              <div className="flex items-end gap-2 h-24">
                <div className="flex-1 bg-blue-300 rounded-t" style={{height: '60%'}}></div>
                <div className="flex-1 bg-blue-400 rounded-t" style={{height: '80%'}}></div>
                <div className="flex-1 bg-blue-500 rounded-t" style={{height: '100%'}}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>
          </div>

          {/* Top Service Providers Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Providers</h3>
              <FaPlus className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Web Developer</p>
                  <div className="flex items-center gap-1 mt-1">
                    <FaStar className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-gray-600">4.8 (24)</span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full hover:bg-blue-200">
                  Hire
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Mike Chen</p>
                  <p className="text-xs text-gray-500">Designer</p>
                  <div className="flex items-center gap-1 mt-1">
                    <FaStar className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-gray-600">4.9 (18)</span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full hover:bg-purple-200">
                  Hire
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Emma Davis</p>
                  <p className="text-xs text-gray-500">Content Writer</p>
                  <div className="flex items-center gap-1 mt-1">
                    <FaStar className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-gray-600">4.7 (31)</span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full hover:bg-green-200">
                  Hire
                </button>
              </div>
            </div>
            
            <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium">View All Providers</button>
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

