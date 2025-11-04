// pages/api/search-insect.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth].js";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify authentication with NextAuth session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { q, limit = 10, language = 'en' } = req.query;

    // Validate required fields
    if (!q || q.trim() === '') {
      return res.status(400).json({ 
        message: 'Search query is required' 
      });
    }

    console.log('=== INSECT SEARCH REQUEST ===');
    console.log('User:', session.user.email);
    console.log('Query:', q);
    console.log('Limit:', limit);
    console.log('Language:', language);

    // Check if API key exists
    if (!process.env.INSECT_ID_API_KEY) {
      console.error('INSECT_ID_API_KEY is not configured');
      return res.status(500).json({ 
        message: 'Insect search service not configured',
        error: 'API key missing'
      });
    }

    // Build the API URL with thumbnails parameter
    const searchUrl = new URL('https://insect.kindwise.com/api/v1/kb/insect/name_search');
    searchUrl.searchParams.append('q', q.trim());
    searchUrl.searchParams.append('limit', Math.min(parseInt(limit), 20));
    searchUrl.searchParams.append('language', language);
    searchUrl.searchParams.append('thumbnails', 'true'); // Request thumbnails
    searchUrl.searchParams.append('thumbnail_width', '150'); // Optional: specify width
    searchUrl.searchParams.append('thumbnail_height', '150'); // Optional: specify height

    console.log('Sending request to Insect.id Search API...');
    console.log('Full URL:', searchUrl.toString());

    // Make request to Insect.id Search API
    const insectIdResponse = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Api-Key': process.env.INSECT_ID_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', insectIdResponse.status);

    if (!insectIdResponse.ok) {
      const errorText = await insectIdResponse.text();
      console.error('Insect.id Search API Error:', errorText);
      console.error('Status:', insectIdResponse.status);
      
      return res.status(insectIdResponse.status).json({ 
        message: 'Insect search service error',
        error: errorText,
        status: insectIdResponse.status
      });
    }

    const searchData = await insectIdResponse.json();
    
    console.log('=== INSECT API RESPONSE ===');
    console.log('Results count:', searchData.entities?.length || 0);
    console.log('First entity (full):', JSON.stringify(searchData.entities?.[0], null, 2));
    console.log('Has thumbnail?', searchData.entities?.[0]?.thumbnail ? 'YES' : 'NO');
    console.log('Has image?', searchData.entities?.[0]?.image ? 'YES' : 'NO');
    console.log('Full first entity keys:', Object.keys(searchData.entities?.[0] || {}));
    
    if (searchData.entities?.[0]?.thumbnail) {
      console.log('Thumbnail type:', typeof searchData.entities[0].thumbnail);
      console.log('Thumbnail length:', searchData.entities[0].thumbnail.length);
      console.log('Thumbnail preview (first 100 chars):', searchData.entities[0].thumbnail.substring(0, 100));
    }

    // Process the search results - check for both thumbnail and image fields
    const processedResults = searchData.entities?.map(entity => {
      console.log('Processing entity:', entity.entity_name);
      console.log('Entity keys:', Object.keys(entity));
      
      return {
        name: entity.entity_name,
        matched_in: entity.matched_in,
        matched_type: entity.matched_in_type,
        access_token: entity.access_token,
        match_position: entity.match_position,
        match_length: entity.match_length,
        thumbnail: entity.thumbnail || entity.image || null, // Try both fields
        image: entity.image || null, // Keep separate image field
        // Log what we found
        _debug: {
          hasThumbnail: !!entity.thumbnail,
          hasImage: !!entity.image,
          allKeys: Object.keys(entity)
        }
      };
    }) || [];

    const responseData = {
      query: q,
      results: processedResults,
      total_results: processedResults.length,
      results_trimmed: searchData.entities_trimmed || false,
      limit: searchData.limit || limit
    };
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Insect search error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}