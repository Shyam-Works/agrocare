import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sprout, Sun, Sparkles, Heart, Droplet } from 'lucide-react';

const detailVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 10, duration: 0.8 },
  },
};

const PlantDetailsCard = ({ details, loading, plantName }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-12 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin text-green-700" />
          <p className="text-xl font-semibold text-gray-600">
            Gathering Intelligence on{" "}
            <span className="font-bold text-green-700">
              {plantName || "this species"}
            </span>
            ...
          </p>
        </div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <motion.div
      variants={detailVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-10"
    >
      <div className="bg-gradient-to-br from-green-800 to-green-950 rounded-3xl shadow-2xl p-12 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <h1 className="text-5xl font-extrabold">{plantName}</h1>
        </div>
        <p className="text-green-200 text-lg leading-relaxed mt-4 border-l-4 border-green-600 pl-4 transition-all duration-500">
          {details.description}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:items-stretch">
        <div className="lg:w-2/5 space-y-8 flex flex-col">
          {details.appearance && (
            <div className="bg-sand-50 rounded-3xl shadow-lg border border-sand-200 p-8 transform hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-sand-200">
                <div className="w-10 h-10 bg-sand-200 rounded-lg flex items-center justify-center shadow-inner">
                  <Sprout className="w-6 h-6 text-green-800" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Physical Characteristics
                </h2>
              </div>
              <div className="space-y-4">
                {details.appearance.leaves && (
                  <div className="bg-white p-3 rounded-xl border border-sand-200 transition-all duration-300 hover:border-green-600">
                    <span className="font-bold text-green-800 block mb-1 text-sm uppercase tracking-wider">
                      Leaves:
                    </span>
                    <p className="text-gray-700 leading-snug">
                      {details.appearance.leaves}
                    </p>
                  </div>
                )}
                {details.appearance.flowers && (
                  <div className="bg-white p-3 rounded-xl border border-sand-200 transition-all duration-300 hover:border-green-600">
                    <span className="font-bold text-red-700 block mb-1 text-sm uppercase tracking-wider">
                      Flowers:
                    </span>
                    <p className="text-gray-700 leading-snug">
                      {details.appearance.flowers}
                    </p>
                  </div>
                )}
                {details.appearance.growth && (
                  <div className="bg-white p-3 rounded-xl border border-sand-200 transition-all duration-300 hover:border-green-600">
                    <span className="font-bold text-amber-700 block mb-1 text-sm uppercase tracking-wider">
                      Growth:
                    </span>
                    <p className="text-gray-700 leading-snug">
                      {details.appearance.growth}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {details.ideal_conditions && (
            <div className="bg-green-50 rounded-3xl shadow-lg border border-green-200 p-8 transform hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-green-200">
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center shadow-inner">
                  <Sun className="w-6 h-6 text-amber-700" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Optimal Environment
                </h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {details.ideal_conditions}
              </p>
            </div>
          )}
          
          {details.fun_fact && (
            <div className="bg-yellow-50 rounded-3xl shadow-lg border-2 border-yellow-300 p-8 transform hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-yellow-300">
                <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center shadow-md">
                  <Sparkles className="w-6 h-6 text-yellow-800 animate-bounce-slow" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Fun Fact
                </h2>
              </div>
              <p className="text-gray-800 text-lg leading-relaxed italic">
                &ldquo;{details.fun_fact}&rdquo;
              </p>
            </div>
          )}
        </div>

        <div className="lg:w-3/5 space-y-8 flex flex-col">
          {details.why_people_love_it && details.why_people_love_it.length > 0 && (
            <div className="bg-rose-50 rounded-3xl shadow-lg border border-rose-200 p-8 transform hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-rose-200">
                <div className="w-10 h-10 bg-rose-200 rounded-lg flex items-center justify-center shadow-inner">
                  <Heart className="w-6 h-6 text-rose-700" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Why It is Loved
                </h2>
              </div>
              <ul className="space-y-3">
                {details.why_people_love_it.map((reason, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-rose-100 transition-all duration-300 hover:bg-rose-100 transform hover:scale-[1.01] hover:shadow-sm"
                  >
                    <span className="text-rose-500 text-2xl leading-none font-bold mt-1">
                      •
                    </span>
                    <span className="text-gray-700 text-base flex-1">
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {details.care_tips && details.care_tips.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 transform hover:shadow-2xl transition-shadow duration-300 flex-grow">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shadow-inner">
                  <Droplet className="w-6 h-6 text-blue-700" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Essential Care Tips
                </h2>
              </div>
              <div className="space-y-4">
                {details.care_tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl transition-all duration-300 border border-gray-100 hover:bg-blue-50 transform hover:scale-[1.01]"
                  >
                    <div className="w-2 h-full bg-blue-500 rounded-full flex-shrink-0 mt-1 animate-fade-in"></div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-gray-900 mb-1 text-lg">
                        {tip.title}
                      </h3>
                      <p className="text-gray-700 text-base leading-snug">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PlantDetailsCard;