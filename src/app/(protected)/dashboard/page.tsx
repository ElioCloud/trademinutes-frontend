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
  FaChartBar
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
        Skills &amp; Interests
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
          placeholder="e.g. #Python"
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
    Credits?: number; // Added Credits to profile type
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
        console.error("❌ Profile fetch error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
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

  // Helper to add a skill
  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  // After profile is saved, fetch profile and show bonus dialog
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
        <div className="flex-1 flex flex-col">


          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Featured Online Course */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-sm font-medium mb-2 opacity-90">ONLINE COURSE</h3>
                <h2 className="text-2xl font-bold mb-4">Sharpen Your Skills with Professional Online Courses</h2>
                <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                  Join Now
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute right-4 top-4 text-white/20">
                <FaStar className="w-8 h-8" />
              </div>
            </div>

            {/* Course Progress Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">%</span>
                  </div>
                  <FaEllipsisV className="w-4 h-4 text-gray-400" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">UI/UX Design</h4>
                <p className="text-sm text-gray-600">2/8 watched</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <span className="text-pink-600 font-bold">#</span>
                  </div>
                  <FaEllipsisV className="w-4 h-4 text-gray-400" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Branding</h4>
                <p className="text-sm text-gray-600">3/8 watched</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">🏢</span>
                  </div>
                  <FaEllipsisV className="w-4 h-4 text-gray-400" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Front End</h4>
                <p className="text-sm text-gray-600">6/12 watched</p>
              </div>
            </div>

            {/* Continue Watching */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Continue Watching</h3>
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
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded mb-2">FRONT END</span>
                    <h4 className="font-semibold text-gray-900 mb-2">Beginner's Guide to Becoming a Professional Front-End Developer</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-600">Leonardo samsul</span>
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
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded mb-2">UI/UX DESIGN</span>
                    <h4 className="font-semibold text-gray-900 mb-2">Optimizing User Experience with the Best UI/UX Design</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-600">Bayu Salto</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-pink-400 to-pink-600 relative">
                    <button className="absolute top-3 right-3 text-white hover:text-red-400">
                      <FaHeart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <span className="inline-block px-2 py-1 bg-pink-100 text-pink-600 text-xs font-semibold rounded mb-2">BRANDING</span>
                    <h4 className="font-semibold text-gray-900 mb-2">Reviving and Refresh Company Image</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-600">Padhang Satrio</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Lesson */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Lesson</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">MENTOR</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">TYPE</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">DESC</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">P</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Padhang Satrio</p>
                            <p className="text-xs text-gray-500">2/16/2004</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded">UI/UX DESIGN</span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">Understand Of UI/UX Design</td>
                      <td className="py-3 px-4">
                        <button className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600">
                          <FaArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className="mt-4 text-purple-600 hover:text-purple-700 font-medium">See All</button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white shadow-sm p-6 overflow-y-auto">
          {/* Statistics Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Statistic</h3>
              <FaEllipsisV className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">
                    {profile?.Name?.charAt(0) || "J"}
                  </span>
                </div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-sm text-gray-600 mb-1">32% completed</p>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Good Morning {profile?.Name?.split(' ')[0] || 'Jason'} 🔥</h4>
              <p className="text-sm text-gray-600">Continue your learning to achieve your target!</p>
            </div>

            {/* Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">Statistic</h5>
              <div className="flex items-end gap-2 h-24">
                <div className="flex-1 bg-purple-300 rounded-t" style={{height: '60%'}}></div>
                <div className="flex-1 bg-purple-400 rounded-t" style={{height: '80%'}}></div>
                <div className="flex-1 bg-purple-500 rounded-t" style={{height: '100%'}}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1-10 Aug</span>
                <span>11-20 Aug</span>
                <span>21-30 Aug</span>
              </div>
            </div>
          </div>

          {/* Your Mentor Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your mentor</h3>
              <FaPlus className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Padhang Satrio</p>
                  <p className="text-xs text-gray-500">Mentor</p>
                </div>
                <button className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full hover:bg-purple-200">
                  Follow
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Zakir Horizontal</p>
                  <p className="text-xs text-gray-500">Mentor</p>
                </div>
                <button className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full hover:bg-purple-200">
                  Follow
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Leonardo Samsul</p>
                  <p className="text-xs text-gray-500">Mentor</p>
                </div>
                <button className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full hover:bg-purple-200">
                  Follow
                </button>
              </div>
            </div>
            
            <button className="w-full mt-4 text-purple-600 hover:text-purple-700 font-medium">See All</button>
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
                  <label className="text-sm font-medium block mb-1 text-[#15803d]">Skills & Interests</label>
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
                      placeholder="e.g. #Python"
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
