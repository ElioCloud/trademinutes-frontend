"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { 
  FaUser, 
  FaEnvelope, 
  FaGraduationCap, 
  FaMapMarkerAlt, 
  FaTag, 
  FaStar, 
  FaCheck, 
  FaCalendar, 
  FaDollarSign, 
  FaTrophy,
  FaEdit,
  FaClock,
  FaUsers,
  FaChartLine,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash
} from "react-icons/fa";

const MOCK_STATS = [
  { label: "Total Patients", value: 520 },
  { label: "Recovery Rate", value: "87%" },
  { label: "Review", value: "4.8 /5" },
  { label: "Today's Counselling", value: 5 },
  { label: "Completed Counselling", value: 350 },
  { label: "Upcoming Counselling", value: 15 },
];

const MOCK_SCHEDULE = [
  { time: "09:00 AM - 10:00 AM", title: "Emma Wilson", type: "Family Counseling", status: "Completed" },
  { time: "10:30 AM - 11:30 AM", title: "Ethan James", type: "Individual Therapy", status: "Ongoing" },
  { time: "12:00 PM - 01:00 PM", title: "Sophia Davis", type: "Family Counseling", status: "Pending" },
  { time: "01:45 PM - 02:45 PM", title: "Liam Thompson", type: "Family Counseling", status: "Pending" },
];

const MOCK_REVIEWS = [
  {
    name: "Emma Wilson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    date: "2 days ago",
    text: "Dr. Blake is very patient and helped my child feel comfortable during therapy. We saw noticeable improvements. He really listens to concerns and provides thoughtful solutions. My child feels more confident after each session."
  },
  {
    name: "Sophia Davis",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 4,
    date: "3 days ago",
    text: "Dr. Blake helped my family communicate better. Highly recommend him for family therapy. His approach is gentle yet effective, which made a difference. We are now resolving conflicts more constructively."
  },
  {
    name: "Liam Thompson",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    date: "5 days ago",
    text: "The sessions are great. My family feels more connected, and my son is improving. Dr. Blake understands the underlying issues and addresses them thoughtfully. We're seeing positive changes in our family dynamic."
  },
  {
    name: "Ethan James",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    rating: 4,
    date: "1 week ago",
    text: "Excellent therapist. Dr. Blake provided great insight and strategies to manage anxiety. He takes time to listen and support."
  }
];

