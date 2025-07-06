export function getAqiLevel(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

export function getAqiColor(aqi: number): string {
  if (aqi <= 50) return "text-green-600";
  if (aqi <= 100) return "text-yellow-600";
  if (aqi <= 150) return "text-orange-600";
  if (aqi <= 200) return "text-red-600";
  if (aqi <= 300) return "text-purple-600";
  return "text-red-800";
}

export function getAqiGradient(level: string): string {
  switch (level.toLowerCase()) {
    case "good":
      return "aqi-gradient-good";
    case "moderate":
      return "aqi-gradient-moderate";
    case "unhealthy for sensitive":
      return "aqi-gradient-sensitive";
    case "unhealthy":
      return "aqi-gradient-unhealthy";
    case "very unhealthy":
      return "aqi-gradient-very-unhealthy";
    case "hazardous":
      return "aqi-gradient-hazardous";
    default:
      return "aqi-gradient-moderate";
  }
}

export function getHealthRecommendations(aqi: number): Array<{
  icon: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'danger';
}> {
  if (aqi <= 50) {
    return [
      {
        icon: "CheckCircle",
        title: "Great Air Quality",
        description: "Perfect for all outdoor activities",
        type: "info"
      }
    ];
  } else if (aqi <= 100) {
    return [
      {
        icon: "AlertTriangle",
        title: "Moderate Air Quality",
        description: "Sensitive individuals should limit outdoor activities",
        type: "warning"
      },
      {
        icon: "Home",
        title: "Consider Indoor Activities",
        description: "Children and elderly should stay indoors during peak hours",
        type: "info"
      }
    ];
  } else if (aqi <= 150) {
    return [
      {
        icon: "Shield",
        title: "Wear a Mask",
        description: "N95 masks recommended for outdoor activities",
        type: "warning"
      },
      {
        icon: "Home",
        title: "Limit Outdoor Exposure",
        description: "Reduce prolonged outdoor activities",
        type: "warning"
      }
    ];
  } else {
    return [
      {
        icon: "AlertCircle",
        title: "Stay Indoors",
        description: "Avoid outdoor activities completely",
        type: "danger"
      },
      {
        icon: "Shield",
        title: "Essential Protection",
        description: "N95 or higher grade masks required if going outside",
        type: "danger"
      },
      {
        icon: "Wind",
        title: "Use Air Purifiers",
        description: "Keep windows closed and use air purifiers indoors",
        type: "warning"
      }
    ];
  }
}

export function formatPollutantValue(value: number, unit: string = "μg/m³"): string {
  if (value === 0) return `0 ${unit}`;
  return `${Math.round(value)} ${unit}`;
}
