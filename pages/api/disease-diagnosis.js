// pages/api/disease-diagnosis.js - Updated for NextAuth consistency
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { dbConnect } from "@/lib/dbConnect";
import User from '@/models/User';
import DiseaseDiagnosis from '@/models/DiseaseDiagnosis';

// Plant.id API endpoint for health assessment
const PLANT_ID_HEALTH_API = 'https://api.plant.id/v3/health_assessment';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await dbConnect();

    // Verify authentication with NextAuth session (consistent with identify-plant.js)
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get user ID from session
    const userId = session.user.id;
    
    // Verify user exists in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('=== DISEASE DIAGNOSIS REQUEST ===');
    console.log('User:', session.user.email);
    console.log('User ID:', userId);

    const { image_url, latitude, longitude, plant_name, plant_type } = req.body;

    // Validate required fields
    if (!image_url) {
      return res.status(400).json({ 
        message: 'Image URL is required' 
      });
    }

    console.log('Image URL:', image_url);

    // Create initial diagnosis record with all required default values
    const diagnosis = new DiseaseDiagnosis({
      user_id: userId,
      image_url: image_url,
      plant_name: plant_name || null,
      plant_type: plant_type || null,
      
      // Required fields with default values
      is_plant_detected: false,
      plant_detection_probability: 0,
      plant_detection_threshold: 0.5,
      is_healthy: false,
      health_probability: 0,
      health_threshold: 0.525,
      
      // Initialize arrays and objects
      disease_suggestions: [],
      diagnostic_question: null,
      primary_disease: {
        disease_detected: false,
        disease_id: null,
        disease_name: null,
        category: 'Other',
        probability: 0,
        risk_level: 'Low'
      },
      
      location: {
        latitude: latitude || null,
        longitude: longitude || null
      },

      // Initialize API response object
      api_response: {
        access_token: null,
        model_version: null,
        custom_id: null,
        status: null,
        sla_compliant_client: null,
        sla_compliant_system: null,
        created: null,
        completed: null
      }
    });

    await diagnosis.save();
    console.log('Diagnosis record created:', diagnosis._id);

    // Prepare Plant.id API request
    const plantIdRequest = {
      images: [image_url],
      latitude: latitude || 43.6532, // Toronto coordinates (matching identify-plant.js)
      longitude: longitude || -79.3832,
      similar_images: true,
      health: "only" // Focus on health/disease detection
    };

    console.log('Sending request to Plant.id Health API...');

    // Call Plant.id API for health assessment
    const plantIdResponse = await fetch(PLANT_ID_HEALTH_API, {
      method: 'POST',
      headers: {
        'Api-Key': process.env.PLANT_ID_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(plantIdRequest)
    });

    if (!plantIdResponse.ok) {
      const errorText = await plantIdResponse.text();
      console.error('Plant.id Health API Error:', errorText);
      
      // Delete the diagnosis record since it failed
      await DiseaseDiagnosis.findByIdAndDelete(diagnosis._id);
      
      return res.status(plantIdResponse.status).json({ 
        message: 'Plant health assessment service error',
        error: errorText
      });
    }

    const apiData = await plantIdResponse.json();
    
    console.log('Plant.id Health API Response received');
    console.log('Is plant probability:', apiData.result?.is_plant?.probability);
    console.log('Is healthy probability:', apiData.result?.is_healthy?.probability);

    // Process the API response
    let updateData = {};
    
    if (apiData.result) {
      const result = apiData.result;
      const diseaseData = result.disease || {};
      const suggestions = diseaseData.suggestions || [];
      
      updateData = {
        // Plant detection
        is_plant_detected: result.is_plant?.binary || false,
        plant_detection_probability: result.is_plant?.probability || 0,
        plant_detection_threshold: result.is_plant?.threshold || 0.5,
        
        // Health status
        is_healthy: result.is_healthy?.binary || false,
        health_probability: result.is_healthy?.probability || 0,
        health_threshold: result.is_healthy?.threshold || 0.525,
        
        // Disease information
        disease_suggestions: suggestions,
        diagnostic_question: diseaseData.question || null,
        
        // API metadata
        api_response: {
          access_token: apiData.access_token || null,
          model_version: apiData.model_version || null,
          custom_id: apiData.custom_id || null,
          status: apiData.status || null,
          sla_compliant_client: apiData.sla_compliant_client || null,
          sla_compliant_system: apiData.sla_compliant_system || null,
          created: apiData.created || null,
          completed: apiData.completed || null
        }
      };

      // Determine primary disease (highest probability)
      let primaryDisease = {
        disease_detected: false,
        disease_id: null,
        disease_name: null,
        category: 'Other',
        probability: 0,
        risk_level: 'Low'
      };

      if (suggestions.length > 0) {
        const topSuggestion = suggestions[0];
        primaryDisease = {
          disease_detected: true,
          disease_id: topSuggestion.id || null,
          disease_name: topSuggestion.name || null,
          category: 'Disease', // You can implement categorizeDiseaseByName method if needed
          probability: topSuggestion.probability || 0,
          risk_level: (topSuggestion.probability || 0) > 0.7 ? 'High' : (topSuggestion.probability || 0) > 0.4 ? 'Medium' : 'Low'
        };
        
        console.log('Disease detected:', topSuggestion.name, 'Confidence:', topSuggestion.probability);
      } else {
        console.log('No disease detected or plant appears healthy');
      }

      updateData.primary_disease = primaryDisease;
    } else {
      // If no result from API, set minimal update data
      updateData = {
        is_plant_detected: false,
        plant_detection_probability: 0,
        plant_detection_threshold: 0.5,
        is_healthy: false,
        health_probability: 0,
        health_threshold: 0.525,
        disease_suggestions: [],
        diagnostic_question: null,
        primary_disease: {
          disease_detected: false,
          disease_id: null,
          disease_name: null,
          category: 'Other',
          probability: 0,
          risk_level: 'Low'
        },
        api_response: {
          access_token: apiData.access_token || null,
          model_version: apiData.model_version || null,
          custom_id: apiData.custom_id || null,
          status: apiData.status || 'no_result',
          sla_compliant_client: apiData.sla_compliant_client || null,
          sla_compliant_system: apiData.sla_compliant_system || null,
          created: apiData.created || null,
          completed: apiData.completed || null
        }
      };
    }

    // Update the diagnosis record
    const updatedDiagnosis = await DiseaseDiagnosis.findByIdAndUpdate(
      diagnosis._id,
      updateData,
      { new: true }
    );

    // Update user stats (consistent with identify-plant.js)
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.total_scans': 1 },
      $set: { 'stats.last_scan': new Date() }
    });

    console.log('User stats updated - Total scans incremented');

    // Prepare response data (consistent format)
    const responseData = {
      diagnosis_id: updatedDiagnosis._id,
      image_url: updatedDiagnosis.image_url,
      is_plant: {
        binary: updatedDiagnosis.is_plant_detected,
        probability: updatedDiagnosis.plant_detection_probability,
        threshold: updatedDiagnosis.plant_detection_threshold
      },
      is_healthy: {
        binary: updatedDiagnosis.is_healthy,
        probability: updatedDiagnosis.health_probability,
        threshold: updatedDiagnosis.health_threshold
      },
      is_plant_detected: updatedDiagnosis.is_plant_detected,
      is_plant_probability: updatedDiagnosis.plant_detection_probability,
      disease: {
        suggestions: updatedDiagnosis.disease_suggestions || [],
        question: updatedDiagnosis.diagnostic_question
      },
      primary_disease: updatedDiagnosis.primary_disease,
      plant_name: updatedDiagnosis.plant_name,
      plant_type: updatedDiagnosis.plant_type,
      location: updatedDiagnosis.location,
      created_at: updatedDiagnosis.createdAt
    };

    console.log('=== DISEASE DIAGNOSIS COMPLETE ===');
    console.log('Disease detected:', updatedDiagnosis.primary_disease?.disease_detected);
    console.log('Disease name:', updatedDiagnosis.primary_disease?.disease_name);
    console.log('Health probability:', updatedDiagnosis.health_probability);

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Disease diagnosis error:', error);
    
    // Log the specific validation errors if it's a validation error
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}