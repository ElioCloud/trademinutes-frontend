'use client';

import { useState, useEffect } from 'react';
import CategoryBanner from '@/components/CategoryBanner';
import ServiceFilters from '@/components/ServiceFilters';
import ServiceGrid from '@/components/ServiceGrid';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryTabsWithBreadcrumb from '@/components/CategoriesWithBreadcrumbs';
import ProductBanner from '@/components/ProductBanner';
import ServicesBanner from '@/components/ServicesBanner';
import { FaArrowRight, FaBriefcase, FaUsers, FaLock, FaQuestionCircle } from 'react-icons/fa';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FiBriefcase, FiUsers, FiLock, FiHelpCircle } from 'react-icons/fi';

interface FilterState {
  serviceOptions: string[];
  sellerDetails: string[];
  budget: string;
  deliveryTime: string;
  sortBy: string;
}

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
  Tiers?: Array<{ name: string; credits: number; title: string; description: string; features: string[]; availableTimeSlot: string; maxDays: number }>;
}

export default function Services() {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    serviceOptions: [],
    sellerDetails: [],
    budget: '',
    deliveryTime: '',
    sortBy: 'Best selling'
  });

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
        const response = await fetch(`${API_BASE_URL}/api/tasks/public`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        const services = data.data || [];
        
        // Add mock ratings and review counts for filtering to work properly
        const servicesWithRatings = services.map((service: Service) => ({
          ...service,
          rating: service.rating || Math.random() * 2 + 3, // Random rating between 3-5
          reviewCount: service.reviewCount || Math.floor(Math.random() * 50) + 1, // Random reviews 1-50
        }));
        
        console.log('Fetched services with ratings:', servicesWithRatings);
        setAllServices(servicesWithRatings);
        setFilteredServices(servicesWithRatings);
      } catch (error) {
        console.error('Error fetching services:', error);
        setAllServices([]);
        setFilteredServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    console.log('Applying filters:', filters);
    console.log('Total services before filtering:', allServices.length);
    
    let filtered = [...allServices];

    // Apply service options filter (category-based)
    if (filters.serviceOptions.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(service => {
        const serviceCategory = (service.Category || service.category || '').toLowerCase();
        const serviceTitle = (service.Title || service.title || '').toLowerCase();
        const serviceDescription = (service.Description || service.description || '').toLowerCase();
        
        return filters.serviceOptions.some(option => {
          const optionLower = option.toLowerCase();
          return serviceCategory.includes(optionLower) || 
                 serviceTitle.includes(optionLower) || 
                 serviceDescription.includes(optionLower);
        });
      });
      console.log(`Service options filter: ${beforeCount} -> ${filtered.length} services`);
    }

    // Apply seller details filter
    if (filters.sellerDetails.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(service => {
        const authorName = (service.Author?.Name || service.Author?.name || service.author?.name || '').toLowerCase();
        const rating = service.rating || 0;
        const reviewCount = service.reviewCount || 0;
        
        return filters.sellerDetails.some(detail => {
          switch (detail) {
            case 'Online':
              return true; // Assume all are online for now
            case 'Offline':
              return false; // Assume none are offline for now
            case 'New Sellers':
              return reviewCount < 10; // New sellers have few reviews
            case 'Top Rated Sellers':
              return rating >= 4.5 && reviewCount >= 5;
            case 'Level 1 Sellers':
              return rating >= 4.0 && reviewCount >= 3;
            case 'Level 2 Sellers':
              return rating >= 3.5 && reviewCount >= 1;
            default:
              return true;
          }
        });
      });
      console.log(`Seller details filter: ${beforeCount} -> ${filtered.length} services`);
    }

    // Apply budget filter
    if (filters.budget && filters.budget !== 'Any Budget') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(service => {
        const price = service.Tiers && service.Tiers.length > 0 
          ? service.Tiers.find((tier: any) => tier.name === 'Basic')?.credits || service.Tiers[0].credits
          : service.Credits || service.credits || 0;
        switch (filters.budget) {
          case 'Under $50':
            return price < 50;
          case '$50 - $100':
            return price >= 50 && price <= 100;
          case '$100 - $200':
            return price >= 100 && price <= 200;
          case '$200 - $500':
            return price >= 200 && price <= 500;
          case 'Over $500':
            return price > 500;
          default:
            return true;
        }
      });
      console.log(`Budget filter (${filters.budget}): ${beforeCount} -> ${filtered.length} services`);
    }

    // Apply delivery time filter (availability-based)
    if (filters.deliveryTime && filters.deliveryTime !== 'Any Time') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(service => {
        // For now, show all services as available
        // You can enhance this based on your availability data structure
        return true;
      });
      console.log(`Delivery time filter: ${beforeCount} -> ${filtered.length} services`);
    }



    // Apply sorting
    const beforeSort = [...filtered];
    switch (filters.sortBy) {
      case 'Newest arrivals':
        filtered.sort((a, b) => (b.CreatedAt || b.createdAt || 0) - (a.CreatedAt || a.createdAt || 0));
        break;
      case 'Price: Low to High':
        filtered.sort((a, b) => {
          const priceA = a.Tiers && a.Tiers.length > 0 
            ? a.Tiers.find((tier: any) => tier.name === 'Basic')?.credits || a.Tiers[0].credits
            : a.Credits || a.credits || 0;
          const priceB = b.Tiers && b.Tiers.length > 0 
            ? b.Tiers.find((tier: any) => tier.name === 'Basic')?.credits || b.Tiers[0].credits
            : b.Credits || b.credits || 0;
          return priceA - priceB;
        });
        break;
      case 'Price: High to Low':
        filtered.sort((a, b) => {
          const priceA = a.Tiers && a.Tiers.length > 0 
            ? a.Tiers.find((tier: any) => tier.name === 'Basic')?.credits || a.Tiers[0].credits
            : a.Credits || a.credits || 0;
          const priceB = b.Tiers && b.Tiers.length > 0 
            ? b.Tiers.find((tier: any) => tier.name === 'Basic')?.credits || b.Tiers[0].credits
            : b.Credits || b.credits || 0;
          return priceB - priceA;
        });
        break;
      case 'Rating: High to Low':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'Most reviews':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'Best selling':
      default:
        // Default sorting by rating and reviews
        filtered.sort((a, b) => {
          const scoreA = (a.rating || 0) * (a.reviewCount || 1);
          const scoreB = (b.rating || 0) * (b.reviewCount || 1);
          return scoreB - scoreA;
        });
        break;
    }
    console.log(`Sorting by ${filters.sortBy}: applied`);

    console.log('Final filtered services:', filtered.length);
    setFilteredServices(filtered);
  }, [allServices, filters]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const features = [
    {
      icon: <FiBriefcase size={24} />,
      title: "Step 1: Post a task",
      desc: "Quickly describe the help you need. It's fast, free, and easy.",
    },
    {
      icon: <FiUsers size={24} />,
      title: "Step 2: Choose helpers",
      desc: "Browse trusted community members who are ready to help.",
    },
    {
      icon: <FiLock size={24} />,
      title: "Step 3: Swap securely",
      desc: "Earn and spend time credits — no payments, just fair trades.",
    },
    {
      icon: <FiHelpCircle size={24} />,
      title: "Support: We're here to help",
      desc: "Need support? Our team is here for you anytime.",
    },
  ];

  if (loading) {
    return (
      <main className="bg-white min-h-screen" style={{ color: '#111' }}>
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading services..." />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen" style={{ color: '#111' }}>
      <Navbar />
      <br/>
      <CategoryTabsWithBreadcrumb />
      <ServicesBanner/>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ServiceFilters 
          onFiltersChange={handleFiltersChange}
          totalResults={filteredServices.length}
          onSortChange={handleSortChange}
        />
        <ServiceGrid items={filteredServices} />
      </div>
      
      {/* How TradeMinutes Works Section - Full Width */}
      <section className="py-36 bg-[#FAF6ED] w-full mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How TradeMinutes Works
            </h2>
                          <p className="text-gray-600 mb-6 max-w-md">
                Get help from trusted community members — no money involved. 
                Simply post what you need, choose your helper, and swap skills securely.
              </p>
          </div>

          {/* Right icons list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map(({ icon, title, desc }, index) => (
              <div key={index} className="flex flex-col items-start space-y-2">
                <div className="bg-grey-600 text-emerald-700 p-3 rounded-full">
                  {icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
