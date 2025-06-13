// components/FAQ.tsx

import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(-1);  // Initialize state as -1, meaning no FAQ is open

  const toggleFAQ = (index: number) => {
    // If the clicked FAQ is already open, close it (set state to -1), otherwise set the clicked index
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-16 px-6 bg-gray-50">
      <h2 className="text-3xl text-center mb-8 font-bold">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div
            className="flex justify-between items-center cursor-pointer p-4 border-b"
            onClick={() => toggleFAQ(1)}
          >
            <p className="text-lg font-semibold">How do I earn time credits?</p>
            <span>{openIndex === 1 ? '-' : '+'}</span>
          </div>
          {openIndex === 1 && (
            <div className="p-4 bg-white">
              <p>You can earn time credits by completing tasks for others or offering your skills.</p>
            </div>
          )}
        </div>

        <div>
          <div
            className="flex justify-between items-center cursor-pointer p-4 border-b"
            onClick={() => toggleFAQ(2)}
          >
            <p className="text-lg font-semibold">Can I use time credits for any service?</p>
            <span>{openIndex === 2 ? '-' : '+'}</span>
          </div>
          {openIndex === 2 && (
            <div className="p-4 bg-white">
              <p>Yes, time credits can be exchanged for any service listed on the platform.</p>
            </div>
          )}
        </div>

        <div>
          <div
            className="flex justify-between items-center cursor-pointer p-4 border-b"
            onClick={() => toggleFAQ(3)}
          >
            <p className="text-lg font-semibold">How do I request help from others?</p>
            <span>{openIndex === 3 ? '-' : '+'}</span>
          </div>
          {openIndex === 3 && (
            <div className="p-4 bg-white">
              <p>Simply browse tasks on the platform and use your time credits to request help.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
