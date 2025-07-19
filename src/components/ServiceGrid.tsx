'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import { FaStar, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const services = [
  
   {
    id: 1,
    category: 'Home Repair',
    title: 'I will help organize your closet for spring',
    rating: 4.88,
    reviews: 24,
    user: 'Sarah Kim',
    avatar: 'https://images.pexels.com/photos/277576/pexels-photo-277576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 60,
    image: 'https://cdn.pixabay.com/photo/2016/11/19/13/06/bed-1839184_1280.jpg',
  },
  {
    id: 2,
    category: 'Language Exchange',
    title: 'I will tutor Grade-9 science for 1 hour',
    rating: 4.93,
    reviews: 26,
    user: 'Daniel Ortiz',
    avatar: 'https://images.pexels.com/photos/792096/pexels-photo-792096.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 59,
    image: 'https://cdn.pixabay.com/photo/2021/11/06/00/38/volunteer-service-6772198_1280.jpg',
  },
  {
    id: 3,
    category: 'Home Repair',
    title: 'I will walk your dog every evening',
    rating: 4.96,
    reviews: 48,
    user: 'Ayesha Patel',
    avatar: 'https://images.pexels.com/photos/721979/pexels-photo-721979.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 114,
    image: 'https://cdn.pixabay.com/photo/2015/11/17/13/13/puppy-1047521_1280.jpg',
  },
  {
    id: 4,
    category: 'Fitness & Wellness',
    title: 'I will troubleshoot and clean your PC',
    rating: 4.85,
    reviews: 58,
    user: 'Michael Chen',
    avatar: 'https://images.pexels.com/photos/573570/pexels-photo-573570.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 76,
    image: 'https://cdn.pixabay.com/photo/2020/10/21/18/07/laptop-5673901_1280.jpg',
  },
  {
    id: 5,
    category: 'Fitness & Wellness',
    title: 'I will design a simple logo for your business',
    rating: 4.94,
    reviews: 30,
    user: 'Liam Johnson',
    avatar: 'https://images.pexels.com/photos/794551/pexels-photo-794551.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 42,
    image: 'https://cdn.pixabay.com/photo/2016/11/19/13/53/apple-1839363_1280.jpg',
  },
  {
    id: 6,
    category: 'Home Repair',
    title: 'I will lead a 30-min yoga session',
    rating: 4.91,
    reviews: 47,
    user: 'Olivia Brown',
    avatar: 'https://images.pexels.com/photos/735423/pexels-photo-735423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 95,
    image: 'https://cdn.pixabay.com/photo/2016/01/18/09/48/yoga-1146281_1280.jpg',
  },
  {
    id: 7,
    category: 'Language Exchange',
    title: 'I will help you practice French conversation',
    rating: 4.95,
    reviews: 25,
    user: 'Noah Wilson',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 84,
    image: 'https://images.pexels.com/photos/845457/pexels-photo-845457.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 8,
    category: 'Household Help',
    title: 'I will assemble flat-pack furniture',
    rating: 4.92,
    reviews: 29,
    user: 'Emma Davis',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 70,
    image: 'https://cdn.pixabay.com/photo/2021/12/23/03/58/da-guojing-6888603_1280.jpg',
  },
  {
    id: 9,
    category: 'Household Help',
    title: 'I will prep 3 days of vegetarian lunches',
    rating: 4.89,
    reviews: 18,
    user: 'Ethan Miller',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 65,
    image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 10,
    category: 'Tutoring & Study',
    title: 'I will help your child with reading skills',
    rating: 4.93,
    reviews: 34,
    user: 'Ava Martinez',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 90,
    image: 'https://images.pexels.com/photos/267582/pexels-photo-267582.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 11,
    category: 'Pet Care',
    title: 'I will pet sit your cat for a weekend',
    rating: 4.96,
    reviews: 38,
    user: 'Mason Garcia',
    avatar: 'https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg',
    price: 80,
    image: 'https://cdn.pixabay.com/photo/2018/01/03/19/17/cat-3059075_1280.jpg',
  },
  {
    id: 12,
    category: 'Tech Help',
    title: 'I will set up your smart TV and apps',
    rating: 4.87,
    reviews: 22,
    user: 'Sophia Robinson',
    avatar: 'https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg',
    price: 100,
    image: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 13,
    category: 'Creative Skills',
    title: 'I will create custom artwork for your room',
    rating: 4.95,
    reviews: 40,
    user: 'Logan Clark',
    avatar: 'https://cdn.pixabay.com/photo/2016/06/20/04/30/asian-man-1468032_1280.jpg',
    price: 115,
    image: 'https://cdn.pixabay.com/photo/2017/06/15/17/22/sculpture-2406078_1280.jpg',
  },
  {
    id: 14,
    category: 'Fitness & Wellness',
    title: 'I will do a virtual guided meditation',
    rating: 4.88,
    reviews: 27,
    user: 'Isabella Lee',
    avatar: 'https://cdn.pixabay.com/photo/2016/06/20/04/30/asian-man-1468032_1280.jpg',
    price: 60,
    image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 15,
    category: 'Language Exchange',
    title: 'I will translate a short Spanish paragraph',
    rating: 4.91,
    reviews: 35,
    user: 'Lucas Hall',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 45,
    image: 'https://images.pexels.com/photos/5428831/pexels-photo-5428831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 16,
    category: 'Home Repair',
    title: 'I will repair a leaking kitchen faucet',
    rating: 4.89,
    reviews: 31,
    user: 'Mia Allen',
    avatar: 'https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg',
    price: 125,
    image: 'https://images.pexels.com/photos/3693096/pexels-photo-3693096.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 17,
    category: 'Household Help',
    title: 'I will cook a family-style Indian dinner',
    rating: 4.93,
    reviews: 39,
    user: 'Elijah Young',
    avatar: 'https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg',
    price: 98,
    image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 18,
    category: 'Tutoring & Study',
    title: 'I will help with exam prep for chemistry',
    rating: 4.95,
    reviews: 50,
    user: 'Charlotte King',
    avatar: 'https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 110,
    image: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 19,
    category: 'Pet Care',
    title: 'I will feed and play with your pet while you\'re away',
    rating: 4.97,
    reviews: 42,
    user: 'James Wright',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 72,
    image: 'https://images.pexels.com/photos/4587991/pexels-photo-4587991.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 20,
    category: 'Tech Help',
    title: 'I will help fix basic Wi-Fi connection issues',
    rating: 4.9,
    reviews: 21,
    user: 'Amelia Scott',
    avatar: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 55,
    image: 'https://images.pexels.com/photos/4491461/pexels-photo-4491461.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  }
];

