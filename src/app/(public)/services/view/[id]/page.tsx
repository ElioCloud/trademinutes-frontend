'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaMapMarkerAlt, FaClock, FaCoins, FaHeart, FaShare, FaEllipsisH, FaCheck, FaInfoCircle } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import BookingModal from '@/components/BookingModal';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

type Availability = {
  Date: string;
  TimeFrom: string;
  TimeTo: string;
};

type Tier = {
  name: string;
  title: string;
  description: string;
  credits: number;
  features: string[];
  availableTimeSlot: string;
  maxDays: number;
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
  Tiers?: Tier[];
  tiers?: Tier[];
  Author?: {
    ID?: string;
    id?: string;
    Name?: string;
    name?: string;
    Avatar?: string;
    avatar?: string;
  };
  author?: {
    id?: string;
    name?: string;
    avatar?: string;
  };
  Images?: string[];
  rating?: number;
  reviewCount?: number;
  CreatedAt?: number;
  createdAt?: number;
};



type Review = {
  id?: string;
  _id?: string;
  reviewer?: {
    name?: string;
    avatar?: string;
    location?: string;
  };
  rating?: number;
  text?: string;
  comment?: string;
  date?: string;
  createdAt?: number;
  price?: string;
  duration?: string;
  hasFiles?: boolean;
};

