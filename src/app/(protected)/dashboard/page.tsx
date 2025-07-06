"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { FaTasks, FaListAlt, FaBook, FaHashtag } from "react-icons/fa";

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
  const [profileSaved, setProfileSaved] = useState(false);

  const [formData, setFormData] = useState({
    university: "",
    program: "",
    yearOfStudy: "",
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");

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

  // Helper to add a skill
  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

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
          {/* Full-width colored stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
            {/* Total Tasks */}
            <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
              <div className="bg-[#22c55e]/20 p-3 rounded-full">
                <svg className="text-[#22c55e] w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Tasks</div>
                <div className="text-2xl font-bold text-black">{taskStats.total}</div>
              </div>
            </div>
            {/* Completed */}
            <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
              <div className="bg-[#3b82f6]/20 p-3 rounded-full">
                <svg className="text-[#3b82f6] w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Completed</div>
                <div className="text-2xl font-bold text-black">{taskStats.recent.length}</div>
              </div>
            </div>
            {/* In Progress */}
            <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
              <div className="bg-[#f59e42]/20 p-3 rounded-full">
                <svg className="text-[#f59e42] w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">In Progress</div>
                <div className="text-2xl font-bold text-black">{taskStats.total - taskStats.recent.length}</div>
              </div>
            </div>
            {/* Credits Earned */}
            <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
              <div className="bg-[#a855f7]/20 p-3 rounded-full">
                <svg className="text-[#a855f7] w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#a855f7">#</text></svg>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Credits Earned</div>
                <div className="text-2xl font-bold text-black">{taskStats.credits}</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* All widgets and panels removed. Dashboard is now empty. */}
          </div>
        </main>

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
                          setProfileSaved(true);
                          setTimeout(() => {
                            setShowProfileDialog(false);
                            setProfileSaved(false);
                            router.refresh?.();
                          }, 2000);
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
                  Profile saved!
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