const PER_PAGE = 8;

interface Service {
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
}

export default function ServiceGrid({ items = services }: { items?: (Service | typeof services[0])[] }) {
  const [realServices, setRealServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const router = useRouter();

  // Fetch real services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
        console.log('Fetching real services from:', `${API_BASE_URL}/api/tasks/public`);
        
        const response = await fetch(`${API_BASE_URL}/api/tasks/public`);
        
        if (!response.ok) {
          console.error('API call failed:', response.status, response.statusText);
          setError('Failed to fetch services');
          return;
        }

        const data = await response.json();
        console.log('Real services API response:', data);
        
        const services = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        console.log('Real services:', services);
        console.log('Total real services count:', services.length);
        
        // Debug: Log each service to see the structure
        services.forEach((service: any, index: number) => {
          console.log(`Service ${index + 1}:`, {
            id: service._id || service.ID || service.id,
            title: service.Title || service.title,
            category: service.Category || service.category,
            images: service.Images,
            imagesLength: service.Images?.length,
            author: service.Author,
            credits: service.Credits || service.credits
          });
        });
        
        setRealServices(services);
      } catch (err) {
        console.error('Error fetching real services:', err);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Use passed items if provided, otherwise use fetched real services, fall back to mock data
  const displayItems = items && items.length > 0 ? items : (realServices.length > 0 ? realServices : services);
  console.log("ServiceGrid displayItems:", displayItems);
  
  const totalPages = Math.ceil(displayItems.length / PER_PAGE);
  const paginated = displayItems.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goTo = (p: number) => setPage(Math.min(Math.max(p, 1), totalPages));

  const handleCardClick = (serviceId: string | number) => {
    router.push(`/tasks/view/${String(serviceId)}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading real services..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Navigation controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">All Services ({displayItems.length})</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-gray-600 font-medium">
            Page {page} of {totalPages}
          </span>
          
          <button 
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40"
          >
            <FaArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paginated.map((s, idx) => {
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
          const serviceId = s._id || s.ID || s.id;
          const title = s.Title || s.title;
          const category = s.Category || s.category;
          const rating = s.rating || 4.5;
          const reviews = s.reviewCount || s.reviews || Math.floor(Math.random() * 50) + 10;
          const user = s.Author?.Name || s.Author?.name || s.author?.name || s.user || 'Provider';
          const avatar = s.Author?.Avatar || s.Author?.ProfilePictureURL || s.author?.avatar || s.author?.profilePictureURL;
          const price = s.Credits || s.credits || s.price || 0;
          
          // Enhanced image handling for different formats
          let image = s.Images?.[0] || s.image;
          
          // If no image found, try alternative image fields
          if (!image && s.Images && s.Images.length > 0) {
            // Try to find first valid image
            for (let i = 0; i < s.Images.length; i++) {
              if (s.Images[i] && typeof s.Images[i] === 'string') {
                image = s.Images[i];
                break;
              }
            }
          }
          
          return (
            <div 
              key={`${serviceId}-${idx}`} 
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
              onClick={() => handleCardClick(serviceId)}
            >
              <div className="h-32 relative">
                {image ? (
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${gradients[idx % gradients.length]}`}></div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              <div className="p-4">
                <span className={`inline-block px-2 py-1 ${colors[idx % colors.length].bg} ${colors[idx % colors.length].text} text-xs font-semibold rounded mb-2`}>
                  {category || 'GENERAL'}
                </span>
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {title || 'Service Title'}
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt={user} 
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold ${avatar ? 'hidden' : ''}`}>
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-600">
                      {user}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {price} credits
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaStar className="w-4 h-4 text-yellow-400" />
                  <span>
                    {rating} ({reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>



    </>
  );
}

export { services };