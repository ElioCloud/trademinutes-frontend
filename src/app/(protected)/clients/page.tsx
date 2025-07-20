"use client";

import { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  FaUser, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaCalendar, 
  FaDollarSign, 
  FaStar, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaHeart, 
  FaThumbsUp, 
  FaThumbsDown,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDownload,
  FaRedo,
  FaChartBar,
  FaList,
  FaGrid,
  FaBookmark,
  FaShare,
  FaFlag,
  FaCheckCircle,
  FaClock,
  FaTag,
  FaArrowUp,
  FaArrowDown,
  FaRegStar,
  FaStarHalfAlt,
  FaCrown,
  FaMedal,
  FaTrophy,
  FaUserTie,
  FaUserFriends,
  FaBuilding,
  FaBriefcase,
  FaGraduationCap,
  FaLaptop,
  FaPalette,
  FaPen,
  FaLightbulb
} from "react-icons/fa";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  isVerified: boolean;
  joinDate: number;
  lastActive: number;
  totalSpent: number;
  totalOrders: number;
  averageRating: number;
  totalReviews: number;
  status: 'active' | 'inactive' | 'vip' | 'new';
  tags: string[];
  notes?: string;
  preferences: {
    preferredCategories: string[];
    budgetRange: string;
    communicationStyle: string;
    timezone: string;
  };
  recentActivity: {
    type: 'booking' | 'review' | 'message' | 'inquiry';
    description: string;
    date: number;
    amount?: number;
  }[];
  services: {
    id: string;
    title: string;
    category: string;
    amount: number;
    date: number;
    status: 'completed' | 'ongoing' | 'cancelled';
    rating?: number;
  }[];
}

interface ClientStats {
  totalClients: number;
  activeClients: number;
  vipClients: number;
  newClients: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSpendingClient: { name: string; amount: number };
  clientRetentionRate: number;
  categoryBreakdown: { category: string; count: number; revenue: number }[];
  topIndustries: { industry: string; count: number }[];
}

