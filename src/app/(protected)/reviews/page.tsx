"use client";

import { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  FaStar, 
  FaFilter, 
  FaSort, 
  FaSearch, 
  FaCalendar, 
  FaUser, 
  FaThumbsUp, 
  FaThumbsDown,
  FaReply,
  FaFlag,
  FaHeart,
  FaShare,
  FaBookmark,
  FaChartBar,
  FaList,
  FaList as FaGrid,
  FaEye,
  FaDownload,
  FaRedo,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaTag,
  FaMapMarkerAlt,
  FaGlobe,
  FaArrowUp,
  FaArrowDown,
  FaStarHalfAlt,
  FaRegStar,
  FaStarHalfAlt as FaRegStarHalfAlt
} from "react-icons/fa";

interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  taskId: string;
  taskTitle: string;
  taskCategory: string;
  taskPrice: number;
  rating: number;
  comment: string;
  createdAt: number;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerLocation?: string;
  isVerified: boolean;
  helpfulCount: number;
  replyCount: number;
  status: 'published' | 'pending' | 'flagged';
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  totalRating: number;
  recentReviews: number;
  topRatedServices: { title: string; rating: number; reviews: number }[];
  categoryBreakdown: { category: string; count: number; avgRating: number }[];
}

interface TaskReviewGroup {
  taskId: string;
  taskTitle: string;
  taskCategory: string;
  taskPrice: number;
  taskImage?: string;
  totalReviews: number;
  averageRating: number;
  totalRevenue: number;
  reviews: Review[];
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskReviewGroup[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'tasks' | 'all'>('tasks');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const generateMockReviews = (): Review[] => {
      const mockReviews: Review[] = [
        {
          id: "1",
          reviewerId: "user1",
          revieweeId: "currentUser",
          taskId: "task1",
          taskTitle: "Web Development Consultation",
          taskCategory: "Technology",
          taskPrice: 150.00,
          rating: 5,
          comment: "Excellent work! The developer was very professional and delivered exactly what I needed. The communication was great throughout the project and the final result exceeded my expectations. Highly recommend!",
          createdAt: Date.now() - 86400000 * 2, // 2 days ago
          reviewerName: "Sarah Johnson",
          reviewerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          reviewerLocation: "New York, NY",
          isVerified: true,
          helpfulCount: 12,
          replyCount: 1,
          status: 'published',
          tags: ['professional', 'communication', 'quality'],
          sentiment: 'positive'
        },
        {
          id: "2",
          reviewerId: "user2",
          revieweeId: "currentUser",
          taskId: "task1",
          taskTitle: "Web Development Consultation",
          taskCategory: "Technology",
          taskPrice: 150.00,
          rating: 4,
          comment: "Good service overall. The work was completed on time and the quality was satisfactory. Would work with again for future projects.",
          createdAt: Date.now() - 86400000 * 5, // 5 days ago
          reviewerName: "Mike Chen",
          reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          reviewerLocation: "San Francisco, CA",
          isVerified: true,
          helpfulCount: 8,
          replyCount: 0,
          status: 'published',
          tags: ['on-time', 'satisfactory'],
          sentiment: 'positive'
        },
        {
          id: "3",
          reviewerId: "user3",
          revieweeId: "currentUser",
          taskId: "task2",
          taskTitle: "UI/UX Design Services",
          taskCategory: "Design",
          taskPrice: 200.00,
          rating: 5,
          comment: "Amazing design work! The designer really understood my vision and created something beautiful. The attention to detail was incredible and the final design was exactly what I was looking for.",
          createdAt: Date.now() - 86400000 * 1, // 1 day ago
          reviewerName: "Emily Rodriguez",
          reviewerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          reviewerLocation: "Los Angeles, CA",
          isVerified: true,
          helpfulCount: 15,
          replyCount: 2,
          status: 'published',
          tags: ['creative', 'detail-oriented', 'vision'],
          sentiment: 'positive'
        },
        {
          id: "4",
          reviewerId: "user4",
          revieweeId: "currentUser",
          taskId: "task2",
          taskTitle: "UI/UX Design Services",
          taskCategory: "Design",
          taskPrice: 200.00,
          rating: 3,
          comment: "The design was okay but took longer than expected. Communication could have been better. The final result was decent but not outstanding.",
          createdAt: Date.now() - 86400000 * 7, // 7 days ago
          reviewerName: "David Thompson",
          reviewerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          reviewerLocation: "Chicago, IL",
          isVerified: false,
          helpfulCount: 3,
          replyCount: 1,
          status: 'published',
          tags: ['delayed', 'communication'],
          sentiment: 'neutral'
        },
        {
          id: "5",
          reviewerId: "user5",
          revieweeId: "currentUser",
          taskId: "task3",
          taskTitle: "Content Writing & SEO",
          taskCategory: "Writing",
          taskPrice: 75.00,
          rating: 5,
          comment: "Outstanding content writing service! The writer delivered high-quality, SEO-optimized content that helped improve our search rankings. Very professional and responsive.",
          createdAt: Date.now() - 86400000 * 3, // 3 days ago
          reviewerName: "Lisa Wang",
          reviewerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
          reviewerLocation: "Seattle, WA",
          isVerified: true,
          helpfulCount: 20,
          replyCount: 0,
          status: 'published',
          tags: ['SEO', 'quality', 'professional'],
          sentiment: 'positive'
        },
        {
          id: "6",
          reviewerId: "user6",
          revieweeId: "currentUser",
          taskId: "task4",
          taskTitle: "Business Strategy Consulting",
          taskCategory: "Consulting",
          taskPrice: 300.00,
          rating: 4,
          comment: "Very knowledgeable consultant who provided valuable insights for our business strategy. The recommendations were practical and actionable.",
          createdAt: Date.now() - 86400000 * 10, // 10 days ago
          reviewerName: "Robert Kim",
          reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
          reviewerLocation: "Austin, TX",
          isVerified: true,
          helpfulCount: 11,
          replyCount: 1,
          status: 'published',
          tags: ['knowledgeable', 'practical', 'insights'],
          sentiment: 'positive'
        }
      ];
      return mockReviews;
    };

    const generateMockStats = (reviews: Review[]): ReviewStats => {
      const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const categoryBreakdown: { [key: string]: { count: number; totalRating: number } } = {};
      
      reviews.forEach(review => {
        ratingDistribution[review.rating]++;
        
        if (!categoryBreakdown[review.taskCategory]) {
          categoryBreakdown[review.taskCategory] = { count: 0, totalRating: 0 };
        }
        categoryBreakdown[review.taskCategory].count++;
        categoryBreakdown[review.taskCategory].totalRating += review.rating;
      });

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      const recentReviews = reviews.filter(review => 
        review.createdAt > Date.now() - 86400000 * 7
      ).length;

      const topRatedServices = Array.from(
        new Set(reviews.map(r => r.taskTitle))
      ).map(title => {
        const serviceReviews = reviews.filter(r => r.taskTitle === title);
        const avgRating = serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;
        return { title, rating: avgRating, reviews: serviceReviews.length };
      }).sort((a, b) => b.rating - a.rating).slice(0, 3);

      const categoryStats = Object.entries(categoryBreakdown).map(([category, data]) => ({
        category,
        count: data.count,
        avgRating: data.totalRating / data.count
      }));

      return {
        totalReviews: reviews.length,
        averageRating,
        ratingDistribution,
        totalRating,
        recentReviews,
        topRatedServices,
        categoryBreakdown: categoryStats
      };
    };

    const groupReviewsByTask = (reviews: Review[]): TaskReviewGroup[] => {
      const groups: { [key: string]: TaskReviewGroup } = {};
      
      reviews.forEach(review => {
        if (!groups[review.taskId]) {
          groups[review.taskId] = {
            taskId: review.taskId,
            taskTitle: review.taskTitle,
            taskCategory: review.taskCategory,
            taskPrice: review.taskPrice,
            totalReviews: 0,
            averageRating: 0,
            totalRevenue: 0,
            reviews: []
          };
        }
        
        groups[review.taskId].reviews.push(review);
        groups[review.taskId].totalReviews++;
        groups[review.taskId].totalRevenue += review.taskPrice;
      });

      // Calculate average ratings
      Object.values(groups).forEach(group => {
        const totalRating = group.reviews.reduce((sum, review) => sum + review.rating, 0);
        group.averageRating = totalRating / group.reviews.length;
      });

      return Object.values(groups).sort((a, b) => b.averageRating - a.averageRating);
    };

    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockReviews = generateMockReviews();
        setReviews(mockReviews);
        
        const mockStats = generateMockStats(mockReviews);
        setStats(mockStats);
        
        const taskGroups = groupReviewsByTask(mockReviews);
        setTaskGroups(taskGroups);
        
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const formatCurrency = (amount: number) => {
    return `TM ${amount.toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="w-4 h-4 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaRegStarHalfAlt key="half" className="w-4 h-4 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesRating = selectedRating === null || review.rating === selectedRating;
    const matchesCategory = selectedCategory === 'all' || review.taskCategory === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRating && matchesCategory && matchesSearch;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = b.createdAt - a.createdAt;
        break;
      case 'rating':
        comparison = b.rating - a.rating;
        break;
      case 'helpful':
        comparison = b.helpfulCount - a.helpfulCount;
        break;
    }
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex h-screen bg-white items-center justify-center">
          <LoadingSpinner size="lg" text="Loading reviews..." />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
              <p className="text-gray-600 mt-1">Manage and analyze your service reviews</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaRedo className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#FAF6ED] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Reviews</span>
                  <FaStar className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalReviews}</div>
                <div className="text-sm text-gray-600 mt-1">Across all services</div>
              </div>

              <div className="bg-[#FAF6ED] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <FaChartBar className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</div>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(stats.averageRating)}
                </div>
              </div>

              <div className="bg-[#FAF6ED] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Recent Reviews</span>
                  <FaCalendar className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.recentReviews}</div>
                <div className="text-sm text-gray-600 mt-1">Last 7 days</div>
              </div>

              <div className="bg-[#FAF6ED] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Top Service</span>
                  <FaThumbsUp className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-lg font-bold text-gray-900">{stats.topRatedServices[0]?.title || 'N/A'}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {stats.topRatedServices[0]?.rating.toFixed(1)} ★ ({stats.topRatedServices[0]?.reviews} reviews)
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedView("tasks")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedView === "tasks"
                      ? "bg-emerald-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaList className="w-4 h-4 inline mr-2" />
                  By Task
                </button>
                <button
                  onClick={() => setSelectedView("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedView === "all"
                      ? "bg-emerald-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaGrid className="w-4 h-4 inline mr-2" />
                  All Reviews
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaSearch className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                                 <select
                   value={selectedRating || ""}
                   onChange={(e) => setSelectedRating(e.target.value ? Number(e.target.value) : null)}
                   className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                 >
                   <option value="">All Ratings</option>
                   <option value="5">5 Stars</option>
                   <option value="4">4 Stars</option>
                   <option value="3">3 Stars</option>
                   <option value="2">2 Stars</option>
                   <option value="1">1 Star</option>
                 </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Design">Design</option>
                  <option value="Writing">Writing</option>
                  <option value="Consulting">Consulting</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort as 'date' | 'rating' | 'helpful');
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="rating-desc">Highest Rating</option>
                  <option value="rating-asc">Lowest Rating</option>
                  <option value="helpful-desc">Most Helpful</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {selectedView === "tasks" ? (
            <div className="space-y-6">
              {taskGroups.map((taskGroup) => (
                <div key={taskGroup.taskId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Task Header */}
                  <div className="bg-[#FAF6ED] p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{taskGroup.taskTitle}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FaTag className="w-4 h-4" />
                            {taskGroup.taskCategory}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaDollarSign className="w-4 h-4" />
                            {formatCurrency(taskGroup.taskPrice)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaStar className="w-4 h-4 text-yellow-400" />
                            {taskGroup.averageRating.toFixed(1)} ({taskGroup.totalReviews} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-700">{formatCurrency(taskGroup.totalRevenue)}</div>
                        <div className="text-sm text-gray-600">Total Revenue</div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {taskGroup.reviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-4">
                            {/* Reviewer Avatar */}
                            <div className="flex-shrink-0">
                              {review.reviewerAvatar ? (
                                <img
                                  src={review.reviewerAvatar}
                                  alt={review.reviewerName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center text-white font-semibold">
                                  {review.reviewerName.charAt(0)}
                                </div>
                              )}
                            </div>

                            {/* Review Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{review.reviewerName}</h4>
                                {review.isVerified && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Verified</span>
                                )}
                                <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(review.sentiment)}`}>
                                  {review.sentiment}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-600">{formatDate(review.createdAt)}</span>
                                {review.reviewerLocation && (
                                  <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <FaMapMarkerAlt className="w-3 h-3" />
                                    {review.reviewerLocation}
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>

                              {/* Tags */}
                              {review.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {review.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                                  <FaThumbsUp className="w-4 h-4" />
                                  <span>{review.helpfulCount} helpful</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                                  <FaReply className="w-4 h-4" />
                                  <span>Reply</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                                  <FaShare className="w-4 h-4" />
                                  <span>Share</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                                  <FaFlag className="w-4 h-4" />
                                  <span>Report</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {sortedReviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Reviewer Avatar */}
                        <div className="flex-shrink-0">
                          {review.reviewerAvatar ? (
                            <img
                              src={review.reviewerAvatar}
                              alt={review.reviewerName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center text-white font-semibold">
                              {review.reviewerName.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{review.reviewerName}</h4>
                            {review.isVerified && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Verified</span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(review.sentiment)}`}>
                              {review.sentiment}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-600">{formatDate(review.createdAt)}</span>
                            <span className="text-sm text-emerald-600 font-medium">{review.taskTitle}</span>
                            {review.reviewerLocation && (
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <FaMapMarkerAlt className="w-3 h-3" />
                                {review.reviewerLocation}
                              </span>
                            )}
                          </div>

                          <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>

                          {/* Tags */}
                          {review.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {review.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                              <FaThumbsUp className="w-4 h-4" />
                              <span>{review.helpfulCount} helpful</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                              <FaReply className="w-4 h-4" />
                              <span>Reply</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                              <FaShare className="w-4 h-4" />
                              <span>Share</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                              <FaFlag className="w-4 h-4" />
                              <span>Report</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
} 