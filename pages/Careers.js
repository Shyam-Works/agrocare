import React from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Users, Star, Heart } from "lucide-react";

export default function Careers() {
  return (
    <div className="min-h-screen bg-[#f0ead2] text-[#283618] p-8">
      <div className="max-w-6xl mx-auto">
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
          Careers at AgroCare
        </h1>
        <p className="text-center text-lg max-w-3xl mx-auto opacity-90 mb-12">
          Join a team that is revolutionizing agriculture with AI-driven
          innovation. At AgroCare, we’re shaping the future of plant health,
          sustainable farming, and smart agricultural intelligence.
        </p>

        {/* Culture Section */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-[#283618]/20">
          <h2 className="text-3xl font-semibold mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-[#283618]" />
            Life at AgroCare
          </h2>
          <p className="text-lg leading-relaxed mb-4">
            We believe that innovation blooms where people feel inspired,
            supported, and empowered. At AgroCare, every voice is heard, every
            idea matters, and every contribution helps shape a greener, smarter
            future.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-lg">
            <li>Collaborative and uplifting work environment</li>
            <li>Opportunities to work with cutting-edge AI technologies</li>
            <li>Meaningful work that impacts global sustainability</li>
            <li>Flexibility for learning, creativity, and innovation</li>
          </ul>
        </section>

        {/* Job Openings */}
        <section className="bg-[#283618] text-[#f0ead2] rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold mb-6 flex items-center gap-3">
            <Briefcase className="w-8 h-8" />
            Current Openings
          </h2>

          <div className="space-y-6">
            {/* Job 1 */}
            <div className="bg-[#f0ead2] text-[#283618] border border-[#283618]/30 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-2">
                Front-End Developer Intern
              </h3>
              <p className="opacity-90 mb-4">
                Help us build beautiful, fast, and interactive interfaces that
                power our AI-driven agriculture tools.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-lg">
                <li>Experience with React / Next.js</li>
                <li>Strong understanding of UI/UX principles</li>
                <li>Basic knowledge of Tailwind CSS</li>
              </ul>
              <button className="mt-4 px-4 py-2 bg-[#283618] text-[#f0ead2] rounded-lg hover:bg-[#1e2a12] transition-all">
                Apply Now
              </button>
            </div>

            {/* Job 2 */}
            <div className="bg-[#f0ead2] text-[#283618] border border-[#283618]/30 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-2">
                AI / ML Research Assistant
              </h3>
              <p className="opacity-90 mb-4">
                Work on plant disease detection, image classification, and
                agricultural analytics using AI models.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-lg">
                <li>Basic understanding of Python & TensorFlow/PyTorch</li>
                <li>Knowledge of CNNs and image processing</li>
                <li>Strong analytical mindset</li>
              </ul>
              <button className="mt-4 px-4 py-2 bg-[#283618] text-[#f0ead2] rounded-lg hover:bg-[#1e2a12] transition-all">
                Apply Now
              </button>
            </div>

            {/* Job 3 */}
            <div className="bg-[#f0ead2] text-[#283618] border border-[#283618]/30 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-2">
                Content Writer – Agriculture
              </h3>
              <p className="opacity-90 mb-4">
                Create educational content that empowers plant lovers and
                farmers to grow healthier, disease-free crops.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-lg">
                <li>Strong writing and research skills</li>
                <li>Passion for agriculture, gardening, or plant science</li>
                <li>Ability to simplify complex topics</li>
              </ul>
              <button className="mt-4 px-4 py-2 bg-[#283618] text-[#f0ead2] rounded-lg hover:bg-[#1e2a12] transition-all">
                Apply Now
              </button>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-[#283618]/20">
          <h2 className="text-3xl font-semibold mb-6 flex items-center gap-3">
            <Star className="w-8 h-8 text-[#283618]" />
            Why Join Us?
          </h2>

          <ul className="space-y-4 text-lg list-disc pl-6">
            <li>
              Join a purpose-driven team focused on transforming agriculture.
            </li>
            <li>
              Shape meaningful innovations that impact global farming
              communities.
            </li>
            <li>
              Advance your career in cutting-edge tech, AI, and product
              development.
            </li>
            <li>
              Collaborate with experts in agriculture, plant science, and
              machine learning.
            </li>
            <li>
              Benefit from flexible schedules ideal for students and early
              professionals.
            </li>
          </ul>
        </section>

        {/* Final Section */}
        <div className="text-center text-xl font-semibold italic mt-12">
          &quot;Grow your career while helping the world grow too.&quot;
        </div>
      </div>
    </div>
  );
}
