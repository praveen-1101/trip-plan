'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getForecast } from '@/lib/api/weather';

export function WeatherChart({ lat, lon }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadForecastData() {
      try {
        const forecast = await getForecast(lat, lon);
        const processedData = forecast.map(item => ({
          time: new Date(item.dt * 1000).toLocaleDateString(),
          temp: item.main.temp,
          humidity: item.main.humidity,
          clouds: item.clouds.all
        }));
        setForecastData(processedData);
      } catch (error) {
        console.error('Error loading forecast:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadForecastData();
  }, [lat, lon]);
  
  if (loading) {
    return <div className="h-[180px] w-full flex items-center justify-center">Loading weather data...</div>;
  }
  
  const chart1 = 'hsl(var(--chart-1))';
  const chart2 = 'hsl(var(--chart-2))';
  const chart3 = 'hsl(var(--chart-3))';
  const axisColor = isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))';
  
  return (
    <div className="h-[180px] w-full">
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
            tick={{ fontSize: 10 }} 
            tickLine={false} 
            axisLine={{ stroke: axisColor, strokeOpacity: 0.3 }} 
            tick={{ fill: axisColor }}
          />
          <YAxis hide={true} />
          <CartesianGrid vertical={false} stroke={axisColor} strokeOpacity={0.1} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'hsl(var(--background))' : 'white',
              borderColor: 'hsl(var(--border))', 
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 1px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
          <Area 
            type="monotone" 
            dataKey="temp" 
            name="Temperature (°C)" 
            stroke={chart1} 
            fillOpacity={1} 
            fill="url(#colorTemp)" 
          />
          <Area 
            type="monotone" 
            dataKey="humidity" 
            name="Humidity (%)" 
            stroke={chart2} 
            fillOpacity={1} 
            fill="url(#colorHumidity)" 
          />
          <Area 
            type="monotone" 
            dataKey="clouds" 
            name="Cloud Cover (%)" 
            stroke={chart3} 
            fillOpacity={1} 
            fill="url(#colorClouds)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}