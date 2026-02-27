"use client";

import { useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";

const SETTING_KEY_DATE = "game_date";
const SETTING_KEY_ERA = "era_name";

export function DateDisplay() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editYear, setEditYear] = useState(0);
  const [editMonth, setEditMonth] = useState(0);
  const [editDay, setEditDay] = useState(0);
  const [eraName, setEraName] = useState("深冬之年");
  const [isEditingEra, setIsEditingEra] = useState(false);
  const [editEraName, setEditEraName] = useState("深冬之年");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/system-settings?keys=${SETTING_KEY_DATE},${SETTING_KEY_ERA}`);
      if (response.ok) {
        const settings = await response.json();
        
        if (settings[SETTING_KEY_DATE]) {
          const parsedDate = new Date(settings[SETTING_KEY_DATE]);
          if (!isNaN(parsedDate.getTime())) {
            setCurrentDate(parsedDate);
            setEditYear(parsedDate.getFullYear());
            setEditMonth(parsedDate.getMonth() + 1);
            setEditDay(parsedDate.getDate());
          } else {
            initializeWithCurrentDate();
          }
        } else {
          initializeWithCurrentDate();
        }
        
        if (settings[SETTING_KEY_ERA]) {
          setEraName(settings[SETTING_KEY_ERA]);
          setEditEraName(settings[SETTING_KEY_ERA]);
        }
      } else {
        initializeWithCurrentDate();
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      initializeWithCurrentDate();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWithCurrentDate = () => {
    const now = new Date();
    setCurrentDate(now);
    setEditYear(now.getFullYear());
    setEditMonth(now.getMonth() + 1);
    setEditDay(now.getDate());
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      await fetch("/api/system-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
    } catch (error) {
      console.error("Failed to save setting:", error);
    }
  };

  useEffect(() => {
    if (!currentDate) return;

    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const now = new Date();
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      setCurrentDate(prevDate => {
        if (!prevDate) return prevDate;
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + 1);
        setEditYear(newDate.getFullYear());
        setEditMonth(newDate.getMonth() + 1);
        setEditDay(newDate.getDate());
        saveSetting(SETTING_KEY_DATE, newDate.toISOString());
        return newDate;
      });

      const intervalId = setInterval(() => {
        setCurrentDate(prevDate => {
          if (!prevDate) return prevDate;
          const newDate = new Date(prevDate);
          newDate.setDate(newDate.getDate() + 1);
          setEditYear(newDate.getFullYear());
          setEditMonth(newDate.getMonth() + 1);
          setEditDay(newDate.getDate());
          saveSetting(SETTING_KEY_DATE, newDate.toISOString());
          return newDate;
        });
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(intervalId);
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, [currentDate]);

  const handleEdit = () => setIsEditing(true);
  const handleSave = async () => {
    const newDate = new Date(editYear, editMonth - 1, editDay);
    setCurrentDate(newDate);
    await saveSetting(SETTING_KEY_DATE, newDate.toISOString());
    setIsEditing(false);
  };
  const handleCancel = () => {
    if (currentDate) {
      setEditYear(currentDate.getFullYear());
      setEditMonth(currentDate.getMonth() + 1);
      setEditDay(currentDate.getDate());
    }
    setIsEditing(false);
  };
  const handleEditEra = () => {
    setEditEraName(eraName);
    setIsEditingEra(true);
  };
  const handleSaveEra = async () => {
    setEraName(editEraName);
    await saveSetting(SETTING_KEY_ERA, editEraName);
    setIsEditingEra(false);
  };
  const handleCancelEra = () => {
    setEditEraName(eraName);
    setIsEditingEra(false);
  };

  if (isLoading || !currentDate) {
    return (
      <div className="flex items-center gap-2 text-zinc-400">
        <Calendar className="h-6 w-6" />
        <span className="text-lg">加载中...</span>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const weekday = weekdays[currentDate.getDay()];
  const yearFrom1492 = year - 1492;

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-950/80 to-zinc-900/80 border border-amber-500/40 rounded-2xl p-4 backdrop-blur-xl shadow-2xl shadow-amber-500/10">
        <Calendar className="h-6 w-6 text-amber-400" />
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1492"
            max="9999"
            value={editYear}
            onChange={(e) => setEditYear(parseInt(e.target.value) || 1492)}
            className="w-20 bg-zinc-800/80 border border-amber-500/30 rounded-xl px-3 py-2 text-center text-amber-200 font-serif transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 outline-none"
          />
          <span className="text-amber-200 font-serif">年</span>
          <input
            type="number"
            min="1"
            max="12"
            value={editMonth}
            onChange={(e) => setEditMonth(parseInt(e.target.value) || 1)}
            className="w-14 bg-zinc-800/80 border border-amber-500/30 rounded-xl px-3 py-2 text-center text-amber-200 font-serif transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 outline-none"
          />
          <span className="text-amber-200 font-serif">月</span>
          <input
            type="number"
            min="1"
            max="31"
            value={editDay}
            onChange={(e) => setEditDay(parseInt(e.target.value) || 1)}
            className="w-14 bg-zinc-800/80 border border-amber-500/30 rounded-xl px-3 py-2 text-center text-amber-200 font-serif transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 outline-none"
          />
          <span className="text-amber-200 font-serif">日</span>
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
    <div className="flex items-center gap-3 group">
      <Calendar className="h-6 w-6 text-amber-400" />
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-amber-950/70 to-zinc-900/70 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-xl hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-2">
            <div className="text-right text-xs text-amber-300 font-serif tracking-wider">
              西元 {year}年 / 
              {isEditingEra ? (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={editEraName}
                    onChange={(e) => setEditEraName(e.target.value)}
                    className="bg-zinc-800/80 border border-amber-500/30 rounded-lg px-2 py-1 text-xs text-amber-200 font-serif outline-none"
                  />
                  <button
                    onClick={handleSaveEra}
                    className="p-0.5 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <X className="h-3 w-3 rotate-45" />
                  </button>
                  <button
                    onClick={handleCancelEra}
                    className="p-0.5 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <span className="cursor-pointer hover:text-amber-200 transition-colors" onClick={handleEditEra}>
                  {eraName} {yearFrom1492}年
                </span>
              )}
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-100 font-serif cursor-pointer tracking-wide" onClick={handleEdit}>
            {month}月{day}日 {weekday}
          </div>
        </div>
      </div>
    </div>
  );
}
