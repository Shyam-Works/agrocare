import React, { useState, useEffect } from "react";
import { Sun, Cloud, Droplets, CloudRain } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLOR_PALETTE = {
  primaryText: "text-green-800",
  darkText: "text-gray-900",
  mediumText: "text-gray-600",
  secondaryText: "text-yellow-600",
  cardBorder: "border-gray-200",
};

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchWeatherData = async () => {
    try {
      const res = await fetch("/api/weather/forcast");
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      setWeatherData(data);
    } catch (error) {
      console.error("Weather fetch error:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  // Get background image based on weather conditions and time
  const getBackgroundImage = () => {
    if (!weatherData?.current) return "/weather/afternoon.png";

    const clouds = weatherData.current.clouds ?? 0;
    const precip = weatherData.current.precipitation ?? 0;
    const currentHour = new Date().getHours();

    // Priority 1: Rain (if precipitation is significant)
    if (precip >= 2) {
      return "/weather/rain.png";
    }

    // Priority 2: Clouds (if very cloudy)
    if (clouds >= 70) {
      return "/weather/clouds.png";
    }

    // Priority 3: Time-based backgrounds for clear/partly cloudy weather
    if (currentHour >= 5 && currentHour < 10) {
      return "/weather/early_morning.png"; // 5 AM - 10 AM
    } else if (currentHour >= 10 && currentHour < 17) {
      return "/weather/afternoon.png"; // 10 AM - 5 PM
    } else if (currentHour >= 17 && currentHour < 20) {
      return "/weather/evening.png"; // 5 PM - 8 PM
    } else {
      return "/weather/night.png"; // 8 PM - 5 AM
    }
  };

  // Process weather forecast for 24-hour chart
  const weatherChartData =
    weatherData?.forecast?.slice(0, 24).map((hour) => ({
      hour: new Date(hour.timestamp).getHours() + ":00",
      temp: hour.temp,
      humidity: hour.humidity,
      precipitation: hour.pop,
    })) || [];

  // Get 3-day forecast summary
  const getThreeDayForecast = () => {
    if (!weatherData?.forecast) return [];
    const days = [];
    const today = new Date();

    for (let i = 1; i <= 3; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dayName = targetDate.toLocaleDateString("en-US", {
        weekday: "short",
      });

      const dayStart = new Date(targetDate).setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate).setHours(23, 59, 59, 999);

      const dayForecasts = weatherData.forecast.filter((f) => {
        const fTime = new Date(f.timestamp).getTime();
        return fTime >= dayStart && fTime <= dayEnd;
      });

      if (dayForecasts.length > 0) {
        const temps = dayForecasts.map((f) => f.temp);
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));

        // Calculate averages for the day
        const avgClouds =
          dayForecasts.reduce((sum, f) => sum + (f.clouds || 0), 0) /
          dayForecasts.length;
        const totalPrecip = dayForecasts.reduce(
          (sum, f) => sum + (f.precipitation || 0),
          0
        );
        const totalSnow = dayForecasts.reduce(
          (sum, f) => sum + (f.snow || 0),
          0
        );
        const avgWind =
          dayForecasts.reduce((sum, f) => sum + (f.wind_speed || 0), 0) /
          dayForecasts.length;

        days.push({
          day: dayName,
          minTemp,
          maxTemp,
          clouds: avgClouds,
          precipitation: totalPrecip,
          snow: totalSnow,
          wind_speed: avgWind,
        });
      }
    }

    return days;
  };

  const backgroundImage = getBackgroundImage();

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (weatherLoading) {
    return (
      <div className="mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200 rounded-lg shadow-md p-6 h-96 flex items-center justify-center">
          <div className="text-gray-600">Loading weather data...</div>
        </div>
      </div>
    );
  }

  if (!weatherData?.current) {
    return null;
  }

  return (
    <div className="mb-6 w-full max-w-md mx-auto perspective-1000">
      <div
        className="relative w-full h-[400px] cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.6s",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleFlip}
      >
        {/* Front Card - Today's Weather & 3-Day Forecast */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="border border-gray-200 rounded-lg shadow-md p-6 relative overflow-hidden w-full h-full">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url('${backgroundImage}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                objectFit: "cover",
                opacity: 0.85,
              }}
            ></div>

            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20 rounded-lg"></div>

            {/* Content with relative positioning to stay above overlay */}
            <div className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Today's Weather */}
                <div>
                  <div className="mb-6">
                    <div className="text-sm text-white/90 mb-1 drop-shadow-lg">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-6xl font-bold text-white mb-2 drop-shadow-lg">
                      {Math.round(weatherData.current.temp)}°C
                    </div>
                    <div className="text-sm text-white/90 drop-shadow-lg">
                      {weatherData.location.city},{" "}
                      {weatherData.location.state}
                    </div>
                  </div>
                </div>

                {/* Right: Weather Icon */}
                <div className="flex items-center justify-center md:justify-end">
                  {(() => {
                    const clouds = weatherData.current.clouds ?? 0;
                    const precip = weatherData.current.precipitation ?? 0;
                    const snow = weatherData.current.snow ?? 0;
                    const wind = weatherData.current.wind_speed ?? 0;

                    const currentHour = new Date().getHours();
                    const isNight = currentHour >= 20 || currentHour < 5;

                    let iconSrc = "/sun.png";

                    if (isNight) {
                      iconSrc = "/cloudy-night.png";

                      if (precip >= 5 && clouds >= 90) {
                        iconSrc = "/thunder.png";
                      } else if (snow >= 5) {
                        iconSrc = "/snow.png";
                      } else if (precip >= 5) {
                        iconSrc = "/raining.png";
                      } else if (wind * 3.6 > 30) {
                        iconSrc = "/wind.png";
                      } else if (clouds >= 70) {
                        iconSrc = "/cloudy.png";
                      }
                    } else {
                      if (precip >= 5 && clouds >= 90) {
                        iconSrc = "/thunder.png";
                      } else if (snow >= 5) {
                        iconSrc = "/snow.png";
                      } else if (precip >= 15) {
                        iconSrc = "/raining.png";
                      } else if (wind * 3.6 > 30) {
                        iconSrc = "/wind.png";
                      } else if (clouds >= 75 && clouds < 90) {
                        iconSrc = "/cloudy.png";
                      } else if (clouds >= 20 && clouds < 75) {
                        iconSrc = "/clouds.png";
                      } else if (clouds < 20 && precip < 1 && snow < 1) {
                        iconSrc = "/sun.png";
                      } else {
                        iconSrc = "/clouds.png";
                      }
                    }

                    return (
                      <img
                        src={iconSrc}
                        alt="Weather Icon"
                        className="w-32 h-32 object-contain drop-shadow-lg"
                      />
                    );
                  })()}
                </div>
              </div>

              {/* 3-Day Forecast */}
              <div className="mt-6 pt-6 border-t border-white/30">
                <h3 className="text-md font-semibold text-white mb-4 drop-shadow-lg">
                  3-Day Forecast
                </h3>
                <div className="rounded-xl backdrop-blur-md p-1 w-full">
                  <div className="grid grid-cols-3 gap-4">
                    {getThreeDayForecast().map((day, idx) => {
                      const clouds = day.clouds || 0;
                      const precip = day.precipitation || 0;
                      const snow = day.snow || 0;
                      const wind = day.wind_speed || 0;

                      let iconSrc = "/sun.png";
                      if (precip >= 10 && clouds >= 90) {
                        iconSrc = "/thunder.png";
                      } else if (snow >= 10) {
                        iconSrc = "/snow.png";
                      } else if (precip >= 10) {
                        iconSrc = "/raining.png";
                      } else if (wind * 3.6 > 30) {
                        iconSrc = "/wind.png";
                      } else if (clouds >= 75 && clouds < 90) {
                        iconSrc = "/cloudy.png";
                      } else if (clouds >= 20 && clouds < 75) {
                        iconSrc = "/clouds.png";
                      } else if (clouds < 20 && precip < 2 && snow < 2) {
                        iconSrc = "/sun.png";
                      } else {
                        iconSrc = "/clouds.png";
                      }

                      return (
                        <div key={idx} className="text-center text-white">
                          <div className="text-sm font-medium mb-2">
                            {day.day}
                          </div>
                          <img
                            src={iconSrc}
                            alt="Weather forecast"
                            className="w-12 h-12 mx-auto mb-2 object-contain"
                          />
                          <div className="text-lg font-bold">
                            {day.maxTemp}° / {day.minTemp}°
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Card - Detailed Agricultural Metrics */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200 rounded-lg shadow-md p-6 w-full h-full flex flex-col">
            <div className="mb-3">
              <h2 className={`text-lg font-bold ${COLOR_PALETTE.primaryText}`}>
                Agricultural Weather Details
              </h2>
              <p className={`text-xs ${COLOR_PALETTE.mediumText}`}>
                {weatherData.location.city}, {weatherData.location.state}
              </p>
            </div>

            {/* Weather Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="bg-white rounded-lg p-3 text-center flex flex-col justify-center">
                <Sun
                  className={`w-5 h-5 mx-auto mb-1 ${COLOR_PALETTE.secondaryText}`}
                />
                <div className={`text-xs ${COLOR_PALETTE.mediumText} mb-1`}>
                  Solar Radiation
                </div>
                <div className={`text-base font-bold ${COLOR_PALETTE.darkText}`}>
                  {Math.round(weatherData.current.solarRad)} W/m²
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 text-center flex flex-col justify-center">
                <Droplets className={`w-5 h-5 mx-auto mb-1 text-blue-500`} />
                <div className={`text-xs ${COLOR_PALETTE.mediumText} mb-1`}>
                  Humidity
                </div>
                <div className={`text-base font-bold ${COLOR_PALETTE.darkText}`}>
                  {Math.round(weatherData.current.humidity)}%
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 text-center flex flex-col justify-center">
                <CloudRain className={`w-5 h-5 mx-auto mb-1 text-blue-600`} />
                <div className={`text-xs ${COLOR_PALETTE.mediumText} mb-1`}>
                  Precipitation
                </div>
                <div className={`text-base font-bold ${COLOR_PALETTE.darkText}`}>
                  {weatherData.current.precipitation.toFixed(1)} mm
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 text-center flex flex-col justify-center">
                <Cloud
                  className={`w-5 h-5 mx-auto mb-1 ${COLOR_PALETTE.mediumText}`}
                />
                <div className={`text-xs ${COLOR_PALETTE.mediumText} mb-1`}>
                  Cloud Cover
                </div>
                <div className={`text-base font-bold ${COLOR_PALETTE.darkText}`}>
                  {Math.round(weatherData.current.clouds)}%
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 text-center flex flex-col justify-center">
                <Sun className={`w-5 h-5 mx-auto mb-1 text-orange-500`} />
                <div className={`text-xs ${COLOR_PALETTE.mediumText} mb-1`}>
                  UV Index
                </div>
                <div className={`text-base font-bold ${COLOR_PALETTE.darkText}`}>
                  {weatherData.current.uv.toFixed(1)}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 text-center flex flex-col justify-center">
                <svg
                  className="w-5 h-5 mx-auto mb-1 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
                <div className={`text-xs ${COLOR_PALETTE.mediumText} mb-1`}>
                  Wind Speed
                </div>
                <div className={`text-base font-bold ${COLOR_PALETTE.darkText}`}>
                  {(weatherData.current.wind_speed * 3.6).toFixed(1)} km/h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flip Indicator */}
      <div className="text-center mt-4">
        <p className={`text-xs ${COLOR_PALETTE.mediumText}`}>
          Click card to flip
        </p>
      </div>
    </div>
  );
};

export default Weather;