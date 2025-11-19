import React from "react";
import Link from "next/link";
import { ArrowLeft, Target, Leaf, Globe } from "lucide-react";

export default function OurMission() {
  return (
    <div className="min-h-screen bg-[#f0ead2] text-[#283618] p-8">
      <div className="max-w-5xl mx-auto">

        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-[#283618] hover:text-white bg-[#283618]/10 hover:bg-[#283618] px-4 py-2 rounded-xl transition-all duration-200 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        {/* Page Title */}
        <h1 className="text-5xl font-extrabold text-center mb-10">
          Our Mission
        </h1>

        {/* Mission Statement */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-[#283618]/20">
          <h2 className="text-3xl font-semibold mb-4 flex items-center gap-3">
            <Target className="w-8 h-8 text-[#283618]" />
            What Drives Us
          </h2>
          <p className="text-lg leading-relaxed">
            At <strong>AgroCare</strong>, our mission is to transform the world of
            agriculture by harnessing the power of technology. We believe that
            advanced AI tools can lead to healthier plants, more efficient
            cultivation practices, and a sustainable future for generations to
            come.
          </p>
        </section>

        {/* Core Values */}
        <section className="bg-[#283618] text-[#f0ead2] rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold mb-6 flex items-center gap-3">
            <Leaf className="w-8 h-8 text-[#f0ead2]" />
            Our Core Values
          </h2>

          <ul className="space-y-6 text-lg">
            <li>
              <strong>🌱 Sustainability:</strong>  
              We aim to reduce waste, promote eco-friendly agricultural methods,
              and support a greener planet.
            </li>

            <li>
              <strong>🤝 Accessibility for Everyone:</strong>  
              Whether you’re a farmer, gardener, or beginner—we bring
              expert-level plant care to your fingertips.
            </li>

            <li>
              <strong>📚 Knowledge Empowerment:</strong>  
              We provide real-time insights, accurate diagnostics, and
              intelligent recommendations so you can grow confidently.
            </li>

            <li>
              <strong>💡 Innovation:</strong>  
              We continuously innovate with AI, machine learning, and smart
              analytics to push agriculture into the future.
            </li>
          </ul>
        </section>

        {/* Global Impact */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-[#283618]/20">
          <h2 className="text-3xl font-semibold mb-4 flex items-center gap-3">
            <Globe className="w-8 h-8 text-[#283618]" />
            Creating a Global Impact
          </h2>
          <p className="text-lg leading-relaxed">
            Our vision extends beyond fields and gardens. We strive to build a
            global network of growers who are empowered by knowledge and
            connected through intelligent technology. By supporting sustainable
            farming worldwide, we hope to create healthier ecosystems and a
            stronger future for food production.
          </p>
        </section>

        {/* Closing Quote */}
        <div className="text-center mt-12 text-xl font-semibold text-[#283618] italic">
          &quot;Empowering growth. Inspiring change.&quot;
        </div>

      </div>
    </div>
  );
}
