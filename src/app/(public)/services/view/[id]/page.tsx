'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaStar, FaMapMarkerAlt, FaClock, FaCoins, FaHeart, FaShare, FaEllipsisH, FaCheck, FaInfoCircle } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/common/LoadingSpinner';

type Availability = {
  Date: string;
  TimeFrom: string;
  TimeTo: string;
};

type Service = {
  ID?: string;
  id?: string;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  Credits?: number;
  credits?: number;
  Category?: string;
  category?: string;
  Location?: string;
  location?: string;
  LocationType?: string;
  locationType?: string;
  Availability?: Availability[];
  availability?: Availability[];
  Author?: {
    Name?: string;
    name?: string;
    Avatar?: string;
    avatar?: string;
  };
  author?: {
    name?: string;
    avatar?: string;
  };
  Images?: string[];
  rating?: number;
  reviewCount?: number;
  CreatedAt?: number;
  createdAt?: number;
};

type Package = {
  name: string;
  title: string;
  price: number;
  description: string;
  deliveryTime: string;
  features: string[];
  deliveryOptions: string[];
};

type Review = {
  id: string;
  reviewer: {
    name: string;
    avatar: string;
    location: string;
  };
  rating: number;
  text: string;
  date: string;
  price: string;
  duration: string;
  hasFiles: boolean;
};

