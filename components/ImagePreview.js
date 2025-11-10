import React from "react";
import { X } from "lucide-react";

const ImagePreview = ({ imageUrl, onClear }) => {
  return (
    <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white">
      <div className="relative w-full aspect-[2/1] overflow-hidden">
        <img
          src={imageUrl}
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
  );
};

export default ImagePreview;