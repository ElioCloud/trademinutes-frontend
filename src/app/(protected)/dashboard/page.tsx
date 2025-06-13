"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { useTheme } from "next-themes";

const Map = dynamic(() => import("@/components/OpenStreetMap"), { ssr: false });

function SkillTagInput() {
  const [input, setInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      setTags([...tags, input.trim()]);
      setInput("");
    }
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

export default function ProfileDashboardPage() {
  const [profile, setProfile] = useState<{ name: string; email: string; university?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileStep, setProfileStep] = useState(1);
  const [formData, setFormData] = useState({
    university: "",
    program: "",
    yearOfStudy: "",
    skills: [] as string[],
  });

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("❌ No token found — redirecting");
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("https://trademinutes-auth.onrender.com/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const rawText = await res.text();
          throw new Error(rawText || "Invalid response format");
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unauthorized");

        setProfile(data);

        // if (!data.university) {
        //   setShowProfileDialog(true);
        // }
      } catch (error) {
        console.error("❌ Profile fetch error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return null;

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex bg-white text-black dark:bg-black dark:text-white">
        <main className="flex-1 p-6">
          <div className="flex justify-end mb-4">

          </div>

          {profile && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl shadow-md col-span-2 ${isDarkMode ? "bg-zinc-900" : "bg-white border border-gray-200"}`}>
                <h2 className="text-lg font-semibold mb-4">Welcome, {profile.name}</h2>
                <p className="text-sm mb-2">Email: <span className="font-medium">{profile.email}</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your dashboard metrics will appear below.</p>
              </div>

              <div className={`p-6 rounded-xl shadow-md ${isDarkMode ? "bg-zinc-900" : "bg-white border border-gray-200"}`}>
                <h2 className="text-lg font-semibold mb-4">Reviews</h2>
                <p className="text-3xl font-bold text-green-600 text-center mb-2">⭐4.85</p>
              </div>



              <div className={`p-6 rounded-xl shadow-md col-span-2 ${isDarkMode ? "bg-zinc-900" : "bg-white border border-gray-200"}`}>
                <h2 className="text-lg font-semibold mb-4">Locations</h2>
                <div className="h-64 rounded-lg overflow-hidden">
                  <Map />
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-md ${isDarkMode ? "bg-zinc-900" : "bg-white border border-gray-200"}`}>
                <h2 className="text-sm font-semibold mb-4">Your Credits</h2>
                <div className={`h-24 rounded-lg flex items-center justify-between px-4 ${isDarkMode ? "bg-zinc-700" : "bg-gray-100"}`}>
                  <div>

                    <p className="text-3xl font-bold text-green-600">152 🪙</p>
                    <p className="text-sm text-gray-500">Use credits to unlock premium content</p>
                  </div>

                </div>
                <br/>
                <h2 className="text-lg font-semibold mb-2">Activity Summary</h2>
                <div className={`h-24 rounded-lg flex items-center justify-between px-4 ${isDarkMode ? "bg-zinc-700" : "bg-gray-100"}`}>
                <div>
                  
                  <p className="text-sm">You have spent <span className="font-bold">3h 45m</span> learning this week.</p>
                  <p className="text-sm text-green-600 mt-1">+37 Credits Earned</p>
                </div></div>
              </div>

              <div className={`p-6 rounded-xl shadow-md col-span-2 ${isDarkMode ? "bg-zinc-900" : "bg-white border border-gray-200"}`}>
                <h2 className="text-lg font-semibold mb-4">Redeem Rewards</h2>
                <div className="space-y-3">
                  {[
                    { title: "$10 Discount Coupon", cost: 100 },
                    { title: "1-on-1 Mentorship Call", cost: 150 },
                    { title: "Premium Course Access", cost: 200 },
                  ].map((reward, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{reward.title}</span>
                      <button className="text-xs bg-violet-600 text-white px-3 py-1 rounded">
                        Redeem ({reward.cost} 🪙)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showProfileDialog && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white/90 p-6 rounded-lg shadow-xl w-full max-w-xl space-y-4 text-black">
                <h2 className="text-xl font-semibold">Complete Your Profile</h2>

                {profileStep === 1 && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="College/University"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full px-3 py-2 border rounded bg-white text-black"
                    />
                    <input
                      type="text"
                      placeholder="Program/Major"
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      className="w-full px-3 py-2 border rounded bg-white text-black"
                    />
                    <input
                      type="text"
                      placeholder="Year of Study"
                      value={formData.yearOfStudy}
                      onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                      className="w-full px-3 py-2 border rounded bg-white text-black"
                    />
                    <div className="text-right">
                      <button onClick={() => setProfileStep(2)} className="bg-violet-600 text-white px-4 py-2 rounded">
                        Next ➝
                      </button>
                    </div>
                  </div>
                )}

                {profileStep === 2 && (
                  <div className="space-y-4">
                    <SkillTagInput />
                    <div className="flex justify-between">
                      <button onClick={() => setProfileStep(1)} className="text-sm text-gray-500 underline">← Back</button>
                      <button
                        onClick={() => {
                          console.log("Submit profile:", { ...formData });
                          setShowProfileDialog(false);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                      >
                        Save Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedLayout>
  );
}
