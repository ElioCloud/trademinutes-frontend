'use client';

import { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Slide {
  id: number;
  title: string;
  description: string;
  image: string;
  alt: string;
}

interface HowTradeMinutesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Step 1: Post a Task",
    description: "Start by describing what you need help with. Whether it's tutoring, tech support, or household tasks, simply post your request with details about what you're looking for.",
    image: "/services-banner.png",
    alt: "Post a task illustration"
  },
  {
    id: 2,
    title: "Step 2: Browse Helpers",
    description: "Explore our community of trusted members who offer their skills and time. Read reviews, check ratings, and find the perfect person to help you with your task.",
    image: "/services-banner.png",
    alt: "Browse helpers illustration"
  },
  {
    id: 3,
    title: "Step 3: Connect & Swap",
    description: "Once you find the right helper, connect with them and arrange your skill swap. No money involved - just fair exchanges of time and expertise.",
    image: "/services-banner.png",
    alt: "Connect and swap illustration"
  },
  {
    id: 4,
    title: "Step 4: Build Community",
    description: "Complete your task, leave reviews, and build lasting connections in your community. TradeMinutes helps you give and receive help while building meaningful relationships.",
    image: "/services-banner.png",
    alt: "Build community illustration"
  }
];

export default function HowTradeMinutesModal({ isOpen, onClose }: HowTradeMinutesModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Reset to first slide when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => prev > 0 ? prev - 1 : slides.length - 1);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => prev < slides.length - 1 ? prev + 1 : 0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const nextSlide = () => {
    setCurrentSlide(prev => prev < slides.length - 1 ? prev + 1 : 0);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => prev > 0 ? prev - 1 : slides.length - 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">How TradeMinutes Works</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Slideshow Content */}
        <div className="relative">
          {/* Slide */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Image */}
              <div className="relative">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].alt}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
              </div>

              {/* Text Content */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                    Step {slides[currentSlide].id}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Footer with Dots */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500">
              {currentSlide + 1} of {slides.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 