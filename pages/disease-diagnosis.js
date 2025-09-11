import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, Camera, Loader2, AlertTriangle, Info, X, Activity, Droplets, Sun, Zap, Leaf, Shield, Clock, Plus, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';

// Updated Unified Upload Component for Disease Diagnosis
const UnifiedUploadComponent = ({ onImageSelect, onClear, imagePreview }) => {
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);

    // Start camera
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            setStream(mediaStream);
            setShowCamera(true);

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions or upload a file instead.');
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    // Capture photo
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `disease-capture-${Date.now()}.jpg`, {
                    type: 'image/jpeg'
                });

                const previewUrl = URL.createObjectURL(blob);
                onImageSelect(file, previewUrl);
                stopCamera();
            }
        }, 'image/jpeg', 0.9);
    };

    // Handle file input
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            onImageSelect(file, previewUrl);
        }
    };

    // Cleanup camera on unmount
    React.useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Camera Modal
    if (showCamera) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                <div className="relative w-full h-full max-w-4xl max-h-4xl">
                    <button
                        onClick={stopCamera}
                        className="absolute top-4 right-4 z-10 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover rounded-lg"
                            style={{ maxHeight: 'calc(100vh - 120px)' }}
                        />

                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                            <button
                                onClick={capturePhoto}
                                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                            >
                                <Camera className="w-8 h-8 text-gray-700" />
                            </button>
                        </div>

                        <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
                            <p className="text-white text-sm">Focus on diseased areas and tap camera button</p>
                        </div>
                    </div>

                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </div>
        );
    }

    // Upload interface
    return (
        <div className="relative">
            {!imagePreview ? (
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                    />

                    <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white">
                        <div className="grid md:grid-cols-2">
                            <label
                                htmlFor="image-upload"
                                className="flex flex-col items-center px-4 py-6 md:px-6 md:py-8 hover:bg-red-50 cursor-pointer transition-colors border-b md:border-b-0 md:border-r border-gray-200"
                            >
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <Upload className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-700 font-medium mb-1">Upload from Device</p>
                                    <p className="text-gray-400 text-sm">Choose from gallery or files</p>
                                </div>
                            </label>

                            <button
                                onClick={startCamera}
                                className="flex flex-col items-center px-4 py-6 md:px-6 md:py-8 hover:bg-red-50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <Camera className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-700 font-medium mb-1">Take Photo</p>
                                    <p className="text-gray-400 text-sm">Capture diseased plant instantly</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white">
                    <div className="relative w-full aspect-[2/1] overflow-hidden">
                        <img
                            src={imagePreview}
                            alt="Plant for diagnosis"
                            className="absolute inset-0 w-full h-full object-contain"
                        />
                         <button
                            onClick={onClear}
                            className="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-90 rounded-full shadow-lg flex items-center justify-center hover:bg-opacity-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                    
                </div>
            )}
        </div>
    );
};

