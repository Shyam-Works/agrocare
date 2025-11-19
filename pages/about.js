import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutUs() {
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

        {/* Header */}
        <h1 className="text-5xl font-extrabold text-center mb-8">
          About AgroCare
        </h1>

        {/* Intro Section */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-[#283618]/20">
          <h2 className="text-3xl font-semibold mb-4">Who We Are</h2>
          <p className="text-lg leading-relaxed">
            AgroCare is an innovative agricultural intelligence platform built to empower
            farmers, gardeners, and plant enthusiasts. With advanced AI tools, real-time
            analysis, and precision insights, we make plant care simple, smart, and
            accessible for everyone.
          </p>
        </section>

        {/* Mission Section */}
        <section className="bg-[#283618] text-[#f0ead2] rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg leading-relaxed">
            Our mission is to revolutionize agriculture by integrating technology with
            nature. We aim to reduce crop loss, improve plant health, and provide
            data-driven solutions that help people grow better, healthier plants.
          </p>
        </section>

        {/* What We Offer */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-[#283618]/20">
          <h2 className="text-3xl font-semibold mb-6 text-[#283618]">What We Offer</h2>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🌱</span>
              <p>
                <strong>Plant Identification:</strong> Instantly identify plant species with AI-powered recognition.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🦠</span>
              <p>
                <strong>Disease Diagnosis:</strong> Detect plant diseases early and get expert-backed treatment suggestions.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <p>
                <strong>Smart Dashboard:</strong> Manage your crops, monitor insights, and track plant health all in one place.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🛒</span>
              <p>
                <strong>Curated Marketplace:</strong> Buy essential tools, fertilizers, and plant supplies recommended for your needs.
              </p>
            </li>
          </ul>
        </section>

        {/* Vision Section */}
        <section className="bg-[#283618] text-[#f0ead2] rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold mb-4">Our Vision</h2>
          <p className="text-lg leading-relaxed">
            To create a future where technology and agriculture grow hand in hand, ensuring
            sustainable farming, reduced waste, and healthier ecosystems around the world.
          </p>
        </section>

        {/* Footer Quote */}
        <div className="text-center mt-12 text-xl font-semibold text-[#283618] italic">
          &quot;Growing smarter, together.&quot;
        </div>

      </div>
    </div>
  );
}
