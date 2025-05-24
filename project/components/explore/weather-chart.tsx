'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getForecast } from '@/lib/api/weather';

interface WeatherChartProps {
  lat: number;
  lon?: number;
  lng?: number;
}

export function WeatherChart({ lat, lon, lng }: WeatherChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CACHE_KEY = `weather-forecast-${lat}-${lon}`;
  const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours
  
  useEffect(() => {
    async function loadForecastData() {
      try {
        // Use lon if provided, otherwise use lng, default to 0 if neither is provided
        const longitude = lon ?? lng ?? 0;
        
        if (!isValidCoordinate(lat, longitude)) {
          throw new Error('Invalid coordinates provided');
        }

          // Try to get cached data
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const { timestamp, data, lat: cachedLat, lon: cachedLon } = parsed;
  
          // Check if cached data is for the same coords and still fresh
          if (
            cachedLat === lat &&
            cachedLon === longitude &&
            Date.now() - timestamp < CACHE_DURATION
          ) {
            setForecastData(data);
            setError(null);
            setLoading(false);
            return;
          }
        }

        const forecast = await getForecast(lat, longitude);
        
        if (!Array.isArray(forecast) || forecast.length === 0) {
          throw new Error('No forecast data available');
        }

        // Validate and process the forecast data
        const processedData = forecast
          .filter(item => 
            item?.dt && 
            item?.main?.temp !== undefined && 
            item?.main?.humidity !== undefined && 
            item?.clouds?.all !== undefined
          )
          .map(item => ({
            time: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            temp: Math.round(item.main.temp),
            temp_min: Math.round(item.main.temp_min),
            temp_max: Math.round(item.main.temp_max),
            humidity: item.main.humidity,
            clouds: item.clouds.all,
            weather: item.weather?.description || 'Unknown',
            wind: item.wind?.speed || 0,
            pop: item.pop ? Math.round(item.pop * 100) : 0
          }));

        if (processedData.length === 0) {
          throw new Error('No valid weather data available');
        }
        
        // Cache the new data with timestamp and coords
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: processedData, lat, lon: longitude })
        );
        
        setForecastData(processedData);
        setError(null);
      } catch (error) {
        console.error('Error loading forecast:', error);
        setError(error instanceof Error ? error.message : 'Unable to load weather data');
        setForecastData([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadForecastData();
  }, [lat, lon, lng]);
  
  if (loading) {
    return <div className="h-[180px] w-full flex items-center justify-center">Loading weather data...</div>;
  }

  if (error || forecastData.length === 0) {
    return (
      <div className="h-[180px] w-full flex items-center justify-center text-muted-foreground">
        {error || 'No weather data available'}
      </div>
    );
  }
  
  // Get colors from CSS variables
  const chart1 = 'hsl(var(--chart-1, 142 76% 36%))'; // Green for temperature
  const chart2 = 'hsl(var(--chart-2, 220 91% 54%))'; // Blue for humidity
  const chart3 = 'hsl(var(--chart-3, 346 84% 61%))'; // Red for cloud cover
  const axisColor = isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))';
  
  return (
    <div className="h-[200px] w-full bg-background/50 rounded-lg p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={forecastData}
          margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chart1} stopOpacity={0.8} />
              <stop offset="95%" stopColor={chart1} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chart2} stopOpacity={0.8} />
              <stop offset="95%" stopColor={chart2} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorClouds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chart3} stopOpacity={0.8} />
              <stop offset="95%" stopColor={chart3} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10, fill: axisColor }} 
            tickLine={false} 
            axisLine={{ stroke: axisColor, strokeOpacity: 0.3 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 10, fill: axisColor }}
            tickLine={false}
            axisLine={{ stroke: axisColor, strokeOpacity: 0.3 }}
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: axisColor } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10, fill: axisColor }}
            tickLine={false}
            axisLine={{ stroke: axisColor, strokeOpacity: 0.3 }}
            label={{ value: 'Humidity/Clouds (%)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: axisColor } }}
          />
          <CartesianGrid vertical={false} stroke={axisColor} strokeOpacity={0.1} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'hsl(var(--background))' : 'white',
              borderColor: 'hsl(var(--border))', 
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 1px 8px rgba(0,0,0,0.1)'
            }}
            formatter={(value, name) => {
              if (name === 'Temperature') return [`${value}°C`, name];
              if (name === 'Humidity' || name === 'Cloud Cover') return [`${value}%`, name];
              return [value, name];
            }}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            }}
          />
          <Legend 
            iconType="circle" 
            iconSize={8} 
            wrapperStyle={{ fontSize: '10px' }}
            formatter={(value) => {
              if (value === 'temp') return 'Temperature (°C)';
              if (value === 'humidity') return 'Humidity (%)';
              if (value === 'clouds') return 'Cloud Cover (%)';
              return value;
            }}
          />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="temp" 
            name="Temperature" 
            stroke={chart1} 
            fillOpacity={1} 
            fill="url(#colorTemp)" 
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="humidity" 
            name="Humidity" 
            stroke={chart2} 
            fillOpacity={1} 
            fill="url(#colorHumidity)" 
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="clouds" 
            name="Cloud Cover" 
            stroke={chart3} 
            fillOpacity={1} 
            fill="url(#colorClouds)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' && 
    typeof lon === 'number' && 
    !isNaN(lat) && 
    !isNaN(lon) && 
    lat >= -90 && 
    lat <= 90 && 
    lon >= -180 && 
    lon <= 180
  );
}