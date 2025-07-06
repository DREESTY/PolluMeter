import { pgTable, text, serial, integer, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull().default("India"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aqiReadings = pgTable("aqi_readings", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  aqi: integer("aqi").notNull(),
  level: text("level").notNull(), // Good, Moderate, Unhealthy for Sensitive, Unhealthy, Very Unhealthy, Hazardous
  primaryPollutant: text("primary_pollutant").notNull(),
  pollutants: jsonb("pollutants").notNull(), // {pm25: number, pm10: number, o3: number, no2: number, so2: number, co: number}
  timestamp: timestamp("timestamp").defaultNow(),
});

export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  temperature: real("temperature").notNull(),
  humidity: integer("humidity").notNull(),
  windSpeed: real("wind_speed").notNull(),
  visibility: real("visibility").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const userAlerts = pgTable("user_alerts", {
  id: serial("id").primaryKey(),
  threshold: integer("threshold").notNull().default(100),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(false),
  dailySummary: boolean("daily_summary").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forecastData = pgTable("forecast_data", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  hour: integer("hour").notNull(), // 0-47 for 48 hour forecast
  predictedAqi: integer("predicted_aqi").notNull(),
  predictedLevel: text("predicted_level").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertAqiReadingSchema = createInsertSchema(aqiReadings).omit({
  id: true,
  timestamp: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  timestamp: true,
});

export const insertUserAlertSchema = createInsertSchema(userAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertForecastDataSchema = createInsertSchema(forecastData).omit({
  id: true,
  timestamp: true,
});

// Types
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type AqiReading = typeof aqiReadings.$inferSelect;
export type InsertAqiReading = z.infer<typeof insertAqiReadingSchema>;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type UserAlert = typeof userAlerts.$inferSelect;
export type InsertUserAlert = z.infer<typeof insertUserAlertSchema>;
export type ForecastData = typeof forecastData.$inferSelect;
export type InsertForecastData = z.infer<typeof insertForecastDataSchema>;

// Pollutants interface
export interface Pollutants {
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
}
