// pages/api/weather/forecast.js
// OR if using App Router: app/api/weather/forecast/route.js

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { lat, lon } = req.query;

  // Default to Toronto if not provided
  const latitude = lat || "43.6532";
  const longitude = lon || "-79.3832";

  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: "Weather API key not configured" });
  }

  try {
    const url = `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${latitude}&lon=${longitude}&key=${apiKey}&hours=96`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    

    // Process data for agriculture-relevant metrics
    const processedData = {
      location: {
        city: data.city_name,
        state: data.state_code,
        country: data.country_code,
      },
      current: data.data[0] ? {
        temp: data.data[0].temp,
        humidity: data.data[0].rh,
        precipitation: data.data[0].precip, // mm
        snow: data.data[0].snow, // mm
        clouds: data.data[0].clouds, // %
        wind_speed: data.data[0].wind_spd, // m/s
        solarRad: data.data[0].solar_rad,
        uv: data.data[0].uv,
        timestamp: data.data[0].timestamp_local,
      } : null,
      forecast: data.data.slice(0, 72).map(hour => ({
        timestamp: hour.timestamp_local,
        temp: hour.temp,
        humidity: hour.rh,
        precipitation: hour.precip, // mm
        pop: hour.pop, // Probability of precipitation %
        snow: hour.snow, // mm
        clouds: hour.clouds, // %
        wind_speed: hour.wind_spd, // m/s
        solarRad: hour.solar_rad,
        uv: hour.uv,
        weather: hour.weather.description,
      })),
    };

    res.status(200).json(processedData);
  } catch (error) {
    console.error("Weather API Error:", error);
    res.status(500).json({ 
      message: "Failed to fetch weather data", 
      error: error.message 
    });
  }
}