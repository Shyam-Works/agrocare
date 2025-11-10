// pages/api/disease-diagnosis.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth].js";
import { dbConnect } from "@/lib/dbConnect";
import User from '@/models/User';
import DiseaseDiagnosis from '@/models/DiseaseDiagnosis';

const PLANT_ID_HEALTH_API = 'https://crop.kindwise.com/api/v1/identification';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = session.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('=== DISEASE DIAGNOSIS REQUEST ===');
    console.log('User:', session.user.email);
    console.log('User ID:', userId);

    const { image_url, latitude, longitude, plant_name, plant_type } = req.body;

    if (!image_url) {
      return res.status(400).json({ 
        message: 'Image URL is required' 
      });
    }

    console.log('Image URL:', image_url);

    // Create initial diagnosis record
    const diagnosis = new DiseaseDiagnosis({
      user_id: userId,
      image_url: image_url,
      plant_name: plant_name || null,
      plant_type: plant_type || null,
      
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
      
      location: {
        latitude: latitude || null,
        longitude: longitude || null
      },

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

    const plantIdRequest = {
      images: [image_url],
      latitude: latitude || 43.6532,
      longitude: longitude || -79.3832,
      similar_images: true
    };

    console.log('Sending request to Plant.id Health API...');

    const plantIdResponse = await fetch(PLANT_ID_HEALTH_API, {
      method: 'POST',
      headers: {
        'Api-Key': process.env.PLANT_HEALTH_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(plantIdRequest)
    });

    if (!plantIdResponse.ok) {
      const errorText = await plantIdResponse.text();
      console.error('Plant.id Health API Error:', errorText);
      
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

    let updateData = {};
    
    if (apiData.result) {
      const result = apiData.result;
      const diseaseData = result.disease || {};
      const suggestions = diseaseData.suggestions || [];
      
      updateData = {
        is_plant_detected: result.is_plant?.binary || false,
        plant_detection_probability: result.is_plant?.probability || 0,
        plant_detection_threshold: result.is_plant?.threshold || 0.5,
        
        is_healthy: result.is_healthy?.binary || false,
        health_probability: result.is_healthy?.probability || 0,
        health_threshold: result.is_healthy?.threshold || 0.525,
        
        disease_suggestions: suggestions,
        diagnostic_question: diseaseData.question || null,
        
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
          category: 'Disease',
          probability: topSuggestion.probability || 0,
          risk_level: (topSuggestion.probability || 0) > 0.7 ? 'High' : (topSuggestion.probability || 0) > 0.4 ? 'Medium' : 'Low'
        };
        
        console.log('Disease detected:', topSuggestion.name, 'Confidence:', topSuggestion.probability);
      } else {
        console.log('No disease detected or plant appears healthy');
      }
      if (primaryDisease.disease_detected) {
            
            console.log('Fetching detailed severity analysis from OpenAI...');
            
            // Make an internal POST request to your existing details API route
            // NOTE: This assumes your details API is configured to run locally.
            const detailsApiUrl = `${req.headers.origin}/api/disease-details`;
            
            const openAiResponse = await fetch(detailsApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    diseaseName: primaryDisease.disease_name,
                    plantName: plant_name || plant_type,
                    imageUrl: image_url, // Pass the image for vision analysis
                }),
            });

            if (openAiResponse.ok) {
                const openAiData = await openAiResponse.json();
                const severity = openAiData.details?.severity_assessment;
                
                if (severity) {
                    const affectedPercentage = severity.affected_percentage;
                    
                    // 1. UPDATE PRIMARY DISEASE OBJECT with severity data
                    primaryDisease.affected_percentage = affectedPercentage;
                    
                    // You can optionally update risk level based on the vision model's assessment
                    // This overwrites the simple probability-based logic from before.
                    primaryDisease.risk_level = openAiData.details.severity_level || primaryDisease.risk_level;
                    
                    console.log(`OpenAI Severity: ${affectedPercentage}%, Level: ${primaryDisease.risk_level}`);

                    // 2. Add an optional field to store observations from OpenAI
                    updateData.ai_severity_observations = {
                         affected_percentage: affectedPercentage,
                         severity_level: severity.severity_level,
                         visual_observations: severity.visual_observations
                    };
                }
            } else {
                 console.warn('Could not fetch OpenAI details for severity. Proceeding with default values.');
            }
        }

      updateData.primary_disease = primaryDisease;
    } else {
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

    const updatedDiagnosis = await DiseaseDiagnosis.findByIdAndUpdate(
      diagnosis._id,
      updateData,
      { new: true }
    );

    // Update user stats - IMPORTANT: Get the updated user data
    console.log('Updating user stats...');
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { 'stats.total_scans': 1 },
        $set: { 'stats.last_scan': new Date() }
      },
      { new: true } // Return the updated document
    );

    console.log('User stats updated:');
    console.log('- Total scans:', updatedUser.stats.total_scans);
    console.log('- Last scan:', updatedUser.stats.last_scan);

    // Prepare response data with updated stats
    const responseData = {
      diagnosis_id: updatedDiagnosis._id.toString(),
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
      created_at: updatedDiagnosis.createdAt,
      
      diagnosis_data_for_save: {
    // These keys match the properties expected by SaveToCategoryModal.jsx
    disease_name: updatedDiagnosis.primary_disease?.disease_name || 'No Major Disease Detected',
    confidence_percentage: Math.round(updatedDiagnosis.primary_disease?.probability * 100) || 0,
    severity_percentage: Math.round(updatedDiagnosis.health_probability * 100) || 0, // Using health_probability as a proxy for severity
    image_url: updatedDiagnosis.image_url,
    plant_name: updatedDiagnosis.plant_name || 'Unspecified Plant',
    // Use the stored timestamp for the diagnosed_date
    diagnosed_date: updatedDiagnosis.createdAt.toISOString(), 
  },
  
      // ✅ ADD UPDATED STATS TO RESPONSE
      updated_stats: {
        total_scans: updatedUser.stats.total_scans,
        last_scan: updatedUser.stats.last_scan
      }
    };

    console.log('=== DISEASE DIAGNOSIS COMPLETE ===');
    console.log('Disease detected:', updatedDiagnosis.primary_disease?.disease_detected);
    console.log('Disease name:', updatedDiagnosis.primary_disease?.disease_name);
    console.log('Health probability:', updatedDiagnosis.health_probability);

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Disease diagnosis error:', error);
    
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