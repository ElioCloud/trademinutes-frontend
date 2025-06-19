"use client";

import { useState } from "react";
import CreateListingModal from "../CreateTaskModal"; // Update if path is different
import ProtectedLayout from "@/components/Layout/ProtectedLayout";

export default function TaskListPage() {
  const allTasks = [
    {
      id: 1,
      title: "Offer: Grocery Pickup",
      type: "offer",
      status: "pending",
      credits: 10,
    },
    {
      id: 2,
      title: "Request: Help with Homework",
      type: "request",
      status: "pending",
      credits: 15,
    },
    {
      id: 3,
      title: "Offer: Yoga Class",
      type: "offer",
      status: "completed",
      credits: 20,
    },
    {
      id: 4,
      title: "Request: Dog Walking",
      type: "request",
      status: "pending",
      credits: 8,
    },
  ];

  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTasks =
    filter === "all"
      ? allTasks
      : allTasks.filter((task) => task.type === filter);

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-semibold">Community Listings</h1>

          <div className="flex items-center gap-4">
            <select
              className="border rounded-xl px-4 py-2 text-sm bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="offer">Offers</option>
              <option value="request">Requests</option>
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow hover:scale-105 transition"
            >
              ➕ Create Listing
            </button>
          </div>
        </div>

        {/* Task Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-3xl p-5 shadow-md hover:shadow-xl"
            >
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full mb-2 inline-block ${
                  task.type === "offer"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {task.type === "offer" ? "Offer" : "Request"}
              </span>

              <h3 className="text-lg font-semibold mb-1">{task.title}</h3>

              <p
                className={`text-xs mb-2 inline-block px-3 py-1 rounded-full ${
                  task.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {task.status === "completed" ? "✅ Completed" : "🕒 Pending"}
              </p>

              <p className="text-sm font-medium text-gray-600 mb-4">
                Credits: {task.credits} 🪙
              </p>
            </div>
          ))}
        </div>

        {/* Create Listing Modal */}
        <CreateListingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </ProtectedLayout>
  );
}
