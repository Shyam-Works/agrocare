import React from "react";
import { Upload, Camera } from "lucide-react";

const ImageUploadButtons = ({ onFileSelect, onCameraClick }) => {
  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
        id="image-upload"
      />

      <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white">
        <div className="grid md:grid-cols-2">
          {/* Upload from Device */}
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center px-4 py-6 md:px-6 md:py-8 cursor-pointer transition-transform duration-300 border-b md:border-b-0 md:border-r border-gray-200"
          >
            <div className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110">
              <Upload className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-medium mb-1">
                Upload from Device
              </p>
              <p className="text-gray-400 text-sm">
                Choose from gallery or files
              </p>
            </div>
          </label>

          {/* Take Photo */}
          <button
            onClick={onCameraClick}
            className="flex flex-col items-center px-4 py-6 md:px-6 md:py-8 cursor-pointer transition-transform duration-300"
          >
            <div className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110">
              <Camera className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-medium mb-1">Take Photo</p>
              <p className="text-gray-400 text-sm">
                Capture diseased plant instantly
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadButtons;