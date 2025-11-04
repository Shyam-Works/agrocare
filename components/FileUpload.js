// components/FileUpload.jsx
import React, { useId } from 'react'; 
import { Upload, User } from 'lucide-react';
import Button from './Button';

const FileUpload = ({
  label,
  accept = 'image/*',
  onChange,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxSizeText = '5MB',
  loading = false,
  previewUrl,
  placeholder = 'Upload File',
  loadingText = 'Uploading...',
  required = false,
  error,
  variant = 'default', // default, profile
  className = '',
  buttonVariant = 'upload',
  ...props
}) => {
  const inputId = useId(); 

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > maxSize) {
      if (onChange) {
        onChange(null, `File size should be less than ${maxSizeText}`);
      }
      return;
    }

    if (onChange) {
      onChange(file, null);
    }
  };

  if (variant === 'profile') {
    return (
      <div className={className}>
        {label && (
          <label className="block text-xs font-medium text-white mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="flex items-center space-x-3">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile" 
              className="w-12 h-12 rounded-full border-2 border-green-100 object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1">
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              id={inputId} // 👈 Using the consistent ID
              disabled={loading}
              {...props}
            />
            <Button
              variant={buttonVariant}
              size="sm"
              fullWidth
              disabled={loading}
              loading={loading}
              loadingText={loadingText}
              className="flex items-center justify-center space-x-2"
            >
              <label htmlFor={inputId} className="flex items-center space-x-2 cursor-pointer w-full justify-center"> {/* 👈 Using the consistent ID */}
                <Upload className="w-4 h-4" />
                <span>{loading ? loadingText : placeholder}</span>
              </label>
            </Button>
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="flex items-center justify-center w-full">
        <label 
          htmlFor={inputId} // 👈 Using the consistent ID
          className={`
            flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            ${error ? 'border-red-500' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-4 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">Max size: {maxSizeText}</p>
          </div>
          <input
            id={inputId} // 👈 Using the consistent ID
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
            {...props}
          />
        </label>
      </div>
      
      {previewUrl && (
        <div className="mt-4">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-20 h-20 rounded-lg object-cover border"
          />
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;