export default function ClientDirectoryPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'spent' | 'orders'>('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    const generateMockClients = (): Client[] => {
      return [
        {
          id: "1",
          name: "Sarah Johnson",
          email: "sarah.johnson@techstartup.com",
          phone: "+1 (555) 123-4567",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          location: "San Francisco, CA",
          company: "TechStartup Inc.",
          jobTitle: "CTO",
          industry: "Technology",
          isVerified: true,
          joinDate: Date.now() - 86400000 * 365, // 1 year ago
          lastActive: Date.now() - 86400000 * 2, // 2 days ago
          totalSpent: 2847.50,
          totalOrders: 8,
          averageRating: 4.8,
          totalReviews: 6,
          status: 'vip',
          tags: ['high-value', 'tech-savvy', 'quick-payer'],
          notes: "Excellent client, always provides clear requirements and pays promptly. Interested in expanding to mobile development.",
          preferences: {
            preferredCategories: ['Technology', 'Design'],
            budgetRange: '$200-500',
            communicationStyle: 'Direct',
            timezone: 'PST'
          },
          recentActivity: [
            { type: 'booking', description: 'Booked Web Development Consultation', date: Date.now() - 86400000 * 2, amount: 150 },
            { type: 'review', description: 'Left 5-star review for UI/UX Design', date: Date.now() - 86400000 * 5 },
            { type: 'message', description: 'Inquired about mobile app development', date: Date.now() - 86400000 * 7 }
          ],
          services: [
            { id: "s1", title: "Web Development Consultation", category: "Technology", amount: 150, date: Date.now() - 86400000 * 2, status: 'completed', rating: 5 },
            { id: "s2", title: "UI/UX Design Services", category: "Design", amount: 200, date: Date.now() - 86400000 * 15, status: 'completed', rating: 5 },
            { id: "s3", title: "Database Optimization", category: "Technology", amount: 300, date: Date.now() - 86400000 * 30, status: 'completed', rating: 4 }
          ]
        },
        {
          id: "2",
          name: "Mike Chen",
          email: "mike.chen@designstudio.com",
          phone: "+1 (555) 234-5678",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          location: "New York, NY",
          company: "Design Studio Pro",
          jobTitle: "Creative Director",
          industry: "Design",
          isVerified: true,
          joinDate: Date.now() - 86400000 * 180, // 6 months ago
          lastActive: Date.now() - 86400000 * 1, // 1 day ago
          totalSpent: 1620.00,
          totalOrders: 5,
          averageRating: 4.6,
          totalReviews: 4,
          status: 'active',
          tags: ['creative', 'design-focused', 'collaborative'],
          notes: "Very creative client with great vision. Sometimes needs multiple revisions but always appreciates quality work.",
          preferences: {
            preferredCategories: ['Design', 'Writing'],
            budgetRange: '$100-300',
            communicationStyle: 'Collaborative',
            timezone: 'EST'
          },
          recentActivity: [
            { type: 'booking', description: 'Booked Logo Design Service', date: Date.now() - 86400000 * 1, amount: 120 },
            { type: 'review', description: 'Left 4-star review for Brand Identity', date: Date.now() - 86400000 * 10 },
            { type: 'message', description: 'Requested revision for website design', date: Date.now() - 86400000 * 12 }
          ],
          services: [
            { id: "s4", title: "Logo Design Service", category: "Design", amount: 120, date: Date.now() - 86400000 * 1, status: 'ongoing' },
            { id: "s5", title: "Brand Identity Package", category: "Design", amount: 250, date: Date.now() - 86400000 * 20, status: 'completed', rating: 4 },
            { id: "s6", title: "Website Design", category: "Design", amount: 400, date: Date.now() - 86400000 * 45, status: 'completed', rating: 4 }
          ]
        },
        {
          id: "3",
          name: "Emily Rodriguez",
          email: "emily.rodriguez@marketing.com",
          phone: "+1 (555) 345-6789",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          location: "Los Angeles, CA",
          company: "Digital Marketing Solutions",
          jobTitle: "Marketing Manager",
          industry: "Marketing",
          isVerified: true,
          joinDate: Date.now() - 86400000 * 90, // 3 months ago
          lastActive: Date.now() - 86400000 * 3, // 3 days ago
          totalSpent: 975.00,
          totalOrders: 3,
          averageRating: 4.9,
          totalReviews: 2,
          status: 'active',
          tags: ['marketing', 'content-focused', 'results-driven'],
          notes: "Marketing professional who values content quality and SEO. Great for ongoing content projects.",
          preferences: {
            preferredCategories: ['Writing', 'Technology'],
            budgetRange: '$50-200',
            communicationStyle: 'Professional',
            timezone: 'PST'
          },
          recentActivity: [
            { type: 'booking', description: 'Booked Content Writing Service', date: Date.now() - 86400000 * 3, amount: 75 },
            { type: 'review', description: 'Left 5-star review for SEO Content', date: Date.now() - 86400000 * 15 },
            { type: 'inquiry', description: 'Asked about monthly content packages', date: Date.now() - 86400000 * 20 }
          ],
          services: [
            { id: "s7", title: "Content Writing Service", category: "Writing", amount: 75, date: Date.now() - 86400000 * 3, status: 'ongoing' },
            { id: "s8", title: "SEO Content Package", category: "Writing", amount: 150, date: Date.now() - 86400000 * 25, status: 'completed', rating: 5 },
            { id: "s9", title: "Social Media Content", category: "Writing", amount: 100, date: Date.now() - 86400000 * 40, status: 'completed', rating: 5 }
          ]
        },
        {
          id: "4",
          name: "David Thompson",
          email: "david.thompson@consulting.com",
          phone: "+1 (555) 456-7890",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          location: "Chicago, IL",
          company: "Business Consulting Group",
          jobTitle: "Senior Consultant",
          industry: "Consulting",
          isVerified: false,
          joinDate: Date.now() - 86400000 * 60, // 2 months ago
          lastActive: Date.now() - 86400000 * 10, // 10 days ago
          totalSpent: 960.00,
          totalOrders: 2,
          averageRating: 4.7,
          totalReviews: 1,
          status: 'active',
          tags: ['consulting', 'business-focused', 'strategic'],
          notes: "Business consultant who needs strategic insights. Good for high-value consulting projects.",
          preferences: {
            preferredCategories: ['Consulting', 'Technology'],
            budgetRange: '$200-500',
            communicationStyle: 'Formal',
            timezone: 'CST'
          },
          recentActivity: [
            { type: 'booking', description: 'Booked Business Strategy Session', date: Date.now() - 86400000 * 10, amount: 300 },
            { type: 'review', description: 'Left 4-star review for Strategy Consulting', date: Date.now() - 86400000 * 25 },
            { type: 'message', description: 'Requested follow-up consultation', date: Date.now() - 86400000 * 30 }
          ],
          services: [
            { id: "s10", title: "Business Strategy Session", category: "Consulting", amount: 300, date: Date.now() - 86400000 * 10, status: 'completed', rating: 4 },
            { id: "s11", title: "Market Analysis Report", category: "Consulting", amount: 250, date: Date.now() - 86400000 * 35, status: 'completed', rating: 5 }
          ]
        },
        {
          id: "5",
          name: "Lisa Wang",
          email: "lisa.wang@startup.com",
          phone: "+1 (555) 567-8901",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
          location: "Seattle, WA",
          company: "Innovation Labs",
          jobTitle: "Product Manager",
          industry: "Technology",
          isVerified: true,
          joinDate: Date.now() - 86400000 * 30, // 1 month ago
          lastActive: Date.now() - 86400000 * 5, // 5 days ago
          totalSpent: 640.00,
          totalOrders: 2,
          averageRating: 4.5,
          totalReviews: 1,
          status: 'new',
          tags: ['startup', 'product-focused', 'innovative'],
          notes: "New client from startup scene. Very innovative ideas but sometimes unclear requirements.",
          preferences: {
            preferredCategories: ['Technology', 'Design'],
            budgetRange: '$100-300',
            communicationStyle: 'Casual',
            timezone: 'PST'
          },
          recentActivity: [
            { type: 'booking', description: 'Booked Mobile App Consultation', date: Date.now() - 86400000 * 5, amount: 150 },
            { type: 'message', description: 'Discussed app development timeline', date: Date.now() - 86400000 * 8 },
            { type: 'inquiry', description: 'Asked about MVP development costs', date: Date.now() - 86400000 * 15 }
          ],
          services: [
            { id: "s12", title: "Mobile App Consultation", category: "Technology", amount: 150, date: Date.now() - 86400000 * 5, status: 'ongoing' },
            { id: "s13", title: "Product Design Review", category: "Design", amount: 200, date: Date.now() - 86400000 * 20, status: 'completed', rating: 4 }
          ]
        }
      ];
    };

    const generateMockStats = (clients: Client[]): ClientStats => {
      const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0);
      const activeClients = clients.filter(c => c.status === 'active' || c.status === 'vip').length;
      const vipClients = clients.filter(c => c.status === 'vip').length;
      const newClients = clients.filter(c => c.status === 'new').length;
      
      const categoryBreakdown: { [key: string]: { count: number; revenue: number } } = {};
      const industryBreakdown: { [key: string]: number } = {};
      
      clients.forEach(client => {
        // Category breakdown
        client.preferences.preferredCategories.forEach(category => {
          if (!categoryBreakdown[category]) {
            categoryBreakdown[category] = { count: 0, revenue: 0 };
          }
          categoryBreakdown[category].count++;
          categoryBreakdown[category].revenue += client.totalSpent / client.preferences.preferredCategories.length;
        });
        
        // Industry breakdown
        if (!industryBreakdown[client.industry]) {
          industryBreakdown[client.industry] = 0;
        }
        industryBreakdown[client.industry]++;
      });

      const topSpendingClient = clients.reduce((top, client) => 
        client.totalSpent > top.totalSpent ? client : top
      );

      return {
        totalClients: clients.length,
        activeClients,
        vipClients,
        newClients,
        totalRevenue,
        averageOrderValue: totalRevenue / clients.reduce((sum, c) => sum + c.totalOrders, 0),
        topSpendingClient: { name: topSpendingClient.name, amount: topSpendingClient.totalSpent },
        clientRetentionRate: 85.5,
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
          category,
          count: data.count,
          revenue: data.revenue
        })),
        topIndustries: Object.entries(industryBreakdown)
          .map(([industry, count]) => ({ industry, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      };
    };

    const fetchClients = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockClients = generateMockClients();
        setClients(mockClients);
        
        const mockStats = generateMockStats(mockClients);
        setStats(mockStats);
        
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
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
      stars.push(<FaStarHalfAlt key="half" className="w-4 h-4 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case 'Technology': return <FaLaptop className="w-4 h-4" />;
      case 'Design': return <FaPalette className="w-4 h-4" />;
      case 'Marketing': return <FaGlobe className="w-4 h-4" />;
      case 'Consulting': return <FaBriefcase className="w-4 h-4" />;
      default: return <FaBuilding className="w-4 h-4" />;
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
    const matchesIndustry = selectedIndustry === 'all' || client.industry === selectedIndustry;
    const matchesSearch = searchTerm === '' || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesIndustry && matchesSearch;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'recent':
        comparison = b.lastActive - a.lastActive;
        break;
      case 'spent':
        comparison = b.totalSpent - a.totalSpent;
        break;
      case 'orders':
        comparison = b.totalOrders - a.totalOrders;
        break;
    }
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex h-screen bg-white items-center justify-center">
          <LoadingSpinner size="lg" text="Loading client directory..." />
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
              <h1 className="text-3xl font-bold text-gray-900">Client Directory</h1>
              <p className="text-gray-600 mt-1">Manage and track your client relationships</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaRedo className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
              <button className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-2">
                <FaPlus className="w-4 h-4" />
                Add Client
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
                  <span className="text-sm text-gray-600">Total Clients</span>
                  <FaUser className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalClients}</div>
                <div className="text-sm text-gray-600 mt-1">{stats.activeClients} active</div>
              </div>

              <div className="bg-[#FAF6ED] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <FaDollarSign className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
                <div className="text-sm text-gray-600 mt-1">from all clients</div>
              </div>

              <div className="bg-[#FAF6ED] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">VIP Clients</span>
                  <FaCrown className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.vipClients}</div>
                <div className="text-sm text-gray-600 mt-1">high-value clients</div>
              </div>

              <div className="bg-[#FAF6ED] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Retention Rate</span>
                  <FaChartBar className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.clientRetentionRate}%</div>
                <div className="text-sm text-gray-600 mt-1">client satisfaction</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedView("grid")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedView === "grid"
                      ? "bg-emerald-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaGrid className="w-4 h-4 inline mr-2" />
                  Grid
                </button>
                <button
                  onClick={() => setSelectedView("list")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedView === "list"
                      ? "bg-emerald-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaList className="w-4 h-4 inline mr-2" />
                  List
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaSearch className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="vip">VIP</option>
                  <option value="active">Active</option>
                  <option value="new">New</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Consulting">Consulting</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort as 'name' | 'recent' | 'spent' | 'orders');
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="recent-desc">Recently Active</option>
                  <option value="recent-asc">Least Active</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="spent-desc">Highest Spent</option>
                  <option value="spent-asc">Lowest Spent</option>
                  <option value="orders-desc">Most Orders</option>
                  <option value="orders-asc">Least Orders</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {selectedView === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedClients.map((client) => (
                <div key={client.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Client Header */}
                  <div className="bg-[#FAF6ED] p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {client.avatar ? (
                          <img
                            src={client.avatar}
                            alt={client.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-emerald-700 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                            {client.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{client.name}</h3>
                          {client.isVerified && (
                            <FaCheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusColor(client.status)}`}>
                            {client.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{client.jobTitle}</p>
                        <p className="text-sm text-gray-500">{client.company}</p>
                      </div>
                    </div>
                  </div>

                  {/* Client Details */}
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaEnvelope className="w-4 h-4" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaMapMarkerAlt className="w-4 h-4" />
                          <span>{client.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {getIndustryIcon(client.industry)}
                        <span>{client.industry}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(client.totalSpent)}</div>
                        <div className="text-xs text-gray-500">Total Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{client.totalOrders}</div>
                        <div className="text-xs text-gray-500">Orders</div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        {renderStars(client.averageRating)}
                        <span className="text-sm text-gray-600 ml-1">({client.totalReviews})</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last active: {formatDate(client.lastActive)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button className="flex-1 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm hover:bg-emerald-100 transition-colors">
                        <FaEye className="w-4 h-4 inline mr-1" />
                        View
                      </button>
                      <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                        <FaEnvelope className="w-4 h-4 inline mr-1" />
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Client</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Company</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Industry</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Total Spent</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Orders</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Rating</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Last Active</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedClients.map((client) => (
                      <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {client.avatar ? (
                              <img
                                src={client.avatar}
                                alt={client.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center text-white font-semibold">
                                {client.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{client.name}</p>
                                {client.isVerified && (
                                  <FaCheckCircle className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-gray-900">{client.company}</p>
                          <p className="text-sm text-gray-500">{client.jobTitle}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {getIndustryIcon(client.industry)}
                            <span className="text-sm text-gray-600">{client.industry}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900">{formatCurrency(client.totalSpent)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900">{client.totalOrders}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            {renderStars(client.averageRating)}
                            <span className="text-sm text-gray-500">({client.totalReviews})</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusColor(client.status)}`}>
                            {client.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-500">{formatDate(client.lastActive)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                              <FaEnvelope className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                              <FaEdit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
} 