"use client";

import { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  FaChartLine, 
  FaEye, 
  FaStar, 
  FaCalendar, 
  FaDollarSign, 
  FaUsers, 
  FaClock, 
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaArrowUp as FaTrendingUp,
  FaArrowDown as FaTrendingDown,
  FaMapMarkerAlt,
  FaGlobe,
  FaHeart,
  FaShare,
  FaBookmark,
  FaFilter,
  FaDownload,
  FaRedo,
  FaCalendarAlt,
  FaChartBar,
  FaChartBar as FaPieChart,
  FaTable,
  FaList,
  FaList as FaGrid3X3,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEnvelope
} from "react-icons/fa";

interface ServiceAnalytics {
  totalServices: number;
  activeServices: number;
  totalViews: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  completionRate: number;
  averageResponseTime: number;
  topPerformingService: {
    title: string;
    views: number;
    bookings: number;
    revenue: number;
    rating: number;
  };
  monthlyTrends: {
    month: string;
    views: number;
    bookings: number;
    revenue: number;
  }[];
  categoryPerformance: {
    category: string;
    services: number;
    views: number;
    bookings: number;
    revenue: number;
    rating: number;
  }[];
  topServices: {
    id: string;
    title: string;
    category: string;
    views: number;
    bookings: number;
    revenue: number;
    rating: number;
    status: string;
  }[];
  clientInsights: {
    totalClients: number;
    repeatClients: number;
    newClients: number;
    averageClientRating: number;
    topClientLocations: string[];
  };
  engagementMetrics: {
    likes: number;
    shares: number;
    bookmarks: number;
    inquiries: number;
    conversionRate: number;
  };
}

