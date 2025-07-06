"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { FaTasks, FaListAlt } from "react-icons/fa";

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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ─── new state for modal steps ──────────────────────────────────────────────
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileStep, setProfileStep] = useState(1);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    university: "",
    program: "",
    yearOfStudy: "",
    skills: [] as string[],
  });

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
          `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/profile`,
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
        const tasks = json.data || json;
        setTaskStats({
          total: tasks.length,
          credits: tasks.reduce((sum: number, t: Task) => sum + (t.Credits || 0), 0),
          recent: tasks.slice(0, 5),
        });
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

  if (loading) return null;

  return (
    <ProtectedLayout>
      <div
        className={`${
          isDarkMode ? "bg-black text-white" : "bg-white text-black"
        } min-h-screen flex`}
      >
        {/* Main content */}
        <main className="flex-1 p-6">
          {profile && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Welcome Panel */}
              <div
                className={`p-6 rounded-xl shadow-md col-span-2 ${
                  isDarkMode ? "bg-zinc-900" : "bg-white border border-gray-200"
                }`}
              >
                <h2 className="text-lg font-semibold mb-4">
                  Welcome, {profile.Name}
                </h2>
                <p className="text-sm mb-2">
                  Email: <span className="font-medium">{profile.Email}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your dashboard metrics will appear below.
                </p>
              </div>

              {/* --- Analytics Cards --- */}
              {/* Task Analytics */}
              <div className="p-6 rounded-xl shadow-md bg-white border border-gray-200 flex flex-col items-center">
                <FaTasks className="text-2xl text-emerald-600 mb-2" />
                <h3 className="font-semibold mb-1">Total Tasks</h3>
                <p className="text-3xl font-bold">{taskStats.total}</p>
              </div>
              <div className="p-6 rounded-xl shadow-md bg-white border border-gray-200 flex flex-col items-center">
                <FaListAlt className="text-2xl text-emerald-600 mb-2" />
                <h3 className="font-semibold mb-1">Credits Earned</h3>
                <p className="text-3xl font-bold">{taskStats.credits} 🪙</p>
              </div>
              <div className="p-6 rounded-xl shadow-md bg-white border border-gray-200 col-span-2">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><FaTasks /> Recent Tasks</h3>
                <ul className="text-sm space-y-1">
                  {taskStats.recent.length === 0 ? <li>No recent tasks.</li> : taskStats.recent.map((t: Task, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{t.Title || t.title}</span>
                      <span className="text-gray-500">{t.Credits || t.credits} 🪙</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Profile Analytics */}
              <div className="p-6 rounded-xl shadow-md bg-white border border-gray-200">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><FaListAlt /> Profile Completion</h3>
                <ul className="text-sm space-y-1">
                  <li>University: <span className="font-medium">{profile.university || "-"}</span></li>
                  <li>Program: <span className="font-medium">{profile.program || "-"}</span></li>
                  <li>Year: <span className="font-medium">{profile.yearOfStudy || "-"}</span></li>
                  <li className="flex items-center">
                    Skills:
                    {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                      <span className="inline-flex flex-wrap gap-2 ml-2">
                        {profile.skills.map((skill, i) => {
                          const colors = [
                            'bg-violet-100 text-violet-800',
                            'bg-emerald-100 text-emerald-800',
                            'bg-yellow-100 text-yellow-800',
                            'bg-pink-100 text-pink-800',
                            'bg-blue-100 text-blue-800',
                            'bg-orange-100 text-orange-800',
                          ];
                          const color = colors[i % colors.length];
                          return (
                            <span
                              key={skill}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </span>
                    ) : (
                      <span className="font-medium ml-2">-</span>
                    )}
                  </li>
                </ul>
              </div>
              {/* Map */}
              <div
                className={`p-6 rounded-xl shadow-md col-span-2 ${
                  isDarkMode ? "bg-zinc-900" : "bg-white border border-gray-200"
                }`}
              >
                <h2 className="text-lg font-semibold mb-4">Locations</h2>
                <div className="h-64 rounded-lg overflow-hidden">
                  <Map />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ─── new profile-completion dialog (2-step) ───────────────────────────── */}
        {showProfileDialog && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gradient-to-br from-[#f0fdf4] via-white to-[#bbf7d0] p-8 rounded-2xl shadow-2xl w-full max-w-xl space-y-6 text-[#1a1446] border border-[#22c55e]/20">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
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
                  {formError && (
                    <div className="text-red-600 text-sm mb-2 font-medium">{formError}</div>
                  )}
                  <input
                    type="text"
                    placeholder="College/University"
                    value={formData.university}
                    onChange={(e) => {
                      setFormData({ ...formData, university: e.target.value });
                      if (formError) setFormError("");
                    }}
                    className="w-full px-5 py-3 border border-gray-200 rounded-full bg-white text-[#1a1446] placeholder-gray-400 text-base focus:border-[#22c55e] outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Program/Major"
                    value={formData.program}
                    onChange={(e) => {
                      setFormData({ ...formData, program: e.target.value });
                      if (formError) setFormError("");
                    }}
                    className="w-full px-5 py-3 border border-gray-200 rounded-full bg-white text-[#1a1446] placeholder-gray-400 text-base focus:border-[#22c55e] outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Year of Study (e.g. 2nd Year BSc)"
                    value={formData.yearOfStudy}
                    onChange={(e) => {
                      setFormData({ ...formData, yearOfStudy: e.target.value });
                      if (formError) setFormError("");
                    }}
                    className="w-full px-5 py-3 border border-gray-200 rounded-full bg-white text-[#1a1446] placeholder-gray-400 text-base focus:border-[#22c55e] outline-none"
                  />
                  <div className="text-right">
                    <button
                      onClick={() => {
                        if (
                          !formData.university ||
                          !formData.program ||
                          !formData.yearOfStudy
                        ) {
                          setFormError(
                            "Please fill in all fields before continuing."
                          );
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
                  <SkillTagInput
                    tags={formData.skills}
                    setTags={(tags) =>
                      setFormData({ ...formData, skills: tags })
                    }
                  />
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setProfileStep(1)}
                      className="text-sm text-[#22c55e] hover:underline font-medium px-4 py-2 rounded-full bg-[#f0fdf4]"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await updateProfile();
                          setShowProfileDialog(false);
                          router.refresh?.();
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
            </div>
          </div>
        )}
        {/* ─────────────────────────────────────────────────────────────────────── */}
      </div>
    </ProtectedLayout>
  );
}
