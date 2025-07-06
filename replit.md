# PolluMeter - Real-Time Air Quality Visualizer

## Overview

PolluMeter is a full-stack web application that provides real-time air quality monitoring and visualization, focusing on underserved areas in India. The application displays current AQI (Air Quality Index) data, weather information, forecasts, and interactive maps to help users understand and track air pollution levels in their area.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with custom glassmorphism design and AQI-specific color schemes
- **State Management**: Zustand for global application state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Framework**: Express.js with TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with structured error handling
- **External APIs**: OpenAQ for air quality data, OpenWeatherMap for weather information

## Key Components

### Database Schema
- **locations**: Stores city/location information with coordinates
- **aqi_readings**: Historical AQI data with pollutant breakdowns
- **weather_data**: Weather information linked to locations
- **user_alerts**: User-configurable alert thresholds and preferences
- **forecast_data**: 48-hour AQI forecast data (currently using mock data)

### Frontend Pages
1. **Dashboard**: Main overview with current AQI, weather, and health recommendations
2. **Forecast**: 48-hour AQI predictions with trend visualization
3. **Map**: Interactive air quality map showing nearby locations
4. **Alerts**: User notification preferences and threshold configuration
5. **Settings**: Location preferences, theme toggle, and app configuration

### API Endpoints
- `/api/current/:locationId` - Current AQI and weather data
- `/api/forecast/:locationId` - 48-hour forecast data
- `/api/locations/*` - Location search and coordinate-based lookup
- `/api/alerts` - User alert configuration
- `/api/nearby/:locationId` - Nearby locations for map display

## Data Flow

1. **Location Detection**: Browser geolocation API or manual city input
2. **Data Fetching**: Backend calls external APIs (OpenAQ, OpenWeatherMap)
3. **Data Processing**: AQI calculations and pollutant analysis
4. **Database Storage**: Historical data persistence for trends
5. **Frontend Display**: Real-time updates via React Query with 5-minute refresh intervals

## External Dependencies

### Production APIs
- **OpenAQ API**: Air quality data from global monitoring stations
- **OpenWeatherMap API**: Weather information and forecasts

### Development Tools
- **Vite**: Fast development server and build tool
- **Replit Integration**: Development environment optimizations
- **TypeScript**: Type safety across frontend and backend

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Embla Carousel**: Touch-friendly carousels
- **Date-fns**: Date manipulation utilities

## Deployment Strategy

### Build Process
- Frontend: Vite builds to `dist/public`
- Backend: ESBuild bundles server code to `dist/index.js`
- Shared: TypeScript schemas and types accessible to both frontend and backend

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- API keys for external services (`OPENWEATHER_API_KEY`)
- Production/development mode detection

### Database Management
- Drizzle migrations in `/migrations` directory
- Schema defined in `shared/schema.ts` for type safety
- Push-based deployment with `npm run db:push`

## Changelog
```
Changelog:
- July 06, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```