"use client";

import { useState } from "react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    locationType: "in-person",
    credits: "",
    availability: [{ date: "", timeFrom: "", timeTo: "" }],
  });

  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  const MAPBOX_TOKEN =
    "pk.eyJ1IjoibmVlbGFtZ2F1Y2hhbiIsImEiOiJjbWMwbzg0dXgwNGlnMmxwcmlncWVycnBnIn0.ARZnElbDY2SOiInY94w6aA"; // Replace with your own

  if (!isOpen) return null;

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationInput = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setFormData((prev) => ({ ...prev, location: query }));

    if (query.length > 2) {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query + " Toronto"
        )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&country=CA&types=address&limit=5`;

        const res = await fetch(url);
        const data = await res.json();
        setLocationSuggestions(data.features);
      } catch (err) {
        console.error("Mapbox error:", err);
      }
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleLocationSelect = (place: any) => {
    setFormData((prev) => ({
      ...prev,
      location: place.place_name,
      latitude: place.geometry.coordinates[1],
      longitude: place.geometry.coordinates[0],
    }));
    setLocationSuggestions([]);
  };

  const handleAvailabilityChange = (field: string, value: string) => {
    const updated = [...formData.availability];
    updated[0][field] = value;
    setFormData((prev) => ({ ...prev, availability: updated }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { timeFrom, timeTo } = formData.availability[0];
    if (timeFrom >= timeTo) {
      alert("⏰ 'Time From' must be earlier than 'Time To'");
      return;
    }

    const payload = {
      ...formData,
      credits: Number(formData.credits),
    };

    console.log("Submitting Payload:", payload);

    try {
      const res = await fetch("http://localhost:8084/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        alert("❌ Failed to create task.");
      } else {
        alert("✅ Task created successfully!");
        onClose();
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("❌ Network error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-red-500"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-purple-700">
          📝 Create Task
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="w-full border px-4 py-2 rounded-xl"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            rows={2}
            className="w-full border px-4 py-2 rounded-xl"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                name="location"
                placeholder="Enter a Canadian location"
                className="border px-4 py-2 rounded-xl w-full"
                value={formData.location}
                onChange={handleLocationInput}
                required
              />
              {locationSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border rounded-xl mt-1 w-full max-h-48 overflow-y-auto shadow">
                  {locationSuggestions.map((place, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                      onClick={() => handleLocationSelect(place)}
                    >
                      {place.place_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <select
              name="locationType"
              className="border px-4 py-2 rounded-xl"
              value={formData.locationType}
              onChange={handleChange}
            >
              <option value="in-person">In-person</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <input
            type="number"
            name="credits"
            placeholder="Credits"
            className="w-full border px-4 py-2 rounded-xl"
            value={formData.credits}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="date"
              value={formData.availability[0].date}
              onChange={(e) => handleAvailabilityChange("date", e.target.value)}
              className="border px-4 py-2 rounded-xl"
            />
            <input
              type="time"
              value={formData.availability[0].timeFrom}
              onChange={(e) =>
                handleAvailabilityChange("timeFrom", e.target.value)
              }
              className="border px-4 py-2 rounded-xl"
            />
            <input
              type="time"
              value={formData.availability[0].timeTo}
              onChange={(e) =>
                handleAvailabilityChange("timeTo", e.target.value)
              }
              className="border px-4 py-2 rounded-xl"
            />
          </div>

          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition"
            >
              ✅ Submit Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