export default function UserProfileSummaryPage() {
  const [profile, setProfile] = useState<{
    Name: string;
    Email: string;
    College?: string;
    Program?: string;
    YearOfStudy?: string;
    Skills?: string[];
    Credits?: number;
    Phone?: string;
    Address?: string;
    ID?: string;
    ProfilePictureURL?: string;
    Bio?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewerNames, setReviewerNames] = useState<{ [id: string]: string }>({});
  const router = useRouter();

  // Editing states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    description: "Welcome to TradeMinutes! TradeMinutes is a modern service marketplace where you can offer, discover, and book a wide range of services—from tutoring and tech help to pet care and more. Earn credits by completing tasks, grow your reputation, and connect with a vibrant community of users.",
    howItWorks: [
      "Browse or list services in dozens of categories",
      "Book appointments and manage your schedule", 
      "Earn and spend credits for every transaction"
    ],
    achievements: [
      "Completed 12 tasks in 3 different categories",
      "Maintained a 4.9/5 average rating from 8 reviews",
      "Earned 100+ credits through service excellence"
    ],
    badges: ["Top Tasker", "Trusted Seller", "Community Helper"],
    skills: [] as string[],
    program: "",
    yearOfStudy: ""
  });
  const [newSkill, setNewSkill] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [newHowItWorks, setNewHowItWorks] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchReviewsForMyTasks = async (userId: string) => {
    try {
      const TASK_API_BASE = process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:8084';
      const REVIEW_API_BASE = process.env.NEXT_PUBLIC_REVIEW_API_URL || 'http://localhost:8086';
      const token = localStorage.getItem("token");
      const res = await fetch(`${TASK_API_BASE}/api/tasks/get/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tasks = await res.json();
      const myTaskIds = (tasks.data || []).map((task: any) => task.id || task._id);
      let allReviews: any[] = [];
      for (const taskId of myTaskIds) {
        const reviewRes = await fetch(`${REVIEW_API_BASE}/api/reviews?taskId=${taskId}`);
        if (reviewRes.ok) {
          const reviews = await reviewRes.json();
          allReviews = allReviews.concat(reviews);
        }
      }
      setReviews(allReviews);
    } catch (err) {
      console.error("Failed to fetch reviews for my tasks:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROFILE_API_URL}/api/profile/get`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) throw new Error("Invalid response format");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
        setProfile(data);
        
        // Initialize edit data with profile data
        setEditData(prev => ({
          ...prev,
          skills: data.Skills || [],
          program: data.Program || "",
          yearOfStudy: data.YearOfStudy || "",
          description: data.Bio || prev.description
        }));
        
        // Fetch reviews for this user's tasks
        if (data.ID) {
          fetchReviewsForMyTasks(data.ID);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const fetchReviewerName = async (reviewerId: string) => {
    if (reviewerNames[reviewerId]) return reviewerNames[reviewerId];
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8084';
      const res = await fetch(`${API_BASE_URL}/api/auth/user/${reviewerId}`);
      if (res.ok) {
        const data = await res.json();
        const name = data.Name || data.name || data.fullName || 'Unknown';
        setReviewerNames(prev => ({ ...prev, [reviewerId]: name }));
        return name;
      }
    } catch (err) {
      console.error('Failed to fetch reviewer name:', err);
    }
    setReviewerNames(prev => ({ ...prev, [reviewerId]: 'Unknown' }));
    return 'Unknown';
  };

  useEffect(() => {
    if (reviews.length > 0) {
      reviews.forEach((review) => {
        if (review.reviewerId && !reviewerNames[review.reviewerId]) {
          fetchReviewerName(review.reviewerId);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE = process.env.NEXT_PUBLIC_PROFILE_API_URL || "http://localhost:8081";
      
      const res = await fetch(`${API_BASE}/api/profile/update-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          college: profile?.College,
          program: editData.program,
          yearOfStudy: editData.yearOfStudy,
          skills: editData.skills,
          bio: editData.description,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      // Update local profile state
      setProfile(prev => prev ? {
        ...prev,
        Program: editData.program,
        YearOfStudy: editData.yearOfStudy,
        Skills: editData.skills,
        Bio: editData.description
      } : null);

      setEditingSection(null);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    // Reset edit data to original values
    setEditData(prev => ({
      ...prev,
      skills: profile?.Skills || [],
      program: profile?.Program || "",
      yearOfStudy: profile?.YearOfStudy || "",
      description: profile?.Bio || prev.description
    }));
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !editData.skills.includes(trimmed)) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addAchievement = () => {
    const trimmed = newAchievement.trim();
    if (trimmed && !editData.achievements.includes(trimmed)) {
      setEditData(prev => ({
        ...prev,
        achievements: [...prev.achievements, trimmed]
      }));
      setNewAchievement("");
    }
  };

  const removeAchievement = (achievement: string) => {
    setEditData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a !== achievement)
    }));
  };

  const addBadge = () => {
    const trimmed = newBadge.trim();
    if (trimmed && !editData.badges.includes(trimmed)) {
      setEditData(prev => ({
        ...prev,
        badges: [...prev.badges, trimmed]
      }));
      setNewBadge("");
    }
  };

  const removeBadge = (badge: string) => {
    setEditData(prev => ({
      ...prev,
      badges: prev.badges.filter(b => b !== badge)
    }));
  };

  const addHowItWorks = () => {
    const trimmed = newHowItWorks.trim();
    if (trimmed && !editData.howItWorks.includes(trimmed)) {
      setEditData(prev => ({
        ...prev,
        howItWorks: [...prev.howItWorks, trimmed]
      }));
      setNewHowItWorks("");
    }
  };

  const removeHowItWorks = (item: string) => {
    setEditData(prev => ({
      ...prev,
      howItWorks: prev.howItWorks.filter(h => h !== item)
    }));
  };

  if (loading || !profile) return null;

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-50 text-black flex flex-col gap-6 p-6">
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-[1400px] mx-auto">
          {/* Left: Profile Card */}
          <div className="w-full md:w-1/4 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Image 
                  src={profile.ProfilePictureURL || "/categories-banner.png"} 
                  alt="User" 
                  width={96} 
                  height={96} 
                  className="rounded-full border-4 border-white shadow-lg object-cover w-24 h-24" 
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <FaCheck className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">{profile.Name || 'TradeMinutes User'}</h2>
                <p className="text-sm text-gray-500">Marketplace Member</p>
                <p className="text-xs text-gray-400">User ID: TM-{profile.Email?.split('@')[0]}</p>
              </div>
              <button 
                onClick={() => router.push('/profile/edit')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors"
              >
                <FaEdit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* Profile Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                <div className="flex items-center gap-3">
                  <FaDollarSign className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Credits</p>
                    <p className="text-xl font-bold">{profile.Credits || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                <div className="flex items-center gap-3">
                  <FaCheck className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Tasks Completed</p>
                    <p className="text-xl font-bold">12</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white">
                <div className="flex items-center gap-3">
                  <FaStar className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Rating</p>
                    <p className="text-xl font-bold">4.9/5</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaEnvelope className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{profile.Email}</p>
                </div>
              </div>
              
              {profile.College && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaGraduationCap className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">College</p>
                    <p className="text-sm font-medium text-gray-900">{profile.College}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaUser className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Program</p>
                  {editingSection === 'program' ? (
                    <input
                      type="text"
                      value={editData.program}
                      onChange={(e) => setEditData(prev => ({ ...prev, program: e.target.value }))}
                      className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{editData.program || 'Not specified'}</p>
                  )}
                </div>
                {editingSection === 'program' ? (
                  <div className="flex gap-1">
                    <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                      <FaSave className="w-3 h-3" />
                    </button>
                    <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingSection('program')} className="text-blue-600 hover:text-blue-800">
                    <FaEdit className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaClock className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Year of Study</p>
                  {editingSection === 'yearOfStudy' ? (
                    <select
                      value={editData.yearOfStudy}
                      onChange={(e) => setEditData(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                      className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{editData.yearOfStudy || 'Not specified'}</p>
                  )}
                </div>
                {editingSection === 'yearOfStudy' ? (
                  <div className="flex gap-1">
                    <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                      <FaSave className="w-3 h-3" />
                    </button>
                    <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingSection('yearOfStudy')} className="text-blue-600 hover:text-blue-800">
                    <FaEdit className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FaTag className="w-4 h-4" />
                  Skills
                </h3>
                {editingSection === 'skills' ? (
                  <div className="flex gap-1">
                    <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                      <FaSave className="w-3 h-3" />
                    </button>
                    <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingSection('skills')} className="text-blue-600 hover:text-blue-800">
                    <FaEdit className="w-3 h-3" />
                  </button>
                )}
              </div>
              {editingSection === 'skills' ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Add skill"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button onClick={addSkill} className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editData.skills.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="text-blue-600 hover:text-blue-800">
                          <FaTimes className="w-2 h-2" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {editData.skills.map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Stats + About + Experience */}
          <div className="w-full md:w-2/4 flex flex-col gap-6">
            {/* About/Description */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaUser className="w-5 h-5 text-blue-500" />
                  About
                </h3>
                {editingSection === 'about' ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                      <FaSave className="w-4 h-4" />
                    </button>
                    <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingSection('about')} className="text-blue-600 hover:text-blue-800">
                    <FaEdit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  {editingSection === 'about' ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      {editData.description}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How It Works</h4>
                  {editingSection === 'about' ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newHowItWorks}
                          onChange={(e) => setNewHowItWorks(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHowItWorks())}
                          placeholder="Add how it works step"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button onClick={addHowItWorks} className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                          <FaPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {editData.howItWorks.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-700 flex-1">{item}</span>
                            <button onClick={() => removeHowItWorks(item)} className="text-red-600 hover:text-red-800">
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {editData.howItWorks.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FaTrophy className="w-4 h-4 text-yellow-500" />
                    Your Achievements
                  </h4>
                  {editingSection === 'about' ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newAchievement}
                          onChange={(e) => setNewAchievement(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAchievement())}
                          placeholder="Add achievement"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button onClick={addAchievement} className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                          <FaPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                        {editData.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="flex-1">{achievement}</span>
                            <button onClick={() => removeAchievement(achievement)} className="text-red-600 hover:text-red-800">
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                      {editData.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Badges</h4>
                  {editingSection === 'about' ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBadge}
                          onChange={(e) => setNewBadge(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBadge())}
                          placeholder="Add badge"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button onClick={addBadge} className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                          <FaPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {editData.badges.map((badge, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            {badge}
                            <button onClick={() => removeBadge(badge)} className="text-blue-600 hover:text-blue-800">
                              <FaTimes className="w-2 h-2" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {editData.badges.map((badge, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                <FaCalendar className="w-5 h-5 text-green-500" />
                Today's Tasks
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-green-800">10:00 AM - 11:00 AM</span>
                    <span className="text-xs text-green-600">John Doe</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-green-800">Dog Walking</span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-200 text-green-800">Completed</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-orange-800">11:30 AM - 12:30 PM</span>
                    <span className="text-xs text-orange-600">Jane Smith</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-orange-800">Math Tutoring</span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-200 text-orange-800">Pending</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-blue-800">2:00 PM - 3:00 PM</span>
                    <span className="text-xs text-blue-600">Alex Lee</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-blue-800">PC Setup</span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-200 text-blue-800">Ongoing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Reviews/Feedback */}
          <div className="w-full md:w-1/4 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                <FaStar className="w-5 h-5 text-yellow-500" />
                User Reviews
              </h3>
              <div className="flex flex-col gap-4">
                {reviewsLoading ? (
                  <div className="text-center text-gray-500 py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Loading reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <FaStar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No reviews yet</p>
                    <p className="text-xs">Start providing services to get reviews</p>
                  </div>
                ) : (
                  reviews.map((review, index) => (
                    <div key={review.id || index} className="flex gap-3 items-start border-b border-gray-100 pb-3 last:border-b-0">
                      <Image 
                        src="https://randomuser.me/api/portraits/men/32.jpg" 
                        alt="Reviewer" 
                        width={36} 
                        height={36} 
                        className="rounded-full w-9 h-9 object-cover" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">{reviewerNames[review.reviewerId] || 'Reviewer'}</span>
                          <span className="text-xs text-gray-400">
                            {review.createdAt ? new Date(review.createdAt * 1000).toLocaleDateString() : 'Unknown date'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}>
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{review.comment || 'No comment'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                <FaChartLine className="w-5 h-5 text-purple-500" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Reviews</span>
                  <span className="font-semibold text-gray-900">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold text-gray-900">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Response Time</span>
                  <span className="font-semibold text-gray-900">2h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