export default function ServiceAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ServiceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedView, setSelectedView] = useState("overview");
  const [sortBy, setSortBy] = useState("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const generateMockAnalytics = (): ServiceAnalytics => {
      return {
        totalServices: 12,
        activeServices: 8,
        totalViews: 2847,
        totalBookings: 156,
        totalRevenue: 8472.50,
        averageRating: 4.7,
        totalReviews: 89,
        responseRate: 94.2,
        completionRate: 98.5,
        averageResponseTime: 2.3,
        topPerformingService: {
          title: "Web Development Consultation",
          views: 456,
          bookings: 23,
          revenue: 1845.00,
          rating: 4.9
        },
        monthlyTrends: [
          { month: "Jan", views: 1200, bookings: 45, revenue: 3200 },
          { month: "Feb", views: 1350, bookings: 52, revenue: 3800 },
          { month: "Mar", views: 1100, bookings: 38, revenue: 2900 },
          { month: "Apr", views: 1600, bookings: 65, revenue: 4200 },
          { month: "May", views: 1800, bookings: 72, revenue: 4800 },
          { month: "Jun", views: 2000, bookings: 85, revenue: 5200 },
          { month: "Jul", views: 2200, bookings: 92, revenue: 5800 },
          { month: "Aug", views: 2400, bookings: 98, revenue: 6200 },
          { month: "Sep", views: 2600, bookings: 105, revenue: 6800 },
          { month: "Oct", views: 2800, bookings: 112, revenue: 7200 },
          { month: "Nov", views: 3000, bookings: 118, revenue: 7800 },
          { month: "Dec", views: 2847, bookings: 156, revenue: 8472.50 }
        ],
        categoryPerformance: [
          { category: "Technology", services: 5, views: 1200, bookings: 65, revenue: 4200, rating: 4.8 },
          { category: "Design", services: 3, views: 850, bookings: 42, revenue: 2800, rating: 4.6 },
          { category: "Writing", services: 2, views: 450, bookings: 28, revenue: 1200, rating: 4.7 },
          { category: "Consulting", services: 2, views: 347, bookings: 21, revenue: 272.50, rating: 4.9 }
        ],
        topServices: [
          { id: "1", title: "Web Development Consultation", category: "Technology", views: 456, bookings: 23, revenue: 1845.00, rating: 4.9, status: "active" },
          { id: "2", title: "UI/UX Design Services", category: "Design", views: 389, bookings: 18, revenue: 1620.00, rating: 4.7, status: "active" },
          { id: "3", title: "Content Writing & SEO", category: "Writing", views: 234, bookings: 15, revenue: 975.00, rating: 4.8, status: "active" },
          { id: "4", title: "Business Strategy Consulting", category: "Consulting", views: 198, bookings: 12, revenue: 960.00, rating: 4.9, status: "active" },
          { id: "5", title: "Mobile App Development", category: "Technology", views: 167, bookings: 8, revenue: 640.00, rating: 4.6, status: "active" }
        ],
        clientInsights: {
          totalClients: 89,
          repeatClients: 34,
          newClients: 55,
          averageClientRating: 4.7,
          topClientLocations: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]
        },
        engagementMetrics: {
          likes: 456,
          shares: 123,
          bookmarks: 89,
          inquiries: 234,
          conversionRate: 5.5
        }
      };
    };

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        if (!token) throw new Error("No authentication token");

        // Get user profile to get user ID
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8081'}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!profileRes.ok) throw new Error("Failed to fetch user profile");
        const profileData = await profileRes.json();
        const userId = profileData.ID || profileData.id;
        
        if (!userId) throw new Error("User ID not found");

        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:8084';
        
        // Fetch user's tasks/services
        const tasksRes = await fetch(`${API_BASE_URL}/api/tasks?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        let tasks: any[] = [];
        if (tasksRes.ok) {
          const response = await tasksRes.json();
          tasks = Array.isArray(response) ? response : (response.data || []);
        }

        // Fetch bookings as owner (services provided)
        const bookingsAsOwnerRes = await fetch(`${API_BASE_URL}/api/bookings?id=${userId}&role=owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        let bookingsAsOwner: any[] = [];
        if (bookingsAsOwnerRes.ok) {
          const response = await bookingsAsOwnerRes.json();
          bookingsAsOwner = Array.isArray(response) ? response : (response.data || []);
        }

        // Fetch reviews for user's services
        const reviewsRes = await fetch(`${API_BASE_URL}/api/reviews?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        let reviews: any[] = [];
        if (reviewsRes.ok) {
          const response = await reviewsRes.json();
          reviews = Array.isArray(response) ? response : (response.data || []);
        }

        console.log('Tasks:', tasks);
        console.log('Bookings as owner:', bookingsAsOwner);
        console.log('Reviews:', reviews);

        // Calculate analytics from real data
        const totalServices = tasks.length;
        const activeServices = tasks.filter((task: any) => task.Status === 'active' || task.status === 'active').length;
        
        // Calculate total revenue from completed bookings
        const totalRevenue = bookingsAsOwner
          .filter((booking: any) => booking.Status === 'completed' || booking.status === 'completed')
          .reduce((sum: number, booking: any) => sum + (booking.Credits || booking.credits || 0), 0);
        
        // Calculate average rating from reviews
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + (review.Rating || review.rating || 0), 0) / reviews.length
          : 0;
        
        // Calculate completion rate
        const completedBookings = bookingsAsOwner.filter((booking: any) => 
          booking.Status === 'completed' || booking.status === 'completed'
        ).length;
        const completionRate = bookingsAsOwner.length > 0 ? (completedBookings / bookingsAsOwner.length) * 100 : 0;

        // Group bookings by task to calculate per-service metrics
        const serviceMetrics: { [key: string]: any } = {};
        bookingsAsOwner.forEach((booking: any) => {
          const taskId = booking.TaskID || booking.taskID || booking.task?.ID || booking.task?.id;
          const taskTitle = booking.TaskTitle || booking.taskTitle || booking.task?.Title || booking.task?.title || 'Unknown Service';
          
          if (!serviceMetrics[taskId]) {
            serviceMetrics[taskId] = {
              id: taskId,
              title: taskTitle,
              bookings: 0,
              revenue: 0,
              completed: 0
            };
          }
          
          serviceMetrics[taskId].bookings++;
          if (booking.Status === 'completed' || booking.status === 'completed') {
            serviceMetrics[taskId].revenue += booking.Credits || booking.credits || 0;
            serviceMetrics[taskId].completed++;
          }
        });

        // Find top performing service
        const topPerformingService = Object.values(serviceMetrics)
          .sort((a: any, b: any) => b.revenue - a.revenue)[0] || {
            title: 'No services yet',
            bookings: 0,
            revenue: 0,
            rating: 0
          };

        // Calculate category performance
        const categoryBreakdown: { [key: string]: any } = {};
        tasks.forEach((task: any) => {
          const category = task.Category || task.category || 'Uncategorized';
          if (!categoryBreakdown[category]) {
            categoryBreakdown[category] = {
              category,
              services: 0,
              bookings: 0,
              revenue: 0,
              rating: 0
            };
          }
          categoryBreakdown[category].services++;
        });

        // Add booking data to categories
        bookingsAsOwner.forEach((booking: any) => {
          const task = tasks.find((t: any) => t.ID === booking.TaskID || t.id === booking.taskID);
          if (task) {
            const category = task.Category || task.category || 'Uncategorized';
            if (categoryBreakdown[category]) {
              categoryBreakdown[category].bookings++;
              if (booking.Status === 'completed' || booking.status === 'completed') {
                categoryBreakdown[category].revenue += booking.Credits || booking.credits || 0;
              }
            }
          }
        });

        // Calculate average rating per category
        reviews.forEach((review: any) => {
          const task = tasks.find((t: any) => t.ID === review.TaskID || t.id === review.taskID);
          if (task) {
            const category = task.Category || task.category || 'Uncategorized';
            if (categoryBreakdown[category]) {
              categoryBreakdown[category].rating = 
                (categoryBreakdown[category].rating + (review.Rating || review.rating || 0)) / 2;
            }
          }
        });

        const categoryPerformance = Object.values(categoryBreakdown);

        // Create top services list
        const topServices = Object.values(serviceMetrics)
          .map((service: any) => {
            const task = tasks.find((t: any) => t.ID === service.id || t.id === service.id);
            const serviceReviews = reviews.filter((r: any) => 
              r.TaskID === service.id || r.taskID === service.id
            );
            const avgRating = serviceReviews.length > 0 
              ? serviceReviews.reduce((sum: number, r: any) => sum + (r.Rating || r.rating || 0), 0) / serviceReviews.length
              : 0;
            
            return {
              id: service.id,
              title: service.title,
              category: task?.Category || task?.category || 'Uncategorized',
              views: 0, // Not available in current backend
              bookings: service.bookings,
              revenue: service.revenue,
              rating: avgRating,
              status: task?.Status || task?.status || 'active'
            };
          })
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 10);

        // Calculate client insights
        const uniqueClients = new Set(bookingsAsOwner.map((b: any) => b.BookerID || b.bookerID));
        const totalClients = uniqueClients.size;
        const repeatClients = bookingsAsOwner.length > totalClients ? totalClients : 0;
        const newClients = totalClients;

        const analyticsData: ServiceAnalytics = {
          totalServices,
          activeServices,
          totalViews: 0, // Not available in current backend
          totalBookings: bookingsAsOwner.length,
          totalRevenue,
          averageRating,
          totalReviews: reviews.length,
          responseRate: 100, // Assuming all bookings are responded to
          completionRate,
          averageResponseTime: 24, // Mock data
          topPerformingService: {
            title: topPerformingService.title,
            views: 0,
            bookings: topPerformingService.bookings,
            revenue: topPerformingService.revenue,
            rating: 0
          },
          monthlyTrends: [
            { month: "Jan", views: 0, bookings: 0, revenue: 0 },
            { month: "Feb", views: 0, bookings: 0, revenue: 0 },
            { month: "Mar", views: 0, bookings: 0, revenue: 0 },
            { month: "Apr", views: 0, bookings: 0, revenue: 0 },
            { month: "May", views: 0, bookings: 0, revenue: 0 },
            { month: "Jun", views: 0, bookings: 0, revenue: 0 }
          ],
          categoryPerformance,
          topServices,
          clientInsights: {
            totalClients,
            repeatClients,
            newClients,
            averageClientRating: averageRating,
            topClientLocations: ['Local', 'National', 'International']
          },
          engagementMetrics: {
            likes: 0,
            shares: 0,
            bookmarks: 0,
            inquiries: bookingsAsOwner.length,
            conversionRate: bookingsAsOwner.length > 0 ? 100 : 0
          }
        };

        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        // Fallback to mock data if backend is not available
        console.log("Falling back to mock data...");
        const data = generateMockAnalytics();
        setAnalytics(data);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return `TM ${amount.toFixed(2)}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? <FaTrendingUp className="text-green-500" /> : <FaTrendingDown className="text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex h-screen bg-white items-center justify-center">
          <LoadingSpinner size="lg" text="Loading service analytics..." />
        </div>
      </ProtectedLayout>
    );
  }

  if (!analytics) {
    return (
      <ProtectedLayout>
        <div className="flex h-screen bg-white items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
            <p className="text-gray-600">Analytics data is not available at the moment.</p>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Service Analytics</h1>
              <p className="text-gray-600 mt-1">Track your service performance and insights</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaRedo className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* View Toggle */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setSelectedView("overview")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === "overview"
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaChartBar className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setSelectedView("services")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === "services"
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaList className="w-4 h-4 inline mr-2" />
              Services
            </button>
            <button
              onClick={() => setSelectedView("trends")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === "trends"
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaChartLine className="w-4 h-4 inline mr-2" />
              Trends
            </button>
            <button
              onClick={() => setSelectedView("insights")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === "insights"
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaPieChart className="w-4 h-4 inline mr-2" />
              Insights
            </button>
          </div>

          {selectedView === "overview" && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#FAF6ED] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <FaDollarSign className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    <span className="text-sm font-normal">TM</span> {analytics.totalRevenue.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                    <FaArrowUp className="w-3 h-3" />
                    <span>+15.2% from last month</span>
                  </div>
                </div>

                <div className="bg-[#FAF6ED] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Views</span>
                    <FaEye className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{formatNumber(analytics.totalViews)}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                    <FaArrowUp className="w-3 h-3" />
                    <span>+8.7% from last month</span>
                  </div>
                </div>

                <div className="bg-[#FAF6ED] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Bookings</span>
                    <FaCalendar className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.totalBookings}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                    <FaArrowUp className="w-3 h-3" />
                    <span>+12.3% from last month</span>
                  </div>
                </div>

                <div className="bg-[#FAF6ED] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <FaStar className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.averageRating}</div>
                  <div className="text-sm text-gray-600 mt-1">from {analytics.totalReviews} reviews</div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Services</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.activeServices}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Rate</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.responseRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.completionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Response Time</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.averageResponseTime}h</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Insights</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Clients</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.clientInsights.totalClients}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Repeat Clients</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.clientInsights.repeatClients}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New Clients</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.clientInsights.newClients}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Client Rating</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.clientInsights.averageClientRating}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Likes</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.engagementMetrics.likes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Shares</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.engagementMetrics.shares}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bookmarks</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.engagementMetrics.bookmarks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="text-lg font-semibold text-gray-900">{analytics.engagementMetrics.conversionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performing Service */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Service</h3>
                <div className="bg-[#FAF6ED] rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{analytics.topPerformingService.title}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Views</p>
                          <p className="text-lg font-semibold text-gray-900">{formatNumber(analytics.topPerformingService.views)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Bookings</p>
                          <p className="text-lg font-semibold text-gray-900">{analytics.topPerformingService.bookings}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Revenue</p>
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(analytics.topPerformingService.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Rating</p>
                          <p className="text-lg font-semibold text-gray-900">{analytics.topPerformingService.rating}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 bg-emerald-700 rounded-full flex items-center justify-center">
                        <FaStar className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedView === "services" && (
            <div className="space-y-6">
              {/* Services Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">All Services</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <FaFilter className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <FaDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Service</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Category</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Views</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Bookings</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Revenue</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Rating</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topServices.map((service, index) => (
                        <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-gray-900">{service.title}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">{service.category}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium text-gray-900">{formatNumber(service.views)}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium text-gray-900">{service.bookings}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium text-gray-900">{formatCurrency(service.revenue)}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1">
                              <FaStar className="w-4 h-4 text-yellow-400" />
                              <span className="font-medium text-gray-900">{service.rating}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusColor(service.status)}`}>
                              {service.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedView === "trends" && (
            <div className="space-y-6">
              {/* Monthly Trends Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                <div className="flex items-end justify-between h-64">
                  {analytics.monthlyTrends.map((data, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-emerald-700 rounded-t"
                        style={{ height: `${(data.revenue / 8000) * 200}px` }}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                      <span className="text-xs font-medium text-gray-900">{formatCurrency(data.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
                  <div className="space-y-4">
                    {analytics.categoryPerformance.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <div>
                            <p className="font-medium text-gray-900">{category.category}</p>
                            <p className="text-xs text-gray-500">{category.services} services</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(category.revenue)}</p>
                          <p className="text-xs text-gray-500">{category.bookings} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Client Locations</h3>
                  <div className="space-y-3">
                    {analytics.clientInsights.topClientLocations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-900">{location}</span>
                        </div>
                        <span className="text-sm text-gray-500">{Math.floor(Math.random() * 20) + 5} clients</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === "insights" && (
            <div className="space-y-6">
              {/* Performance Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">High Conversion Rate</p>
                        <p className="text-sm text-gray-600">Your services convert well</p>
                      </div>
                      <FaTrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Strong Client Retention</p>
                        <p className="text-sm text-gray-600">38% repeat clients</p>
                      </div>
                      <FaUsers className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Fast Response Time</p>
                        <p className="text-sm text-gray-600">2.3h average response</p>
                      </div>
                      <FaClock className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-1">Increase Service Visibility</p>
                      <p className="text-sm text-gray-600">Add more images and detailed descriptions to improve conversion rates.</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-1">Optimize Pricing Strategy</p>
                      <p className="text-sm text-gray-600">Consider adjusting prices based on demand and competition analysis.</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-1">Expand Service Categories</p>
                      <p className="text-sm text-gray-600">Technology services perform best - consider adding more tech-related offerings.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Analysis */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FaHeart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{analytics.engagementMetrics.likes}</p>
                    <p className="text-sm text-gray-600">Likes</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FaShare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{analytics.engagementMetrics.shares}</p>
                    <p className="text-sm text-gray-600">Shares</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FaBookmark className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{analytics.engagementMetrics.bookmarks}</p>
                    <p className="text-sm text-gray-600">Bookmarks</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FaEnvelope className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{analytics.engagementMetrics.inquiries}</p>
                    <p className="text-sm text-gray-600">Inquiries</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
} 