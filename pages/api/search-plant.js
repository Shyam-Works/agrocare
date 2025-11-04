// pages/api/search-plant.js
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

    console.log('=== PLANT SEARCH REQUEST ===');
    console.log('User:', session.user.email);
    console.log('Query:', q);
    console.log('Limit:', limit);
    console.log('Language:', language);

    // Build the API URL with query parameters
    const searchUrl = new URL('https://plant.id/api/v3/kb/plants/name_search');
    searchUrl.searchParams.append('q', q.trim());
    searchUrl.searchParams.append('limit', Math.min(parseInt(limit), 20)); // Max 20
    searchUrl.searchParams.append('language', language);
    searchUrl.searchParams.append('thumbnails', 'true');

    console.log('Sending request to Plant.id Search API...');
    console.log('URL:', searchUrl.toString());

    // Make request to Plant.id Search API
    const plantIdResponse = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Api-Key': process.env.PLANT_ID_API_KEY,
      },
    });

    if (!plantIdResponse.ok) {
      const errorText = await plantIdResponse.text();
      console.error('Plant.id Search API Error:', errorText);
      
      return res.status(plantIdResponse.status).json({ 
        message: 'Plant search service error',
        error: errorText
      });
    }

    const searchData = await plantIdResponse.json();
    
    console.log('Plant.id Search API Response received');
    console.log('Results count:', searchData.entities?.length || 0);
    console.log('Results trimmed:', searchData.entities_trimmed);

    // Process the search results
    const processedResults = searchData.entities?.map(entity => ({
      name: entity.entity_name,
      matched_in: entity.matched_in,
      matched_type: entity.matched_in_type,
      access_token: entity.access_token,
      match_position: entity.match_position,
      match_length: entity.match_length,
      thumbnail: entity.thumbnail // Base64 encoded image if requested
    })) || [];

    const responseData = {
      query: q,
      results: processedResults,
      total_results: processedResults.length,
      results_trimmed: searchData.entities_trimmed,
      limit: searchData.limit
    };

    console.log('=== PLANT SEARCH COMPLETE ===');
    console.log('Found:', processedResults.length, 'results');

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Plant search error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}