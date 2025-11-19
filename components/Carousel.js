import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef(null);

  const plants = [
    { src: "/flower.jpg", name: "Flower", alt: "Beautiful flower" },
    { src: "/tree.png", name: "Tree", alt: "Healthy tree" },
    { src: "/wild-plant.jpg", name: "Wild Plant", alt: "Wild plant" },
    { src: "/succulents.png", name: "Succulents", alt: "Succulent plants" },
    { src: "/garden-plant.png", name: "Garden Plant", alt: "Garden plant" },
  ];

  const imagesPerView = 4;
  const maxIndex = Math.max(0, plants.length - imagesPerView);

  const scrollToIndex = (index) => {
    if (isTransitioning) return;

    const newIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(newIndex);
    setIsTransitioning(true);

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const imageWidth = container.scrollWidth / plants.length;
      container.scrollTo({
        left: imageWidth * newIndex,
        behavior: "smooth",
      });
    }

    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrevious = () => {
    scrollToIndex(currentIndex - 1);
  };

  const handleNext = () => {
    scrollToIndex(currentIndex + 1);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!isTransitioning) {
        const imageWidth = container.scrollWidth / plants.length;
        const newIndex = Math.round(container.scrollLeft / imageWidth);
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isTransitioning, plants.length]);

  return (



    <div
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      style={{
        fontFamily: '"Open Sans", sans-serif',
        fontStyle: "normal",
        fontOpticalSizing: "auto"
        
      }}
    >

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-[#fefae0] mb-2">
          Supported Plant Species
        </h2>
        <p className="text-white -600 text-xl">
          Our scanner accurately identifies all the plant species listed below.
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 ${
            currentIndex === 0
              ? "opacity-0 cursor-not-allowed"
              : "opacity-0 group-hover:opacity-100 hover:bg-[#1c352d] hover:text-white"
          }`}
          aria-label="Previous images"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 ${
            currentIndex >= maxIndex
              ? "opacity-0 cursor-not-allowed"
              : "opacity-0 group-hover:opacity-100 hover:bg-[#1c352d] hover:text-white"
          }`}
          aria-label="Next images"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          // Changed: Added overflow-y-hidden to explicitly prevent vertical scrolling.
          className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex gap-4 px-2">
            {plants.map((plant, index) => (
              <div
                key={index}
                className="flex-none w-[calc(25%-12px)] min-w-[200px]"
              >
                <div className="relative group/card overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-105">
                  {/* Image */}
                  <div className="aspect-[3/4] bg-gray-100">
                    <img
                      src={plant.src}
                      alt={plant.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg">
                        {plant.name}
                      </h3>
                    </div>
                  </div>

                  {/* Border on hover */}
                  <div className="absolute inset-0 ring-2 ring-[#1c352d]/0 group-hover/card:ring-[#1c352d]/50 rounded-2xl transition-all duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-[#1c352d]"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Mobile scroll hint */}
      <div className="text-center mt-4 md:hidden">
        <p className="text-sm text-gray-500">Swipe to see more →</p>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Carousel;
