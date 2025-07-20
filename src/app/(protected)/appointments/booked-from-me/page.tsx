"use client";

import { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import dayjs from "dayjs";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHourglassHalf, 
  FaUserTie,
  FaCheck,
  FaPlay,
  FaExclamationTriangle,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStar,
  FaCoins
} from "react-icons/fa";
import { FaCheckDouble } from "react-icons/fa6";
import { useAuth } from '@/contexts/AuthContext';

interface Booking {
  id: string;
  taskTitle: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  status: string;
  bookerName?: string;
  bookerEmail?: string;
  bookerPhone?: string;
  bookerProfilePicture?: string;
  bookerId?: string;
  location?: string;
  credits?: number;
  notes?: string;
  coverImage?: string;
  taskImages?: string[];
}

export default function BookedFromMePage() {
  const { refreshUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dialog, setDialog] = useState<{ open: boolean; message: string; isError: boolean }>({ open: false, message: '', isError: false });

  // Confirm booking handler
  const handleConfirm = async (bookingId: string) => {
    setConfirmingId(bookingId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:8084';
      const res = await fetch(`${API_BASE_URL}/api/bookings/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookingId }),
      });
      if (!res.ok) throw new Error("Failed to confirm booking");
      // Update UI
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "confirmed" } : b));
    } catch (err) {
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setConfirmingId(null);
    }
  };

  // Complete booking handler
  const handleComplete = async (bookingId: string) => {
    setCompletingId(bookingId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:8084';
      const res = await fetch(`${API_BASE_URL}/api/bookings/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookingId }),
      });
      if (!res.ok) throw new Error("Failed to mark as completed");
      
      // Update local booking status
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "completed" } : b));
      
      // Refresh user data to update credits in real-time
      await refreshUser();
      
      setDialog({ open: true, message: "Booking and task marked as completed. Client will be notified. Credits have been transferred to your account.", isError: false });
    } catch (err) {
      setDialog({ open: true, message: "Failed to mark as completed. Please try again.", isError: true });
    } finally {
      setCompletingId(null);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        let userId = null;
        if (token) {
          const profileRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8084'}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            userId = profileData.ID || profileData.id;
          }
        }
        if (!userId) throw new Error("User ID not found");
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:8084';
        const res = await fetch(`${API_BASE_URL}/api/bookings?role=owner&id=${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        const bookingsPromises = (data.data || data || []).map(async (b: any) => {
          // Get task ID from booking
          const taskId = b.TaskID || b.taskID || b.task?.ID || b.task?.id || b.taskId;
          console.log(`Booking ${b.ID || b.id}: Task ID = ${taskId}`);
          
          // Get booker ID from booking
          const bookerId = b.BookerID || b.bookerID || b.Booker?.ID || b.booker?.id || b.bookerId;
          console.log(`Booking ${b.ID || b.id}: Booker ID = ${bookerId}`);
          console.log(`Raw booking booker fields:`, {
            BookerID: b.BookerID,
            bookerID: b.bookerID,
            Booker: b.Booker,
            booker: b.booker,
            bookerId: b.bookerId
          });
          
          let taskImages = [];
          let bookerName = b.BookerName || b.bookerName || "Client";
          let bookerEmail = b.BookerEmail || b.bookerEmail || "";
          let bookerPhone = b.BookerPhone || b.bookerPhone || "";
          let bookerProfilePicture = "";
          
          // Fetch task details to get images and author info
          if (taskId) {
            try {
              const taskRes = await fetch(`${API_BASE_URL}/api/tasks/get/${taskId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              if (taskRes.ok) {
                const taskData = await taskRes.json();
                const task = taskData.data || taskData;
                taskImages = task.Images || task.images || [];
                console.log(`Fetched task ${taskId} images:`, taskImages);
                
                // Get booker details from the task's Author field (which contains the profile picture)
                if (task.Author) {
                  bookerName = task.Author.Name || task.Author.name || bookerName;
                  bookerEmail = task.Author.Email || task.Author.email || bookerEmail;
                  bookerProfilePicture = task.Author.Avatar || task.Author.avatar || "";
                  console.log(`✅ Using booker details from task Author:`, { 
                    name: bookerName, 
                    email: bookerEmail, 
                    profilePicture: bookerProfilePicture,
                    taskAuthor: task.Author
                  });
                }
              }
            } catch (err) {
              console.log(`Failed to fetch task ${taskId} details:`, err);
            }
          }
          
          // If we still don't have the profile picture, try fetching from auth service as fallback
          if (!bookerProfilePicture && bookerId) {
            try {
              const bookerRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8084'}/api/auth/user/${bookerId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              if (bookerRes.ok) {
                const bookerData = await bookerRes.json();
                const booker = bookerData.data || bookerData;
                bookerName = booker.Name || booker.name || bookerName;
                bookerEmail = booker.Email || booker.email || bookerEmail;
                bookerPhone = booker.Phone || booker.phone || bookerPhone;
                bookerProfilePicture = booker.ProfilePictureURL || booker.profilePictureURL || booker.Avatar || booker.avatar || booker.ProfilePicture || booker.profilePicture || "";
                console.log(`✅ Fetched booker ${bookerId} details from auth service:`, { 
                  name: bookerName, 
                  email: bookerEmail, 
                  phone: bookerPhone, 
                  profilePicture: bookerProfilePicture,
                  rawBookerData: booker
                });
                
                // If no profile picture from auth service, try profile service for this specific user
                if (!bookerProfilePicture) {
                  try {
                    const profileRes = await fetch(`${process.env.NEXT_PUBLIC_PROFILE_API_URL || 'http://localhost:8081'}/api/profile/${bookerId}`, {
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                    });
                    if (profileRes.ok) {
                      const profileData = await profileRes.json();
                      bookerProfilePicture = profileData.ProfilePictureURL || profileData.profilePictureURL || "";
                      console.log(`✅ Fetched profile picture from profile service for user ${bookerId}:`, bookerProfilePicture);
                    } else {
                      console.log(`❌ Profile service returned:`, profileRes.status, profileRes.statusText);
                    }
                  } catch (profileErr) {
                    console.log(`❌ Error fetching profile picture from profile service:`, profileErr);
                  }
                }
              } else {
                console.log(`❌ Failed to fetch booker ${bookerId} details:`, bookerRes.status, bookerRes.statusText);
                const errorText = await bookerRes.text();
                console.log(`❌ Error response:`, errorText);
              }
            } catch (err) {
              console.log(`❌ Error fetching booker ${bookerId} details:`, err);
            }
          } else if (!bookerId) {
            console.log(`⚠️ No booker ID found for booking ${b.ID || b.id}`);
          }
          
          const booking = {
            id: b.ID || b.id || b._id,
            taskTitle: b.TaskTitle || b.taskTitle || b.task?.Title || b.task?.title || "",
            date: b.Timeslot?.Date || b.timeslot?.date || "",
            timeFrom: b.Timeslot?.TimeFrom || b.timeslot?.timeFrom || "",
            timeTo: b.Timeslot?.TimeTo || b.timeslot?.timeTo || "",
            status: b.Status || b.status || "",
            bookerName: bookerName,
            bookerEmail: bookerEmail,
            bookerPhone: bookerPhone,
            bookerProfilePicture: bookerProfilePicture,
            bookerId: bookerId,
            location: b.Location || b.location || "Location TBD",
            credits: b.Credits || b.credits || 0,
            notes: b.Notes || b.notes || "",
            coverImage: b.CoverImage || b.coverImage || b.task?.CoverImage || b.task?.coverImage || "",
            taskImages: taskImages
          };
          
          // Debug logging to see what data we're getting
          console.log('=== RAW BOOKING DATA ===');
          console.log('Raw booking object:', b);
          console.log('Task object:', b.task);
          console.log('Client info from booking:');
          console.log('  - BookerName:', b.BookerName);
          console.log('  - bookerName:', b.bookerName);
          console.log('  - BookerEmail:', b.BookerEmail);
          console.log('  - bookerEmail:', b.bookerEmail);
          console.log('  - BookerPhone:', b.BookerPhone);
          console.log('  - bookerPhone:', b.bookerPhone);
          console.log('  - BookerID:', b.BookerID);
          console.log('  - bookerID:', b.bookerID);
          console.log('  - Booker:', b.Booker);
          console.log('  - booker:', b.booker);
          console.log('TaskImages from booking:', b.TaskImages);
          console.log('taskImages from booking:', b.taskImages);
          console.log('Images from task:', b.task?.Images);
          console.log('images from task:', b.task?.images);
          console.log('=== PROCESSED BOOKING DATA ===');
          console.log('Booking data:', {
            id: booking.id,
            taskTitle: booking.taskTitle,
            bookerName: booking.bookerName,
            bookerEmail: booking.bookerEmail,
            bookerPhone: booking.bookerPhone,
            coverImage: booking.coverImage,
            taskImages: booking.taskImages,
            hasTaskImages: booking.taskImages && booking.taskImages.length > 0
          });
          
          return booking;
        });
        const bookings = await Promise.all(bookingsPromises);
        setBookings(bookings);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Sort bookings: completed > confirmed > pending > cancelled
  const statusOrder = { completed: 0, confirmed: 1, pending: 2, cancelled: 3 };
  const sortedBookings = [...bookings].sort((a, b) => {
    const aStatus = a.status ? a.status.toLowerCase() : '';
    const bStatus = b.status ? b.status.toLowerCase() : '';
    return (statusOrder[aStatus as keyof typeof statusOrder] ?? 99) - (statusOrder[bStatus as keyof typeof statusOrder] ?? 99);
  });

  // Filter bookings based on selected status
  const filteredBookings = selectedStatus === 'all' 
    ? sortedBookings 
    : sortedBookings.filter(b => b.status.toLowerCase() === selectedStatus);

  // Group bookings by status for stats
  const completedBookings = bookings.filter(b => b.status && b.status.toLowerCase() === 'completed');
  const confirmedBookings = bookings.filter(b => b.status && b.status.toLowerCase() === 'confirmed');
  const pendingBookings = bookings.filter(b => b.status && b.status.toLowerCase() === 'pending');
  const cancelledBookings = bookings.filter(b => b.status && b.status.toLowerCase() === 'cancelled');

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <FaCheckDouble className="w-5 h-5 text-green-600" />;
      case 'confirmed':
        return <FaCheck className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <FaHourglassHalf className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <FaTimesCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FaExclamationTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
      case 'confirmed':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200';
      case 'pending':
        return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200';
      case 'cancelled':
        return 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <ProtectedLayout headerName="Booked from Me">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (error) {
    return (
      <ProtectedLayout headerName="Booked from Me">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookings</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout headerName="Booked from Me">
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Service Bookings</h1>
                <p className="text-gray-600">Manage and track all bookings for your services</p>
              </div>
              <div className="mt-4 lg:mt-0">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                                     <div className="flex items-center gap-2">
                     <FaCheckDouble className="w-4 h-4 text-green-600" />
                     <span>{completedBookings.length} Completed</span>
                   </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="w-4 h-4 text-blue-600" />
                    <span>{confirmedBookings.length} Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaHourglassHalf className="w-4 h-4 text-yellow-600" />
                    <span>{pendingBookings.length} Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-amber-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Total Bookings</p>
                    <p className="text-2xl font-bold text-black">{bookings.length}</p>
                  </div>
                  <FaCalendarAlt className="w-6 h-6 text-emerald-700" />
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Pending</p>
                    <p className="text-2xl font-bold text-black">{pendingBookings.length}</p>
                  </div>
                  <FaHourglassHalf className="w-6 h-6 text-emerald-700" />
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Confirmed</p>
                    <p className="text-2xl font-bold text-black">{confirmedBookings.length}</p>
                  </div>
                  <FaCheck className="w-6 h-6 text-emerald-700" />
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">Completed</p>
                    <p className="text-2xl font-bold text-black">{completedBookings.length}</p>
                  </div>
                  <FaCheckDouble className="w-6 h-6 text-emerald-700" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Pending ({pendingBookings.length})
              </button>
              <button
                onClick={() => setSelectedStatus('confirmed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'confirmed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Confirmed ({confirmedBookings.length})
              </button>
              <button
                onClick={() => setSelectedStatus('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Completed ({completedBookings.length})
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Grid */}
        <div className="px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">
                  {selectedStatus === 'all' 
                    ? "You don't have any bookings yet." 
                    : `No ${selectedStatus} bookings found.`
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBookings.map((booking, idx) => {
                  // Define gradients for fallback images (same as tasks/list)
                  const gradients = [
                    'from-blue-400 to-blue-600',
                    'from-purple-400 to-purple-600', 
                    'from-green-400 to-green-600',
                    'from-pink-400 to-pink-600',
                    'from-yellow-400 to-yellow-600',
                    'from-orange-400 to-orange-600'
                  ];
                  
                  // Debug image rendering (same as tasks/list)
                  console.log(`=== RENDERING BOOKING ${idx + 1}: ${booking.taskTitle} ===`);
                  console.log('Booking taskImages:', booking.taskImages);
                  console.log('Has taskImages:', booking.taskImages && booking.taskImages.length > 0);
                  console.log('First taskImage:', booking.taskImages && booking.taskImages.length > 0 ? booking.taskImages[0] : 'None');
                  
                  // Convert taskImages to string array if needed (exact same as tasks/list)
                  const imageUrls = booking.taskImages && Array.isArray(booking.taskImages) ? booking.taskImages : [];
                  console.log('Image URLs:', imageUrls);
                  console.log('Has image URLs:', imageUrls.length > 0);
                  console.log('Will show image:', imageUrls.length > 0);
                  console.log('Image URL to use:', imageUrls[0]);
                  
                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg overflow-hidden"
                    >
                      {/* Cover Image - Exact same implementation as tasks/list */}
                      <div className="h-48 relative">
                        {imageUrls.length > 0 ? (
                          <img
                            src={imageUrls[0]}
                            alt={booking.taskTitle}
                            className="w-full h-full object-cover"
                            style={{ zIndex: 1 }}
                            onLoad={() => {
                              console.log(`Image loaded successfully for booking ${idx + 1}:`, imageUrls[0]);
                              console.log(`Image element for booking ${idx + 1}:`, document.querySelector(`img[src="${imageUrls[0]}"]`));
                            }}
                            onError={(e) => {
                              console.log(`Image failed to load for booking ${idx + 1}:`, imageUrls[0]);
                              console.log('Error event:', e);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              // Show fallback
                              const fallback = target.nextElementSibling;
                              if (fallback) {
                                fallback.classList.remove('hidden');
                              }
                            }}
                          />
                        ) : null}
                        <div 
                          className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]} ${imageUrls.length > 0 ? 'hidden' : ''}`}
                          style={{ zIndex: 0 }}
                        ></div>
                       {/* Status Badge Overlay */}
                       <div className="absolute top-3 right-3">
                         <div className="flex items-center gap-2">
                           {getStatusIcon(booking.status)}
                           <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm bg-white/80 ${getStatusColor(booking.status)}`}>
                             {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                           </span>
                         </div>
                       </div>
                     </div>

                     {/* Header */}
                     <div className="p-6">
                       <div className="flex items-start justify-between mb-4">
                         <div className="flex-1">
                           <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                             {booking.taskTitle}
                           </h3>
                         </div>
                         {!booking.coverImage && !booking.taskImages?.length && (
                           <div className="flex items-center gap-2">
                             {getStatusIcon(booking.status)}
                             <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                               {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                             </span>
                           </div>
                         )}
                       </div>

                       {/* Client Information */}
                       <div className="bg-gray-50 rounded-lg p-4 mb-4">
                         <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                           <FaUserTie className="w-4 h-4 text-emerald-600" />
                           Client Details
                         </h4>
                         <div className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" 
                              onClick={() => {
                                if (booking.bookerId) {
                                  window.open(`/users/${booking.bookerId}`, '_blank');
                                }
                              }}>
                           {/* Profile Picture */}
                           <div className="flex-shrink-0">
                             {booking.bookerProfilePicture ? (
                               <img
                                 src={booking.bookerProfilePicture}
                                 alt={booking.bookerName || "Client"}
                                 className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                 onLoad={() => console.log(`✅ Profile picture loaded for ${booking.bookerName}:`, booking.bookerProfilePicture)}
                                 onError={(e) => {
                                   console.log(`❌ Profile picture failed to load for ${booking.bookerName}:`, booking.bookerProfilePicture);
                                   const target = e.target as HTMLImageElement;
                                   target.style.display = 'none';
                                   target.nextElementSibling?.classList.remove('hidden');
                                 }}
                               />
                             ) : (
                               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-lg">
                                 {(booking.bookerName || "C").charAt(0).toUpperCase()}
                               </div>
                             )}
                           </div>
                           
                           {/* Client Info */}
                           <div className="flex-1 min-w-0">
                             <div className="text-sm font-semibold text-gray-900 truncate">
                               {booking.bookerName || "Client"}
                             </div>
                             {booking.bookerEmail && (
                               <div className="text-xs text-gray-600 truncate flex items-center gap-1">
                                 <FaEnvelope className="w-3 h-3" />
                                 {booking.bookerEmail}
                               </div>
                             )}
                           </div>
                           
                           {/* Click Indicator */}
                           <div className="flex-shrink-0">
                             <FaEye className="w-4 h-4 text-gray-400" />
                           </div>
                         </div>
                         
                         {booking.bookerPhone && (
                           <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                             <FaPhone className="w-3 h-3 text-gray-500" />
                             <span className="font-medium">Phone:</span>
                             <span className="text-blue-600">{booking.bookerPhone}</span>
                           </div>
                         )}
                       </div>

                       {/* Service Details */}
                       <div className="space-y-2">
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                           <FaCalendarAlt className="w-4 h-4 text-emerald-600" />
                           <span>{booking.date}</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                           <FaClock className="w-4 h-4 text-blue-600" />
                           <span>{booking.timeFrom} - {booking.timeTo}</span>
                         </div>
                         {booking.credits && (
                           <div className="flex items-center gap-3 text-sm text-gray-600">
                             <FaCoins className="w-4 h-4 text-yellow-600" />
                             <span>{booking.credits} credits</span>
                           </div>
                         )}
                         {booking.location && booking.location !== "Location TBD" && (
                           <div className="flex items-center gap-3 text-sm text-gray-600">
                             <FaMapMarkerAlt className="w-4 h-4 text-red-600" />
                             <span>{booking.location}</span>
                           </div>
                         )}
                         {booking.notes && (
                           <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                             <div className="flex items-start gap-2">
                               <FaEnvelope className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                               <div>
                                 <span className="text-xs font-medium text-blue-800">Client Notes:</span>
                                 <p className="text-sm text-blue-700 mt-1">{booking.notes}</p>
                               </div>
                             </div>
                           </div>
                         )}
                       </div>
                     </div>

                    {/* Actions */}
                    <div className="p-6">
                      {booking.status === 'pending' && (
                        <button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          onClick={() => handleConfirm(booking.id)}
                          disabled={confirmingId === booking.id}
                        >
                          {confirmingId === booking.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Confirming...
                            </>
                          ) : (
                            <>
                              <FaCheck className="w-4 h-4" />
                              Confirm Booking
                            </>
                          )}
                        </button>
                      )}

                      {booking.status === 'confirmed' && (
                        <button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          onClick={() => handleComplete(booking.id)}
                          disabled={completingId === booking.id}
                        >
                          {completingId === booking.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Completing...
                            </>
                          ) : (
                            <>
                              <FaPlay className="w-4 h-4" />
                              Mark as Completed
                            </>
                          )}
                        </button>
                      )}

                      {booking.status === 'completed' && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                            <FaCheckCircle className="w-5 h-5" />
                            Service Completed
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Great job! Client has been notified.</p>
                        </div>
                      )}

                      {booking.status === 'cancelled' && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-red-600 font-medium">
                            <FaTimesCircle className="w-5 h-5" />
                            Booking Cancelled
                          </div>
                          <p className="text-sm text-gray-500 mt-1">This booking has been cancelled.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>

        {/* Dialog for completion feedback */}
        {dialog.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4 border-2 ${dialog.isError ? 'border-red-200' : 'border-green-200'}`}>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  dialog.isError ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {dialog.isError ? (
                    <FaExclamationTriangle className="w-8 h-8 text-red-600" />
                  ) : (
                    <FaCheckCircle className="w-8 h-8 text-green-600" />
                  )}
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  dialog.isError ? 'text-red-900' : 'text-green-900'
                }`}>
                  {dialog.isError ? 'Error' : 'Success'}
                </h3>
                <p className="text-gray-700 mb-6">{dialog.message}</p>
                <button 
                  onClick={() => setDialog({ open: false, message: '', isError: false })} 
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    dialog.isError 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
} 