"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUpload, FaTimes, FaImage, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";

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

export default function CreateServicePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Increased to 4 steps
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
      router.push('/login');
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
        alert("❌ Failed to load categories.");
      }
    };

    fetchCategories();
  }, [router]);

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
        alert("❌ Failed to fetch locations.");
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
        alert("❌ Cover image must be less than 5MB");
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
      alert("❌ Maximum 5 content images allowed");
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ Each image must be less than 5MB");
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
      // Validate step 1 - Basic Info
      if (!formData.title || !formData.description || !selectedCategory) {
        alert("❌ Please fill in title, description, and category.");
        return;
      }
      if (!coverImage) {
        alert("❌ Please upload a cover image.");
        return;
      }
    }
    if (currentStep === 2) {
      // Validate step 2 - Location & Availability
      if (!formData.location || !formData.availability[0].timeFrom || !formData.availability[0].timeTo) {
        alert("❌ Please fill in location and availability details.");
        return;
      }
    }
    if (currentStep === 3) {
      // Validate step 3 - Tier Configuration
      const hasValidTiers = tiers.some(tier => tier.title && tier.description && tier.credits > 0);
      if (!hasValidTiers) {
        alert("❌ Please configure at least one tier with title, description, and credits.");
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
      alert("❌ Please select both start and end times.");
      setUploading(false);
      return;
    }

    if (timeFrom >= timeTo) {
      alert("⏰ 'Time From' must be earlier than 'Time To'");
      setUploading(false);
      return;
    }

    // Validate tiers
    const hasValidTiers = tiers.some(tier => tier.credits > 0 && tier.title && tier.description);
    if (!hasValidTiers) {
      alert("❌ Please configure at least one tier with credits, title, and description.");
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
      alert("❌ Please select a valid location from the suggestions.");
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
        alert("❌ Failed to create service.");
      } else {
        alert("✅ Service created successfully!");
        router.push('/my-listings');
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("❌ Network error occurred.");
    } finally {
      setUploading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900">Basic Information</h3>
        <p className="text-gray-600 mt-2">Start by providing the essential details about your service</p>
      </div>

      {/* Cover Image Upload */}
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-700">Cover Image *</label>
        {coverImagePreview ? (
          <div className="relative">
            <img
              src={coverImagePreview}
              alt="Cover preview"
              className="w-full h-64 object-cover rounded-xl border"
            />
            <button
              type="button"
              onClick={removeCoverImage}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label htmlFor="cover-image" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition">
            <FaUpload className="w-16 h-16 text-gray-400 mb-4" />
            <span className="text-xl text-gray-500">Upload cover image</span>
            <span className="text-sm text-gray-400 mt-2">Click to browse or drag and drop</span>
          </label>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverImageChange}
          className="hidden"
          id="cover-image"
        />
      </div>

      {/* Content Images Upload */}
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-700">
          Content Images (Max 5)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {contentImagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Content ${index + 1}`}
                className="w-full h-40 object-cover rounded-xl border"
              />
              <button
                type="button"
                onClick={() => removeContentImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          ))}
          {contentImagePreviews.length < 5 && (
            <label htmlFor="content-images" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition">
              <FaImage className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Add image</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleContentImagesChange}
                className="hidden"
                id="content-images"
              />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">Category *</label>
          <select
            name="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 px-6 py-4 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-lg"
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

        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">Title *</label>
          <input
            type="text"
            name="title"
            placeholder="Enter your service title"
            className="w-full border border-gray-300 px-6 py-4 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-lg"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-700">Description *</label>
        <textarea
          name="description"
          placeholder="Describe your service in detail"
          rows={6}
          className="w-full border border-gray-300 px-6 py-4 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none text-lg"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900">Location & Availability</h3>
        <p className="text-gray-600 mt-2">Set your service location and availability schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">Location *</label>
          <div className="relative">
            <input
              type="text"
              name="location"
              placeholder="Enter a Canadian location"
              className="border border-gray-300 px-6 py-4 rounded-xl w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-lg"
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
        </div>

        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">Service Type</label>
          <select
            name="locationType"
            value={formData.locationType}
            onChange={handleChange}
            className="border border-gray-300 px-6 py-4 rounded-xl w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-lg"
            required
          >
            <option value="in-person">In-person</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-700">Availability Time *</label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">From</label>
            <select
              name="timeFrom"
              className="border border-gray-300 px-6 py-4 rounded-xl w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-lg"
              value={formData.availability[0].timeFrom}
              onChange={(e) => handleAvailabilityChange("timeFrom", e.target.value)}
              required
            >
              <option value="">Select start time</option>
              {generateTimeOptions()}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">To</label>
            <select
              name="timeTo"
              className="border border-gray-300 px-6 py-4 rounded-xl w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-lg"
              value={formData.availability[0].timeTo}
              onChange={(e) => handleAvailabilityChange("timeTo", e.target.value)}
              required
            >
              <option value="">Select end time</option>
              {generateTimeOptions()}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900">Configure Service Tiers</h3>
        <p className="text-gray-600 mt-2">Set up your pricing tiers and time commitments</p>
      </div>

      {tiers.map((tier, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-gray-900">{tier.name} Tier</h4>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Credits:</span>
              <input
                type="number"
                value={tier.credits}
                onChange={(e) => handleTierChange(index, 'credits', parseInt(e.target.value) || 0)}
                className="w-24 border border-gray-300 px-3 py-2 rounded-lg text-sm"
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={tier.title}
                onChange={(e) => handleTierChange(index, 'title', e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder={`${tier.name} package title`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
              <input
                type="text"
                value={tier.deliveryTime}
                onChange={(e) => handleTierChange(index, 'deliveryTime', e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., 2 days"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={tier.description}
              onChange={(e) => handleTierChange(index, 'description', e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows={3}
              placeholder={`Describe what's included in the ${tier.name} package`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Hours</label>
              <input
                type="number"
                value={tier.weeklyHours}
                onChange={(e) => handleTierChange(index, 'weeklyHours', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="0"
                max="168"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Hours</label>
              <input
                type="number"
                value={tier.dailyHours}
                onChange={(e) => handleTierChange(index, 'dailyHours', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="0"
                max="24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Days</label>
              <input
                type="number"
                value={tier.maxDays}
                onChange={(e) => handleTierChange(index, 'maxDays', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="1"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900">Review & Submit</h3>
        <p className="text-gray-600 mt-2">Review your service details before creating</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Info Review */}
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Category</label>
              <p className="text-lg text-gray-900">{selectedCategory}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Title</label>
              <p className="text-lg text-gray-900">{formData.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Description</label>
              <p className="text-lg text-gray-900">{formData.description}</p>
            </div>
          </div>
        </div>

        {/* Location & Availability Review */}
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Location & Availability</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Location</label>
              <p className="text-lg text-gray-900">{formData.location}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Service Type</label>
              <p className="text-lg text-gray-900 capitalize">{formData.locationType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Availability</label>
              <p className="text-lg text-gray-900">
                {formData.availability[0].timeFrom} - {formData.availability[0].timeTo}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tiers Review */}
      <div className="space-y-6">
        <h4 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Service Tiers</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold text-gray-900">{tier.name} Tier</h5>
                <span className="text-2xl font-bold text-purple-600">{tier.credits} Credits</span>
              </div>
              {tier.title && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Title</label>
                  <p className="text-gray-900">{tier.title}</p>
                </div>
              )}
              {tier.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{tier.description}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <p className="font-medium text-gray-600">Weekly</p>
                  <p className="text-gray-900">{tier.weeklyHours}h</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-600">Daily</p>
                  <p className="text-gray-900">{tier.dailyHours}h</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-600">Max Days</p>
                  <p className="text-gray-900">{tier.maxDays}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Images Review */}
      {coverImagePreview && (
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Cover Image</label>
              <img
                src={coverImagePreview}
                alt="Cover preview"
                className="w-full h-32 object-cover rounded-lg border"
              />
            </div>
            {contentImagePreviews.map((preview, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-600 mb-2">Content {index + 1}</label>
                <img
                  src={preview}
                  alt={`Content ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ProtectedLayout>
      <div className="w-full">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Service</h1>
              <p className="text-gray-600 mt-2">
                Step {currentStep} of {totalSteps}: {
                  currentStep === 1 ? 'Basic Information' : 
                  currentStep === 2 ? 'Location & Availability' :
                  currentStep === 3 ? 'Service Tiers' : 'Review & Submit'
                }
              </p>
            </div>

          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${currentStep >= 1 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 h-2 rounded ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-4 h-4 rounded-full ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 h-2 rounded ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-4 h-4 rounded-full ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 h-2 rounded ${currentStep >= 4 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-4 h-4 rounded-full ${currentStep >= 4 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
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
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center space-x-2 px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg font-medium"
            >
              <span>Next</span>
              <FaArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={uploading}
              onClick={handleSubmit}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                uploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl'
              } text-white flex items-center space-x-2`}
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" text="" />
                  <span>Creating Service...</span>
                </>
              ) : (
                <>
                  <span>Create Service</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
} 