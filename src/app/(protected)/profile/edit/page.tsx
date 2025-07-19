"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { 
  FaSave, 
  FaArrowLeft, 
  FaUser, 
  FaEnvelope, 
  FaBook, 
  FaMapPin, 
  FaTag, 
  FaGraduationCap,
  FaClock,
  FaInfo,
  FaCheck
} from "react-icons/fa";

interface ProfileData {
  Name: string;
  Email: string;
  College?: string;
  Program?: string;
  YearOfStudy?: string;
  Skills?: string[];
  ProfilePictureURL?: string;
  Location?: string;
  Bio?: string;
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    college: "",
    program: "",
    yearOfStudy: "",
    skills: [] as string[],
    location: "",
    bio: "",
  });

  const [skillInput, setSkillInput] = useState("");

  // Function to handle real-time field updates
  const handleFieldUpdate = async (field: string, value: string | string[]) => {
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
          [field]: value,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update field");
      }

      // Show success message briefly
      setSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update field");
      setTimeout(() => setError(null), 3000);
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
        
        if (!res.ok) throw new Error("Failed to fetch profile");
        
        const data = await res.json();
        setProfile(data);
        setFormData({
          college: data.College || "",
          program: data.Program || "",
          yearOfStudy: data.YearOfStudy || "",
          skills: data.Skills || [],
          location: data.Location || "",
          bio: data.Bio || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleImageUpload = (imageUrl: string) => {
    setProfile(prev => prev ? { ...prev, ProfilePictureURL: imageUrl } : null);
    setSuccess("Profile picture updated successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleImageRemove = () => {
    setProfile(prev => prev ? { ...prev, ProfilePictureURL: "" } : null);
  };

  const addSkill = async () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      const newSkills = [...formData.skills, trimmed];
      setFormData(prev => ({
        ...prev,
        skills: newSkills
      }));
      setSkillInput("");
      // Update skills in real-time
      await handleFieldUpdate('skills', newSkills);
    }
  };

  const removeSkill = async (skill: string) => {
    const newSkills = formData.skills.filter(s => s !== skill);
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
    // Update skills in real-time
    await handleFieldUpdate('skills', newSkills);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

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
          college: formData.college,
          program: formData.program,
          yearOfStudy: formData.yearOfStudy,
          skills: formData.skills,
          location: formData.location,
          bio: formData.bio,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-white"
            >
              <FaArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <FaCheck className="w-4 h-4 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <FaInfo className="w-4 h-4 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="w-5 h-5 text-blue-500" />
                Profile Picture
              </h2>
              <ProfilePictureUpload
                currentImageUrl={profile?.ProfilePictureURL}
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                isLoading={saving}
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaUser className="w-5 h-5 text-blue-500" />
                    Basic Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaUser className="w-4 h-4" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile?.Name || ""}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaEnvelope className="w-4 h-4" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile?.Email || ""}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaGraduationCap className="w-5 h-5 text-green-500" />
                    Academic Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaBook className="w-4 h-4" />
                        College/University
                      </label>
                      <input
                        type="text"
                        value={formData.college}
                        onChange={(e) => setFormData(prev => ({ ...prev, college: e.target.value }))}
                        onBlur={(e) => handleFieldUpdate('college', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your college/university"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Program
                      </label>
                      <input
                        type="text"
                        value={formData.program}
                        onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                        onBlur={(e) => handleFieldUpdate('program', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaClock className="w-4 h-4" />
                        Year of Study
                      </label>
                      <select
                        value={formData.yearOfStudy}
                        onChange={(e) => setFormData(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                        onBlur={(e) => handleFieldUpdate('yearOfStudy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaMapPin className="w-5 h-5 text-orange-500" />
                    Location
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaMapPin className="w-4 h-4" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      onBlur={(e) => handleFieldUpdate('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your location (city, state)"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Skills */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaTag className="w-5 h-5 text-purple-500" />
                    Skills & Services
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaTag className="w-4 h-4" />
                      Add Skills
                    </label>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Web Development, Math Tutoring"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-blue-600 hover:text-blue-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaInfo className="w-5 h-5 text-indigo-500" />
                    About Me
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      onBlur={(e) => handleFieldUpdate('bio', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell others about yourself, your skills, and what services you offer..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  );
} 