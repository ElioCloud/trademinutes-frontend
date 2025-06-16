import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Service {
    id: number;
    slug: string;
    title: string;
    category: string;
    rating: number;
    reviews: number;
    user: string;
    review: string;
    avatar: string;
    price: number;
    image: string;
    description?: string;
}

const mockServices: Service[] = [
    {
        id: 3,
        slug: 'walk-your-dog-every-evening',
        title: 'I will walk your dog every evening',
        category: 'Pet Service',
        rating: 4.96,
        reviews: 48,
        chat: '',
        user: 'Ayesha Patel',
        avatar: 'https://images.pexels.com/photos/721979/pexels-photo-721979.jpeg',
        price: 200,
        image: 'https://cdn.pixabay.com/photo/2015/11/17/13/13/puppy-1047521_1280.jpg',
        description:
            'Your dog will enjoy a peaceful 30-minute walk with me every evening. I’m experienced and love pets!',
    },
    {
    id: 4,
    slug: 'docker-kubernetes',
    title: 'I will help you learn Docker and kurbernetes',
    category: 'Tutoring & Study',
    rating: 4.92,
    reviews: 62,
    review: '',
    user: 'bob',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
    price: 180,
    image: 'https://miro.medium.com/v2/resize:fit:4800/format:webp/1*WRocACNtWLIzZrxuGOyeBA.jpeg',
    description:
      'I provide personalized tutoring for college-level students. With clear explanations and exam strategies, I’ll help you feel confident and prepared.',
  }
];

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
    const service = mockServices.find((s) => s.slug === params.slug);
    if (!service) return notFound();

    return (
        <>
            <Navbar />

            <main className="w-full min-h-screen bg-white text-black px-6 py-12">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
                    {/* Left Side */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
                        <p className="text-sm text-gray-600 mb-4">{service.category}</p>

                        <div className="flex items-center gap-2 mb-6">
                            <Image
                                src={service.avatar}
                                alt={service.user}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                            />
                            <span className="font-medium">{service.user}</span>
                            <span className="text-yellow-500">⭐ {service.rating}</span>
                            <span className="text-sm text-gray-500">({service.reviews} reviews)</span>
                        </div>

                        <div className="aspect-video w-full relative rounded-lg overflow-hidden mb-6">
                            <Image
                                src={service.image}
                                alt={service.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>

                        <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-2">Description</h2>
                            <p className="text-sm leading-relaxed">{service.description}</p>
                        </div>
                    </div>




                    {/* Right Side - Pricing & Contact Box */}
                    <div className="w-full lg:w-[350px] space-y-6">
                        {/* Pricing Box */}
                        <div className="border border-gray-200 rounded-lg p-5 shadow-md bg-white">
                            <h3 className="text-xl font-semibold mb-1">{service.price}</h3>
                            <p className="text-sm text-gray-700 mb-4">
                                Includes: 30-minute walk, pet care attention, and photo updates.
                            </p>

                            <ul className="space-y-2 text-sm mb-6">
                                <li className="flex items-center gap-2">🕒 1 Day Delivery</li>
                                <li className="flex items-center gap-2">🔁 2 Revisions</li>
                                <li className="flex items-center gap-2">📄 Photo Proof</li>
                            </ul>

                            <button className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700">
                                Continue for {service.price}
                            </button>
                        </div>

                        {/* Freelancer Card */}
                        <div className="border border-gray-200 rounded-lg p-5 shadow-md bg-white text-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Image
                                    src={service.avatar}
                                    alt={service.user}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-semibold">{service.user}</p>
                                    <p className="text-gray-500">Dog Trainer</p>
                                    <div className="text-yellow-500 text-sm flex items-center">
                                        ⭐ {service.rating} <span className="text-gray-400 ml-1">({service.reviews} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-3" />

                            <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
                                <div>
                                    <p className="font-medium text-black">Canada</p>
                                    <p className="text-gray-400">Location</p>
                                </div>
                                <div>
                                    <p className="font-medium text-black">Points: {service.price} / hr</p>
                                    <p className="text-gray-400">Rate</p>
                                </div>
                                <div>
                                    <p className="font-medium text-black">98%</p>
                                    <p className="text-gray-400">Job Success</p>
                                </div>
                            </div>
                            <br/>

                            <button className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700">
                                Contact Me →
                            </button>
                        </div>

                        {/* Reviews */}
                        <div className="border border-gray-200 rounded-lg p-5 shadow-md bg-white text-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Image
                                    src={service.avatar}
                                    alt={service.user}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-semibold">{service.user}</p>
                                    <p className="text-gray-500">Dog Trainer</p>
                                    <div className="text-yellow-500 text-sm flex items-center">
                                        ⭐ {service.rating} <span className="text-gray-400 ml-1">({service.reviews} reviews)</span>
                                    </div>
                                </div>
                            </div>
                            <br/>
                            <button className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700">
                                Reviews {service.review}
                            </button>

                          
                        </div>

                    </div>

                </div>
            </main>

            <Footer />
        </>
    );
}
