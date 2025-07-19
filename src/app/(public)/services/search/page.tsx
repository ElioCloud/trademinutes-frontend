"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { FaSearch, FaFilter, FaTimes, FaStar, FaHeart, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import SearchBanner from '@/components/SearchBanner';

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
        // Try to get token for authenticated search
        const token = localStorage.getItem("token");
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
        
        let response;
        if (token) {
          // Authenticated request
          response = await fetch(`${API_BASE_URL}/api/tasks/get/all`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch services');
          }

          const data = await response.json();
          console.log('Search API response:', data);
          
          const services = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          console.log('Services array:', services);

          // Filter services based on query and category with improved search logic
          const filteredServices = services.filter((service: Service) => {
            const title = (service.Title || service.title || '').toLowerCase();
            const description = (service.Description || service.description || '').toLowerCase();
            const serviceCategory = (service.Category || service.category || '').toLowerCase();
            const authorName = (service.Author?.Name || service.Author?.name || service.author?.name || '').toLowerCase();
            const searchQuery = query.toLowerCase();
            const categoryFilter = category.toLowerCase();

            // Split search query into words for better matching
            const searchWords = searchQuery.split(' ').filter(word => word.length > 0);
            
            // Check if any search word matches title, description, category, or author
            const matchesQuery = searchWords.some(word => 
              title.includes(word) || 
              description.includes(word) || 
              serviceCategory.includes(word) ||
              authorName.includes(word)
            ) || title.includes(searchQuery) || description.includes(searchQuery);
            
            const matchesCategory = !category || serviceCategory.includes(categoryFilter);

            return matchesQuery && matchesCategory;
          });

          console.log('Filtered services:', filteredServices);
          setResults(filteredServices);
        } else {
          // For public search, use comprehensive mock data
          const mockServices: Service[] = [
            // Tech & Digital Skills
            {
              ID: '1',
              Title: 'Python Programming Tutoring',
              Description: 'Expert Python programming help for beginners and intermediate learners. Covering data structures, algorithms, and web development.',
              Credits: 50,
              Category: 'Tech & Digital Skills',
              Location: 'Online',
              Author: { Name: 'Sarah Johnson', Avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg' },
              Images: ['https://images.pexels.com/photos/267582/pexels-photo-267582.jpeg'],
              rating: 4.8,
              reviewCount: 24,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '2',
              Title: 'Web Development with React',
              Description: 'Learn modern web development with React.js. Build responsive, interactive user interfaces and single-page applications.',
              Credits: 75,
              Category: 'Tech & Digital Skills',
              Location: 'Online',
              Author: { Name: 'Mike Chen', Avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' },
              Images: ['https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg'],
              rating: 4.9,
              reviewCount: 18,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '3',
              Title: 'JavaScript Fundamentals',
              Description: 'Master JavaScript programming from basics to advanced concepts. Learn ES6+, DOM manipulation, and modern JS frameworks.',
              Credits: 60,
              Category: 'Tech & Digital Skills',
              Location: 'Online',
              Author: { Name: 'Emma Davis', Avatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg' },
              Images: ['https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg'],
              rating: 4.7,
              reviewCount: 31,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '4',
              Title: 'Mobile App Development',
              Description: 'Create iOS and Android apps using React Native. Learn cross-platform development and app store deployment.',
              Credits: 90,
              Category: 'Tech & Digital Skills',
              Location: 'Online',
              Author: { Name: 'Alex Rodriguez', Avatar: 'https://images.pexels.com/photos/8159846/pexels-photo-8159846.jpeg' },
              Images: ['https://images.pexels.com/photos/1322182/pexels-photo-1322182.jpeg'],
              rating: 4.6,
              reviewCount: 15,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '5',
              Title: 'Database Design & SQL',
              Description: 'Learn database design principles, SQL queries, and database management systems like MySQL and PostgreSQL.',
              Credits: 55,
              Category: 'Tech & Digital Skills',
              Location: 'Online',
              Author: { Name: 'Lisa Wang', Avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' },
              Images: ['https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg'],
              rating: 4.5,
              reviewCount: 12,
              CreatedAt: Date.now() / 1000
            },
            // Academic Help
            {
              ID: '6',
              Title: 'Mathematics Tutoring',
              Description: 'Expert math tutoring for all levels - algebra, calculus, statistics, and advanced mathematics.',
              Credits: 45,
              Category: 'Academic Help',
              Location: 'Online',
              Author: { Name: 'Dr. Robert Smith', Avatar: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg' },
              Images: ['https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg'],
              rating: 4.9,
              reviewCount: 42,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '7',
              Title: 'English Literature & Writing',
              Description: 'Improve your writing skills, essay composition, and literary analysis. Perfect for students and professionals.',
              Credits: 40,
              Category: 'Academic Help',
              Location: 'Online',
              Author: { Name: 'Prof. Maria Garcia', Avatar: 'https://images.pexels.com/photos/3777946/pexels-photo-3777946.jpeg' },
              Images: ['https://images.pexels.com/photos/5905712/pexels-photo-5905712.jpeg'],
              rating: 4.8,
              reviewCount: 28,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '8',
              Title: 'Science Tutoring',
              Description: 'Comprehensive science tutoring covering physics, chemistry, biology, and environmental science.',
              Credits: 50,
              Category: 'Academic Help',
              Location: 'Online',
              Author: { Name: 'Dr. James Wilson', Avatar: 'https://images.pexels.com/photos/3777949/pexels-photo-3777949.jpeg' },
              Images: ['https://images.pexels.com/photos/5905715/pexels-photo-5905715.jpeg'],
              rating: 4.7,
              reviewCount: 35,
              CreatedAt: Date.now() / 1000
            },
            // Creative & Arts
            {
              ID: '9',
              Title: 'Graphic Design & Branding',
              Description: 'Create stunning visual designs, logos, and brand identities using Adobe Creative Suite and modern design tools.',
              Credits: 70,
              Category: 'Creative & Arts',
              Location: 'Online',
              Author: { Name: 'Sophie Anderson', Avatar: 'https://images.pexels.com/photos/3777952/pexels-photo-3777952.jpeg' },
              Images: ['https://images.pexels.com/photos/5905718/pexels-photo-5905718.jpeg'],
              rating: 4.9,
              reviewCount: 56,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '10',
              Title: 'Digital Art & Illustration',
              Description: 'Learn digital painting, illustration techniques, and create amazing artwork using Procreate and Photoshop.',
              Credits: 65,
              Category: 'Creative & Arts',
              Location: 'Online',
              Author: { Name: 'David Kim', Avatar: 'https://images.pexels.com/photos/3777955/pexels-photo-3777955.jpeg' },
              Images: ['https://images.pexels.com/photos/5905721/pexels-photo-5905721.jpeg'],
              rating: 4.8,
              reviewCount: 33,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '11',
              Title: 'Photography & Editing',
              Description: 'Master photography techniques, composition, and post-processing with Lightroom and Photoshop.',
              Credits: 60,
              Category: 'Creative & Arts',
              Location: 'Online',
              Author: { Name: 'Amanda Lee', Avatar: 'https://images.pexels.com/photos/3777958/pexels-photo-3777958.jpeg' },
              Images: ['https://images.pexels.com/photos/5905724/pexels-photo-5905724.jpeg'],
              rating: 4.7,
              reviewCount: 29,
              CreatedAt: Date.now() / 1000
            },
            // Health & Wellness
            {
              ID: '12',
              Title: 'Personal Fitness Training',
              Description: 'Get personalized workout plans, nutrition guidance, and fitness coaching to achieve your health goals.',
              Credits: 80,
              Category: 'Health & Wellness',
              Location: 'Online',
              Author: { Name: 'Chris Thompson', Avatar: 'https://images.pexels.com/photos/3777961/pexels-photo-3777961.jpeg' },
              Images: ['https://images.pexels.com/photos/5905727/pexels-photo-5905727.jpeg'],
              rating: 4.9,
              reviewCount: 67,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '13',
              Title: 'Yoga & Meditation',
              Description: 'Learn yoga poses, breathing techniques, and meditation practices for stress relief and mindfulness.',
              Credits: 45,
              Category: 'Health & Wellness',
              Location: 'Online',
              Author: { Name: 'Priya Patel', Avatar: 'https://images.pexels.com/photos/3777964/pexels-photo-3777964.jpeg' },
              Images: ['https://images.pexels.com/photos/5905730/pexels-photo-5905730.jpeg'],
              rating: 4.8,
              reviewCount: 38,
              CreatedAt: Date.now() / 1000
            },
            // Language & Culture
            {
              ID: '14',
              Title: 'Spanish Language Learning',
              Description: 'Learn Spanish from beginner to advanced levels. Practice conversation, grammar, and cultural understanding.',
              Credits: 50,
              Category: 'Language & Culture',
              Location: 'Online',
              Author: { Name: 'Carlos Mendez', Avatar: 'https://images.pexels.com/photos/3777967/pexels-photo-3777967.jpeg' },
              Images: ['https://images.pexels.com/photos/5905733/pexels-photo-5905733.jpeg'],
              rating: 4.7,
              reviewCount: 25,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '15',
              Title: 'French Conversation',
              Description: 'Improve your French speaking skills through interactive conversations and cultural immersion.',
              Credits: 55,
              Category: 'Language & Culture',
              Location: 'Online',
              Author: { Name: 'Marie Dubois', Avatar: 'https://images.pexels.com/photos/3777970/pexels-photo-3777970.jpeg' },
              Images: ['https://images.pexels.com/photos/5905736/pexels-photo-5905736.jpeg'],
              rating: 4.6,
              reviewCount: 19,
              CreatedAt: Date.now() / 1000
            },
            // Handy Skills & Repair
            {
              ID: '16',
              Title: 'Home Repair & Maintenance',
              Description: 'Learn essential home repair skills, plumbing basics, electrical work, and general maintenance.',
              Credits: 70,
              Category: 'Handy Skills & Repair',
              Location: 'Local',
              Author: { Name: 'Tom Johnson', Avatar: 'https://images.pexels.com/photos/3777973/pexels-photo-3777973.jpeg' },
              Images: ['https://images.pexels.com/photos/5905739/pexels-photo-5905739.jpeg'],
              rating: 4.8,
              reviewCount: 44,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '17',
              Title: 'Car Maintenance & Repair',
              Description: 'Learn basic car maintenance, troubleshooting, and repair techniques to save money on vehicle care.',
              Credits: 75,
              Category: 'Handy Skills & Repair',
              Location: 'Local',
              Author: { Name: 'Mike Brown', Avatar: 'https://images.pexels.com/photos/3777976/pexels-photo-3777976.jpeg' },
              Images: ['https://images.pexels.com/photos/5905742/pexels-photo-5905742.jpeg'],
              rating: 4.7,
              reviewCount: 31,
              CreatedAt: Date.now() / 1000
            },
            // Business & Entrepreneurship
            {
              ID: '18',
              Title: 'Business Strategy & Planning',
              Description: 'Develop business strategies, create business plans, and learn entrepreneurship fundamentals.',
              Credits: 85,
              Category: 'Entrepreneurship & Business',
              Location: 'Online',
              Author: { Name: 'Jennifer Adams', Avatar: 'https://images.pexels.com/photos/3777979/pexels-photo-3777979.jpeg' },
              Images: ['https://images.pexels.com/photos/5905745/pexels-photo-5905745.jpeg'],
              rating: 4.9,
              reviewCount: 52,
              CreatedAt: Date.now() / 1000
            },
            {
              ID: '19',
              Title: 'Digital Marketing Strategy',
              Description: 'Learn SEO, social media marketing, content marketing, and digital advertising strategies.',
              Credits: 80,
              Category: 'Entrepreneurship & Business',
              Location: 'Online',
              Author: { Name: 'Ryan Chen', Avatar: 'https://images.pexels.com/photos/3777982/pexels-photo-3777982.jpeg' },
              Images: ['https://images.pexels.com/photos/5905748/pexels-photo-5905748.jpeg'],
              rating: 4.8,
              reviewCount: 41,
              CreatedAt: Date.now() / 1000
            },
            // Everyday Help
            {
              ID: '20',
              Title: 'Cooking & Meal Planning',
              Description: 'Learn cooking techniques, meal planning, and healthy recipe creation for busy lifestyles.',
              Credits: 45,
              Category: 'Everyday Help',
              Location: 'Online',
              Author: { Name: 'Chef Sarah Wilson', Avatar: 'https://images.pexels.com/photos/3777985/pexels-photo-3777985.jpeg' },
              Images: ['https://images.pexels.com/photos/5905751/pexels-photo-5905751.jpeg'],
              rating: 4.7,
              reviewCount: 36,
              CreatedAt: Date.now() / 1000
            }
          ];

          // Filter mock services based on query and category with improved search logic
          const filteredServices = mockServices.filter((service: Service) => {
            const title = (service.Title || service.title || '').toLowerCase();
            const description = (service.Description || service.description || '').toLowerCase();
            const serviceCategory = (service.Category || service.category || '').toLowerCase();
            const authorName = (service.Author?.Name || service.Author?.name || service.author?.name || '').toLowerCase();
            const searchQuery = query.toLowerCase();
            const categoryFilter = category.toLowerCase();

            // Split search query into words for better matching
            const searchWords = searchQuery.split(' ').filter(word => word.length > 0);
            
            // Check if any search word matches title, description, category, or author
            const matchesQuery = searchWords.some(word => 
              title.includes(word) || 
              description.includes(word) || 
              serviceCategory.includes(word) ||
              authorName.includes(word)
            ) || title.includes(searchQuery) || description.includes(searchQuery);
            
            const matchesCategory = !category || serviceCategory.includes(categoryFilter);

            return matchesQuery && matchesCategory;
          });

          console.log('Mock filtered services:', filteredServices);
          setResults(filteredServices);
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
      // Check if user is authenticated
      const token = localStorage.getItem("token");
      if (token) {
        router.push(`/tasks/view/${serviceId}`);
      } else {
        // For mock data, show a message to sign up
        alert('Please sign up or log in to view service details and book appointments.');
        router.push('/register');
      }
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
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
} 