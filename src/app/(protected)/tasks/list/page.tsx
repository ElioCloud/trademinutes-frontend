"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import CreateListingModal from "../CreateTaskModal";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { FaHeart, FaStar, FaTrash, FaCalendar, FaMapMarkerAlt, FaClock, FaCoins } from "react-icons/fa";

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
}

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const router = useRouter();

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
      const res = await fetch(`${API_BASE_URL}/api/tasks/get/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        setTasks(json.data.map((task: any) => ({ ...task, id: task.id || task._id })));
      } else if (Array.isArray(json)) {
        setTasks(json.map((task: any) => ({ ...task, id: task.id || task._id })));
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
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
    }
  };

  console.log("task", tasks);

  // Force mapping of _id to id before rendering
  const mappedTasks = tasks.map((task: any) => ({ ...task, id: task.id }));

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-white p-8">
        <style jsx>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Listings</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow hover:scale-105 transition"
          >
            ➕ Create Listing
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : mappedTasks.length === 0 ? (
          <p>No tasks found.</p>
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
              
              return (
                <div key={task.id ?? idx} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/tasks/view/${String(task.id)}`)}>
                  <div className={`h-32 bg-gradient-to-br ${gradients[idx % gradients.length]} relative`}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setTaskToDelete(task.id);
                        setShowConfirmModal(true);
                      }}
                      className="absolute top-3 right-3 text-white hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <FaTrash className="w-5 h-5" />
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
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {task.Title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {task.Description}
                    </p>
                    
                    {/* Location and Time Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{task.Location}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {task.LocationType}
                        </span>
                      </div>
                      
                      {task.Availability?.length > 0 && (
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <FaCalendar className="w-4 h-4 text-gray-400" />
                            <span>{task.Availability[0].Date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="w-4 h-4 text-gray-400" />
                            <span>{task.Availability[0].TimeFrom} - {task.Availability[0].TimeTo}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    

                    
                    {/* Status and Rating */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FaStar className="w-4 h-4 text-yellow-400" />
                        <span>4.5 (12 reviews)</span>
                      </div>
                      {task.Status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.Status === 'open' ? 'bg-green-100 text-green-600' :
                          task.Status === 'in progress' ? 'bg-blue-100 text-blue-600' :
                          task.Status === 'completed' ? 'bg-gray-100 text-gray-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {task.Status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Are you sure?</h2>
              <p className="text-sm text-gray-600 mb-6">
                This will permanently delete the task.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { console.log('Delete clicked', taskToDelete); handleDelete(); }}
                  className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600"
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
