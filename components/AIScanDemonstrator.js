import React from "react";
import { Star } from "lucide-react";

const userFeedback = [
  {
    name: "Maria K.",
    location: "Kenya",
    rating: 5,
    quote:
      "The instant diagnosis saved my entire tomato harvest. I knew exactly what fungicide to use within minutes!",
  },
  {
    name: "David C.",
    location: "USA",
    rating: 5,
    quote:
      "Unbelievable accuracy. It identified a rare micronutrient deficiency my traditional methods missed. Highly recommend!",
  },
  {
    name: "Aisha R.",
    location: "India",
    rating: 4,
    quote:
      "Easy to use, even in remote fields. The support team is also very knowledgeable when I needed more context.",
  },
  {
    name: "Carlos M.",
    location: "Brazil",
    rating: 5,
    quote:
      "It’s like having an agronomist in my pocket accurate, fast, and so easy to use!",
  },
];

const AIScanDemonstrator = () => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
        }`}
      />
    ));
  };

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ backgroundColor: "#f0ead2", borderTopLeftRadius: "50px", borderTopRightRadius: "50px" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-green-950 opacity-10"></div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight"
            style={{ color: "#283618", fontFamily: '"Arial", Gadget, sans-serif',
              
              fontWeight: 700, }}
          >
            Real Farmers, Real Results
          </h2>
          <p
            className="text-xl max-w-2xl mx-auto mb-10"
            style={{ color: "#283618", opacity: 0.8, fontFamily: '"Arial", Gadget, sans-serif',
              
              fontWeight: 400, }}
          >
            More than just precise and efficient, our AI is transforming agriculture by driving measurable yield improvements worldwide. Discover insights from our farming community.
          </p>
        </div>

        {/* Infinite Scroll Section */}
        
        <div className="relative w-full overflow-hidden">
          <div className="scroll-track flex space-x-8 md:space-x-10">
            {/* Duplicate the testimonials twice for seamless looping */}
            {[...userFeedback, ...userFeedback].map((feedback, index) => (
              <div
                key={index}
                className="testimonial-card w-80 md:w-96 p-6 rounded-xl border text-left flex-shrink-0"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.55)",
                  borderColor: "#283618",
                  borderWidth: "1px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="flex mb-3">{renderStars(feedback.rating)}</div>
                <p
                  className="text-base md:text-lg italic mb-4"
                  style={{ color: "#283618" }}
                >
                  &quot;{feedback.quote}&quot;
                </p>
                <p className="text-sm font-bold" style={{ color: "#38761d" }}>
                  {feedback.name}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "#283618", opacity: 0.7 }}
                >
                  {feedback.location}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        .scroll-track {
          display: flex;
          width: max-content;
          animation: scrollLoop 35s linear infinite;
        }

        @keyframes scrollLoop {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .testimonial-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .testimonial-card:hover {
          transform: scale(1.03);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </section>
  );
};

export default AIScanDemonstrator;
