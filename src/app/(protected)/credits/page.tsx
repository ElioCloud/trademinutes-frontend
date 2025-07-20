"use client";

import { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  FaCoins, 
  FaPlus, 
  FaMinus, 
  FaHistory, 
  FaChartLine, 
  FaDollarSign, 
  FaCalendar, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaRedo,
  FaFilter,
  FaSearch,
  FaSort,
  FaEye,
  FaGift,
  FaStar,
  FaTrophy,
  FaMedal,
  FaCrown,
  FaUserTie,
  FaBriefcase,
  FaGraduationCap,
  FaLaptop,
  FaPalette,
  FaPen,
  FaLightbulb,
  FaTag,
  FaMapMarkerAlt,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaClock as FaTime,
  FaCalendarAlt,
  FaChartBar,
  FaChartBar as FaPieChart,
  FaList,
  FaList as FaGrid,
  FaBookmark,
  FaShare,
  FaFlag,
  FaRegStar,
  FaStarHalfAlt,
  FaArrowRight,
  FaArrowLeft,
  FaChevronRight,
  FaChevronLeft,
  FaEllipsisV,
  FaHeart,
  FaThumbsUp,
  FaThumbsDown,
  FaReply,
  FaEdit,
  FaTrash,
  FaCopy,
  FaExternalLinkAlt,
  FaLock,
  FaUnlock,
  FaShieldAlt,
  FaCreditCard,
  FaWallet,
  FaPiggyBank,
  FaHandshake,
  FaAward,
  FaCertificate,
  FaRocket,
  FaFire,
  FaBolt,
  FaGem,
  FaGem as FaDiamond,
  FaCrown as FaCrownAlt,
  FaStarHalfAlt as FaRegStarHalfAlt
} from "react-icons/fa";

interface CreditTransaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus' | 'refund' | 'penalty';
  amount: number;
  description: string;
  category: string;
  date: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  reference?: string;
  serviceId?: string;
  clientName?: string;
  tags: string[];
}

interface CreditStats {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalBonus: number;
  totalRefunds: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  dailyEarnings: number;
  earningTrend: number; // percentage
  spendingTrend: number; // percentage
  topEarningCategories: { category: string; amount: number; percentage: number }[];
  recentActivity: { date: string; earned: number; spent: number }[];
  achievements: { title: string; description: string; icon: string; unlocked: boolean }[];
  showBuyCredits: boolean;
}

interface CreditGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: number;
  category: string;
  status: 'active' | 'completed' | 'overdue';
  progress: number; // percentage
}

interface CreditTier {
  name: string;
  minCredits: number;
  currentTier: boolean;
  benefits: string[];
  icon: string;
  color: string;
}

