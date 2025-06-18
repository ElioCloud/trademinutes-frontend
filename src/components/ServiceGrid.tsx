'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import Link from 'next/link';

const services = [
  {
    id: 1,
    slug: 'docker-kubernetes',
    title: 'I will help you learn Docker and kurbernetes',
    category: 'Tutoring & Study',
    rating: 4.88,
    reviews: 24,
    user: 'Alice',
    avatar: 'https://images.pexels.com/photos/277576/pexels-photo-277576.jpeg',
    price: 60,
    image: 'https://miro.medium.com/v2/resize:fit:4800/format:webp/1*WRocACNtWLIzZrxuGOyeBA.jpeg',
  },
  {
    id: 3,
    slug: 'walk-your-dog-every-evening',
    title: 'I will walk your dog every evening',
    category: 'Home Repair',
    rating: 4.96,
    reviews: 48,
    user: 'Ayesha Patel',
    avatar: 'https://images.pexels.com/photos/721979/pexels-photo-721979.jpeg',
    price: 114,
    image: 'https://cdn.pixabay.com/photo/2015/11/17/13/13/puppy-1047521_1280.jpg',
  },
  // Add more services with slugs here...
];

const PER_PAGE = 8;

export default function ServiceGrid({ items = services }: { items?: typeof services }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / PER_PAGE);
  const paginated = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goTo = (p: number) => setPage(Math.min(Math.max(p, 1), totalPages));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-15">
        {paginated.map((s) => (
          <Link
            key={s.slug}
            href={`/services/${s.slug}`}
            className="bg-white rounded-lg shadow-sm overflow-hidden border flex flex-col hover:shadow-md transition"
          >
            <Image
              src={s.image}
              alt={s.title}
              width={400}
              height={260}
              className="object-cover w-full h-48"
            />
            <div className="p-4 flex flex-col flex-1">
              <p className="text-xs text-black">{s.category}</p>
              <h3 className="font-semibold text-sm mt-1 line-clamp-2 text-black">{s.title}</h3>
              <div className="flex items-center text-xs text-black mt-2">
                <FiStar className="text-yellow-400 mr-1" />
                {s.rating}
                <span className="ml-1">({s.reviews} reviews)</span>
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Image
                    src={s.avatar}
                    alt={s.user}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                  <span className="text-xs text-gray-500">{s.user}</span>
                </div>
                <span className="text-xs text-gray-500">
                  Starting at&nbsp;<strong className="text-black">{s.price} credits</strong>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-18 mb-18">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-black text-black disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i + 1)}
              className={`px-3 py-1 rounded border border-black ${
                page === i + 1 ? 'bg-emerald-600 text-white' : 'bg-white text-black'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-black text-black disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
