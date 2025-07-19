"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import CreateListingModal from "../CreateTaskModal";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { FaHeart, FaStar, FaTrash, FaCalendar, FaMapMarkerAlt, FaClock, FaCoins, FaPlus } from "react-icons/fa";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Availability {
  Date: string;
  TimeFrom: string;
  TimeTo: string;
}

interface Author {
  id: string;
  Name: string;
  Email: string;
  Avatar?: string;
}

interface Task {
  id: string;
  Title: string;
  Description: string;
  Location: string;
  Latitude: number;
  longitude: number;
  LocationType: string;
  Credits: number;
  Availability: Availability[];
  Type?: string;
  Category?: string;
  Status?: string;
  Author?: Author;
  Images?: string[]; // Add Images field for uploaded images
}

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const router = useRouter();



  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, setting loading to false");
      setLoading(false);
      return;
    }
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
      console.log("Fetching tasks from:", `${API_BASE_URL}/api/tasks/get/user`);
      console.log("Using token:", token.substring(0, 20) + "...");
      
      const res = await fetch(`${API_BASE_URL}/api/tasks/get/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("API Response status:", res.status);
      console.log("API Response headers:", Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP error! status: ${res.status}, body: ${errorText}`);
      }
      
      const json = await res.json();
      console.log("=== FRONTEND DEBUG: Raw API Response ===");
      console.log("API Response:", json);
      
      let processedTasks;
      if (json && Array.isArray(json.data)) {
        processedTasks = json.data.map((task: any) => ({ ...task, id: task.id || task._id }));
      } else if (Array.isArray(json)) {
        processedTasks = json.map((task: any) => ({ ...task, id: task.id || task._id }));
      } else {
        processedTasks = [];
      }
      
      console.log("=== FRONTEND DEBUG: Processed Tasks ===");
      processedTasks.forEach((task: any, index: number) => {
        console.log(`Task ${index + 1}:`, {
          id: task.id,
          title: task.Title,
          images: task.Images,
          imagesLength: task.Images ? task.Images.length : 0,
          hasImages: task.Images && task.Images.length > 0
        });
      });
      
      setTasks(processedTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      console.error("Error details:", {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!taskToDelete || !token) return;

    // Check if user typed the correct confirmation
    if (deleteConfirmation.toLowerCase() !== "delete") {
      toast.error("❌ Please type 'delete' to confirm");
      return;
    }

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";

      const res = await fetch(
        `${API_BASE_URL}/api/tasks/delete/${taskToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        toast.error("❌ Failed to delete task");
        return;
      }

      toast.success("🗑️ Task deleted");
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskToDelete)
      );
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("❌ Network error");
    } finally {
      setShowConfirmModal(false);
      setTaskToDelete(null);
      setDeleteConfirmation("");
    }
  };

  console.log("task", tasks);

  // Ensure all tasks have proper id mapping
  const mappedTasks = tasks.map((task: any) => ({ 
    ...task, 
    id: task.id || task._id || task.ID 
  }));

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-white">
        <style jsx>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
        
        {/* Header Section */}
        <div className="pt-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
              <p className="text-gray-500 text-base font-normal mt-1">Manage and create your service listings</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:bg-purple-700 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <FaPlus className="w-4 h-4 text-white" />
              Create Listing
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="py-8">

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading your listings..." />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">Create your first service listing to get started</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Create Your First Listing
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mappedTasks.map((task: Task, idx: number) => {
              const gradients = [
                'from-blue-400 to-blue-600',
                'from-purple-400 to-purple-600', 
                'from-green-400 to-green-600',
                'from-pink-400 to-pink-600',
                'from-yellow-400 to-yellow-600',
                'from-orange-400 to-orange-600'
              ];
              const colors = [
                { bg: 'bg-blue-100', text: 'text-blue-600' },
                { bg: 'bg-purple-100', text: 'text-purple-600' },
                { bg: 'bg-green-100', text: 'text-green-600' },
                { bg: 'bg-pink-100', text: 'text-pink-600' },
                { bg: 'bg-yellow-100', text: 'text-yellow-600' },
                { bg: 'bg-orange-100', text: 'text-orange-600' }
              ];
              
              // Debug image rendering
              console.log(`=== RENDERING TASK ${idx + 1}: ${task.Title} ===`);
              console.log('Task images:', task.Images);
              console.log('Has images:', task.Images && task.Images.length > 0);
              console.log('First image:', task.Images && task.Images.length > 0 ? task.Images[0] : 'None');
              
              // Convert primitive.A to string array if needed
              const imageUrls = task.Images && Array.isArray(task.Images) ? task.Images : [];
              console.log('Image URLs:', imageUrls);
              console.log('Has image URLs:', imageUrls.length > 0);
              
              return (
                <div key={task.id ?? idx} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1" onClick={() => {
                  console.log('Clicking task:', task.id, task.Title);
                  router.push(`/tasks/view/${String(task.id)}`);
                }}>
                  <div className="h-32 relative">
                    {imageUrls.length > 0 ? (
                      <img
                        src={imageUrls[0]}
                        alt={task.Title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradients[idx % gradients.length]}`}></div>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setTaskToDelete(task.id);
                        setShowConfirmModal(true);
                      }}
                      className="absolute top-3 right-3 text-white hover:text-red-400 transition-colors bg-black/20 rounded-full p-2 hover:bg-black/40"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-block px-2 py-1 ${colors[idx % colors.length].bg} ${colors[idx % colors.length].text} text-xs font-semibold rounded`}>
                        {task.Type || task.Category || 'SERVICE'}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                        <FaCoins className="w-4 h-4" />
                        <span>{task.Credits}</span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {task.Title}
                    </h4>
                    
                    {/* Location and Time Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaMapMarkerAlt className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{task.Location}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                          {task.LocationType}
                        </span>
                      </div>
                      
                      {task.Availability?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FaClock className="w-4 h-4 text-gray-400" />
                          <span>{task.Availability[0].TimeFrom} - {task.Availability[0].TimeTo}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaStar className="w-4 h-4 text-yellow-400" />
                      <span>4.5 (12 reviews)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>

        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4">
            <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Listing?</h2>
                <p className="text-gray-600 mb-4">
                  This action cannot be undone. The listing will be permanently removed.
                </p>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    Type "delete" to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type 'delete' to confirm"
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setDeleteConfirmation("");
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { console.log('Delete clicked', taskToDelete); handleDelete(); }}
                  disabled={deleteConfirmation.toLowerCase() !== "delete"}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    deleteConfirmation.toLowerCase() === "delete"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <CreateListingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          showToast={(msg, type) =>
            type === "success" ? toast.success(msg) : toast.error(msg)
          }
          onCreated={fetchTasks}
        />

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </ProtectedLayout>
  );
}
