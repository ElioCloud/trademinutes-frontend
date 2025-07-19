"use client";

import { useState, useEffect } from "react";
import { FaUpload, FaTimes, FaImage } from "react-icons/fa";

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
    availability: [{ date: new Date().toISOString().split('T')[0], timeFrom: "", timeTo: "" }],
  });

  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [contentImages, setContentImages] = useState<File[]>([]);
  const [contentImagePreviews, setContentImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
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

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("❌ Cover image must be less than 5MB", "error");
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (contentImages.length + files.length > 5) {
      showToast("❌ Maximum 5 content images allowed", "error");
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        showToast("❌ Each image must be less than 5MB", "error");
        return false;
      }
      return true;
    });

    setContentImages(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setContentImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview("");
  };

  const removeContentImage = (index: number) => {
    setContentImages(prev => prev.filter((_, i) => i !== index));
    setContentImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setUploading(true);

    const { timeFrom, timeTo } = formData.availability[0];

    if (!timeFrom || !timeTo) {
      showToast("❌ Please select both start and end times.", "error");
      setUploading(false);
      return;
    }

    if (timeFrom >= timeTo) {
      showToast("⏰ 'Time From' must be earlier than 'Time To'", "error");
      setUploading(false);
      return;
    }

    // Ensure latitude and longitude are valid numbers
    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);
    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude === 0 ||
      longitude === 0
    ) {
      showToast("❌ Please select a valid location from the suggestions.", "error");
      setUploading(false);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add basic task data
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('latitude', latitude.toString());
      formDataToSend.append('longitude', longitude.toString());
      formDataToSend.append('locationType', formData.locationType);
      formDataToSend.append('credits', formData.credits);
      formDataToSend.append('category', selectedCategory);
      formDataToSend.append('availability', JSON.stringify(formData.availability));

      // Add cover image
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      // Add content images
      contentImages.forEach((image, index) => {
        formDataToSend.append('contentImages', image);
      });

      // Debug: Log what's being sent
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      console.log('Sending request to:', `${API_BASE_URL}/api/tasks/create`);
      console.log('Request headers:', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data' // Browser will set this automatically
      });

      const res = await fetch(`${API_BASE_URL}/api/tasks/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
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
    } catch (err) {
      console.error("Network error:", err);
      showToast("❌ Network error occurred.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] relative">
        {/* Header */}
        <div className="bg-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create New Listing</h2>
              <p className="text-purple-100 mt-1">Add your service to the marketplace</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cover Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Cover Image</label>
            {coverImagePreview ? (
              <div className="relative">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition">
                <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload cover image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Content Images Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Content Images (Max 5)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {contentImagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Content ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeContentImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FaTimes className="w-2 h-2" />
                  </button>
                </div>
              ))}
              {contentImagePreviews.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition">
                  <FaImage className="w-4 h-4 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Add image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleContentImagesChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <select
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              name="title"
              placeholder="Enter your service title"
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              placeholder="Describe your service in detail"
              rows={3}
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Location *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  placeholder="Enter a Canadian location"
                  className="border border-gray-300 px-4 py-3 rounded-xl w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  value={formData.location}
                  onChange={handleLocationInput}
                  required
                />
                {locationSuggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-200 rounded-xl mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
                    {locationSuggestions.map((place) => (
                      <li
                        key={place.id}
                        className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
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
                value={formData.locationType}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-3 rounded-xl w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                required
              >
                <option value="in-person">In-person</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Pricing & Time *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Credits</label>
                <input
                  type="number"
                  name="credits"
                  placeholder="Enter credits"
                  className="border border-gray-300 px-4 py-3 rounded-xl w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  value={formData.credits}
                  onChange={handleChange}
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Time</label>
                <div className="flex gap-2">
                  <select
                    name="timeFrom"
                    className="border border-gray-300 px-3 py-3 rounded-xl w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    value={formData.availability[0].timeFrom}
                    onChange={(e) => handleAvailabilityChange("timeFrom", e.target.value)}
                    required
                  >
                    <option value="">From</option>
                    {generateTimeOptions()}
                  </select>
                  <select
                    name="timeTo"
                    className="border border-gray-300 px-3 py-3 rounded-xl w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    value={formData.availability[0].timeTo}
                    onChange={(e) => handleAvailabilityChange("timeTo", e.target.value)}
                    required
                  >
                    <option value="">To</option>
                    {generateTimeOptions()}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 ${
              uploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
            } text-white`}
          >
            {uploading ? 'Creating Listing...' : 'Create Listing'}
          </button>
        </form>
        </div>
      </div>
      {isOpen && (
        <button
          type="button"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: "#6366f1",
            color: "white",
            borderRadius: "50%",
            width: 56,
            height: 56,
            fontSize: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => {
            alert(
              `Latitude: ${formData.latitude || "N/A"}\nLongitude: ${formData.longitude || "N/A"}`
            );
          }}
          title="Show current coordinates"
        >
          📍
        </button>
      )}
    </div>
  );
}