export default function CreditsPage() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [goals, setGoals] = useState<CreditGoal[]>([]);
  const [tiers, setTiers] = useState<CreditTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'transactions' | 'goals' | 'tiers'>('overview');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchCredits = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        if (!token) throw new Error("No authentication token");

        // Get user profile to get user ID and current credits
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8081'}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!profileRes.ok) throw new Error("Failed to fetch user profile");
        const profileData = await profileRes.json();
        const userId = profileData.ID || profileData.id;
        const currentCredits = profileData.credits || 0;
        
        if (!userId) throw new Error("User ID not found");

        // Fetch booking history from task-core service
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:8084';
        
        // Fetch bookings as booker (spent credits)
        const bookingsAsBookerRes = await fetch(`${API_BASE_URL}/api/bookings?id=${userId}&role=booker`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        let bookingsAsBooker: any[] = [];
        if (bookingsAsBookerRes.ok) {
          const response = await bookingsAsBookerRes.json();
          console.log('Booker response:', response);
          bookingsAsBooker = Array.isArray(response) ? response : (response.data || []);
        } else {
          console.log('Failed to fetch booker bookings:', bookingsAsBookerRes.status, bookingsAsBookerRes.statusText);
        }

        // Fetch bookings as owner (earned credits)
        const bookingsAsOwnerRes = await fetch(`${API_BASE_URL}/api/bookings?id=${userId}&role=owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        let bookingsAsOwner: any[] = [];
        if (bookingsAsOwnerRes.ok) {
          const response = await bookingsAsOwnerRes.json();
          console.log('Owner response:', response);
          bookingsAsOwner = Array.isArray(response) ? response : (response.data || []);
        } else {
          console.log('Failed to fetch owner bookings:', bookingsAsOwnerRes.status, bookingsAsOwnerRes.statusText);
        }

        // Transform booking data to credit transactions
        const transformedTransactions: CreditTransaction[] = [];
        
        console.log('Bookings as booker:', bookingsAsBooker);
        console.log('Bookings as owner:', bookingsAsOwner);
        
        // Add bookings as booker (spent credits)
        if (Array.isArray(bookingsAsBooker)) {
          bookingsAsBooker.forEach((booking: any) => {
            if (booking && typeof booking === 'object') {
              const bookingId = booking.ID || booking.id || booking._id || `book-${Date.now()}`;
              const taskTitle = booking.TaskTitle || booking.taskTitle || booking.task?.Title || booking.task?.title || 'Service Booking';
              const credits = booking.Credits || booking.credits || 0;
              const status = booking.Status || booking.status || 'completed';
              const taskId = booking.TaskID || booking.taskID || booking.task?.ID || booking.task?.id;
              const createdAt = booking.CreatedAt || booking.createdAt || booking.bookedAt;
              
              transformedTransactions.push({
                id: bookingId,
                type: 'spent',
                amount: -credits,
                description: `Booked: ${taskTitle}`,
                category: 'Service Booking',
                date: createdAt ? new Date(createdAt).getTime() : Date.now(),
                status: status === 'completed' ? 'completed' : 'pending',
                reference: `BOOK-${bookingId}`,
                serviceId: taskId,
                clientName: 'You',
                tags: ['booking', 'service', status]
              });
            }
          });
        }

        // Add bookings as owner (earned credits) - only completed ones
        if (Array.isArray(bookingsAsOwner)) {
          bookingsAsOwner.forEach((booking: any) => {
            if (booking && typeof booking === 'object' && (booking.Status === 'completed' || booking.status === 'completed')) {
              const bookingId = booking.ID || booking.id || booking._id || `earn-${Date.now()}`;
              const taskTitle = booking.TaskTitle || booking.taskTitle || booking.task?.Title || booking.task?.title || 'Service Provided';
              const credits = booking.Credits || booking.credits || 0;
              const taskId = booking.TaskID || booking.taskID || booking.task?.ID || booking.task?.id;
              const updatedAt = booking.UpdatedAt || booking.updatedAt || booking.completedAt || booking.CreatedAt || booking.createdAt;
              
              transformedTransactions.push({
                id: bookingId,
                type: 'earned',
                amount: credits,
                description: `Provided: ${taskTitle}`,
                category: 'Service Provided',
                date: updatedAt ? new Date(updatedAt).getTime() : Date.now(),
                status: 'completed',
                reference: `EARN-${bookingId}`,
                serviceId: taskId,
                clientName: booking.BookerName || booking.bookerName || 'Client',
                tags: ['service', 'completed', 'earned']
              });
            }
          });
        }

        // Add some additional transaction types for better activity display
        if (transformedTransactions.length === 0) {
          // If no real transactions, add some placeholder activities
          transformedTransactions.push({
            id: 'welcome-bonus',
            type: 'bonus',
            amount: 50,
            description: 'Welcome Bonus',
            category: 'Bonus',
            date: Date.now() - 86400000 * 7, // 7 days ago
            status: 'completed',
            reference: 'WELCOME-001',
            clientName: 'System',
            tags: ['bonus', 'welcome']
          });
        }

        // Sort transactions by date (newest first)
        transformedTransactions.sort((a, b) => b.date - a.date);

        // Calculate stats from transactions
        const totalEarned = transformedTransactions.filter(t => t.type === 'earned')
          .reduce((sum, t) => sum + t.amount, 0);
        const totalSpent = Math.abs(transformedTransactions.filter(t => t.type === 'spent')
          .reduce((sum, t) => sum + t.amount, 0));
        
        const monthlyEarnings = transformedTransactions
          .filter(t => t.type === 'earned' && t.date > Date.now() - 86400000 * 30)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const weeklyEarnings = transformedTransactions
          .filter(t => t.type === 'earned' && t.date > Date.now() - 86400000 * 7)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const dailyEarnings = transformedTransactions
          .filter(t => t.type === 'earned' && t.date > Date.now() - 86400000)
          .reduce((sum, t) => sum + t.amount, 0);

        const monthlySpent = transformedTransactions
          .filter(t => t.type === 'spent' && t.date > Date.now() - 86400000 * 30)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const weeklySpent = transformedTransactions
          .filter(t => t.type === 'spent' && t.date > Date.now() - 86400000 * 7)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const categoryBreakdown: { [key: string]: number } = {};
        transformedTransactions.filter(t => t.type === 'earned').forEach(t => {
          if (!categoryBreakdown[t.category]) {
            categoryBreakdown[t.category] = 0;
          }
          categoryBreakdown[t.category] += t.amount;
        });

        const topEarningCategories = Object.entries(categoryBreakdown)
          .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalEarned > 0 ? (amount / totalEarned) * 100 : 0
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        const transformedStats: CreditStats = {
          currentBalance: currentCredits,
          totalEarned,
          totalSpent,
          totalBonus: 0, // No bonus system in current backend
          totalRefunds: 0, // No refund system in current backend
          monthlyEarnings,
          weeklyEarnings,
          dailyEarnings,
          earningTrend: weeklyEarnings > 0 ? 12.5 : 0, // Mock trend
          spendingTrend: weeklySpent > 0 ? -5.2 : 0, // Mock trend
          topEarningCategories,
          recentActivity: [
            { date: "This Week", earned: weeklyEarnings, spent: weeklySpent },
            { date: "Last Week", earned: 0, spent: 0 }, // Would need historical data
            { date: "This Month", earned: monthlyEarnings, spent: monthlySpent }
          ],
          achievements: [
            { title: "First Earnings", description: "Earned your first credits", icon: "FaStar", unlocked: totalEarned > 0 },
            { title: "5-Star Provider", description: "Received 5-star review", icon: "FaTrophy", unlocked: bookingsAsOwner.length > 0 },
            { title: "Top Earner", description: "Earned 1000+ credits", icon: "FaCrown", unlocked: totalEarned >= 1000 },
            { title: "Consistent", description: "7 days of activity", icon: "FaMedal", unlocked: weeklyEarnings > 0 },
            { title: "Diverse Skills", description: "Work in 3+ categories", icon: "FaGem", unlocked: Object.keys(categoryBreakdown).length >= 3 }
          ],
          showBuyCredits: currentCredits < 50 // Show buy credits option when balance is low
        };

        // Create mock goals and tiers since they don't exist in backend
        const mockGoals: CreditGoal[] = [
          {
            id: "1",
            title: "Save for Premium Tools",
            targetAmount: 500,
            currentAmount: currentCredits,
            deadline: Date.now() + 86400000 * 30,
            category: "Tools",
            status: currentCredits >= 500 ? 'completed' : 'active',
            progress: Math.min((currentCredits / 500) * 100, 100)
          },
          {
            id: "2",
            title: "Monthly Target",
            targetAmount: 1000,
            currentAmount: monthlyEarnings,
            deadline: Date.now() + 86400000 * 15,
            category: "Earnings",
            status: 'active',
            progress: Math.min((monthlyEarnings / 1000) * 100, 100)
          }
        ];

        const mockTiers: CreditTier[] = [
          {
            name: "Bronze",
            minCredits: 0,
            currentTier: currentCredits < 1000,
            benefits: ["Basic features", "Standard support"],
            icon: "FaMedal",
            color: "text-amber-600"
          },
          {
            name: "Silver",
            minCredits: 1000,
            currentTier: currentCredits >= 1000 && currentCredits < 5000,
            benefits: ["Priority support", "Advanced analytics", "Custom branding"],
            icon: "FaGem",
            color: "text-gray-400"
          },
          {
            name: "Gold",
            minCredits: 5000,
            currentTier: currentCredits >= 5000 && currentCredits < 10000,
            benefits: ["VIP support", "Premium features", "Exclusive tools", "Priority listing"],
            icon: "FaCrown",
            color: "text-yellow-500"
          },
          {
            name: "Platinum",
            minCredits: 10000,
            currentTier: currentCredits >= 10000,
            benefits: ["Dedicated manager", "Custom solutions", "Exclusive events", "Highest priority"],
            icon: "FaDiamond",
            color: "text-purple-500"
          }
        ];

        setTransactions(transformedTransactions);
        setStats(transformedStats);
        setGoals(mockGoals);
        setTiers(mockTiers);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching credits data:", err);
        setError(err.message || "Failed to load credits data");
        
        // Fallback to mock data if backend is not available
        console.log("Falling back to mock data...");
        const generateMockTransactions = (): CreditTransaction[] => {
          return [
            {
              id: "1",
              type: 'earned',
              amount: 150.00,
              description: "Web Development Consultation",
              category: "Technology",
              date: Date.now() - 86400000 * 2,
              status: 'completed',
              reference: "TXN-2024-001",
              serviceId: "service1",
              clientName: "Sarah Johnson",
              tags: ['consultation', 'web-development', 'completed']
            },
            {
              id: "2",
              type: 'earned',
              amount: 200.00,
              description: "UI/UX Design Services",
              category: "Design",
              date: Date.now() - 86400000 * 5,
              status: 'completed',
              reference: "TXN-2024-002",
              serviceId: "service2",
              clientName: "Mike Chen",
              tags: ['design', 'ui-ux', 'completed']
            }
          ];
        };

        const mockTransactions = generateMockTransactions();
        const mockStats: CreditStats = {
          currentBalance: 2847.50,
          totalEarned: 2847.50,
          totalSpent: 75,
          totalBonus: 40,
          totalRefunds: 50,
          monthlyEarnings: 650,
          weeklyEarnings: 150,
          dailyEarnings: 0,
          earningTrend: 12.5,
          spendingTrend: -5.2,
          topEarningCategories: [
            { category: "Technology", amount: 450, percentage: 45 },
            { category: "Design", amount: 320, percentage: 32 },
            { category: "Consulting", amount: 230, percentage: 23 }
          ],
          recentActivity: [
            { date: "This Week", earned: 150, spent: 75 },
            { date: "Last Week", earned: 450, spent: 120 },
            { date: "This Month", earned: 650, spent: 300 }
          ],
          achievements: [
            { title: "First Earnings", description: "Earned your first credits", icon: "FaStar", unlocked: true },
            { title: "5-Star Provider", description: "Received 5-star review", icon: "FaTrophy", unlocked: true },
            { title: "Top Earner", description: "Earned 1000+ credits", icon: "FaCrown", unlocked: false },
            { title: "Consistent", description: "7 days of activity", icon: "FaMedal", unlocked: true },
            { title: "Diverse Skills", description: "Work in 3+ categories", icon: "FaGem", unlocked: false }
          ],
          showBuyCredits: false
        };

        const mockGoals: CreditGoal[] = [
          {
            id: "1",
            title: "Save for Premium Tools",
            targetAmount: 500,
            currentAmount: 2847.50,
            deadline: Date.now() + 86400000 * 30,
            category: "Tools",
            status: 'completed',
            progress: 100
          },
          {
            id: "2",
            title: "Monthly Target",
            targetAmount: 1000,
            currentAmount: 650,
            deadline: Date.now() + 86400000 * 15,
            category: "Earnings",
            status: 'active',
            progress: 65
          }
        ];

        const mockTiers: CreditTier[] = [
          {
            name: "Bronze",
            minCredits: 0,
            currentTier: false,
            benefits: ["Basic features", "Standard support"],
            icon: "FaMedal",
            color: "text-amber-600"
          },
          {
            name: "Silver",
            minCredits: 1000,
            currentTier: true,
            benefits: ["Priority support", "Advanced analytics", "Custom branding"],
            icon: "FaGem",
            color: "text-gray-400"
          },
          {
            name: "Gold",
            minCredits: 5000,
            currentTier: false,
            benefits: ["VIP support", "Premium features", "Exclusive tools", "Priority listing"],
            icon: "FaCrown",
            color: "text-yellow-500"
          },
          {
            name: "Platinum",
            minCredits: 10000,
            currentTier: false,
            benefits: ["Dedicated manager", "Custom solutions", "Exclusive events", "Highest priority"],
            icon: "FaDiamond",
            color: "text-purple-500"
          }
        ];

        setTransactions(mockTransactions);
        setStats(mockStats);
        setGoals(mockGoals);
        setTiers(mockTiers);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return <FaPlus className="w-4 h-4 text-green-500" />;
      case 'spent': return <FaMinus className="w-4 h-4 text-red-500" />;
      case 'bonus': return <FaGift className="w-4 h-4 text-purple-500" />;
      case 'refund': return <FaArrowUp className="w-4 h-4 text-blue-500" />;
      case 'penalty': return <FaExclamationTriangle className="w-4 h-4 text-orange-500" />;
      default: return <FaCoins className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned': return 'text-green-600';
      case 'spent': return 'text-red-600';
      case 'bonus': return 'text-purple-600';
      case 'refund': return 'text-blue-600';
      case 'penalty': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technology': return <FaLaptop className="w-4 h-4" />;
      case 'Design': return <FaPalette className="w-4 h-4" />;
      case 'Consulting': return <FaBriefcase className="w-4 h-4" />;
      case 'Marketing': return <FaGlobe className="w-4 h-4" />;
      case 'Bonus': return <FaGift className="w-4 h-4" />;
      case 'Refund': return <FaArrowUp className="w-4 h-4" />;
      default: return <FaTag className="w-4 h-4" />;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesCategory && matchesSearch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = b.date - a.date;
        break;
      case 'amount':
        comparison = Math.abs(b.amount) - Math.abs(a.amount);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex h-screen bg-white items-center justify-center">
          <LoadingSpinner size="lg" text="Loading credits..." />
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
              <h1 className="text-3xl font-bold text-gray-900">Credits</h1>
              <p className="text-gray-600 mt-1">Manage your TradeMinutes credits and earnings</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaRedo className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
              <button className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-2">
                <FaDownload className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#FAF6ED] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Current Balance</span>
                  <FaCoins className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.currentBalance)}</div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <FaArrowUp className="w-3 h-3" />
                  <span>+{stats.earningTrend}% this month</span>
                </div>
              </div>

              <div className="bg-[#FAF6ED] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Earned</span>
                  <FaDollarSign className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalEarned)}</div>
                <div className="text-sm text-gray-600 mt-1">Lifetime earnings</div>
              </div>

              <div className="bg-[#FAF6ED] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Monthly Earnings</span>
                  <FaChartLine className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthlyEarnings)}</div>
                <div className="text-sm text-gray-600 mt-1">This month</div>
              </div>

              <div className="bg-[#FAF6ED] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Bonus</span>
                  <FaGift className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalBonus)}</div>
                <div className="text-sm text-gray-600 mt-1">Bonus earnings</div>
              </div>
            </div>
          )}

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
              onClick={() => setSelectedView("transactions")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === "transactions"
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaHistory className="w-4 h-4 inline mr-2" />
              Transactions
            </button>
            <button
              onClick={() => setSelectedView("goals")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === "goals"
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaTrophy className="w-4 h-4 inline mr-2" />
              Goals
            </button>
            <button
              onClick={() => setSelectedView("tiers")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === "tiers"
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaCrown className="w-4 h-4 inline mr-2" />
              Tiers
            </button>
          </div>

          {/* Content */}
          {selectedView === "overview" && (
            <div className="space-y-6">
              {/* Earning Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Earning Categories</h3>
                  <div className="space-y-3">
                    {stats?.topEarningCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(category.category)}
                          <span className="font-medium text-gray-900">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{formatCurrency(category.amount)}</div>
                          <div className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {stats?.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{activity.date}</span>
                        <div className="text-right">
                          <div className="text-sm text-green-600">+{formatCurrency(activity.earned)}</div>
                          <div className="text-sm text-red-600">-{formatCurrency(activity.spent)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buy More Credits */}
              {stats?.showBuyCredits && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 shadow-sm border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <FaExclamationTriangle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Low Credit Balance</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          You're running low on credits. Purchase more to continue booking services.
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="text-gray-600">Current Balance:</span>
                            <span className="ml-2 font-semibold text-red-600">{formatCurrency(stats.currentBalance)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Recommended:</span>
                            <span className="ml-2 font-semibold text-gray-900">500+ credits</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Buy Credits
                      </button>
                      <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                        View Packages
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Credit Packages */}
              {stats?.showBuyCredits && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Packages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border-2 border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                          <FaCoins className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">Starter Pack</h4>
                        <p className="text-2xl font-bold text-emerald-600 mb-2">100 Credits</p>
                        <p className="text-sm text-gray-600 mb-3">Perfect for getting started</p>
                        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                          $9.99
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border-2 border-emerald-300 bg-emerald-50 relative">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium">Most Popular</span>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                          <FaGem className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">Professional Pack</h4>
                        <p className="text-2xl font-bold text-emerald-600 mb-2">500 Credits</p>
                        <p className="text-sm text-gray-600 mb-3">Best value for regular users</p>
                        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                          $39.99
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border-2 border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                          <FaCrown className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">Premium Pack</h4>
                        <p className="text-2xl font-bold text-emerald-600 mb-2">1000 Credits</p>
                        <p className="text-sm text-gray-600 mb-3">For power users</p>
                        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                          $69.99
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedView === "transactions" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FaSearch className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">All Types</option>
                      <option value="earned">Earned</option>
                      <option value="spent">Spent</option>
                      <option value="bonus">Bonus</option>
                      <option value="refund">Refund</option>
                      <option value="penalty">Penalty</option>
                    </select>

                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="Technology">Technology</option>
                      <option value="Design">Design</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Bonus">Bonus</option>
                      <option value="Refund">Refund</option>
                    </select>
                  </div>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-');
                      setSortBy(sort as 'date' | 'amount' | 'type');
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="amount-desc">Highest Amount</option>
                    <option value="amount-asc">Lowest Amount</option>
                    <option value="type-asc">Type A-Z</option>
                    <option value="type-desc">Type Z-A</option>
                  </select>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Type</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Description</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Category</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.type)}
                              <span className="capitalize font-medium text-gray-900">{transaction.type}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              {transaction.clientName && (
                                <p className="text-sm text-gray-500">{transaction.clientName}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(transaction.category)}
                              <span className="text-sm text-gray-600">{transaction.category}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                              {transaction.type === 'spent' || transaction.type === 'penalty' ? '-' : '+'}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-500">{formatDate(transaction.date)}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-500 font-mono">{transaction.reference}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedView === "goals" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => (
                  <div key={goal.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {goal.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            goal.status === 'completed' ? 'bg-green-500' :
                            goal.status === 'overdue' ? 'bg-red-500' :
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(goal.currentAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-semibold text-gray-900">{formatDate(goal.deadline)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500">{goal.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedView === "tiers" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tiers.map((tier, index) => (
                  <div key={index} className={`bg-white rounded-xl p-6 shadow-sm border-2 ${
                    tier.currentTier ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                  }`}>
                    <div className="text-center mb-4">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                        tier.currentTier ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}>
                        <FaCrown className="w-8 h-8 text-white" />
                      </div>
                      <h3 className={`text-xl font-bold ${tier.color}`}>{tier.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {tier.minCredits === 0 ? 'Starting tier' : `${tier.minCredits.toLocaleString()}+ credits`}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {tier.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center gap-2 text-sm">
                          <FaCheckCircle className={`w-4 h-4 ${
                            tier.currentTier ? 'text-emerald-600' : 'text-gray-400'
                          }`} />
                          <span className={tier.currentTier ? 'text-gray-900' : 'text-gray-600'}>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {tier.currentTier && (
                      <div className="mt-4 pt-4 border-t border-emerald-200">
                        <span className="text-sm font-semibold text-emerald-700">Current Tier</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
} 