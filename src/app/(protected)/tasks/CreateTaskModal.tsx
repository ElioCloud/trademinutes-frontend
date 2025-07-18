"use client";

import { useState, useEffect } from "react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
  onCreated?: () => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  showToast,
  onCreated,
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    locationType: "in-person",
    credits: "",
    type: "",
    availability: [{ date: "", timeFrom: "", timeTo: "" }],
  });

  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";

  const MAPBOX_TOKEN =
    "pk.eyJ1IjoibmVlbGFtZ2F1Y2hhbiIsImEiOiJjbWMwbzg0dXgwNGlnMmxwcmlncWVycnBnIn0.ARZnElbDY2SOiInY94w6aA";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tasks/categories`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        showToast("❌ Failed to load categories.", "error");
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, showToast]);

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${min
          .toString()
          .padStart(2, "0")}`;
        const label = new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        options.push(
          <option key={time} value={time}>
            {label}
          </option>
        );
      }
    }
    return options;
  };

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
        showToast("❌ Failed to fetch locations.", "error");
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
    setFormData((prev) => {
      const availability = [...prev.availability];
      availability[0] = {
        ...availability[0],
        [field]: value,
      };
      return { ...prev, availability };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { date, timeFrom, timeTo } = formData.availability[0];
    if (!date) {
      showToast("❌ Please select a date.", "error");
      return;
    }
    if (!timeFrom || !timeTo) {
      showToast("❌ Please select both start and end times.", "error");
      return;
    }
    if (timeFrom >= timeTo) {
      showToast("⏰ 'Time From' must be earlier than 'Time To'", "error");
      return;
    }
    if (images.length === 0) {
      showToast("❌ Please add at least one image.", "error");
      return;
    }
    const token = localStorage.getItem("token");
    // Use FormData for image upload
    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("location", formData.location);
    form.append("latitude", formData.latitude);
    form.append("longitude", formData.longitude);
    form.append("locationType", formData.locationType);
    form.append("credits", formData.credits);
    form.append("category", selectedCategory);
    form.append("date", date);
    form.append("timeFrom", timeFrom);
    form.append("timeTo", timeTo);
    images.forEach((img, idx) => form.append("images", img));
    const res = await fetch(`${API_BASE_URL}/api/tasks/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server error:", errorText);
      showToast("❌ Failed to create task.", "error");
    } else {
      showToast("✅ Task created successfully!", "success");
      if (onCreated) onCreated();
      onClose();
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
          📝 Create A Task
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <div className="flex gap-2">
            <input
              type="text"
              name="location"
              placeholder="Enter a Canadian location"
              value={formData.location}
              onChange={handleLocationInput}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <select
              name="locationType"
              value={formData.locationType}
              onChange={handleChange}
              className="w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="in-person">In-person</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <input
            type="number"
            name="credits"
            placeholder="Credits"
            value={formData.credits}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            type="text"
            name="type"
            placeholder="Enter offer type "
            value={formData.type}
            onChange={handleLocationInput}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <div className="flex gap-2">
            <input
              type="date"
              name="date"
              value={formData.availability[0].date}
              onChange={(e) => handleAvailabilityChange("date", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <select
              name="timeFrom"
              value={formData.availability[0].timeFrom}
              onChange={(e) =>
                handleAvailabilityChange("timeFrom", e.target.value)
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            >
              <option value="">From</option>
              {generateTimeOptions()}
            </select>
            <select
              name="timeTo"
              value={formData.availability[0].timeTo}
              onChange={(e) =>
                handleAvailabilityChange("timeTo", e.target.value)
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            >
              <option value="">To</option>
              {generateTimeOptions()}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            <div className="flex flex-wrap gap-4 mt-2">
              {previews.map((src, idx) => (
                <div key={src} className="relative w-24 h-24">
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:bg-red-100"
                    title="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-400 to-purple-500 text-white px-8 py-2 rounded-md font-semibold shadow hover:scale-105 transition"
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-lg">✔️</span> Submit Task
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
