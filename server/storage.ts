import { 
  locations, 
  aqiReadings, 
  weatherData, 
  userAlerts, 
  forecastData,
  type Location,
  type InsertLocation,
  type AqiReading,
  type InsertAqiReading,
  type WeatherData,
  type InsertWeatherData,
  type UserAlert,
  type InsertUserAlert,
  type ForecastData,
  type InsertForecastData
} from "@shared/schema";

export interface IStorage {
  // Locations
  getLocation(id: number): Promise<Location | undefined>;
  getLocationByCoords(lat: number, lon: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  searchLocations(query: string): Promise<Location[]>;

  // AQI Readings
  getLatestAqiReading(locationId: number): Promise<AqiReading | undefined>;
  createAqiReading(reading: InsertAqiReading): Promise<AqiReading>;
  getAqiHistory(locationId: number, limit?: number): Promise<AqiReading[]>;

  // Weather Data
  getLatestWeatherData(locationId: number): Promise<WeatherData | undefined>;
  createWeatherData(weather: InsertWeatherData): Promise<WeatherData>;

  // User Alerts
  getUserAlert(): Promise<UserAlert | undefined>;
  createOrUpdateUserAlert(alert: InsertUserAlert): Promise<UserAlert>;

  // Forecast Data
  getForecast(locationId: number): Promise<ForecastData[]>;
  createForecastData(forecast: InsertForecastData): Promise<ForecastData>;
  clearOldForecast(locationId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private locations: Map<number, Location>;
  private aqiReadings: Map<number, AqiReading>;
  private weatherData: Map<number, WeatherData>;
  private userAlerts: Map<number, UserAlert>;
  private forecastData: Map<number, ForecastData>;
  private currentLocationId: number;
  private currentAqiId: number;
  private currentWeatherId: number;
  private currentAlertId: number;
  private currentForecastId: number;

  constructor() {
    this.locations = new Map();
    this.aqiReadings = new Map();
    this.weatherData = new Map();
    this.userAlerts = new Map();
    this.forecastData = new Map();
    this.currentLocationId = 1;
    this.currentAqiId = 1;
    this.currentWeatherId = 1;
    this.currentAlertId = 1;
    this.currentForecastId = 1;

    // Add default location for Mumbai
    this.createLocation({
      city: "Mumbai",
      state: "Maharashtra", 
      country: "India",
      latitude: 19.0760,
      longitude: 72.8777
    });
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getLocationByCoords(lat: number, lon: number): Promise<Location | undefined> {
    // Simple distance-based search (in real app would use proper geospatial queries)
    const threshold = 0.01; // ~1km
    for (const location of Array.from(this.locations.values())) {
      const distance = Math.sqrt(
        Math.pow(location.latitude - lat, 2) + Math.pow(location.longitude - lon, 2)
      );
      if (distance < threshold) {
        return location;
      }
    }
    return undefined;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const location: Location = {
      id,
      city: insertLocation.city,
      state: insertLocation.state,
      country: insertLocation.country,
      latitude: insertLocation.latitude,
      longitude: insertLocation.longitude,
      createdAt: new Date()
    };
    this.locations.set(id, location);
    return location;
  }

  async searchLocations(query: string): Promise<Location[]> {
    const results: Location[] = [];
    const lowerQuery = query.toLowerCase();

    for (const location of Array.from(this.locations.values())) {
      if (location.city.toLowerCase().includes(lowerQuery) ||
          location.state.toLowerCase().includes(lowerQuery) ||
          location.country.toLowerCase().includes(lowerQuery)) {
        results.push(location);
      }
    }

    // If no results found, create a mock location for demo
    if (results.length === 0) {
      const mockLocation = await this.createLocation({
        city: query,
        state: "India",
        country: "India",
        latitude: 19.0760 + (Math.random() - 0.5) * 0.1,
        longitude: 72.8777 + (Math.random() - 0.5) * 0.1
      });
      results.push(mockLocation);
    }

    return results;
  }

  async getLatestAqiReading(locationId: number): Promise<AqiReading | undefined> {
    const readings = Array.from(this.aqiReadings.values())
      .filter(reading => reading.locationId === locationId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
    return readings[0];
  }

  async createAqiReading(insertReading: InsertAqiReading): Promise<AqiReading> {
    const id = this.currentAqiId++;
    const reading: AqiReading = {
      ...insertReading,
      id,
      locationId: insertReading.locationId || null,
      timestamp: new Date()
    };
    this.aqiReadings.set(id, reading);
    return reading;
  }

  async getAqiHistory(locationId: number, limit = 10): Promise<AqiReading[]> {
    return Array.from(this.aqiReadings.values())
      .filter(reading => reading.locationId === locationId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async getLatestWeatherData(locationId: number): Promise<WeatherData | undefined> {
    const weatherEntries = Array.from(this.weatherData.values())
      .filter(weather => weather.locationId === locationId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
    return weatherEntries[0];
  }

  async createWeatherData(insertWeather: InsertWeatherData): Promise<WeatherData> {
    const id = this.currentWeatherId++;
    const weather: WeatherData = {
      ...insertWeather,
      id,
      locationId: insertWeather.locationId || null,
      timestamp: new Date()
    };
    this.weatherData.set(id, weather);
    return weather;
  }

  async getUserAlert(): Promise<UserAlert | undefined> {
    const alerts = Array.from(this.userAlerts.values());
    return alerts[0]; // Return first alert (single user system for now)
  }

  async createOrUpdateUserAlert(insertAlert: InsertUserAlert): Promise<UserAlert> {
    const existing = await this.getUserAlert();
    if (existing) {
      const updated: UserAlert = { ...existing, ...insertAlert };
      this.userAlerts.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentAlertId++;
      const alert: UserAlert = {
        ...insertAlert,
        id,
        threshold: insertAlert.threshold || 100,
        emailNotifications: insertAlert.emailNotifications || false,
        pushNotifications: insertAlert.pushNotifications || false,
        dailySummary: insertAlert.dailySummary || false,
        createdAt: new Date()
      };
      this.userAlerts.set(id, alert);
      return alert;
    }
  }

  async getForecast(locationId: number): Promise<ForecastData[]> {
    return Array.from(this.forecastData.values())
      .filter(forecast => forecast.locationId === locationId)
      .sort((a, b) => a.hour - b.hour);
  }

  async createForecastData(insertForecast: InsertForecastData): Promise<ForecastData> {
    const id = this.currentForecastId++;
    const forecast: ForecastData = {
      ...insertForecast,
      id,
      locationId: insertForecast.locationId || null,
      timestamp: new Date()
    };
    this.forecastData.set(id, forecast);
    return forecast;
  }

  async clearOldForecast(locationId: number): Promise<void> {
    const toDelete = Array.from(this.forecastData.entries())
      .filter(([_, forecast]) => forecast.locationId === locationId);

    toDelete.forEach(([id]) => {
      this.forecastData.delete(id);
    });
  }
}

export const storage = new MemStorage();