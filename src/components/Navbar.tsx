'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white text-gray-900 px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-700">
          Trade<span className="text-black">Minutes</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <span className="hover:text-black cursor-pointer">How it works</span>
          <span className="hover:text-black cursor-pointer">Features</span>
          <span className="hover:text-black cursor-pointer">Pricing</span>

          <Link href="/login">
            <span className="hover:text-black cursor-pointer">Login</span>
          </Link>

          <Link href="/register">
            <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700">
              Sign up
            </button>
          </Link>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center" onClick={toggleMobileMenu}>
          <Image src="/menu-icon.svg" alt="Menu" width={30} height={30} />
        </div>
      </div>

      {/* Mobile Menu with Conditional Shadow and Increased Top Margin */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col items-center py-4 space-y-4 shadow-lg mt-6">
          <span className="hover:text-black cursor-pointer">How it works</span>
          <span className="hover:text-black cursor-pointer">Features</span>
          <span className="hover:text-black cursor-pointer">Pricing</span>

          <Link href="/login">
            <span className="hover:text-black cursor-pointer">Login</span>
          </Link>

          <Link href="/register">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700">
              Sign up
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
