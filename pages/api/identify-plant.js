// pages/api/identify-plant.js - FIXED VERSION
import jwt from 'jsonwebtoken';
import { dbConnect } from "@/lib/dbConnect";
import User from '@/models/User';
import Identification from '@/models/Identification';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await dbConnect();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { image_url } = req.body;

    // Validate required fields
    if (!image_url) {
      return res.status(400).json({ 
        message: 'Image URL is required' 
      });
    }

    // Create initial identification record
    const identification = new Identification({
      user_id: userId,
      image_url: image_url,
      plant_type: "plant",
      identified: false
    });

    await identification.save();

    // Prepare the request body for Plant.id API with correct format
    const requestBody = {
      images: [image_url],
      latitude: 43.6532, // Toronto coordinates
      longitude: -79.3832,
      similar_images: true,
      classification_level: "all"
    };

    // Make request to Plant.id API with minimal parameters
    const plantIdResponse = await fetch('https://api.plant.id/v3/identification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.PLANT_ID_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!plantIdResponse.ok) {
      const errorText = await plantIdResponse.text();
      console.error('Plant.id API Error:', errorText);
      
      // Delete the identification record since it failed
      await Identification.findByIdAndDelete(identification._id);
      
      return res.status(plantIdResponse.status).json({ 
        message: 'Plant identification service error',
        error: errorText
      });
    }

    const plantIdData = await plantIdResponse.json();
    
    // Log the full response to debug
    console.log('Plant.id API Response:', JSON.stringify(plantIdData, null, 2));

    // Process the Plant.id response
    let updateData = {
      is_plant_probability: plantIdData.result?.is_plant?.probability || 0,
    };

    // Check if plant identification was successful
    if (plantIdData.result?.classification?.suggestions?.length > 0) {
      const allSuggestions = plantIdData.result.classification.suggestions;
      const bestMatch = allSuggestions[0];
      
      // Extract similar images from best match - prioritize full-size images
      const bestMatchImages = bestMatch.similar_images?.slice(0, 4).map(img => ({
        url: img.url || img.url_small, // Use full-size image first, fallback to small
        url_small: img.url_small, // Keep small version available if needed
        similarity: img.similarity
      })) || [];

      // 🔧 FIXED: Properly extract similar images for each individual suggestion
      const alternativeSuggestions = allSuggestions.slice(1, 4).map((suggestion, index) => {
        let suggestionImages = [];
        
        // Extract images specific to THIS suggestion from the Plant.id API response
        if (suggestion.similar_images && suggestion.similar_images.length > 0) {
          suggestionImages = suggestion.similar_images.slice(0, 4).map(img => ({
            url: img.url || img.url_small, // Use full-size image first, fallback to small
            url_small: img.url_small, // Keep small version available if needed
            similarity: img.similarity
          }));
          console.log(`Images for ${suggestion.name}:`, suggestionImages);
        } else {
          console.log(`No images found for ${suggestion.name}`);
        }

        return {
          name: suggestion.name,
          species: suggestion.name,
          probability: suggestion.probability,
          similar_images: suggestionImages // Each suggestion gets its own images
        };
      });
      
      updateData = {
        ...updateData,
        identified: true,
        identified_name: bestMatch.name,
        species: bestMatch.name,
        confidence: bestMatch.probability,
        category: "Plant",
        alternative_suggestions: alternativeSuggestions,
        similar_images: bestMatchImages,
        plant_details: bestMatch.details || {}
      };

      // Debug: Log what we're about to save to database
      console.log('Saving to database:', {
        identified_name: bestMatch.name,
        alternative_suggestions_count: alternativeSuggestions.length,
        alternative_suggestions: alternativeSuggestions
      });
    }

    // Update the identification record
    const updatedIdentification = await Identification.findByIdAndUpdate(
      identification._id,
      updateData,
      { new: true }
    );

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.total_scans': 1 },
      $set: { 'stats.last_scan': new Date() }
    });

    // Prepare response data
    const responseData = {
      identification_id: updatedIdentification._id,
      image_url: updatedIdentification.image_url,
      identified: updatedIdentification.identified,
      identified_name: updatedIdentification.identified_name,
      species: updatedIdentification.species,
      category: updatedIdentification.category,
      confidence: updatedIdentification.confidence,
      is_plant_probability: updatedIdentification.is_plant_probability,
      is_plant_detected: updatedIdentification.is_plant_probability > 0.5,
      alternative_suggestions: updatedIdentification.alternative_suggestions || [],
      similar_images: updatedIdentification.similar_images || [],
      plant_details: updatedIdentification.plant_details || {},
      created_at: updatedIdentification.createdAt
    };

    // Log the final response to debug
    console.log('Final Response Data:', JSON.stringify(responseData, null, 2));

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Plant identification error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}