// pages/api/disease-diagnosis.js
import {dbConnect} from '@/lib/dbConnect';
import DiseaseDiagnosis from '../../models/DiseaseDiagnosis';
import User from '../../models/User';
import jwt from 'jsonwebtoken';

// Plant.id API endpoint for health assessment
const PLANT_ID_HEALTH_API = 'https://plant.id/api/v3/health_assessment';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    return await createDiagnosis(req, res);
  } else if (req.method === 'GET') {
    return await getDiagnoses(req, res);
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

// POST - Create new disease diagnosis
async function createDiagnosis(req, res) {
  try {
    // Get user from token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { image_url, latitude, longitude, plant_name, plant_type } = req.body;

    if (!image_url) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // Prepare Plant.id API request
    const plantIdRequest = {
      images: [image_url],
      latitude: latitude || 49.207,
      longitude: longitude || 16.608,
      similar_images: true,
      health: "only", // Focus on health/disease detection
      
    };

    console.log('Calling Plant.id API with:', plantIdRequest);

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
      console.error('Plant.id API Error:', errorText);
      return res.status(plantIdResponse.status).json({ 
        message: 'Plant.id API error', 
        details: errorText
      });
    }

    const apiData = await plantIdResponse.json();
    console.log('Plant.id API Response:', JSON.stringify(apiData, null, 2));
    
    if (!apiData.result) {
      return res.status(400).json({ message: 'No diagnosis results from Plant.id API' });
    }

    // Process the API response
    const result = apiData.result;
    const diseaseData = result.disease || {};
    const suggestions = diseaseData.suggestions || [];
    
    // Create disease diagnosis record
    const diagnosis = new DiseaseDiagnosis({
      user_id: user._id,
      image_url,
      plant_name: plant_name || null,
      plant_type: plant_type || null,
      
      // Plant detection
      is_plant_detected: result.is_plant?.binary || false,
      plant_detection_probability: result.is_plant?.probability || 0,
      plant_detection_threshold: result.is_plant?.threshold || 0.5,
      
      // Health status
      is_healthy: result.is_healthy?.binary || false,
      health_probability: result.is_healthy?.probability || 0,
      health_threshold: result.is_healthy?.threshold || 0.525,
      
      // Disease information - we'll set primary_disease after creating the record
      disease_suggestions: suggestions,
      diagnostic_question: diseaseData.question || null,
      
      // Location
      location: {
        latitude: latitude || null,
        longitude: longitude || null
      },
      
      // API metadata
      api_response: {
        access_token: apiData.access_token,
        model_version: apiData.model_version,
        custom_id: apiData.custom_id,
        status: apiData.status,
        sla_compliant_client: apiData.sla_compliant_client,
        sla_compliant_system: apiData.sla_compliant_system,
        created: apiData.created,
        completed: apiData.completed
      }
    });

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
        disease_id: topSuggestion.id,
        disease_name: topSuggestion.name,
        category: diagnosis.categorizeDiseaseByName(topSuggestion.name),
        probability: topSuggestion.probability,
        risk_level: diagnosis.calculateRiskLevel(topSuggestion.probability)
      };
    }

    diagnosis.primary_disease = primaryDisease;

    // Save to database
    await diagnosis.save();

    console.log('Diagnosis saved:', diagnosis._id);

    // Return response in format expected by frontend
    const response = {
      id: diagnosis._id,
      is_plant: {
        binary: diagnosis.is_plant_detected,
        probability: diagnosis.plant_detection_probability,
        threshold: diagnosis.plant_detection_threshold
      },
      is_healthy: {
        binary: diagnosis.is_healthy,
        probability: diagnosis.health_probability,
        threshold: diagnosis.health_threshold
      },
      is_plant_detected: diagnosis.is_plant_detected,
      is_plant_probability: diagnosis.plant_detection_probability,
      disease: {
        suggestions: diagnosis.disease_suggestions,
        question: diagnosis.diagnostic_question
      },
      primary_disease: diagnosis.primary_disease,
      severity_score: diagnosis.severity_score,
      created_at: diagnosis.created_at
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Disease diagnosis error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET - Get user's diagnosis history
async function getDiagnoses(req, res) {
  try {
    // Get user from token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query options
    const query = { user_id: user._id };
    
    // Filter by health status if provided
    if (req.query.is_healthy !== undefined) {
      query.is_healthy = req.query.is_healthy === 'true';
    }
    
    // Filter by disease category if provided
    if (req.query.category) {
      query['primary_disease.category'] = req.query.category;
    }

    const diagnoses = await DiseaseDiagnosis.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await DiseaseDiagnosis.countDocuments(query);

    res.json({
      diagnoses,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_records: total,
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Get diagnosis history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}