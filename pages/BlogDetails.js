import React from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Home } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "How AI Is Transforming Modern Agriculture",
    date: "November 2025",
    readTime: "5 min read",
    content: `
Artificial Intelligence has revolutionized nearly every industry—and agriculture is no exception. 
From computer vision that detects diseases early to machine learning models predicting soil quality, 
AI-driven agriculture is helping farmers increase crop yields, reduce resource waste, and move toward sustainable agriculture.

At AgroCare, we leverage advanced deep-learning models to monitor plant health, identify diseases, and provide actionable insights.

AI transforms farming by:
• Identifying diseases with image recognition  
• Predicting optimal watering schedules  
• Monitoring soil health with smart sensors  
• Reducing fertilizer waste with precision farming  

The future of agriculture is smart, efficient, and fully AI-powered.
    `,
  },
  {
    id: 2,
    title: "Top 10 Early Signs of Plant Diseases",
    date: "November 2025",
    readTime: "4 min read",
    content: `
Catching plant diseases early is the key to preventing widespread crop loss. 
Most plant diseases start with minor symptoms that often go unnoticed.

Here are early signs to watch for:
• Yellowing or curling leaves  
• Unusual spots or discoloration  
• Slow or stunted growth  
• Powdery layers or white patches  
• Wilting despite proper watering  

AgroCare’s disease detection tool uses AI to pinpoint diseases with high accuracy—helping farmers respond before it’s too late.
    `,
  },
  {
    id: 3,
    title: "Building AgroCare: The Future of Smart Plant Diagnosis",
    date: "October 2025",
    readTime: "6 min read",
    content: `
AgroCare was built with one mission: make plant care intelligent and accessible for everyone.

Our platform combines:
• Deep Learning models trained on thousands of plant images  
• Real-time data analytics  
• Weather integrations  
• Personalized treatment recommendations  

AgroCare is shaping the future of modern agriculture—one plant at a time.
    `,
  },
  {
    id: 4,
    title: "Why Soil Health Determines 80% of Your Crop Success",
    date: "September 2025",
    readTime: "7 min read",
    content: `
Healthy soil equals healthy plants. Soil affects nutrient levels, water retention, and disease resistance.

Critical soil factors:
• pH levels  
• Organic matter  
• Moisture balance  
• Nutrient density  

Smart monitoring tools help farmers understand and optimize soil conditions in real-time.
    `,
  },
  {
    id: 5,
    title: "Smart Irrigation: Saving Water with Precision Technology",
    date: "August 2025",
    readTime: "5 min read",
    content: `
Smart irrigation systems use sensors and AI to regulate water usage, ensuring plants get exactly what they need.

Benefits include:
• 40–70% less water usage  
• Improved crop health  
• Lower utility costs  
• Reduced environmental impact  

AgroCare integrates perfectly with smart irrigation tools to keep your plants at peak health.
    `,
  },
  {
    id: 6,
    title: "The Rise of Urban Farming & How Tech Is Leading the Way",
    date: "July 2025",
    readTime: "6 min read",
    content: `
Urban farming is becoming the future of food sustainability. With limited land and growing populations, 
cities are adopting tech-driven solutions like vertical farms, hydroponics, and AI-based crop monitoring.

Urban farming is:
• Space-efficient  
• Environmentally friendly  
• Scalable  
• Perfect for smart automation  

AgroCare supports urban farmers with tools for monitoring indoor plant health.
    `,
  },
];

export default function BlogDetails() {
  const router = useRouter();
  const { id } = router.query;

  const post = blogPosts.find((blog) => blog.id === Number(id));

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f0ead2] flex items-center justify-center text-[#283618] text-2xl">
        Blog not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ead2] p-8 text-[#283618]">
      <div className="max-w-4xl mx-auto">

        {/* Navigation Buttons */}
        <div className="flex justify-between mb-8">
          <button
            onClick={() => router.push("/blog")}
            className="flex items-center gap-2 text-[#283618] font-semibold hover:underline"
          >
            <ArrowLeft size={20} />
            Back to Blogs
          </button>

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#283618] font-semibold hover:underline"
          >
            <Home size={20} />
            Go Home
          </button>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold mb-4">{post.title}</h1>

        {/* Metadata */}
        <div className="text-[#283618]/70 mb-6">
          {post.date} • {post.readTime}
        </div>

        {/* Content Box */}
        <div className="bg-white border border-[#283618]/20 rounded-2xl shadow-lg p-8 text-lg leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </div>
    </div>
  );
}
