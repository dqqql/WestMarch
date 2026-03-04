"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Calendar, Edit3 } from "lucide-react";
import type { WeatherType, WeatherRecord } from "@prisma/client";
import { WEATHER_CONFIGS, generateNextWeather, getWeatherDescription } from "@/lib/weather";

const SETTING_KEY_CURRENT_WEATHER_DATE = "current_weather_date";

export function WeatherDisplay() {
  const [currentWeather, setCurrentWeather] = useState<WeatherRecord | null>(null);
  const [weatherHistory, setWeatherHistory] = useState<WeatherRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editWeatherType, setEditWeatherType] = useState<WeatherType>("SUNNY");
  const [editDescription, setEditDescription] = useState("");
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentDate = useCallback(async () => {
    try {
      const response = await fetch(`/api/system-settings?keys=game_date`);
      if (response.ok) {
        const settings = await response.json();
        if (settings.game_date) {
          const date = new Date(settings.game_date);
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          setCurrentDate(dateStr);
          return dateStr;
        }
      }
    } catch (error) {
      console.error("Failed to load current date:", error);
    }
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setCurrentDate(dateStr);
    return dateStr;
  }, []);

  const loadWeather = useCallback(async (dateStr: string) => {
    try {
      const response = await fetch(`/api/weather?date=${dateStr}`);
      if (response.ok) {
        const weather = await response.json();
        if (weather) {
          setCurrentWeather(weather);
          setEditWeatherType(weather.weatherType);
          setEditDescription(weather.description || "");
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load weather:", error);
    }
    
    const newWeatherType = generateNextWeather();
    const description = getWeatherDescription(newWeatherType);
    try {
      const newWeather = await saveWeather(dateStr, newWeatherType, description);
      setCurrentWeather(newWeather);
      setEditWeatherType(newWeatherType);
      setEditDescription(description);
    } catch (saveError) {
      console.error("Failed to save weather:", saveError);
      setCurrentWeather({
        id: "temp",
        date: dateStr,
        weatherType: newWeatherType,
        description: description,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setEditWeatherType(newWeatherType);
      setEditDescription(description);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/weather?history=true`);
      if (response.ok) {
        const history = await response.json();
        setWeatherHistory(history);
      }
    } catch (error) {
      console.error("Failed to load weather history:", error);
    }
  }, []);

  const saveWeather = async (date: string, weatherType: WeatherType, description?: string) => {
    const response = await fetch("/api/weather", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, weatherType, description })
    });
    return await response.json();
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const dateStr = await loadCurrentDate();
      if (dateStr) {
        await loadWeather(dateStr);
      }
      setIsLoading(false);
    };
    init();
  }, [loadCurrentDate, loadWeather]);

  const handleEdit = () => {
    if (currentWeather) {
      setEditWeatherType(currentWeather.weatherType);
      setEditDescription(currentWeather.description || "");
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (currentDate) {
      try {
        const updatedWeather = await saveWeather(currentDate, editWeatherType, editDescription);
        setCurrentWeather(updatedWeather);
      } catch (error) {
        console.error("Failed to save weather:", error);
        setCurrentWeather({
          id: currentWeather?.id || "temp",
          date: currentDate,
          weatherType: editWeatherType,
          description: editDescription,
          createdAt: currentWeather?.createdAt || new Date(),
          updatedAt: new Date()
        });
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (currentWeather) {
      setEditWeatherType(currentWeather.weatherType);
      setEditDescription(currentWeather.description || "");
    }
    setIsEditing(false);
  };

  const handleOpenHistory = async () => {
    await loadHistory();
    setIsHistoryOpen(true);
  };

  if (isLoading || !currentWeather || !currentDate) {
    return (
      <div className="flex items-center gap-2 text-zinc-400">
        <span className="text-lg">加载中...</span>
      </div>
    );
  }

  const config = WEATHER_CONFIGS[currentWeather.weatherType];

  if (isEditing) {
    return (
      <div className={`flex items-center gap-3 bg-gradient-to-r ${config.gradient} border border-zinc-600/50 rounded-2xl p-4 backdrop-blur-xl shadow-2xl`}>
        <div className="flex items-center gap-3">
          <select
            value={editWeatherType}
            onChange={(e) => setEditWeatherType(e.target.value as WeatherType)}
            className="bg-zinc-800/80 border border-zinc-600/50 rounded-xl px-3 py-2 text-white transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 outline-none"
          >
            {Object.entries(WEATHER_CONFIGS).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.icon} {cfg.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="天气描述..."
            className="bg-zinc-800/80 border border-zinc-600/50 rounded-xl px-3 py-2 text-white placeholder-zinc-500 transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-xl transition-all"
          >
            <X className="h-5 w-5 rotate-45" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 group">
        <div className={`flex items-center gap-3 bg-gradient-to-r ${config.gradient} border border-zinc-700/50 rounded-2xl p-4 backdrop-blur-xl hover:border-zinc-600/50 hover:shadow-xl transition-all duration-500`}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenHistory}
              className={`text-4xl hover:scale-110 transition-transform duration-300 ${config.isSpecial ? "animate-pulse" : ""}`}
            >
              {config.icon}
            </button>
            <div className="flex flex-col">
              <span className={`text-xl font-bold ${config.color}`}>
                {config.name}
              </span>
              {currentWeather.description && (
                <span className="text-sm text-zinc-400">
                  {currentWeather.description}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleEdit}
            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30 rounded-xl transition-all opacity-0 group-hover:opacity-100"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300" onClick={() => setIsHistoryOpen(false)}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">天气历史</h3>
                  <p className="text-zinc-500 text-sm">查看过去的天气记录</p>
                </div>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-xl">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
              {weatherHistory.length === 0 ? (
                <div className="text-center text-zinc-500 py-8">
                  暂无天气记录
                </div>
              ) : (
                weatherHistory.map((record) => {
                  const cfg = WEATHER_CONFIGS[record.weatherType];
                  return (
                    <div key={record.id} className={`flex items-center gap-4 bg-gradient-to-r ${cfg.gradient} border border-zinc-700/50 rounded-2xl p-4`}>
                      <span className="text-3xl">{cfg.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${cfg.color}`}>{cfg.name}</span>
                          <span className="text-zinc-500 text-sm">{record.date}</span>
                        </div>
                        {record.description && (
                          <p className="text-sm text-zinc-400 mt-1">{record.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