export default function ServiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'Basic' | 'Standard' | 'Premium'>('Basic');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [likes, setLikes] = useState(315);

  // Mock packages data
  const packages: Record<string, Package> = {
    Basic: {
      name: 'Basic',
      title: 'One simple floor plan or Elevation',
      price: 43.25,
      description: 'Each 2D Floor Plan or elevation with an area up to 110 sqft',
      deliveryTime: '2-day delivery',
      features: ['Source file'],
      deliveryOptions: ['2 days', '1 day']
    },
    Standard: {
      name: 'Standard',
      title: 'One floor plan or Elevation',
      price: 57.66,
      description: 'Each 2D Floor Plan or elevation with an area From 111 sqft to 1800 sqft',
      deliveryTime: '3-day delivery',
      features: ['Source file', 'Multiple formats'],
      deliveryOptions: ['3 days', '2 days']
    },
    Premium: {
      name: 'Premium',
      title: 'One large floor plan or Elevation',
      price: 187.41,
      description: 'Each 2D Floor Plan or elevation with an area: From 1801 sqft to 3000 sqft',
      deliveryTime: '4-day delivery',
      features: ['Source file', 'Multiple formats', 'Priority support'],
      deliveryOptions: ['4 days', '2 days']
    }
  };

  // Mock reviews data
  const mockReviews: Review[] = [
    {
      id: '1',
      reviewer: {
        name: 'joemarks4',
        avatar: '/api/placeholder/40/40',
        location: 'United Arab Emirates'
      },
      rating: 5,
      text: 'Outstanding. He was able to take my hand drawn plans and turn them into cad plan\'s quickly, and with very little rework. He was able to fix all the little problems that my drawings got wrong. I highly recommend Alejandro!!',
      date: '3 weeks ago',
      price: 'CA$150-CA$300',
      duration: '6 days',
      hasFiles: true
    },
    {
      id: '2',
      reviewer: {
        name: 'larsosterberg',
        avatar: '/api/placeholder/40/40',
        location: 'Sweden'
      },
      rating: 5,
      text: 'Very quick delivery with great quality and attention to details. Proactive, fast response time. Highly recommend Alejandros work to others.',
      date: '2 months ago',
      price: 'CA$43-CA$57',
      duration: '2 days',
      hasFiles: false
    }
  ];

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const serviceId = params.id as string;
        
        console.log("=== SERVICE VIEW DEBUG START ===");
        console.log("Service ID:", serviceId);
        console.log("Params:", params);
        
        // Use the public API endpoint (no authentication required)
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
        const url = `${API_BASE_URL}/api/tasks/public/${serviceId}`;
        
        console.log("API Base URL:", API_BASE_URL);
        console.log("Full URL:", url);
        console.log("Environment variable:", process.env.NEXT_PUBLIC_TASK_API_URL);
        
        console.log("Making fetch request...");
        const response = await fetch(url);
        
        console.log("Response received:");
        console.log("Status:", response.status);
        console.log("Status Text:", response.statusText);
        console.log("Headers:", Object.fromEntries(response.headers.entries()));
        console.log("OK:", response.ok);
        
        if (!response.ok) {
          console.error("Response not OK - Status:", response.status);
          const errorText = await response.text();
          console.error("Error response body:", errorText);
          throw new Error(`Service not found (Status: ${response.status})`);
        }
        
        console.log("Response is OK, parsing JSON...");
        const json = await response.json();
        console.log("=== SERVICE VIEW DEBUG ===");
        console.log("Raw API response:", json);
        console.log("Response type:", typeof json);
        console.log("Is array:", Array.isArray(json));
        console.log("Has data property:", 'data' in json);
        console.log("Service data:", json.data || json);
        
        const data = json.data || json;
        console.log("Final data to set:", data);
        console.log("Data type:", typeof data);
        console.log("Data keys:", Object.keys(data || {}));
        
        setService(data);
        setReviews(mockReviews); // In real app, fetch from API
        console.log("=== SERVICE VIEW DEBUG END ===");
      } catch (err) {
        console.error("=== SERVICE VIEW ERROR ===");
        console.error("Error type:", typeof err);
        console.error("Error name:", err instanceof Error ? err.name : 'N/A');
        console.error("Error message:", err instanceof Error ? err.message : err);
        console.error("Full error:", err);
        console.error("=== END ERROR ===");
        setError(err instanceof Error ? err.message : 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      console.log("Params.id exists, calling fetchService");
      fetchService();
    } else {
      console.log("Params.id is falsy:", params.id);
    }
  }, [params.id]);

  const handleLike = () => {
    setLikes(prev => prev + 1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service?.Title || 'Service',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleOrder = () => {
    // Navigate to booking page
    router.push(`/book-appointment?service=${service?.ID}&package=${selectedPackage}`);
  };

  const handleContact = () => {
    // Navigate to messages or open contact modal
    router.push(`/messages?user=${service?.Author?.Name}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading service..." />
        </div>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-16">
          <div className="text-red-500 text-lg mb-4">{error || 'Service not found'}</div>
          <button 
            onClick={() => router.push('/services')}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Browse Services
          </button>
        </div>
      </main>
    );
  }

  const serviceId = service.ID || service.id;
  const title = service.Title || service.title;
  const category = service.Category || service.category;
  const rating = service.rating || 4.9;
  const reviewCount = service.reviewCount || 554;
  const user = service.Author?.Name || service.Author?.name || service.author?.name || 'Provider';
  const avatar = service.Author?.Avatar || service.author?.avatar;
  const price = service.Credits || service.credits || 0;
  const location = service.Location || service.location || 'Online';
  const locationType = service.LocationType || service.locationType || 'Online';
  const availability = service.Availability || service.availability || [];
  const images = service.Images || [];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="cursor-pointer hover:text-green-600">🏠</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-green-600">Graphics & Design</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-green-600">Architecture & Interior Design</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-green-600">2D Drawings & Floor Plans</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover Image */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="relative h-96">
                {images.length > 0 ? (
                  <Image
                    src={images[currentImageIndex] || images[0]}
                    alt={title || 'Service'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-lg">Service Image</span>
                  </div>
                )}
                
                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden ${
                        index === currentImageIndex ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${title} ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Title and Provider Info */}
            <div className="bg-white rounded-xl p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {title || 'Service Title'}
              </h1>
              
              {/* Service Details */}
              <div className="mb-6 space-y-4">
                {/* Description */}
                {service?.Description && (
                  <p className="text-gray-700 leading-relaxed">
                    {service.Description}
                  </p>
                )}
                
                {/* Service Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  {/* Location */}
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{location}</p>
                      <p className="text-xs text-gray-500">{locationType}</p>
                    </div>
                  </div>
                  
                  {/* Credits/Price */}
                  <div className="flex items-center space-x-2">
                    <FaCoins className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{price} credits</p>
                      <p className="text-xs text-gray-500">Service cost</p>
                    </div>
                  </div>
                  
                  {/* Availability */}
                  {availability.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <FaClock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {availability[0].TimeFrom} - {availability[0].TimeTo}
                        </p>
                        <p className="text-xs text-gray-500">Available time</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <Image
                    src={avatar || '/api/placeholder/60/60'}
                    alt={user}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{rating} ({reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">What people loved about this freelancer</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 cursor-pointer hover:text-green-600">See all reviews</span>
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">←</button>
                    <button className="p-1 hover:bg-gray-100 rounded">→</button>
                  </div>
                </div>
              </div>
              
              {mockReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 mb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <Image
                      src={review.reviewer.avatar}
                      alt={review.reviewer.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">{review.reviewer.name}</span>
                        <span className="text-sm text-gray-500">🇸🇪 {review.reviewer.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{review.text}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Price: {review.price}</span>
                        <span>Duration: {review.duration}</span>
                        {review.hasFiles && (
                          <span className="text-green-600">✓ Has files</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* About This Gig */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this gig</h2>
              <div className="prose max-w-none text-gray-700 space-y-4">
                <p>I just need your sketch (JPG, PDF, etc.) with measures to make drawing in AutoCAD or LayOut (SketchUp).</p>
                <p>My work includes the source file (only in the standard package and premium) and other format you need it, like: JPG, PDF</p>
                <p className="font-semibold text-red-600">*** Contact through the inbox before buying ***</p>
                <p>The price does not include a new architectural design, only draw based on a design.</p>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Project scale</h4>
                  <p className="text-gray-600">Building</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Building type</h4>
                  <p className="text-gray-600">Residential, Commercial, Office & workspace</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Drawing type</h4>
                  <p className="text-gray-600">Floor plan, Elevation, Site plan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Action Icons */}
              <div className="flex justify-end space-x-4 mb-4">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-500"
                >
                  <FaHeart className="w-5 h-5" />
                  <span>{likes}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FaShare className="w-5 h-5" />
                </button>
                <button className="text-gray-600 hover:text-gray-800">
                  <FaEllipsisH className="w-5 h-5" />
                </button>
              </div>

              {/* Package Selection */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex space-x-1 mb-6">
                  {Object.keys(packages).map((pkg) => (
                    <button
                      key={pkg}
                      onClick={() => setSelectedPackage(pkg as any)}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                        selectedPackage === pkg
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pkg}
                    </button>
                  ))}
                </div>

                {/* Selected Package Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {packages[selectedPackage].title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      CA${packages[selectedPackage].price}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>+ fees</span>
                      <FaInfoCircle className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                  
                  <p className="text-gray-600">
                    {packages[selectedPackage].description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FaClock className="w-4 h-4" />
                      <span>{packages[selectedPackage].deliveryTime}</span>
                    </div>
                    
                    {packages[selectedPackage].features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaCheck className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Delivery Options */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Delivery Options</h4>
                    {packages[selectedPackage].deliveryOptions.map((option, index) => (
                      <label key={index} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="delivery"
                          defaultChecked={index === 0}
                          className="text-green-500"
                        />
                        <span className="text-sm text-gray-600">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mt-6">
                  <button
                    onClick={handleOrder}
                    className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Request to order
                  </button>
                  <button
                    onClick={handleContact}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Contact me
                  </button>
                </div>

                {/* Hourly Offer */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Image
                      src={avatar || '/api/placeholder/40/40'}
                      alt={user}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">Need flexibility when hiring?</h4>
                      <button className="text-green-600 hover:text-green-700 text-sm underline">
                        Request an hourly offer
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Hiring on an hourly basis is perfect for long-term projects, with easy automatic weekly payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <div className="fixed bottom-6 left-6">
        <div className="bg-white rounded-full shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-3">
            <Image
              src={avatar || '/api/placeholder/40/40'}
              alt={user}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="text-sm">
              <p className="font-medium text-gray-900">Message {user}</p>
              <p className="text-gray-500">Away • Avg. response time: 1 Hour</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
} 