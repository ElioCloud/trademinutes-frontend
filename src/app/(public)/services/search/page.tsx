"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { FaSearch, FaFilter, FaTimes, FaStar, FaMapMarkerAlt, FaClock, FaCoins } from 'react-icons/fa';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import SearchBanner from '@/components/SearchBanner';
import AuthModal from '@/components/AuthModal';

// Real service type based on API response
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

export default function SearchResultsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchResultsPage />
    </Suspense>
  );
}

function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const [results, setResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const fetchSearchResults = async () => {
      // Only return early if there's no query AND no category
      if (!query.trim() && !category) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Get token for authenticated search
        const token = localStorage.getItem("token");
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
        
        if (token) {
          // Fetch current user profile to filter out own tasks
          let currentUserId = null;
          try {
            const profileRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8081'}/api/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              currentUserId = profileData.ID || profileData.id;
            }
          } catch (profileErr) {
            console.log('Could not fetch user profile, continuing without filtering own tasks');
          }

          // Fetch all tasks from backend
          const response = await fetch(`${API_BASE_URL}/api/tasks/get/all`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch services');
          }

          const data = await response.json();
          console.log('Search API response:', data);
          
          const services = data && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          console.log('Services array:', services);

          // Use all tasks for search (including own tasks)
          let filteredTasks = services;

          // Filter services based on query and category with improved search logic
          const filteredServices = filteredTasks.filter((service: Service) => {
            const title = (service.Title || service.title || '').toLowerCase();
            const description = (service.Description || service.description || '').toLowerCase();
            const serviceCategory = (service.Category || service.category || '').toLowerCase();
            const authorName = (service.Author?.Name || service.Author?.name || service.author?.name || '').toLowerCase();
            const searchQuery = query.toLowerCase();
            const categoryFilter = category.toLowerCase();

            // If only category is selected (no query), show all services in that category
            if (!query.trim() && category) {
              return serviceCategory.includes(categoryFilter);
            }

            // If only query is provided (no category), search across all fields
            if (query.trim() && !category) {
              const searchWords = searchQuery.split(' ').filter(word => word.length > 0);
              return searchWords.some(word => 
                title.includes(word) || 
                description.includes(word) || 
                serviceCategory.includes(word) ||
                authorName.includes(word)
              ) || title.includes(searchQuery) || description.includes(searchQuery);
            }

            // If both query and category are provided, filter by both
            if (query.trim() && category) {
              const searchWords = searchQuery.split(' ').filter(word => word.length > 0);
              const matchesQuery = searchWords.some(word => 
                title.includes(word) || 
                description.includes(word) || 
                serviceCategory.includes(word) ||
                authorName.includes(word)
              ) || title.includes(searchQuery) || description.includes(searchQuery);
              
              const matchesCategory = serviceCategory.includes(categoryFilter);
              
              return matchesQuery && matchesCategory;
            }

            // If neither query nor category, show all services
            return true;
          });

          console.log('Filtered services from backend:', filteredServices);
          setResults(filteredServices);
    } else {
          // For unauthenticated users, fetch real data from public endpoint
          try {
            console.log('Fetching from public endpoint...');
            const response = await fetch(`${API_BASE_URL}/api/tasks/public`);
            
            if (!response.ok) {
              console.error('Public API call failed:', response.status, response.statusText);
              setError('Search is temporarily unavailable. Please try again later or sign up to access all features.');
              setResults([]);
              return;
            }

            const data = await response.json();
            console.log('Public search API response:', data);
            
            const services = data && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
            console.log('Public services array:', services);
            console.log('Total services from API:', services.length);
            console.log('Search query:', query);
            console.log('Category filter:', category);

            // If no search query and no category, show all services
            if (!query.trim() && !category) {
              console.log('No search query or category - showing all services');
              setResults(services);
              return;
            }

            // Filter services based on query and category with improved search logic
            const filteredServices = services.filter((service: Service) => {
              const title = (service.Title || service.title || '').toLowerCase();
              const description = (service.Description || service.description || '').toLowerCase();
              const serviceCategory = (service.Category || service.category || '').toLowerCase();
              const authorName = (service.Author?.Name || service.Author?.name || service.author?.name || '').toLowerCase();
              const searchQuery = query.toLowerCase();
              const categoryFilter = category.toLowerCase();

              // If only category is selected (no query), show all services in that category
              if (!query.trim() && category) {
                return serviceCategory.includes(categoryFilter);
              }

              // If only query is provided (no category), search across all fields
              if (query.trim() && !category) {
                const searchWords = searchQuery.split(' ').filter(word => word.length > 0);
                return searchWords.some(word => 
                  title.includes(word) || 
                  description.includes(word) || 
                  serviceCategory.includes(word) ||
                  authorName.includes(word)
                ) || title.includes(searchQuery) || description.includes(searchQuery);
              }

              // If both query and category are provided, filter by both
              if (query.trim() && category) {
                const searchWords = searchQuery.split(' ').filter(word => word.length > 0);
                const matchesQuery = searchWords.some(word => 
                  title.includes(word) || 
                  description.includes(word) || 
                  serviceCategory.includes(word) ||
                  authorName.includes(word)
                ) || title.includes(searchQuery) || description.includes(searchQuery);
                
                const matchesCategory = serviceCategory.includes(categoryFilter);
                
                return matchesQuery && matchesCategory;
              }

              // If neither query nor category, show all services
              return true;
            });

            console.log('Public filtered services:', filteredServices);
            setResults(filteredServices);
          } catch (publicErr) {
            console.error('Error fetching public services:', publicErr);
            setError('Search is temporarily unavailable. Please try again later or sign up to access all features.');
      setResults([]);
          }
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, category]);

  const handleServiceClick = (service: Service) => {
    const serviceId = service.ID || service.id;
    if (serviceId) {
      router.push(`/services/view/${serviceId}`);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar */}
      <Navbar />



      {/* Search Banner */}
      <SearchBanner 
        query={query} 
        category={category} 
        resultCount={results.length} 
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Results */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => {
                    const params = new URLSearchParams();
                    params.append('q', query);
                    if (e.target.value) params.append('category', e.target.value);
                    router.push(`/services/search?${params.toString()}`);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="Academic Help">Academic Help</option>
                  <option value="Tech & Digital Skills">Tech & Digital Skills</option>
                  <option value="Creative & Arts">Creative & Arts</option>
                  <option value="Personal Development">Personal Development</option>
                  <option value="Language & Culture">Language & Culture</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Handy Skills & Repair">Handy Skills & Repair</option>
                  <option value="Everyday Help">Everyday Help</option>
                  <option value="Administrative & Misc Help">Administrative & Misc Help</option>
                  <option value="Social & Community">Social & Community</option>
                  <option value="Entrepreneurship & Business">Entrepreneurship & Business</option>
                  <option value="Specialized Skills">Specialized Skills</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (Credits)</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">0 - 25 credits</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">26 - 50 credits</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">51 - 100 credits</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">100+ credits</span>
                  </label>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      4.5+ stars
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      4.0+ stars
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      3.5+ stars
                    </span>
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              <button 
                onClick={() => router.push(`/services/search?q=${query}`)}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Services</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="md" text="Searching..." />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-red-500 text-lg mb-4">{error}</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-500 text-lg mb-4">
                  No services found matching your search.
                </div>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search terms or browse our categories.
                </p>
                <button 
                  onClick={() => router.push('/')}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Browse All Services
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((service, index) => {
                  const gradients = [
                    'from-blue-400 to-blue-600',
                    'from-purple-400 to-purple-600', 
                    'from-green-400 to-green-600',
                    'from-pink-400 to-pink-600',
                    'from-yellow-400 to-yellow-600',
                    'from-indigo-400 to-indigo-600'
                  ];
                  const colors = [
                    { bg: 'bg-blue-100', text: 'text-blue-600' },
                    { bg: 'bg-purple-100', text: 'text-purple-600' },
                    { bg: 'bg-green-100', text: 'text-green-600' },
                    { bg: 'bg-pink-100', text: 'text-pink-600' },
                    { bg: 'bg-yellow-100', text: 'text-yellow-600' },
                    { bg: 'bg-indigo-100', text: 'text-indigo-600' }
                  ];
                  
                  // Handle both mock and real data structures
                  const serviceId = service.ID || service.id;
                  const title = service.Title || service.title;
                  const category = service.Category || service.category;
                  const rating = service.rating || 4.5;
                  const reviews = service.reviewCount || Math.floor(Math.random() * 50) + 10;
                  const user = service.Author?.Name || service.Author?.name || service.author?.name || 'Provider';
                  const avatar = service.Author?.Avatar || service.author?.avatar;
                  const price = service.Credits || service.credits || 0;
                  const location = service.Location || service.location || 'Online';
                  const locationType = service.LocationType || service.locationType || 'Online';
                  const availability = service.Availability || service.availability || [];
                  
                  // Enhanced image handling for different formats
                  let image = service.Images?.[0];
                  
                  // If no image found, try alternative image fields
                  if (!image && service.Images && service.Images.length > 0) {
                    // Try to find first valid image
                    for (let i = 0; i < service.Images.length; i++) {
                      if (service.Images[i] && typeof service.Images[i] === 'string') {
                        image = service.Images[i];
                        break;
                      }
                    }
                  }
                  
                  return (
                    <div
                      key={serviceId || index}
                      onClick={() => handleServiceClick(service)}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="h-32 relative">
                        {image ? (
                          <Image
                            src={image}
                            alt={title || 'Service'}
                            width={300}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${gradients[index % gradients.length]}`}></div>
                        )}
                        <div className="absolute inset-0 bg-black/20"></div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-block px-2 py-1 ${colors[index % colors.length].bg} ${colors[index % colors.length].text} text-xs font-semibold rounded`}>
                            {category || 'GENERAL'}
                          </span>
                          <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                            <FaCoins className="w-4 h-4" />
                            <span>{price}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          {title || 'Service Title'}
                        </h3>
                        
                        {/* Location and Time Details */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{location}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                              {locationType}
                            </span>
                          </div>
                          
                          {availability.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <FaClock className="w-4 h-4 text-gray-400" />
                              <span>{availability[0].TimeFrom} - {availability[0].TimeTo}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FaStar className="w-4 h-4 text-yellow-400" />
                          <span>{rating} ({reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
      )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={() => {
          // After successful login, redirect to the service details
          // The user can now book appointments
          console.log('User authenticated successfully');
        }}
      />
    </main>
  );
} 