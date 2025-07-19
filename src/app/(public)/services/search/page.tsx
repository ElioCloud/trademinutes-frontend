"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { FaSearch, FaFilter, FaTimes, FaStar, FaHeart, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

// Real service type based on API response
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

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
        const response = await fetch(`${API_BASE_URL}/api/tasks/get/all`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }

        const data = await response.json();
        console.log('Search API response:', data);
        
        const services = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        console.log('Services array:', services);

        // Filter services based on query and category
        const filteredServices = services.filter((service: Service) => {
          const title = (service.Title || service.title || '').toLowerCase();
          const description = (service.Description || service.description || '').toLowerCase();
          const serviceCategory = (service.Category || service.category || '').toLowerCase();
          const searchQuery = query.toLowerCase();
          const categoryFilter = category.toLowerCase();

          const matchesQuery = title.includes(searchQuery) || description.includes(searchQuery);
          const matchesCategory = !category || serviceCategory.includes(categoryFilter);

          return matchesQuery && matchesCategory;
        });

        console.log('Filtered services:', filteredServices);
        setResults(filteredServices);
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
      router.push(`/tasks/view/${serviceId}`);
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

      {/* Search Results Section */}
      <section className="bg-[#f3fbfa] py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Search Results</h1>
            <p className="text-gray-600">
              Showing results for: <span className="font-semibold text-black">{query}</span>
              {category && (
                <> in category: <span className="font-semibold text-black">{category}</span></>
              )}
            </p>
            {results.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Found {results.length} service{results.length !== 1 ? 's' : ''}
              </p>
            )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((service, index) => (
                <div
                  key={service.ID || service.id || index}
                  onClick={() => handleServiceClick(service)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative">
                    {service.Images && service.Images.length > 0 ? (
                      <Image
                        src={service.Images[0]}
                        alt={service.Title || service.title || 'Service'}
                        width={300}
                        height={200}
                        className="rounded-t-lg object-cover h-[200px] w-full"
                      />
                    ) : (
                      <div className="h-[200px] bg-gradient-to-br from-blue-400 to-blue-600 rounded-t-lg flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">
                          {(service.Title || service.title || 'S').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-50">
                      <FaHeart className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-2">
                      {service.Category || service.category || 'General'}
                    </p>
                    <h3 className="text-[17px] font-semibold mb-2 text-gray-900 line-clamp-2">
                      {service.Title || service.title || 'Service Title'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {service.Description || service.description || 'No description available'}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <FaStar className="text-yellow-400 mr-1" />
                      {service.rating || 4.5}
                      <span className="ml-1">({service.reviewCount || Math.floor(Math.random() * 50) + 10} reviews)</span>
                    </div>

                    {/* Location and Date */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      {service.Location || service.location ? (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-1" />
                          {service.Location || service.location}
                        </div>
                      ) : null}
                      {service.CreatedAt || service.createdAt ? (
                        <div className="flex items-center">
                          <FaClock className="mr-1" />
                          {formatDate(service.CreatedAt || service.createdAt || Date.now() / 1000)}
                        </div>
                      ) : null}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {(service.Author?.Name || service.Author?.name || service.author?.name || 'P').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700">
                          {service.Author?.Name || service.Author?.name || service.author?.name || 'Provider'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        <strong className="text-green-600">{service.Credits || service.credits || 0} credits</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
} 