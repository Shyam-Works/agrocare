// pages/api/identify-insect.js - Insect Identification API
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth].js";
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

    // Verify authentication with NextAuth session
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

    console.log('=== INSECT IDENTIFICATION REQUEST ===');
    console.log('User:', session.user.email);
    console.log('User ID:', userId);

    const { image_url } = req.body;

    // Validate required fields
    if (!image_url) {
      return res.status(400).json({ 
        message: 'Image URL is required' 
      });
    }

    console.log('Image URL:', image_url);

    // Create initial identification record
    const identification = new Identification({
      user_id: userId,
      image_url: image_url,
      plant_type: "insect",
      identified: false
    });

    await identification.save();
    console.log('Identification record created:', identification._id);

    // Prepare the request body for Insect.id API
    const requestBody = {
      images: [image_url],
      latitude: 43.6532, // Toronto coordinates (you can make this dynamic based on user location)
      longitude: -79.3832,
      similar_images: true
    };

    console.log('Sending request to Insect.id API...');

    // Make request to Insect.id API
    const insectIdResponse = await fetch('https://insect.kindwise.com/api/v1/identification?details=common_names,url,description,image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.INSECT_ID_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!insectIdResponse.ok) {
      const errorText = await insectIdResponse.text();
      console.error('Insect.id API Error:', errorText);
      
      // Delete the identification record since it failed
      await Identification.findByIdAndDelete(identification._id);
      
      return res.status(insectIdResponse.status).json({ 
        message: 'Insect identification service error',
        error: errorText
      });
    }

    const insectIdData = await insectIdResponse.json();
    
    // Log the full response to debug
    console.log('Insect.id API Response received');
    console.log('Is insect probability:', insectIdData.result?.is_insect?.probability);
    console.log('Suggestions count:', insectIdData.result?.classification?.suggestions?.length);

    // Process the Insect.id response
    let updateData = {
      is_plant_probability: insectIdData.result?.is_insect?.probability || 0,
    };

    // Check if insect identification was successful
    if (insectIdData.result?.classification?.suggestions?.length > 0) {
      const allSuggestions = insectIdData.result.classification.suggestions;
      const bestMatch = allSuggestions[0];
      
      console.log('Best match:', bestMatch.name, 'Confidence:', bestMatch.probability);
      
      // Extract similar images from best match
      const bestMatchImages = bestMatch.similar_images?.slice(0, 4).map(img => ({
        url: img.url || img.url_small,
        url_small: img.url_small,
        similarity: img.similarity,
        license_name: img.license_name,
        license_url: img.license_url,
        citation: img.citation
      })) || [];

      // Extract alternative suggestions with their own images
      const alternativeSuggestions = allSuggestions.slice(1, 4).map((suggestion) => {
        let suggestionImages = [];
        
        if (suggestion.similar_images && suggestion.similar_images.length > 0) {
          suggestionImages = suggestion.similar_images.slice(0, 4).map(img => ({
            url: img.url || img.url_small,
            url_small: img.url_small,
            similarity: img.similarity,
            license_name: img.license_name,
            license_url: img.license_url,
            citation: img.citation
          }));
          console.log(`Images for ${suggestion.name}:`, suggestionImages.length);
        } else {
          console.log(`No images found for ${suggestion.name}`);
        }

        return {
          name: suggestion.name,
          species: suggestion.name,
          probability: suggestion.probability,
          similar_images: suggestionImages,
          details: suggestion.details || {}
        };
      });
      
      updateData = {
        ...updateData,
        identified: true,
        identified_name: bestMatch.name,
        species: bestMatch.name,
        confidence: bestMatch.probability,
        category: "Insect",
        alternative_suggestions: alternativeSuggestions,
        similar_images: bestMatchImages,
        plant_details: bestMatch.details || {}
      };

      console.log('Insect identified successfully:', bestMatch.name);
      console.log('Alternative suggestions:', alternativeSuggestions.length);
    } else {
      console.log('No insect identification found');
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

    console.log('User stats updated - Total scans incremented');

    // Prepare response data
    const responseData = {
      identification_id: updatedIdentification._id,
      image_url: updatedIdentification.image_url,
      identified: updatedIdentification.identified,
      identified_name: updatedIdentification.identified_name,
      species: updatedIdentification.species,
      category: updatedIdentification.category,
      confidence: updatedIdentification.confidence,
      is_insect_probability: updatedIdentification.is_plant_probability,
      is_insect_detected: updatedIdentification.is_plant_probability > 0.5,
      alternative_suggestions: updatedIdentification.alternative_suggestions || [],
      similar_images: updatedIdentification.similar_images || [],
      insect_details: updatedIdentification.plant_details || {},
      created_at: updatedIdentification.createdAt
    };

    console.log('=== INSECT IDENTIFICATION COMPLETE ===');
    console.log('Success:', updatedIdentification.identified);
    console.log('Insect name:', updatedIdentification.identified_name);
    console.log('Confidence:', updatedIdentification.confidence);

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Insect identification error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}