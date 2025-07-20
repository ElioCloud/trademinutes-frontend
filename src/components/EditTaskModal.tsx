"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaMapMarkerAlt, FaClock, FaCoins, FaUpload, FaTrash } from "react-icons/fa";
import LoadingSpinner from "./common/LoadingSpinner";

interface Availability {
  Date: string;
  TimeFrom: string;
  TimeTo: string;
}

interface Tier {
  name: string;
  title: string;
  description: string;
  credits: number;
  features: string[];
  availableTimeSlot: string;
  maxDays: number;
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
  Images?: string[];
  Tiers?: Tier[];
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdated: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  onUpdated,
  showToast,
}: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    locationType: "Online",
    credits: 0,
    category: "",
    type: "",
    availability: [{ date: "", timeFrom: "", timeTo: "" }],
  });
  const [tiers, setTiers] = useState<Tier[]>([
    {
      name: "Basic",
      title: "",
      description: "",
      credits: 0,
      features: [],
      availableTimeSlot: "9:00 AM - 5:00 PM",
      maxDays: 7
    },
    {
      name: "Standard",
      title: "",
      description: "",
      credits: 0,
      features: [],
      availableTimeSlot: "8:00 AM - 6:00 PM",
      maxDays: 14
    },
    {
      name: "Premium",
      title: "",
      description: "",
      credits: 0,
      features: [],
      availableTimeSlot: "24/7 Available",
      maxDays: 30
    }
  ]);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.Title || "",
        description: task.Description || "",
        location: task.Location || "",
        locationType: task.LocationType || "Online",
        credits: task.Credits || 0,
        category: task.Category || "",
        type: task.Type || "",
        availability: task.Availability?.map(av => ({
          date: av.Date || "",
          timeFrom: av.TimeFrom || "",
          timeTo: av.TimeTo || "",
        })) || [{ date: "", timeFrom: "", timeTo: "" }],
      });
      setExistingImages(task.Images || []);
      
      // Set tiers from task if available
      if (task.Tiers && task.Tiers.length > 0) {
        setTiers(task.Tiers);
      }
    }
  }, [task, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvailabilityChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map((av, i) =>
        i === index ? { ...av, [field]: value } : av
      ),
    }));
  };

  const addAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, { date: "", timeFrom: "", timeTo: "" }],
    }));
  };

  const removeAvailability = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const handleTierChange = (index: number, field: keyof Tier, value: any) => {
    setTiers(prev => prev.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    ));
  };

  const addTierFeature = (tierIndex: number) => {
    setTiers(prev => prev.map((tier, i) => 
      i === tierIndex ? { ...tier, features: [...tier.features, ""] } : tier
    ));
  };

  const removeTierFeature = (tierIndex: number, featureIndex: number) => {
    setTiers(prev => prev.map((tier, i) => 
      i === tierIndex ? { ...tier, features: tier.features.filter((_, fi) => fi !== featureIndex) } : tier
    ));
  };

  const updateTierFeature = (tierIndex: number, featureIndex: number, value: string) => {
    setTiers(prev => prev.map((tier, i) => 
      i === tierIndex ? { 
        ...tier, 
        features: tier.features.map((feature, fi) => fi === featureIndex ? value : feature)
      } : tier
    ));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("locationType", formData.locationType);
      formDataToSend.append("credits", formData.credits.toString());
      formDataToSend.append("category", formData.category);
      formDataToSend.append("type", formData.type);

      // Add availability
      formDataToSend.append("availability", JSON.stringify(formData.availability));

      // Add tiers
      formDataToSend.append("tiers", JSON.stringify(tiers));

      // Add new images
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      // Add existing images that weren't removed
      formDataToSend.append("existingImages", JSON.stringify(existingImages));

      const response = await fetch(`${API_BASE_URL}/api/tasks/update/${task.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update task: ${errorData}`);
      }

      showToast("✅ Task updated successfully!", "success");
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update task");
      showToast("❌ Failed to update task", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Listing</h2>
              <p className="text-gray-600 mt-1">Update your service listing details</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter service title"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="">Select Category</option>
                  <option value="Technology">Technology</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Writing">Writing</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your service in detail"
                rows={4}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                required
              />
            </div>

            {/* Location and Credits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location *</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                    className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location Type</label>
                <select
                  name="locationType"
                  value={formData.locationType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="Online">Online</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Credits *</label>
                <div className="relative">
                  <FaCoins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="credits"
                    value={formData.credits}
                    onChange={handleChange}
                    placeholder="Enter credits"
                    min="1"
                    className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <button
                  type="button"
                  onClick={addAvailability}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  + Add Time Slot
                </button>
              </div>
              
              {formData.availability.map((av, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">Date</label>
                    <input
                      type="date"
                      value={av.date}
                      onChange={(e) => handleAvailabilityChange(index, "date", e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">From</label>
                    <input
                      type="time"
                      value={av.timeFrom}
                      onChange={(e) => handleAvailabilityChange(index, "timeFrom", e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">To</label>
                    <input
                      type="time"
                      value={av.timeTo}
                      onChange={(e) => handleAvailabilityChange(index, "timeTo", e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div className="flex items-end">
                    {formData.availability.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAvailability(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tiers */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Service Tiers</label>
              <p className="text-sm text-gray-600">Configure your pricing tiers and what's included in each package</p>
              
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={tier.title}
                      onChange={(e) => handleTierChange(index, 'title', e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder={`${tier.name} package title`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={tier.description}
                      onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      rows={2}
                      placeholder={`Describe what's included in the ${tier.name} package`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Available Time Slot</label>
                      <input
                        type="text"
                        value={tier.availableTimeSlot}
                        onChange={(e) => handleTierChange(index, 'availableTimeSlot', e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 9:00 AM - 5:00 PM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Days</label>
                      <input
                        type="number"
                        value={tier.maxDays}
                        onChange={(e) => handleTierChange(index, 'maxDays', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Features</label>
                      <button
                        type="button"
                        onClick={() => addTierFeature(index)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        + Add Feature
                      </button>
                    </div>
                    <div className="space-y-2">
                      {tier.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateTierFeature(index, featureIndex, e.target.value)}
                            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter feature description"
                          />
                          <button
                            type="button"
                            onClick={() => removeTierFeature(index, featureIndex)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Images */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Images</label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Current Images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Add New Images:</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-green-600 hover:text-green-700 font-medium"
                  >
                    Choose files
                  </label>
                  <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                </div>
              </div>

              {/* Preview New Images */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">New Images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`New image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 