export default function ServiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('Basic');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Helper function to check if service belongs to current user
  const isOwnService = () => {
    if (!user || !service) return false;
    const serviceAuthorId = service.Author?.ID || service.Author?.id || service.author?.id;
    const currentUserId = user.ID || user.id;
    return serviceAuthorId === currentUserId;
  };

  // Debug logging function
  const logToFile = async (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}${data ? '\nData: ' + JSON.stringify(data, null, 2) : ''}\n\n`;
    
    // Log to console
    console.log('=== DEBUG LOG ENTRY ===');
    console.log(logEntry);
    console.log('=== END DEBUG LOG ===');
    
    // Write to debug log file
    try {
      const response = await fetch('/api/debug-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logEntry }),
      });
      
      if (!response.ok) {
        console.error('Failed to write to debug log file');
      }
    } catch (error) {
      console.error('Error writing to debug log:', error);
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
        
        // Debug tiers data specifically
        logToFile("TIERS DEBUG START", {
          tiersProperty: data.Tiers,
          tiersPropertyLowercase: data.tiers,
          tiersType: typeof data.Tiers,
          tiersTypeLowercase: typeof data.tiers,
          tiersIsArray: Array.isArray(data.Tiers),
          tiersIsArrayLowercase: Array.isArray(data.tiers),
          tiersLength: data.Tiers?.length,
          tiersLengthLowercase: data.tiers?.length,
          firstTier: data.Tiers?.[0],
          firstTierLowercase: data.tiers?.[0]
        });
        
        setService(data);
        
        // Handle tiers data - could be string or array
        let tiersData = data.Tiers || data.tiers;
        
        logToFile("TIERS PARSING START", {
          originalTiersData: tiersData,
          originalType: typeof tiersData
        });
        
        // If tiers is a string, try to parse it
        if (typeof tiersData === 'string') {
          try {
            tiersData = JSON.parse(tiersData);
            logToFile("SUCCESSFULLY PARSED TIERS FROM STRING", tiersData);
          } catch (e) {
            logToFile("FAILED TO PARSE TIERS STRING", { error: e, originalString: tiersData });
            tiersData = [];
          }
        }
        
        // Update the data object with parsed tiers
        if (tiersData && Array.isArray(tiersData)) {
          data.Tiers = tiersData;
          logToFile("FINAL TIERS DATA SET", data.Tiers);
        } else {
          logToFile("NO VALID TIERS DATA FOUND", { tiersData, isArray: Array.isArray(tiersData) });
        }
        
        // Set initial selected tier if tiers are available
        if (data.Tiers && data.Tiers.length > 0) {
          setSelectedTier(data.Tiers[0].name);
          logToFile("SET INITIAL SELECTED TIER", { 
            selectedTier: data.Tiers[0].name,
            availableTiers: data.Tiers.map((t: Tier) => t.name)
          });
        } else {
          logToFile("NO TIERS AVAILABLE FOR INITIAL SELECTION", { 
            tiersLength: data.Tiers?.length,
            tiersData: data.Tiers
          });
        }
        
        // Fetch real reviews for this service
        if (data.Author?.ID || data.Author?.id) {
          fetchReviews(data.Author.ID || data.Author.id);
        }
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

  const handleOrder = () => {
    if (!token) {
      setIsAuthModalOpen(true);
    } else {
      setIsBookingModalOpen(true);
    }
  };

  const handleContact = () => {
    // Navigate to messages or open contact modal
    router.push(`/messages?user=${service?.Author?.Name}`);
  };

  const fetchReviews = async (authorId: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_REVIEW_API_URL || 'http://localhost:8086';
      const response = await fetch(`${API_BASE_URL}/api/reviews?revieweeId=${authorId}`);
      
      if (response.ok) {
        const data = await response.json();
        const reviewsData = Array.isArray(data) ? data : data.data || [];
        setReviews(reviewsData);
        console.log("Fetched reviews:", reviewsData);
      } else {
        console.log("No reviews found or error fetching reviews");
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    }
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
  const serviceProvider = service.Author?.Name || service.Author?.name || service.author?.name || 'Provider';
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
            <Link href="/" className="cursor-pointer hover:text-green-600">🏠</Link>
            <span>/</span>
            <Link href="/services" className="cursor-pointer hover:text-green-600">Services</Link>
            {category && (
              <>
                <span>/</span>
                <Link 
                  href={`/services/category/${category.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="cursor-pointer hover:text-green-600"
                >
                  {category}
                </Link>
              </>
            )}
            {title && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium truncate max-w-xs">{title}</span>
              </>
            )}
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
              <div className="mb-6">
                {/* Service Details Grid */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  {/* Location */}
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{location}</p>
                      <p className="text-xs text-gray-500">{locationType}</p>
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
              

            </div>

            {/* About the Service */}
            {service?.Description && (
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About the service</h2>
                <div className="prose max-w-none text-gray-700">
                  <p className="leading-relaxed">
                    {service.Description}
                  </p>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">What people loved</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 cursor-pointer hover:text-green-600">See all reviews</span>
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">←</button>
                    <button className="p-1 hover:bg-gray-100 rounded">→</button>
                  </div>
                </div>
              </div>
              
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id || review._id} className="border-b border-gray-100 pb-6 mb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <Image
                        src={review.reviewer?.avatar || '/api/placeholder/40/40'}
                        alt={review.reviewer?.name || 'Reviewer'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">{review.reviewer?.name || 'Anonymous'}</span>
                          <span className="text-sm text-gray-500">{review.reviewer?.location || 'Unknown location'}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-sm text-gray-500">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{review.comment || review.text || 'No comment provided'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet</p>
                </div>
              )}
            </div>


          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Tier Selection */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                {service?.Tiers && service.Tiers.length > 0 ? (
                  <>
                    <div className="flex space-x-1 mb-6">
                      {service.Tiers.map((tier) => (
                        <button
                          key={tier.name}
                          onClick={() => setSelectedTier(tier.name)}
                          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                            selectedTier === tier.name
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tier.name}
                        </button>
                      ))}
                    </div>

                    {/* Selected Tier Details */}
                    {(() => {
                      const currentTier = service.Tiers.find(tier => tier.name === selectedTier);
                      if (!currentTier) return null;
                      
                      return (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {currentTier.title || `${currentTier.name} Package`}
                          </h3>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-gray-900">
                              {currentTier.credits} Credits
                            </span>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>No tax</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600">
                            {currentTier.description}
                          </p>

                          {/* Tier Features */}
                          {currentTier.features && currentTier.features.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">What's included:</h4>
                              <ul className="space-y-1">
                                {currentTier.features.map((feature, index) => (
                                  <li key={index} className="flex items-center text-sm text-gray-600">
                                    <FaCheck className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Time Slot and Max Days */}
                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Available Time:</span>
                              <span className="font-medium text-gray-900">{currentTier.availableTimeSlot}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Max Duration:</span>
                              <span className="font-medium text-gray-900">{currentTier.maxDays} days</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No pricing tiers available</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 mt-6">
                  {isOwnService() ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">You are the service provider. You cannot book or contact yourself.</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleOrder}
                        className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        {(() => {
                          const currentTier = service?.Tiers?.find(tier => tier.name === selectedTier);
                          if (currentTier) {
                            return (
                              <div className="flex flex-col items-center">
                                <span>Book {currentTier.name} Package</span>
                                <span className="text-sm opacity-90">{currentTier.credits} Credits</span>
                              </div>
                            );
                          }
                          return 'Book this service';
                        })()}
                      </button>
                      <button
                        onClick={() => {
                          if (token) {
                            // Show message dialog
                            setIsMessageModalOpen(true);
                          } else {
                            // Show login modal
                            setIsAuthModalOpen(true);
                          }
                        }}
                        className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Contact me
                      </button>
                    </>
                  )}
                </div>

                {/* Service Provider Info */}
                {!isOwnService() && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <Image
                        src={avatar || '/api/placeholder/40/40'}
                        alt={serviceProvider}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">About {serviceProvider}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={`w-3 h-3 ${i < Math.floor(service?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {service?.rating || 0} ({service?.reviewCount || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {serviceProvider} is a trusted provider with a proven track record of delivering quality services. 
                      They specialize in {service?.Category || service?.category || 'their field'} and are committed to 
                      ensuring customer satisfaction with every project.
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      {!isOwnService() && (
        <div className="fixed bottom-6 right-6">
          <div 
            className="bg-white rounded-full shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => {
              if (token) {
                // Open chat box - you can implement this functionality
                console.log('Opening chat with', serviceProvider);
                // For now, just show an alert
                alert('Chat functionality coming soon!');
              } else {
                // Show login modal
                setIsAuthModalOpen(true);
              }
            }}
          >
            <div className="flex items-center space-x-3">
              <Image
                src={avatar || '/api/placeholder/40/40'}
                alt={serviceProvider}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-900">Message {serviceProvider}</p>
                <p className="text-gray-500">Click to chat</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        service={service}
        selectedTier={selectedTier}
        onBookingSuccess={() => {
          // Refresh the page or show success message
          window.location.reload();
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          setIsAuthModalOpen(false);
          setIsBookingModalOpen(true);
        }}
        defaultMode="login"
      />

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[400px] max-w-[500px] w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send a message to {serviceProvider}</h3>
              <p className="text-sm text-gray-600 mt-1">Ask questions or discuss project details</p>
            </div>
            
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[120px] resize-none"
              placeholder="Type your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={sendingMessage}
            />
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsMessageModalOpen(false);
                  setMessageText('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={sendingMessage}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!messageText.trim()) return;
                  
                  setSendingMessage(true);
                  try {
                    // Here you would implement the actual message sending logic
                    console.log('Sending message:', messageText);
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Show success message
                    alert('Message sent successfully!');
                    setIsMessageModalOpen(false);
                    setMessageText('');
                  } catch (error) {
                    alert('Failed to send message. Please try again.');
                  } finally {
                    setSendingMessage(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={sendingMessage || !messageText.trim()}
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 