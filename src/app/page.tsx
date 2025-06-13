'use client';

import Benefits from '@/components/Benefits';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import HowItWorks from '@/components/HowItWorks';
import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';
import Image from 'next/image';
import Link from 'next/link';


export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar */}
       <Navbar />
      {/* <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-700">
          Trade<span className="text-black">Minutes</span>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium">
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
      </nav> */}

      {/* Hero Section */}
      <section className="text-center pt-12 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="w-10 h-10 mx-auto mb-6">
          <Image src="/refresh.svg" alt="refresh icon" width={30} height={30} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Exchange Skills, Not Money</h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">
          Swap your skills for time credits to get the help you need, all in one app
        </p>
        <Link href="/register">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700">
            Get started
          </button>
        </Link>

        <div className="mt-10 flex flex-col items-center md:flex-row md:justify-center gap-16">
          <Image
            src="/clock.png"
            alt="Clock in hand"
            width={200}
            height={200}
            className="rounded-lg"
          />

          <Image
            src="/map.png"
            alt="Clock in hand"
            width={250}
            height={200}
            className="rounded-lg shadow-md"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-2">Smart Map & Task Matching</h3>
            <p className="text-gray-600">
              Browse nearby service requests and offers on an interactive map
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Time Credit & Scheduling System</h3>
            <p className="text-gray-600">
              Earn and spend time credits for each completed or requested task
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Trust & Community Profiles</h3>
            <p className="text-gray-600">
              Verified profiles show ID, neighborhood status, completed tasks, and skills
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Time Credit & Scheduling System</h3>
            <p className="text-gray-600">
              Earn and spend time credits for each completed or requested task
            </p>
          </div>
        </div>
       
       
        {/* <div className="text-center mt-16 text-gray-400 text-sm">
          <p>Trusted by</p>
          <div className="flex flex-wrap justify-center space-x-4 mt-2">
            <span>© GlobalBank</span>
            <span>© Epicurious</span>
            <span>© Acme Corp</span>
          </div>
        </div> */}
        
      </section>
       <HowItWorks />
        <Benefits />
       <Pricing />
        <FAQ />
      <Footer />
    </main>
  );
}