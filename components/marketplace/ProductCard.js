// components/marketplace/ProductCard.js

"use client";

import { useState } from "react";
import Image from "next/image";
import ProductModal from "./ProductModal";

export default function ProductCard({ listing, currentUser }) {
  const [showModal, setShowModal] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(price);
  };

  const capitalizeTitle = (title) => {
    return title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
        onClick={() => setShowModal(true)}
      >
        {/* Image Container - Top */}
        <div className="w-full aspect-square relative">
          {listing.images && listing.images[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          
          {/* Type Badge on Image */}
          <div className="absolute top-3 right-3">
            <span className="bg-white bg-opacity-95 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wide">
              {listing.type}
            </span>
          </div>
        </div>

        {/* Details Container - Bottom */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
            {listing.title}
          </h3>

          {/* Price */}
          <p className="text-xl font-bold text-green-600 mb-2">
            {formatPrice(listing.price)}
          </p>

          {/* Location */}
          <div className="flex items-center text-gray-600">
            <svg
              className="w-4 h-4 mr-1.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm font-medium truncate">{listing.location}</span>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        listing={listing}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentUser={currentUser}
      />
    </>
  );
}