import React from 'react';
import { Leaf, Bug, BarChart3, Store, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
       <Navbar />
      {/* Hero Section */}
      <section className="relative h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/hero-part1.png)'}}>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-0"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl lg:text-6xl font-bold text-black leading-tight mb-6">
              Smart Solutions<br/>
              For Modern Farming
            </h1>
            <p className="text-xl text-white leading-relaxed mb-8 max-w-lg">
              Empowering farmers with AI-driven tools for crop management and disease identification
            </p>
            
            <button className="group bg-white text-green-800 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-green-800 mb-6">
              Whether You are a Farmer,<br/>
              Nature Lover, or Backyard Grower
            </h2>
          </div>
          
          <div className="space-y-8 text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
            <p>
              At AgroCare, we are passionate about empowering farmers, gardeners, and nature lovers with smart technology 
              that makes plant care simple and effective.
            </p>
            
            <p>
              Our mission is to bridge the gap between modern AI tools and traditional farming practices, helping people grow 
              healthier crops, prevent diseases early, and make informed decisions.
            </p>
            
            <p>
              Whether you manage acres of farmland or a few pots on your balcony, AgroCare is here to support your green 
              journey — from seed to harvest.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold pt-4">
              <Leaf className="w-6 h-6" />
              <span className="text-xl">Growing smarter. Farming better. Together.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-green-800 text-center mb-16">Our Services</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Plant Identification */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
                Plant<br/>
                Identification
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Identifying plants accurately is the first step to successful farming and gardening. Our AI-powered tool helps you 
                quickly identify any plant, whether it is s a common crop or a rare herb.
              </p>
            </div>

            {/* Disease Diagnosis */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Bug className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
                Disease<br/>
                Diagnosis
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Detect diseases before they spread. With just a photo, our AI can identify common crop 
                diseases and alert you to early signs of trouble. Prevent loss, protect your harvest, and act 
                fast with science-backed solutions.
              </p>
            </div>

            {/* Dashboard */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-4 text-center">Dashboard</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Track daily plant health, view real-time weather updates, and get AI-powered care 
                suggestions. Monitor your personal plant collection and receive timely alerts to keep 
                every plant thriving.
              </p>
            </div>

            {/* Marketplace */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Store className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-4 text-center">Marketplace</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Find trusted tools, seeds, fertilizers, and plant care products all in one place. 
                Curated by experts and tried by fellow farmers, our marketplace ensures you get 
                quality, affordable farming essentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="relative py-24 bg-cover bg-center bg-no-repeat"
        style={{backgroundImage: 'url(/hero-part2.png)'}}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Enhancing Crop Health<br/>
            and Productivity
          </h2>
          <p className="text-xl text-white mb-10 leading-relaxed max-w-2xl mx-auto">
            Discover how AgroCare can help you optimize your practice and achieve better yields
          </p>
          
          <button className="group bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto">
            Learn More
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;