// New component for the individual diagnosis card
const DiagnosisCard = ({ image, name, probability }) => {
    // Get severity label based on probability
    const getSeverityLabel = (prob) => {
        if (prob >= 0.7) return 'High';
        if (prob >= 0.4) return 'Moderate';
        return 'Mild';
    };

    // Get color class for the severity tag
    const getSeverityColor = (prob) => {
        if (prob >= 0.7) return 'bg-red-500';
        if (prob >= 0.4) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const severityLabel = getSeverityLabel(probability);
    const severityColor = getSeverityColor(probability);
    const percentage = Math.round(probability * 100);

    return (
        <div className="flex items-center space-x-4 p-4 border-b border-gray-200 last:border-b-0">
            {/* Image container with fixed size */}
            <div className="w-24 h-24 flex-shrink-0 border border-gray-300 rounded-xl overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Disease Name:</p>
                <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Match Confidence</span>
                        <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${severityColor}`}>
                            {severityLabel}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${severityColor}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    <p className="text-right text-xs text-gray-500 mt-1">{percentage}%</p>
                </div>
            </div>
        </div>
    );
};

// Treatment Recommendation component
const TreatmentCard = ({ recommendations }) => {
    const listItems = [
        { text: 'Apply cool, damp cloth to affected area for 10-15 minutes', icon: <Droplets className="w-5 h-5 text-green-600" /> },
        { text: 'Avoid scratching or rubbing the affected area', icon: <X className="w-5 h-5 text-red-600" /> },
        { text: 'Consider over-the-counter antihistamine (e.g., Benadryl)', icon: <Info className="w-5 h-5 text-orange-600" /> },
        { text: 'Monitor symptoms for 24-48 hours for improvement', icon: <Clock className="w-5 h-5 text-purple-600" /> },
        { text: 'Use gentle, fragrance-free moisturizer', icon: <Zap className="w-5 h-5 text-blue-600" /> }
    ];

    return (
        <div className="bg-orange-50 rounded-2xl p-6 h-full flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold text-orange-800 mb-4">Treatment Recommendations</h2>
                <ul className="space-y-4">
                    {listItems.map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                            <div className="mt-1 flex-shrink-0">{item.icon}</div>
                            <p className="text-gray-700">{item.text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// Quick Actions component
const QuickActions = () => {
    return (
        <div className="bg-orange-50 rounded-2xl p-6 mt-6">
            <h2 className="text-xl font-bold text-orange-800 mb-4">Quick Actions</h2>
            <div className="flex space-x-4">
                <button className="flex-1 bg-white border border-gray-300 rounded-lg py-3 flex items-center justify-center space-x-2 text-gray-700 hover:bg-gray-100 transition-colors">
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Email Report</span>
                </button>
                <button className="flex-1 bg-white border border-gray-300 rounded-lg py-3 flex items-center justify-center space-x-2 text-gray-700 hover:bg-gray-100 transition-colors">
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add to Dashboard</span>
                </button>
            </div>
        </div>
    );
};

const DiseaseDiagnosisPage = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [diagnosing, setDiagnosing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Get user info on component mount
useEffect(() => {
  fetch("/api/auth/session")
    .then((res) => res.json())
    .then((data) => {
      console.log("Session response:", data); // Debug log
      
      if (data && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.first_name || data.user.name?.split(' ')[0],
          last_name: data.user.last_name || data.user.name?.split(' ').slice(1).join(' '),
          profile_image_url: data.user.profile_image_url || data.user.image,
          location: data.user.location
        });
      }
    })
    .catch((error) => {
      console.error("Auth error:", error);
    });
}, []);

    const handleImageSelect = (file, previewUrl) => {
        setSelectedImage(file);
        setImagePreview(previewUrl);
        setResult(null);
        setError(null);
    };

    // Upload image
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "plant");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.secure_url) {
                return data.secure_url;
            } else {
                throw new Error("Image upload failed");
            }
        } catch (error) {
            throw new Error("Image upload failed: " + error.message);
        }
    };

    // Handle disease diagnosis
    const handleDiagnoseDisease = async () => {
        if (!selectedImage) return;

        if (!user) {
            setError("Please log in to diagnose plant diseases");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const imageUrl = await uploadImage(selectedImage);

            setUploading(false);
            setDiagnosing(true);

            // Call your disease diagnosis API
            const response = await fetch('/api/disease-diagnosis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    image_url: imageUrl
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Disease diagnosis failed');
            }

            const diagnosisResult = await response.json();
            setResult(diagnosisResult);
            console.log('Diagnosis Result:', diagnosisResult);
        } catch (error) {
            setError(error.message);
        } finally {
            setUploading(false);
            setDiagnosing(false);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        <span className="text-red-600">Disease</span> Diagnosis
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Get instant, accurate plant disease identification and treatment recommendations
                        powered by AI technology
                    </p>
                </div>

                {/* Main Upload Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
                    {/* Header with steps - Hidden on mobile */}
                    <div className="bg-gradient-to-r from-orange-200 to-orange-50 p-6 border-b border-gray-200 hidden sm:block">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Plant Photo</h2>
                        <div className="flex items-center justify-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                                <span className="text-sm font-medium text-gray-700">Upload plant photo</span>
                            </div>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                <span className="text-sm font-medium text-gray-700">AI analyzes image</span>
                            </div>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                                <span className="text-sm font-medium text-gray-700">Get diagnosis & tips</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Login Required Message */}
                        {!user && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <div className="flex items-center space-x-3">
                                    <Info className="w-5 h-5 text-amber-600" />
                                    <p className="text-amber-700 text-sm">Please log in to diagnose plant diseases and access treatment recommendations.</p>
                                </div>
                            </div>
                        )}

                        {/* Upload Component */}
                        <UnifiedUploadComponent
                            onImageSelect={handleImageSelect}
                            onClear={clearImage}
                            imagePreview={imagePreview}
                        />

                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center justify-center space-x-4">
                            <button
                                onClick={handleDiagnoseDisease}
                                disabled={uploading || diagnosing || !selectedImage || !user}
                                className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                {uploading || diagnosing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>{uploading ? 'Uploading...' : 'Analyzing...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Activity className="w-5 h-5" />
                                        <span>Diagnose</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={clearImage}
                                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Results Section - New Layout */}
                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Possible Diagnosis - Left Column */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Possible Diagnosis</h2>
                            <div className="space-y-4">
                                {result.disease?.suggestions?.slice(0, 3).map((disease, index) => (
                                    <DiagnosisCard
                                        key={disease.id || index}
                                        image={disease.similar_images?.[0]?.url_small || imagePreview}
                                        name={disease.name}
                                        probability={disease.probability}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Treatment Recommendations & Quick Actions - Right Column */}
                        <div>
                            <TreatmentCard />
                            <QuickActions />
                        </div>
                    </div>
                )}

                {/* Tips Section */}
                {!result && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center space-x-2">
                            <Info className="w-5 h-5" />
                            <span>Tips for Better Disease Diagnosis</span>
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-700">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>Focus on diseased or affected areas</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>Include leaves, stems, or fruits showing symptoms</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>Take multiple angles if possible</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>Ensure good lighting and sharp focus</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>Avoid heavily cluttered backgrounds</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>Use high-resolution images for better analysis</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default DiseaseDiagnosisPage;