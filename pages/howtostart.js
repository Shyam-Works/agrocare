import React, { useState, useRef } from 'react';
import { 
  Upload, Cloud, ChevronUp, ChevronDown, Send, 
  Sun, Clock, ArrowLeft, Sprout, 
  X, ShoppingBag, Loader2
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function GardenPlanner() {
  // State
  const [step, setStep] = useState('input'); // 'input' | 'loading' | 'results'
  const [size, setSize] = useState(20);
  const [cost, setCost] = useState(100);
  const [idea, setIdea] = useState('');
  
  // Image Upload State
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedCloudinaryUrl, setUploadedCloudinaryUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Data State
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 1. Handle File Selection & Upload to Cloudinary
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewUrl(URL.createObjectURL(file));
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      // Use environment variables for Cloudinary
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET); 

      try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        );
        
        if (!res.ok) throw new Error('Cloudinary upload failed');
        
        const data = await res.json();
        setUploadedCloudinaryUrl(data.secure_url);
        console.log('Uploaded:', data.secure_url);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // 2. Submit to Backend (Suggest Plants)
  const handleSubmit = async () => {
    if (!idea) {
        alert("Please explain your idea first!");
        return;
    }
    if (!uploadedCloudinaryUrl) {
        alert("Please upload a photo of your garden first!");
        return;
    }

    setStep('loading');
    
    try {
      const res = await fetch('/api/plan-garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest',
          imageUrl: uploadedCloudinaryUrl,
          size,
          cost,
          idea
        })
      });

      if (!res.ok) throw new Error('Failed to fetch suggestions');

      const data = await res.json();
      setSuggestions(data); // Expecting array of 4 plants
      setStep('results');

    } catch (error) {
      console.error("Analysis error:", error);
      alert("Something went wrong while analyzing. Please try again.");
      setStep('input');
    }
  };

  // 3. Get Details for Selected Plant
  const handleSelectPlant = async (plant) => {
    if (selectedPlant?.common_name === plant.common_name) return; // Prevent re-fetch
    
    setSelectedPlant(plant);
    setLoadingDetails(true);
    setDetails(null);
    
    // Smooth scroll to details area
    setTimeout(() => {
      document.getElementById('plant-details-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const res = await fetch('/api/plan-garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'detail',
          selectedPlantName: plant.common_name
        })
      });

      if (!res.ok) throw new Error('Failed to fetch details');

      const data = await res.json();
      setDetails(data);

    } catch (error) {
      console.error("Detail error:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (

    <div className="min-h-screen bg-white font-sans text-slate-800 pb-20">
        <Navbar />
      {/* Inject Custom Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Quicksand:wght@300;400;500;600;700&display=swap');
          .font-cursive { font-family: 'Pacifico', cursive; }
          .font-body { font-family: 'Quicksand', sans-serif; }
        `}
      </style>

      {/* --- Header --- */}
      <div 
        className="relative w-full h-[40vh] flex flex-col items-center justify-center text-center px-4 mb-8 bg-cover bg-center"
        style={{ backgroundImage: "url('/howtostart.png')" }}
      >
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0" />

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl text-white mb-2 font-body font-bold tracking-wide">
            Turn <span className="font-cursive text-[#D4F7D4]">Passion</span> into <span className="font-cursive text-[#D4F7D4]">Produce</span>
          </h1>
          <p className="text-[#E0F2E0] text-lg font-medium font-body">
            Grow, care, track, and trade
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        
        {/* --- STEP 1: INPUTS --- */}
        {step === 'input' && (
           <div className="animate-fade-in-up">
            <h2 className="text-[#2D5A27] text-2xl font-bold mb-6 font-body">Plan your perfect garden</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Upload Card */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 h-48 relative overflow-hidden group">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                />
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white z-10">
                            <Loader2 className="animate-spin mr-2" /> Uploading...
                        </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Upload className="mb-2" />
                    <span>Upload a photo</span>
                  </div>
                )}
              </div>

              {/* Size Card */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 h-48 flex flex-col items-center justify-center">
                 <div className="flex items-center gap-4 mb-2">
                    <span className="text-5xl font-bold text-slate-800">{size}</span>
                    <div className="flex flex-col">
                       <button onClick={() => setSize(s=>s+1)} className="p-1 hover:bg-slate-100 rounded"><ChevronUp size={20}/></button>
                       <button onClick={() => setSize(s=>Math.max(1, s-1))} className="p-1 hover:bg-slate-100 rounded"><ChevronDown size={20}/></button>
                    </div>
                 </div>
                 <span className="text-slate-500">Estimated Size (m²)</span>
              </div>

              {/* Cost Card */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 h-48 flex flex-col items-center justify-center p-6">
                 <span className="text-5xl font-bold text-slate-800 mb-2">${cost}</span>
                 <span className="text-slate-500">Estimated cost</span>
                 <input type="range" min="10" max="1000" value={cost} onChange={(e)=>setCost(e.target.value)} className="w-full mt-4 accent-green-600" />
              </div>
            </div>

            {/* Idea Input */}
            <div>
               <label className="block text-slate-700 font-bold mb-2">Explain your idea</label>
               <div className="flex gap-2">
                 <input 
                    type="text" 
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="...flower to decorate backyard and get some fresh vegetables"
                    className="flex-1 p-4 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-600"
                 />
                 <button 
                    onClick={handleSubmit}
                    disabled={isUploading || !uploadedCloudinaryUrl}
                    className={`p-4 rounded-xl text-white transition-colors flex items-center justify-center
                        ${(isUploading || !uploadedCloudinaryUrl) ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#2E5B2D] hover:bg-[#244623]'}
                    `}
                 >
                    {isUploading ? <Loader2 className="animate-spin" /> : <Send />}
                 </button>
               </div>
               {!uploadedCloudinaryUrl && <p className="text-xs text-red-400 mt-2 ml-1">* Please upload an image first</p>}
            </div>
          </div>
        )}

        {/* --- STEP 2: LOADING --- */}
        {step === 'loading' && (
           <div className="py-20 flex flex-col items-center justify-center text-center animate-pulse">
              <Sprout className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-slate-800">Cultivating Ideas...</h2>
              <p className="text-slate-500">AgroCare AI is analyzing your soil and preferences.</p>
           </div>
        )}

        {/* --- STEP 3: RESULTS --- */}
        {step === 'results' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Suggestions</h3>
                    <p className="text-slate-500">Select what you want to grow?</p>
                </div>
                <button onClick={() => setStep('input')} className="text-slate-500 hover:text-green-600 flex items-center text-sm">
                    <ArrowLeft className="w-4 h-4 mr-1" /> New Plan
                </button>
            </div>

            {/* Suggestions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
               {suggestions.map((plant, idx) => (
                 <div 
                    key={idx}
                    onClick={() => handleSelectPlant(plant)}
                    className={`bg-white rounded-xl p-4 shadow-sm border-2 cursor-pointer transition-all hover:shadow-lg
                      ${selectedPlant?.common_name === plant.common_name ? 'border-green-500 ring-2 ring-green-100' : 'border-transparent hover:border-green-200'}
                    `}
                 >
                    <div className="h-32 w-full flex items-center justify-center mb-4 bg-slate-50 rounded-lg overflow-hidden">
                       <img 
                          src={plant.image_url} 
                          alt={plant.common_name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop
                            e.target.src = 'https://placehold.co/400x300?text=No+Image';
                          }} 
                        />
                    </div>
                    <h4 className="text-center font-bold text-lg text-slate-800 mb-3">{plant.common_name}</h4>
                    
                    <div className="space-y-2 text-xs">
                       <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">Care</span>
                          <span className={`px-3 py-1 rounded text-white font-bold
                            ${plant.care_level === 'High' ? 'bg-[#1B4332]' : 
                              plant.care_level === 'Moderate' ? 'bg-[#2D6A4F]' : 
                              'bg-[#40916C]'}
                          `}>
                            {plant.care_level}
                          </span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">Sun</span>
                          <span className="bg-[#E69F00] text-white px-3 py-1 rounded font-bold text-[10px]">
                             {plant.sun_requirement}
                          </span>
                       </div>
                       <div className="flex items-center justify-center gap-1 text-slate-500 pt-2">
                          <Clock size={14} />
                          <span>{plant.days_to_harvest}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {/* --- DETAILS SECTION --- */}
            {selectedPlant && (
              <div id="plant-details-section" className="animate-slide-up">
                 <h2 className="text-2xl font-bold text-[#DDA15E] mb-6 flex items-center gap-2">
                    Plant: {selectedPlant.common_name}
                    {loadingDetails && <Loader2 className="animate-spin w-5 h-5 text-slate-400" />}
                 </h2>
                 
                 {loadingDetails ? (
                    <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                        Generating specific grow guide for {selectedPlant.common_name}...
                    </div>
                 ) : details && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                       
                       {/* BLUE BOX: WATERING */}
                       <div className="bg-[#E8F1F8] p-6 rounded-lg border-l-4 border-[#2B6CB0]">
                          <h3 className="text-[#2B6CB0] font-bold text-lg mb-3">Watering</h3>
                          <div className="space-y-2 text-sm text-[#2C5282]">
                             <p><span className="font-bold">Frequency:</span> {details.watering.frequency}</p>
                             <p><span className="font-bold">Tip:</span> {details.watering.tip}</p>
                          </div>
                       </div>

                       {/* ORANGE BOX: FERTILIZER */}
                       <div className="bg-[#FDF2E3] p-6 rounded-lg border-l-4 border-[#9C6428]">
                          <h3 className="text-[#9C6428] font-bold text-lg mb-3">Fertilizer</h3>
                          <div className="space-y-2 text-sm text-[#744210]">
                             <p><span className="font-bold">Type:</span> {details.fertilizer.type}</p>
                             <p><span className="font-bold">Frequency:</span> {details.fertilizer.frequency}</p>
                             <p><span className="font-bold">Tip:</span> {details.fertilizer.tip}</p>
                          </div>
                       </div>

                       {/* GREEN BOX: PESTS */}
                       <div className="bg-[#E2E8E4] p-6 rounded-lg border-l-4 border-[#2F4F38]">
                          <h3 className="text-[#2F4F38] font-bold text-lg mb-3">Recommended Pest</h3>
                          <div className="space-y-2 text-sm text-[#273C2C]">
                             <p><span className="font-bold">Fungicide:</span> {details.pest.fungicide}</p>
                             <p><span className="font-bold">Insecticide:</span> {details.pest.insecticide}</p>
                             <p><span className="font-bold">Tip:</span> {details.pest.tip}</p>
                          </div>
                       </div>

                       {/* YELLOW BOX: SEED INFO */}
                       <div className="bg-[#FFFBE5] p-6 rounded-lg border-l-4 border-[#746C26]">
                          <h3 className="text-[#746C26] font-bold text-lg mb-3">Seed Information</h3>
                          <div className="space-y-2 text-sm text-[#5F581D]">
                             <p><span className="font-bold">Type:</span> {details.seed.type}</p>
                             <p><span className="font-bold">Depth:</span> {details.seed.depth}</p>
                             <p><span className="font-bold">Spacing:</span> {details.seed.spacing}</p>
                          </div>
                       </div>
                    </div>
                 )}

                 {details && !loadingDetails && (
                    <>
                       {/* Cyan Tip Box */}
                       <div className="bg-[#E6FFFA] p-4 rounded-lg text-[#234E52] text-sm font-medium mb-6 flex items-start gap-2 border border-[#B2F5EA]">
                          <div className="mt-1 w-2 h-2 rounded-full bg-[#38B2AC] flex-shrink-0" />
                          {details.support_tip}
                       </div>

                       <div className="text-sm font-bold text-slate-700 mb-8 space-y-1">
                          <p>Season: <span className="font-normal">{details.season}</span></p>
                          <p>Spacing: <span className="font-normal">{details.spacing}</span></p>
                       </div>

                       {/* Essential Equipment */}
                       <div className="border-t pt-8">
                          <h3 className="text-xl font-bold text-[#2D5A27] mb-4 border-b-2 border-[#2D5A27] inline-block pb-1">Essential Equipment</h3>
                          
                          <div className="text-sm space-y-3">
                             <p><span className="font-bold">Canadian Tire:</span> watering can, soil, fertilizer, etc.</p>
                             <p><span className="font-bold">Home Depot Canada:</span> {details.equipment.join(', ')}</p>
                             
                             <div className="flex items-center gap-2 mt-4 text-[#D69E2E] font-bold">
                                <span className="bg-[#D69E2E] text-white px-2 py-0.5 rounded text-xs">Tip</span>
                                <span>Find your neccessary products on AgroCare marketplace for more saving</span>
                             </div>
                          </div>
                       </div>
                    </>
                 )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}