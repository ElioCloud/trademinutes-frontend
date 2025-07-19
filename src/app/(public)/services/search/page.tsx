"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import ServiceCard from '@/components/ServiceCard';
import { useState, useEffect, Suspense } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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
        const services = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];

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

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-600">
          Showing results for: <span className="font-semibold text-black">{query}</span>
          {category && (
            <> in category: <span className="font-semibold text-black">{category}</span></>
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="md" text="Searching..." />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : results.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No services found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((service, index) => (
            <div
              key={service.ID || service.id || index}
              onClick={() => handleServiceClick(service)}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="h-48 relative">
                {service.Images && service.Images.length > 0 ? (
                  <img
                    src={service.Images[0]}
                    alt={service.Title || service.title || 'Service'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {(service.Title || service.title || 'S').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded mb-2">
                  {service.Category || service.category || 'General'}
                </span>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {service.Title || service.title || 'Service Title'}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {service.Description || service.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    {service.Credits || service.credits || 0} credits
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">
                      By {service.Author?.Name || service.Author?.name || service.author?.name || 'Provider'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
} 