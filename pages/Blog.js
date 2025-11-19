import React, { useState } from "react";
import { Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";

const initialBlogPosts = [
  { id: 1, title: "How AI Is Transforming Modern Agriculture", description: "Discover how advanced machine learning models are reshaping crop monitoring, boosting yields, and improving sustainability across the globe.", date: "November 2025", readTime: "5 min read" },
  { id: 2, title: "Top 10 Early Signs of Plant Diseases", description: "Catch diseases early with these essential tips every farmer and gardener should know to prevent major crop damage.", date: "November 2025", readTime: "4 min read" },
  { id: 3, title: "Building AgroCare: The Future of Smart Plant Diagnosis", description: "An inside look at the technology, mission, and innovation powering AgroCare’s AI-driven agricultural tools.", date: "October 2025", readTime: "6 min read" },
  { id: 4, title: "Why Soil Health Determines 80% of Your Crop Success", description: "Understand the science behind soil nutrients, pH balance, and how AI tools help monitor soil conditions accurately.", date: "September 2025", readTime: "7 min read" },
  { id: 5, title: "Smart Irrigation: Saving Water with Precision Technology", description: "Learn how sensor-based irrigation systems optimize water usage and keep your plants consistently healthy.", date: "August 2025", readTime: "5 min read" },
  { id: 6, title: "The Rise of Urban Farming & How Tech Is Leading the Way", description: "Explore how cities are adopting rooftop gardens, smart hydroponics, and AI-driven crop care solutions.", date: "July 2025", readTime: "6 min read" },
];

const additionalBlogPosts = [
  { id: 7, title: "AI-Powered Pest Control Strategies", description: "Explore how AI can predict and prevent pest infestations, reducing crop loss and pesticide use.", date: "June 2025", readTime: "5 min read" },
  { id: 8, title: "Sustainable Fertilizer Practices with Tech", description: "Learn how smart fertilization techniques help increase efficiency while minimizing environmental impact.", date: "May 2025", readTime: "4 min read" },
  { id: 9, title: "Robotics in Modern Farming", description: "Discover the role of autonomous machines in planting, harvesting, and monitoring crops with precision.", date: "April 2025", readTime: "6 min read" },
];

export default function Blog() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  const blogsToShow = showAll ? [...initialBlogPosts, ...additionalBlogPosts] : initialBlogPosts;

  return (
    <div className="min-h-screen bg-[#f0ead2] py-16 px-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-14">
        <h1 className="text-5xl font-extrabold text-[#283618] mb-4">AgroCare Blog</h1>
        <p className="text-[#283618]/80 text-lg max-w-2xl mx-auto">
          Explore insights, research, and innovations in AI-powered agriculture.
        </p>
      </div>

      {/* Blog Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {blogsToShow.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-[#283618]/20 rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center gap-2 text-[#283618]/70 text-sm mb-3">
              <Clock size={16} />
              <span>
                {post.date} • {post.readTime}
              </span>
            </div>

            <h2 className="text-xl font-bold text-[#283618] mb-3">{post.title}</h2>
            <p className="text-[#283618]/80 mb-5">{post.description}</p>

            <button
              onClick={() => router.push(`/blog/${post.id}`)}
              className="flex items-center gap-2 text-[#283618] font-semibold hover:underline"
            >
              Read More <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer Buttons */}
      <div className="mt-16 text-center flex flex-col sm:flex-row justify-center gap-4">
        {!showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="bg-[#283618] hover:bg-[#1e2a12] text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all"
          >
            Explore All Articles
          </button>
        )}

        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center text-[#283618] hover:text-white bg-[#283618]/10 hover:bg-[#283618] px-4 py-3 rounded-xl transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>

    
  );
}
