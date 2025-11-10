// components/SaveToCategoryModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Folder, Check, Loader2, AlertCircle } from 'lucide-react';

const SaveToCategoryModal = ({ 
  isOpen, 
  onClose, 
  diagnosisData,  // All the data from UI
  onSaveSuccess 
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [mode, setMode] = useState('select');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryId(null);
      setError(null);

      if (!diagnosisData) {
        setError('No diagnosis data available');
        return;
      }

      setNewCategoryName(diagnosisData.plant_name || '');
      fetchCategories();
    }
  }, [isOpen, diagnosisData]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/get-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      const fetchedCategories = data.categories || [];
      setCategories(fetchedCategories);
      
      if (fetchedCategories.length === 0) {
        setMode('create');
      } else {
        setMode('select');
        setSelectedCategoryId(fetchedCategories[0]._id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!diagnosisData) {
      setError('No diagnosis data available');
      return;
    }

    if (mode === 'create' && !newCategoryName.trim()) {
      setError('Please enter a category name');
      return;
    }
    
    if (mode === 'select' && !selectedCategoryId) {
      setError('Please select a category');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const requestBody = {
        category_name: mode === 'create' ? newCategoryName.trim() : undefined,
        category_id: mode === 'select' ? selectedCategoryId : undefined,
        create_new: mode === 'create',
        diagnosis_id: diagnosisData.diagnosis_id,  // The ID from the diagnosis
        diagnosis_data: {
          disease_name: diagnosisData.disease_name,
          confidence_percentage: diagnosisData.confidence_percentage,
          severity_percentage: diagnosisData.severity_percentage,
          image_url: diagnosisData.image_url,
          plant_name: diagnosisData.plant_name,
          diagnosed_date: diagnosisData.diagnosed_date
        }
      };

      const response = await fetch('/api/save-to-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save');
      }
      
      if (onSaveSuccess) {
        onSaveSuccess(data.category);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving to category:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isSaveDisabled = saving || 
    !diagnosisData || 
    (mode === 'select' && !selectedCategoryId) || 
    (mode === 'create' && !newCategoryName.trim());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Save to Category</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {diagnosisData && (
            <div className="text-green-50 mt-3 text-sm space-y-1">
              <p><strong>Disease:</strong> {diagnosisData.disease_name}</p>
              <p><strong>Confidence:</strong> {diagnosisData.confidence_percentage}%</p>
              {diagnosisData.severity_percentage && (
                <p><strong>Severity:</strong> {diagnosisData.severity_percentage}%</p>
              )}
            </div>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => {
                setMode('select');
                if (categories.length > 0 && !selectedCategoryId) {
                  setSelectedCategoryId(categories[0]._id);
                }
              }}
              disabled={categories.length === 0}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                mode === 'select'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${categories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Folder className="w-5 h-5 inline mr-2" />
              Select Existing
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                mode === 'create'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Create New
            </button>
          </div>

          {mode === 'select' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No categories yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => setSelectedCategoryId(category._id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedCategoryId === category._id
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {category.category_name}
                          </h3>
                          {category.plant_type && (
                            <p className="text-sm text-gray-500 mt-1">
                              {category.plant_type}
                            </p>
                          )}
                        </div>
                        {selectedCategoryId === category._id && (
                          <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Corn Field A, Tomato Garden"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={50}
              />
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveToCategoryModal;