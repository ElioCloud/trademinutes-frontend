"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { 
  FiUser, 
  FiMail, 
  FiAward, 
  FiMapPin, 
  FiStar, 
  FiCheck, 
  FiCalendar, 
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiUsers
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";

interface UserProfile {
  ID: string;
  Name: string;
  Email: string;
  College?: string;
  Program?: string;
  YearOfStudy?: string;
  Skills?: string[];
  Credits?: number;
  Phone?: string;
  Address?: string;
  ProfilePictureURL?: string;
  CoverImageURL?: string;
  Bio?: string;
}

interface Review {
  id: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName?: string;
  reviewerProfilePicture?: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    responseRate: 0,
    avgResponseTime: 0,
    memberSince: ''
  });
  const [profileStats, setProfileStats] = useState({
    credits: 0,
    tasksCompleted: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        const PROFILE_API_BASE = process.env.NEXT_PUBLIC_PROFILE_API_URL || 'http://localhost:8083';
        const AUTH_API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8084';
        
        // Try to get profile from profile service
        const profileRes = await fetch(`${PROFILE_API_BASE}/api/profile/${userId}`);
        let profileData: any = {};
        
        if (profileRes.ok) {
          profileData = await profileRes.json();
        }
        
        // Try to get additional user info from auth service
        const authRes = await fetch(`${AUTH_API_BASE}/api/auth/user/${userId}`);
        if (authRes.ok) {
          const authData = await authRes.json();
          profileData = { ...profileData, ...authData };
        }
        
        if (!profileData.Name && !profileData.name) {
          throw new Error('User not found');
        }
        
        setProfile({
          ID: userId,
          Name: profileData.Name || profileData.name || 'Unknown User',
          Email: profileData.Email || profileData.email || '',
          College: profileData.College || profileData.college,
          Program: profileData.Program || profileData.program,
          YearOfStudy: profileData.YearOfStudy || profileData.yearOfStudy,
          Skills: profileData.Skills || profileData.skills || [],
          Credits: profileData.Credits || profileData.credits || 0,
          Phone: profileData.Phone || profileData.phone,
          Address: profileData.Address || profileData.address,
          ProfilePictureURL: profileData.ProfilePictureURL || profileData.profilePictureURL,
          CoverImageURL: profileData.CoverImageURL || profileData.coverImageURL,
          Bio: profileData.Bio || profileData.bio
        });
        
        // Fetch user stats and reviews
        await fetchUserStats(userId);
        await fetchUserReviews(userId);
        
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('User not found or profile unavailable');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserStats = async (userId: string) => {
    try {
      const TASK_API_BASE = process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:8084';
      const REVIEW_API_BASE = process.env.NEXT_PUBLIC_REVIEW_API_URL || 'http://localhost:8086';
      const AUTH_API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8084';
      
      // Fetch user's tasks
      const tasksRes = await fetch(`${TASK_API_BASE}/api/tasks/get/user`);
      let totalTasks = 0;
      let respondedTasks = 0;
      let tasksCompleted = 0;
      
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        const tasks = tasksData.data || tasksData || [];
        totalTasks = tasks.length;
        
        tasks.forEach((task: any) => {
          if (task.status === 'completed' || task.status === 'in_progress') {
            respondedTasks++;
          }
          if (task.status === 'completed' || task.status === 'Completed') {
            tasksCompleted++;
          }
        });
      }
      
      // Fetch reviews
      let totalReviews = 0;
      let totalRating = 0;
      let reviewCount = 0;
      
      try {
        const reviewsRes = await fetch(`${REVIEW_API_BASE}/api/reviews/user/${userId}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          const reviews = Array.isArray(reviewsData) ? reviewsData : (reviewsData.data || []);
          totalReviews = reviews.length;
          
          reviews.forEach((review: any) => {
            const rating = review.rating || review.Rating || 0;
            if (rating > 0) {
              totalRating += rating;
              reviewCount++;
            }
          });
        }
      } catch (reviewErr) {
        console.error("Error fetching reviews for stats:", reviewErr);
      }
      
      // Fetch user creation date
      let memberSince = '';
      try {
        const userRes = await fetch(`${AUTH_API_BASE}/api/auth/user/${userId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.createdAt) {
            memberSince = new Date(userData.createdAt).getFullYear().toString();
          }
        }
      } catch (userErr) {
        console.error("Error fetching user data for stats:", userErr);
      }
      
      // Calculate statistics
      const responseRate = totalTasks > 0 ? Math.round((respondedTasks / totalTasks) * 100) : 0;
      const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
      
      setStats({
        totalReviews,
        responseRate,
        avgResponseTime: 2, // Default value
        memberSince: memberSince || '2024'
      });
      
      setProfileStats({
        credits: profile?.Credits || 0,
        tasksCompleted,
        rating: Math.round(averageRating * 10) / 10
      });
      
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchUserReviews = async (userId: string) => {
    try {
      const REVIEW_API_BASE = process.env.NEXT_PUBLIC_REVIEW_API_URL || 'http://localhost:8086';
      const AUTH_API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8084';
      
      // Try to get reviews for this user
      const reviewsRes = await fetch(`${REVIEW_API_BASE}/api/reviews/user/${userId}`);
      let allReviews: Review[] = [];
      
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        const reviews = Array.isArray(reviewsData) ? reviewsData : (reviewsData.data || []);
        
        // Fetch reviewer names and profile pictures
        for (const review of reviews) {
          try {
            const reviewerRes = await fetch(`${AUTH_API_BASE}/api/auth/user/${review.reviewerId}`);
            if (reviewerRes.ok) {
              const reviewerData = await reviewerRes.json();
              review.reviewerName = reviewerData.Name || reviewerData.name || 'Unknown User';
            }
          } catch (err) {
            review.reviewerName = 'Unknown User';
          }
        }
        
        allReviews = reviews;
      }
      
      setReviews(allReviews);
      
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The user profile you are looking for does not exist.'}</p>
          <a 
            href="/" 
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {profile.CoverImageURL && (
          <Image 
            src={profile.CoverImageURL} 
            alt="Cover" 
            fill
            className="object-cover" 
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Profile Picture */}
              <div className="relative p-6">
                <div className="flex justify-center">
                  <Image 
                    src={profile.ProfilePictureURL || "/categories-banner.png"} 
                    alt={profile.Name} 
                    width={120} 
                    height={120} 
                    className="rounded-full border-4 border-white shadow-lg object-cover w-30 h-30" 
                  />
                </div>
                <div className="text-center mt-4">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.Name}</h1>
                  <p className="text-gray-500">TradeMinutes Member</p>
                </div>
              </div>

              {/* Stats */}
              <div className="px-6 pb-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                  <div className="flex items-center gap-3">
                    <FiDollarSign className="w-5 h-5" />
                    <div>
                      <p className="text-sm opacity-90">Credits</p>
                      <p className="text-xl font-bold">{profileStats.credits}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                  <div className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5" />
                    <div>
                      <p className="text-sm opacity-90">Tasks Completed</p>
                      <p className="text-xl font-bold">{profileStats.tasksCompleted}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white">
                  <div className="flex items-center gap-3">
                    <FiStar className="w-5 h-5" />
                    <div>
                      <p className="text-sm opacity-90">Rating</p>
                      <p className="text-xl font-bold">{profileStats.rating > 0 ? `${profileStats.rating}/5` : 'No ratings'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="px-6 pb-6 space-y-3">
                {profile.Email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiMail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{profile.Email}</p>
                    </div>
                  </div>
                )}
                
                {profile.College && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiAward className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">College</p>
                      <p className="text-sm font-medium text-gray-900">{profile.College}</p>
                    </div>
                  </div>
                )}
                
                {profile.Program && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiUser className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Program</p>
                      <p className="text-sm font-medium text-gray-900">{profile.Program}</p>
                    </div>
                  </div>
                )}
                
                {profile.YearOfStudy && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiCalendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Year of Study</p>
                      <p className="text-sm font-medium text-gray-900">{profile.YearOfStudy}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              {profile.Skills && profile.Skills.length > 0 && (
                <div className="px-6 pb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiAward className="w-4 h-4" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.Skills.map((skill, idx) => {
                      const colors = [
                        'bg-blue-100 text-blue-800',
                        'bg-green-100 text-green-800',
                        'bg-purple-100 text-purple-800',
                        'bg-orange-100 text-orange-800',
                        'bg-pink-100 text-pink-800',
                        'bg-indigo-100 text-indigo-800',
                        'bg-teal-100 text-teal-800',
                        'bg-red-100 text-red-800'
                      ];
                      const colorClass = colors[idx % colors.length];
                      
                      return (
                        <span key={idx} className={`${colorClass} px-3 py-1 rounded-full text-xs font-semibold`}>
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:w-2/3 space-y-6">
            {/* About */}
            {profile.Bio && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-gray-600" />
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed">{profile.Bio}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiStar className="w-5 h-5 text-gray-600" />
                Reviews ({reviews.length})
              </h3>
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <FaStar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No reviews yet</p>
                  </div>
                ) : (
                  reviews.map((review, index) => (
                    <div key={review.id || index} className="flex gap-3 items-start border-b border-gray-100 pb-4 last:border-b-0">
                      <Image 
                        src={review.reviewerProfilePicture || "/categories-banner.png"} 
                        alt={review.reviewerName || 'Reviewer'} 
                        width={36} 
                        height={36} 
                        className="rounded-full w-9 h-9 object-cover border-2 border-gray-200" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">
                            {review.reviewerName || 'Reviewer'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}>
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-gray-600" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Reviews</span>
                  <span className="font-semibold text-gray-900">{stats.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold text-gray-900">{stats.responseRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Response Time</span>
                  <span className="font-semibold text-gray-900">{stats.avgResponseTime}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">{stats.memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 