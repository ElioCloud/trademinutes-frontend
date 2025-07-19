"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AuthModal from '@/components/AuthModal';

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

export default function AllServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8084";
        console.log('Fetching all services from:', `${API_BASE_URL}/api/tasks/public`);
        
        const response = await fetch(`${API_BASE_URL}/api/tasks/public`);
        
        if (!response.ok) {
          console.error('API call failed:', response.status, response.statusText);
          setError('Failed to fetch services');
          return;
        }

        const data = await response.json();
        console.log('API response:', data);
        
        const allServices = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        console.log('All services:', allServices);
        console.log('Total services count:', allServices.length);
        
        setServices(allServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchAllServices();
  }, []);

  const handleServiceClick = (service: Service) => {
    const serviceId = service.ID || service.id;
    if (serviceId) {
      const token = localStorage.getItem("token");
      if (token) {
        router.push(`/tasks/view/${serviceId}`);
      } else {
        setAuthMode('login');
        setShowAuthModal(true);
      }
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Services</h1>
          <p className="text-gray-600">Showing all available services in the marketplace</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" text="Loading all services..." />
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
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Total Services: {services.length}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div
                  key={service.ID || service.id || index}
                  onClick={() => handleServiceClick(service)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 border border-gray-200"
                >
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {service.Title || service.title || 'No Title'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {service.Description || service.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Category: {service.Category || service.category || 'N/A'}</span>
                      <span className="font-semibold text-green-600">
                        {service.Credits || service.credits || 0} credits
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      By: {service.Author?.Name || service.Author?.name || service.author?.name || 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={() => {
          console.log('User authenticated successfully');
        }}
      />
    </main>
  );
}
