// components/marketplace/ProductModal.js

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductModal({ listing, isOpen, onClose, currentUser }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen || !listing) return null;

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

  const nextImage = () => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const openFullscreenImage = () => {
    setIsImageFullscreen(true);
  };

  const closeFullscreenImage = () => {
    setIsImageFullscreen(false);
  };

  const handleFullscreenBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeFullscreenImage();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl max-w-6xl w-full h-[85vh] overflow-hidden relative flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Side - Image Gallery (60%) */}
            <div className="w-[60%] bg-gray-50 p-6 flex flex-col">
              {/* Main Image */}
              <div 
                className="flex-1 relative bg-gray-100 rounded-xl overflow-hidden cursor-zoom-in mb-4"
                onClick={openFullscreenImage}
              >
                {listing.images && listing.images.length > 0 ? (
                  <>
                    <Image
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      fill
                      className="object-contain"
                    />

                    {/* Image Navigation Arrows */}
                    {listing.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2.5 shadow-lg transition-all"
                        >
                          <svg
                            className="w-6 h-6 text-gray-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2.5 shadow-lg transition-all"
                        >
                          <svg
                            className="w-6 h-6 text-gray-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Zoom Icon */}
                    <div className="absolute top-3 left-3 bg-black bg-opacity-70 rounded-lg px-3 py-1.5 flex items-center space-x-1.5">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                        />
                      </svg>
                      <span className="text-white text-xs font-semibold">Click to zoom</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-green-600 ring-2 ring-green-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${listing.title} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Product Details (40%) */}
            <div className="w-[40%] p-8 overflow-y-auto">
              {/* Header with badges */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                  {listing.type}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                  {listing.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {capitalizeTitle(listing.title)}
              </h1>

              {/* Price */}
              <p className="text-4xl font-extrabold text-green-600 mb-5">
                {formatPrice(listing.price)}
              </p>

              {/* Location */}
              <div className="flex items-center text-gray-700 mb-6 pb-6 border-b-2 border-gray-200">
                <svg
                  className="w-5 h-5 text-gray-500 mr-2.5"
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
                <span className="text-base font-semibold">{listing.location}</span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  {listing.description}
                </p>
              </div>

              {/* Seller Info */}
              {listing.user_id && (
                <div className="bg-gray-50 rounded-xl p-5 mb-5">
                  <h3 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide">
                    Seller Information
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-300">
                      {currentUser && listing.user_id._id === currentUser.id ? (
                        currentUser.profile_image_url || currentUser.image ? (
                          <img
                            src={currentUser.profile_image_url || currentUser.image}
                            alt={`${currentUser.first_name || currentUser.name?.split(" ")[0]} ${currentUser.last_name || ""}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-green-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {(currentUser.first_name || currentUser.name?.split(" ")[0])?.charAt(0)}
                              {(currentUser.last_name || currentUser.name?.split(" ").slice(1).join(" "))?.charAt(0)}
                            </span>
                          </div>
                        )
                      ) : listing.user_id.profile_image_url || listing.user_id.image ? (
                        <img
                          src={listing.user_id.profile_image_url || listing.user_id.image}
                          alt={`${listing.user_id.first_name} ${listing.user_id.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-green-600 flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {listing.user_id.first_name?.charAt(0)}
                            {listing.user_id.last_name?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">
                        {listing.user_id.first_name} {listing.user_id.last_name}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">
                        {listing.user_id.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {listing.contact_info && (
                <div className="bg-green-50 rounded-xl p-5 mb-5">
                  <h3 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {listing.contact_info.phone && (
                      <div className="flex items-center text-gray-800">
                        <svg
                          className="w-5 h-5 text-green-600 mr-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-base font-semibold">{listing.contact_info.phone}</span>
                      </div>
                    )}
                    {listing.contact_info.email && (
                      <div className="flex items-center text-gray-800">
                        <svg
                          className="w-5 h-5 text-green-600 mr-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-base font-semibold">{listing.contact_info.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Posted Date */}
              <div className="text-sm text-gray-600 font-medium pt-5 border-t-2 border-gray-200">
                Posted on{" "}
                {new Date(listing.created_at).toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isImageFullscreen && listing.images && listing.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center p-4"
          onClick={handleFullscreenBackdropClick}
        >
          {/* Close Button */}
          <button
            onClick={closeFullscreenImage}
            className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Image Counter */}
          {listing.images.length > 1 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-5 py-2.5 rounded-full text-base font-bold">
              {currentImageIndex + 1} / {listing.images.length}
            </div>
          )}

          {/* Fullscreen Image */}
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={listing.images[currentImageIndex]}
              alt={listing.title}
              width={1200}
              height={1200}
              className="object-contain max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation Arrows for Fullscreen */}
            {listing.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all"
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all"
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}