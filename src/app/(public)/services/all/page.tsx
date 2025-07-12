'use client';

import CategoryBanner from '@/components/CategoryBanner';
import ServiceFilters from '@/components/ServiceFilters';
import ServiceGrid from '@/components/ServiceGrid';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryTabsWithBreadcrumb from '@/components/CategoriesWithBreadcrumbs';
import ProductBanner from '@/components/ProductBanner';
import ServicesBanner from '@/components/ServicesBanner';

export default function Services() {
  return (
    <main className="bg-white min-h-screen text-gray-900">
      <Navbar />
      <br/>
      <CategoryTabsWithBreadcrumb />
      <ServicesBanner/>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-row items-center justify-between gap-6 mb-20 flex-wrap md:flex-nowrap">
          <div className="flex flex-row flex-wrap items-center gap-4 w-full md:w-auto">
            <ServiceFilters />
          </div>
          <span className="text-sm text-gray-600 whitespace-nowrap">Sort by <strong className="text-emerald-600">Best Seller</strong></span>
        </div>
        <ServiceGrid />
      </div>
      <Footer />
    </main>
  );
}
