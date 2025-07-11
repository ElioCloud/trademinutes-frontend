"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";

export default function UserProfileSummaryPage() {
  const [profile, setProfile] = useState<{
    Name: string;
    Email: string;
    College?: string;
    Program?: string;
    YearOfStudy?: string;
    Skills?: string[];
  } | null>(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

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
          throw new Error("Invalid response format");
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch profile");

        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_TASK_API_URL}/api/tasks/get/user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const json = await res.json();
        setTasks(json.data || json);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    fetchProfile();
    fetchTasks();
  }, [router]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  if (loading || !profile) return null;

  return (
    <ProtectedLayout>
      <div
        className={`${
          isDarkMode ? "bg-black text-white" : "bg-white text-black"
        } min-h-screen flex`}
      >
        <main className="flex-1 p-6">
          <div className="min-h-screen bg-gray-100 p-6 flex flex-col lg:flex-row gap-6 justify-center items-start">
            {/* ─── Profile Card ─── */}
            <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-sm">
              <Image
                src="https://cdn.pixabay.com/photo/2020/09/29/13/27/woman-5612838_1280.jpg"
                alt="User"
                width={800}
                height={600}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
              <h2 className="text-lg font-semibold mb-1">{profile.Name}</h2>
              <p className="text-xs text-gray-400 mb-2">
                Last login: 12 Jun 2025, 22:10
              </p>
              <p className="text-sm">🎓 {profile.College || "Not specified"}</p>
              <p className="text-sm text-gray-500 mb-2">
                Program: {profile.Program || "Not specified"}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Year: {profile.YearOfStudy || "Not specified"}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Email: {profile.Email}
              </p>
              {profile.Skills && profile.Skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.Skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-violet-100 text-violet-800 px-2 py-1 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ─── Wallet + Tasks ─── */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Wallet Card */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base">
                    My Eliocloud Wallet
                  </h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-xs">Active account</p>
                      <p className="font-semibold">alexj.elio.credits</p>
                    </div>
                    <button className="text-xs bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-1 rounded-full font-medium">
                      Withdraw Funds
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-xs">Lifetime earnings</p>
                      <p className="font-semibold"> (730 🪙)</p>
                    </div>
                    <button className="text-xs bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-1 rounded-full font-medium">
                      View History
                    </button>
                  </div>
                </div>
              </div>

              {/* Tasks Card */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base">My Tasks</h3>
                  <button
                    onClick={() => router.push("/tasks/list")}
                    className="text-xs bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full shadow hover:scale-105 transition"
                  >
                    🔍 Go to Tasks Page
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  {tasks.length === 0 ? (
                    <p className="text-gray-500 text-sm">No tasks found.</p>
                  ) : (
                    tasks.map((task, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 bg-blue-500 rounded-full" />
                          <span>{task.Title}</span>
                        </div>
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                          {task.Credits} 🪙
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
