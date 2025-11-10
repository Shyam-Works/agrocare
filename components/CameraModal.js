import React from "react";
import { X, Camera } from "lucide-react";

const CameraModal = ({ videoRef, canvasRef, onCapture, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-4xl max-h-4xl">
        <button
          onClick={onClose}
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
            style={{ maxHeight: "calc(100vh - 120px)" }}
          />

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <button
              onClick={onCapture}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
            >
              <Camera className="w-8 h-8 text-gray-700" />
            </button>
          </div>

          <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
            <p className="text-white text-sm">
              Focus on diseased areas and tap camera button
            </p>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraModal;