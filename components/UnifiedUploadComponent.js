

import React, { useState } from "react";
import {
  Upload,
  Camera,
  X,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

const UnifiedUploadComponent = ({ onImageSelect, onClear, imagePreview }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "Unable to access camera. Please check permissions or upload a file instead."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });

          const previewUrl = URL.createObjectURL(blob);
          onImageSelect(file, previewUrl);
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onImageSelect(file, previewUrl);
    }
  };

  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-4xl max-h-4xl">
          <button
            onClick={stopCamera}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white backdrop-blur-sm hover:bg-opacity-30 transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full h-full flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain rounded-xl shadow-2xl"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            />

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 border-4 border-white bg-green-800 rounded-full flex items-center justify-center shadow-xl hover:bg-green-700 transition-colors duration-300"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>

            <div className="absolute top-4 left-4 bg-green-950 bg-opacity-70 rounded-full px-4 py-2 backdrop-blur-sm">
              <p className="text-white text-sm font-medium">
                Center the species and tap the capture button
              </p>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    );
  }

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

          <div className="border border-gray-200 rounded-2xl  overflow-hidden bg-white">
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center px-6 py-10 bg-sand-50 hover:bg-sand-100 cursor-pointer transition-colors"
              >
                <div className="w-14 h-14 bg-sand-200 rounded-full flex items-center justify-center mb-4 border border-sand-300 transform hover:scale-110 transition-transform duration-300">
                  <Upload className="w-7 h-7 text-green-800" />
                </div>
                <div className="text-center">
                  <p className="text-gray-800 font-bold mb-1">
                    Upload from Device
                  </p>
                  <p className="text-gray-500 text-sm">
                    Choose from gallery or files
                  </p>
                </div>
              </label>

              <button
                onClick={startCamera}
                className="flex flex-col items-center px-6 py-10 bg-sand-50 hover:bg-sand-100 transition-colors"
              >
                <div className="w-14 h-14 bg-sand-200 rounded-full flex items-center justify-center mb-4 border border-sand-300 transform hover:scale-110 transition-transform duration-300">
                  <Camera className="w-7 h-7 text-green-800" />
                </div>
                <div className="text-center">
                  <p className="text-gray-800 font-bold mb-1">Take Photo</p>
                  <p className="text-gray-500 text-sm">
                    Use camera to capture instantly
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            src={imagePreview}
            alt="Selected plant"
            className="w-full max-w-sm h-64 mx-auto rounded-3xl shadow-xl border-4 border-green-700 object-cover transform scale-100 hover:scale-[1.01] transition-transform duration-300"
          />
          <button
            onClick={onClear}
            className="absolute -top-3 -right-3 w-10 h-10 bg-white border-2 border-green-600 text-green-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UnifiedUploadComponent;