'use client'; // Ensure this runs as a client component

import Image from 'next/image';

export default function HeroIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main green blob shape */}
      <div className="relative w-full h-96">
  <Image
    src="/Capstone2.jpg"
    alt="Green blob"
    fill
    className="object-contain"
  />
</div>

      {/* Decorative elements positioned absolutely */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Coffee Cup */}
        <div className="absolute top-8 left-12 transform -rotate-12">
          <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center">
            <div className="w-12 h-12 bg-[#1a5f3f] rounded-t-lg"></div>
          </div>
          <div className="w-20 h-2 bg-white rounded-full mt-1 mx-auto"></div>
        </div>

        {/* Open Book 1 */}
        <div className="absolute top-16 right-16 transform rotate-6">
          <div className="w-20 h-14 bg-white rounded shadow-lg flex">
            <div className="w-1/2 border-r border-gray-200"></div>
            <div className="w-1/2"></div>
          </div>
        </div>

        {/* Open Book 2 */}
        <div className="absolute bottom-20 left-20 transform -rotate-12">
          <div className="w-16 h-12 bg-white rounded shadow-lg flex">
            <div className="w-1/2 border-r border-gray-200"></div>
            <div className="w-1/2"></div>
          </div>
        </div>

        {/* Stack of Books 1 */}
        <div className="absolute top-24 right-8 transform rotate-3">
          <div className="space-y-1">
            <div className="w-16 h-3 bg-[#2d7a5f] rounded shadow"></div>
            <div className="w-16 h-3 bg-[#1a5f3f] rounded shadow"></div>
          </div>
        </div>

        {/* Stack of Books 2 */}
        <div className="absolute bottom-16 left-12 transform -rotate-6">
          <div className="space-y-1">
            <div className="w-14 h-3 bg-[#2d7a5f] rounded shadow"></div>
            <div className="w-14 h-3 bg-[#1a5f3f] rounded shadow"></div>
          </div>
        </div>

        {/* Pen */}
        <div className="absolute top-32 left-24 transform rotate-45">
          <div className="w-1 h-12 bg-[#1a5f3f] rounded-full"></div>
          <div
            className="w-3 h-3 bg-yellow-600 rounded-full -mt-1"
            style={{ marginLeft: '-4px' }} // Fixed negative arbitrary margin
          ></div>
        </div>

        {/* Pencils */}
        <div className="absolute bottom-24 right-20 transform rotate-12">
          <div className="space-y-2">
            <div className="w-1 h-8 bg-white rounded-full"></div>
            <div className="w-1 h-8 bg-[#1a5f3f] rounded-full"></div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-12 right-24">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="absolute bottom-28 left-32">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="absolute top-40 right-12">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
