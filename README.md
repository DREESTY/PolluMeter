# 🌫️ PolluMeter - Real-Time Air Quality Visualizer

PolluMeter is a full-stack web application designed to monitor and visualize real-time air quality data in underserved regions of India. With interactive charts, live maps, and user alerts, PolluMeter empowers individuals to stay informed about air pollution and make healthier lifestyle choices.

---

## 📌 Overview

PolluMeter provides:
- **Live AQI data** from OpenAQ
- **Current weather** from OpenWeatherMap
- **48-hour air quality forecast** (mocked for now)
- **Custom user alerts** for AQI thresholds
- **Interactive location-based maps** and a sleek glassmorphism UI

---

## 🏗️ System Architecture

### 🌐 Frontend (React 18 + TypeScript)
- **Build Tool**: Vite
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) on Radix primitives
- **Styling**: TailwindCSS with custom glassmorphism design + AQI-based color coding
- **Routing**: Wouter (lightweight)
- **Global State**: Zustand
- **Server State**: TanStack Query (React Query)
- **Charts**: Recharts

### 🔧 Backend (Express.js + TypeScript)
- **Framework**: Express (ESM Modules)
- **Database**: PostgreSQL using **Drizzle ORM**
- **Hosting**: Neon (serverless PostgreSQL)
- **API Architecture**: RESTful, modular, with error handling
- **External APIs**: OpenAQ, OpenWeatherMap

---

## 🗃️ Database Schema

- `locations`: City/location info + geocoordinates  
- `aqi_readings`: Historical AQI + pollutant breakdown  
- `weather_data`: Real-time weather info  
- `user_alerts`: Custom alert preferences  
- `forecast_data`: 48-hour forecasted AQI (mock data)

---

## 🖥️ Frontend Pages

| Page       | Description                                                  |
|------------|--------------------------------------------------------------|
| Dashboard  | Live AQI + weather + health suggestions                      |
| Forecast   | 48-hour AQI graph + trend analysis                           |
| Map        | Interactive map with nearby AQI data                         |
| Alerts     | User-configurable AQI thresholds + notifications             |
| Settings   | Theme toggle, preferred city, data units, etc.               |

---

## 🔌 API Endpoints

| Endpoint                          | Description                                     |
|----------------------------------|-------------------------------------------------|
| `/api/current/:locationId`       | Current AQI and weather                        |
| `/api/forecast/:locationId`      | 48-hour AQI prediction                         |
| `/api/locations/*`               | Location search and reverse geolocation        |
| `/api/alerts`                    | User alert configuration                       |
| `/api/nearby/:locationId`        | Nearby locations for Map View                  |

---

## 🔄 Data Flow Summary

1. **Location Detection**: Browser geolocation or manual input  
2. **Backend Fetching**: External APIs (OpenAQ, OpenWeatherMap)  
3. **Processing**: Pollutant breakdown, AQI scaling  
4. **Persistence**: PostgreSQL for historical data and forecasts  
5. **Frontend Display**: Real-time data refresh every 5 minutes

---

## 📦 External Dependencies

### 🌍 Production APIs
- [OpenAQ API](https://docs.openaq.org/)
- [OpenWeatherMap API](https://openweathermap.org/api)

### 🛠️ Dev Tools
- Vite, TypeScript, Replit integration

### 🧩 UI Libraries
- **Radix UI** (accessible primitives)
- **Lucide React** (icons)
- **Embla Carousel** (mobile-friendly carousels)
- **Date-fns** (date manipulation)

---

## 🚀 Deployment Strategy

### Build
- Frontend → `dist/public` via Vite  
- Backend → Bundled `dist/index.js` via ESBuild  
- Shared → Type-safe schemas via `shared/schema.ts`

### Env Vars
```bash
DATABASE_URL=your_postgres_url
OPENWEATHER_API_KEY=your_weather_api_key
NODE_ENV=production
