import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLocationSchema, insertUserAlertSchema } from "@shared/schema";
import { z } from "zod";

const OPENAQ_API_URL = "https://api.openaq.org/v2";
const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5";

// Get API keys from environment variables
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY || "your_api_key_here";

function getAqiLevel(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function getPrimaryPollutant(pollutants: any): string {
  const { pm25, pm10, o3, no2, so2, co } = pollutants;
  const maxValue = Math.max(pm25 || 0, pm10 || 0, o3 || 0, no2 || 0, so2 || 0, co || 0);
  
  if (pm25 === maxValue) return "PM2.5";
  if (pm10 === maxValue) return "PM10";
  if (o3 === maxValue) return "O₃";
  if (no2 === maxValue) return "NO₂";
  if (so2 === maxValue) return "SO₂";
  return "CO";
}

function calculateAqiFromPollutants(pollutants: any): number {
  // Simplified AQI calculation - in production would use proper EPA formula
  const pm25 = pollutants.pm25 || 0;
  const pm10 = pollutants.pm10 || 0;
  const o3 = pollutants.o3 || 0;
  
  // Convert concentrations to AQI (simplified)
  const pm25Aqi = pm25 * 4; // Rough conversion
  const pm10Aqi = pm10 * 2;
  const o3Aqi = o3 * 1.5;
  
  return Math.round(Math.max(pm25Aqi, pm10Aqi, o3Aqi));
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get current location data (AQI + Weather)
  app.get("/api/current/:locationId", async (req, res) => {
    try {
      const locationId = parseInt(req.params.locationId);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      // Try to get recent data from storage first
      let aqiReading = await storage.getLatestAqiReading(locationId);
      let weatherData = await storage.getLatestWeatherData(locationId);

      // If data is older than 30 minutes, fetch fresh data
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      if (!aqiReading || !aqiReading.timestamp || aqiReading.timestamp < thirtyMinutesAgo) {
        try {
          // Fetch from OpenAQ API
          const aqiResponse = await fetch(
            `${OPENAQ_API_URL}/latest?coordinates=${location.latitude},${location.longitude}&radius=25000&limit=1`
          );
          
          if (aqiResponse.ok) {
            const aqiData = await aqiResponse.json();
            if (aqiData.results && aqiData.results.length > 0) {
              const result = aqiData.results[0];
              const pollutants = {
                pm25: result.measurements?.find((m: any) => m.parameter === "pm25")?.value || 0,
                pm10: result.measurements?.find((m: any) => m.parameter === "pm10")?.value || 0,
                o3: result.measurements?.find((m: any) => m.parameter === "o3")?.value || 0,
                no2: result.measurements?.find((m: any) => m.parameter === "no2")?.value || 0,
                so2: result.measurements?.find((m: any) => m.parameter === "so2")?.value || 0,
                co: result.measurements?.find((m: any) => m.parameter === "co")?.value || 0,
              };

              const aqi = calculateAqiFromPollutants(pollutants);
              const level = getAqiLevel(aqi);
              const primaryPollutant = getPrimaryPollutant(pollutants);

              aqiReading = await storage.createAqiReading({
                locationId,
                aqi,
                level,
                primaryPollutant,
                pollutants
              });
            }
          }
        } catch (error) {
          console.error("Error fetching AQI data:", error);
        }
      }

      if (!weatherData || !weatherData.timestamp || weatherData.timestamp < thirtyMinutesAgo) {
        try {
          // Fetch from OpenWeatherMap API
          const weatherResponse = await fetch(
            `${OPENWEATHER_API_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
          );
          
          if (weatherResponse.ok) {
            const weather = await weatherResponse.json();
            weatherData = await storage.createWeatherData({
              locationId,
              temperature: weather.main.temp,
              humidity: weather.main.humidity,
              windSpeed: weather.wind?.speed || 0,
              visibility: (weather.visibility || 10000) / 1000, // Convert to km
              description: weather.weather[0].description,
              icon: weather.weather[0].icon
            });
          }
        } catch (error) {
          console.error("Error fetching weather data:", error);
        }
      }

      res.json({
        location,
        aqi: aqiReading,
        weather: weatherData
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get forecast data
  app.get("/api/forecast/:locationId", async (req, res) => {
    try {
      const locationId = parseInt(req.params.locationId);
      let forecast = await storage.getForecast(locationId);

      // If no forecast data or data is old, generate new forecast
      if (forecast.length === 0) {
        // Clear old forecast and generate new one
        await storage.clearOldForecast(locationId);
        
        // Get current AQI as base
        const currentReading = await storage.getLatestAqiReading(locationId);
        const baseAqi = currentReading?.aqi || 100;

        // Generate 48-hour forecast with some randomness
        for (let hour = 0; hour < 48; hour++) {
          // Simulate AQI changes with random walk
          const variation = (Math.random() - 0.5) * 40; // ±20 AQI variation
          const timeVariation = Math.sin(hour * Math.PI / 12) * 20; // Daily cycle
          const predictedAqi = Math.max(0, Math.min(500, Math.round(baseAqi + variation + timeVariation)));
          const predictedLevel = getAqiLevel(predictedAqi);

          await storage.createForecastData({
            locationId,
            hour,
            predictedAqi,
            predictedLevel
          });
        }

        forecast = await storage.getForecast(locationId);
      }

      res.json(forecast);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Search locations
  app.get("/api/locations/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const locations = await storage.searchLocations(query);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get location by coordinates
  app.get("/api/locations/coords", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }

      let location = await storage.getLocationByCoords(lat, lon);
      
      if (!location) {
        // Reverse geocoding to get city name (simplified)
        try {
          const geocodeResponse = await fetch(
            `${OPENWEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
          );
          
          if (geocodeResponse.ok) {
            const geocodeData = await geocodeResponse.json();
            location = await storage.createLocation({
              city: geocodeData.name,
              state: geocodeData.sys?.country === "IN" ? "India" : geocodeData.sys?.country || "Unknown",
              country: "India",
              latitude: lat,
              longitude: lon
            });
          }
        } catch (error) {
          console.error("Error with reverse geocoding:", error);
        }
      }

      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get AQI history
  app.get("/api/aqi/history/:locationId", async (req, res) => {
    try {
      const locationId = parseInt(req.params.locationId);
      const limit = parseInt(req.query.limit as string) || 10;
      
      const history = await storage.getAqiHistory(locationId, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alert = await storage.getUserAlert();
      res.json(alert || {
        threshold: 100,
        emailNotifications: true,
        pushNotifications: false,
        dailySummary: true
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user alerts
  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertUserAlertSchema.parse(req.body);
      const alert = await storage.createOrUpdateUserAlert(alertData);
      res.json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  // Get nearby locations with AQI
  app.get("/api/nearby/:locationId", async (req, res) => {
    try {
      const locationId = parseInt(req.params.locationId);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      // For demo purposes, generate some nearby locations with mock AQI data
      const nearbyLocations = [
        { ...location, distance: 0 },
        // These would be real nearby locations in production
      ];

      const locationsWithAqi = await Promise.all(
        nearbyLocations.map(async (loc) => {
          const aqiReading = await storage.getLatestAqiReading(loc.id);
          return {
            id: loc.id,
            city: loc.city,
            state: loc.state,
            country: loc.country,
            latitude: loc.latitude,
            longitude: loc.longitude,
            distance: loc.distance,
            aqi: aqiReading?.aqi || Math.floor(Math.random() * 300),
            level: aqiReading?.level || getAqiLevel(Math.floor(Math.random() * 300))
          };
        })
      );

      res.json(locationsWithAqi);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
