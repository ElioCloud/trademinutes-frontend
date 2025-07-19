"use client";

import { useState, useEffect } from "react";
import { FaUpload, FaTimes, FaImage, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
  onCreated?: () => void;
}

interface Tier {
  name: string;
  title: string;
  description: string;
  credits: number;
  deliveryTime: string;
  features: string[];
  weeklyHours: number;
  dailyHours: number;
  maxDays: number;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  showToast,
  onCreated,
}: CreateTaskModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    locationType: "in-person",
    availability: [{ date: new Date().toISOString().split('T')[0], timeFrom: "", timeTo: "" }],
  });

  const [tiers, setTiers] = useState<Tier[]>([
    {
      name: "Basic",
      title: "",
      description: "",
      credits: 0,
      deliveryTime: "2 days",
      features: [],
      weeklyHours: 20,
      dailyHours: 4,
      maxDays: 7
    },
    {
      name: "Standard",
      title: "",
      description: "",
      credits: 0,
      deliveryTime: "3 days",
      features: [],
      weeklyHours: 30,
      dailyHours: 6,
      maxDays: 14
    },
    {
      name: "Premium",
      title: "",
      description: "",
      credits: 0,
      deliveryTime: "4 days",
      features: [],
      weeklyHours: 40,
      dailyHours: 8,
      maxDays: 30
    }
  ]);

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

  const handleTierChange = (tierIndex: number, field: keyof Tier, value: any) => {
    setTiers(prev => prev.map((tier, index) => 
      index === tierIndex ? { ...tier, [field]: value } : tier
    ));
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

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.title || !formData.description || !selectedCategory || !formData.location) {
        showToast("❌ Please fill in all required fields.", "error");
        return;
      }
      if (!coverImage) {
        showToast("❌ Please upload a cover image.", "error");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
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

    // Validate tiers
    const hasValidTiers = tiers.some(tier => tier.credits > 0 && tier.title && tier.description);
    if (!hasValidTiers) {
      showToast("❌ Please configure at least one tier with credits, title, and description.", "error");
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
      formDataToSend.append('category', selectedCategory);
      formDataToSend.append('availability', JSON.stringify(formData.availability));
      formDataToSend.append('tiers', JSON.stringify(tiers));

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

  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Cover Image Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Cover Image *</label>
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
        <label className="block text-sm font-medium text-gray-700">Availability Time *</label>
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
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Configure Service Tiers</h3>
        <p className="text-sm text-gray-600">Set up your pricing tiers and time commitments</p>
      </div>

      {tiers.map((tier, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">{tier.name} Tier</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Credits:</span>
              <input
                type="number"
                value={tier.credits}
                onChange={(e) => handleTierChange(index, 'credits', parseInt(e.target.value) || 0)}
                className="w-20 border border-gray-300 px-2 py-1 rounded text-sm"
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={tier.title}
                onChange={(e) => handleTierChange(index, 'title', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder={`${tier.name} package title`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
              <input
                type="text"
                value={tier.deliveryTime}
                onChange={(e) => handleTierChange(index, 'deliveryTime', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., 2 days"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={tier.description}
              onChange={(e) => handleTierChange(index, 'description', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows={2}
              placeholder={`Describe what's included in the ${tier.name} package`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Hours</label>
              <input
                type="number"
                value={tier.weeklyHours}
                onChange={(e) => handleTierChange(index, 'weeklyHours', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="0"
                max="168"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Hours</label>
              <input
                type="number"
                value={tier.dailyHours}
                onChange={(e) => handleTierChange(index, 'dailyHours', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="0"
                max="24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Days</label>
              <input
                type="number"
                value={tier.maxDays}
                onChange={(e) => handleTierChange(index, 'maxDays', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="1"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] relative">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Listing</h2>
              <p className="text-gray-600 mt-1">
                Step {currentStep} of 2: {currentStep === 1 ? 'Basic Information' : 'Pricing Tiers'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center mt-4 space-x-2">
            <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 h-1 rounded ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>

        {/* Footer with Navigation */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : (
              <div></div>
            )}
            
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg font-medium"
              >
                <span>Next</span>
                <FaArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={uploading}
                onClick={handleSubmit}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                  uploading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl'
                } text-white flex items-center space-x-2`}
              >
                {uploading ? (
                  <>
                    <LoadingSpinner size="sm" text="" />
                    <span>Creating Listing...</span>
                  </>
                ) : (
                  <>
                    <span>Create Listing</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
