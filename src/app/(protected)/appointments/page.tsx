"use client";

import { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: "upcoming" | "past";
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("loggedInUserID");

      if (!token || !userId) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/bookings/owner/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();
        const now = new Date();

        const formatted = (json.data || []).map((item: any) => {
          const dateStr = item.timeslot?.date || "N/A";
          const from = item.timeslot?.timeFrom || "";
          const to = item.timeslot?.timeTo || "";
          const dateTime = new Date(`${dateStr}T${from}`);
          const isUpcoming = dateTime.getTime() > now.getTime();

          return {
            id: item.taskId,
            title: item.taskTitle || "Untitled Task",
            date: dateStr,
            time: `${from} - ${to}`,
            location: item.location || "Online",
            status: isUpcoming ? "upcoming" : "past",
          };
        });

        setAppointments(formatted);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };

    fetchAppointments();
  }, []);

  const upcoming = appointments.filter((a) => a.status === "upcoming");
  const past = appointments.filter((a) => a.status === "past");

  return (
    <ProtectedLayout>
      <div className="max-w-5xl pl-8 py-10 space-y-10">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-left">
            Upcoming Appointments
          </h2>
          {upcoming.length === 0 ? (
            <div className="text-gray-500">No upcoming appointments.</div>
          ) : (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {upcoming.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white/80 rounded-xl shadow p-5 border border-gray-200 flex flex-col gap-2"
                >
                  <div className="font-semibold text-lg text-emerald-700">
                    {appt.title}
                  </div>
                  <div className="text-gray-600 text-sm mb-1">
                    📍 {appt.location}
                  </div>
                  <div className="text-gray-500 text-sm">
                    🗓️ {appt.date} &nbsp; ⏰ {appt.time}
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold self-start mt-2">
                    Upcoming
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Past Appointments</h2>
          {past.length === 0 ? (
            <div className="text-gray-500">No past appointments.</div>
          ) : (
            <div className="space-y-4">
              {past.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white/80 rounded-xl shadow p-5 border border-gray-200 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-700">
                      {appt.title}
                    </div>
                    <div className="text-gray-600 text-sm mb-1">
                      📍 {appt.location}
                    </div>
                    <div className="text-gray-500 text-sm">
                      🗓️ {appt.date} &nbsp; ⏰ {appt.time}
                    </div>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">
                    Past
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProtectedLayout>
  );
}
