"use client";

import { useState, useEffect } from "react";
import { Calendar, Edit2, X, Check } from "lucide-react";

export function DateDisplay() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editYear, setEditYear] = useState(0);
  const [editMonth, setEditMonth] = useState(0);
  const [editDay, setEditDay] = useState(0);
  const [eraName, setEraName] = useState("深冬之年");
  const [isEditingEra, setIsEditingEra] = useState(false);
  const [editEraName, setEditEraName] = useState("深冬之年");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setEditYear(now.getFullYear());
    setEditMonth(now.getMonth() + 1);
    setEditDay(now.getDate());
    setEditEraName(eraName);

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      const newDate = new Date();
      setCurrentDate(newDate);
      setEditYear(newDate.getFullYear());
      setEditMonth(newDate.getMonth() + 1);
      setEditDay(newDate.getDate());

      const intervalId = setInterval(() => {
        const newDate = new Date();
        setCurrentDate(newDate);
        setEditYear(newDate.getFullYear());
        setEditMonth(newDate.getMonth() + 1);
        setEditDay(newDate.getDate());
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(intervalId);
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const newDate = new Date(editYear, editMonth - 1, editDay);
    setCurrentDate(newDate);
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

  const handleSaveEra = () => {
    setEraName(editEraName);
    setIsEditingEra(false);
  };

  const handleCancelEra = () => {
    setEditEraName(eraName);
    setIsEditingEra(false);
  };

  if (!currentDate) {
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
  
  // 计算以1492年为原点的年份
  const yearFrom1492 = year - 1492;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 bg-zinc-800/80 border border-amber-500/30 rounded-lg p-3 backdrop-blur-sm">
        <Calendar className="h-6 w-6 text-amber-500" />
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1492"
            max="9999"
            value={editYear}
            onChange={(e) => setEditYear(parseInt(e.target.value) || 1492)}
            className="w-16 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-center text-amber-300 font-medieval"
          />
          <span className="text-amber-300 font-medieval">年</span>
          <input
            type="number"
            min="1"
            max="12"
            value={editMonth}
            onChange={(e) => setEditMonth(parseInt(e.target.value) || 1)}
            className="w-10 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-center text-amber-300 font-medieval"
          />
          <span className="text-amber-300 font-medieval">月</span>
          <input
            type="number"
            min="1"
            max="31"
            value={editDay}
            onChange={(e) => setEditDay(parseInt(e.target.value) || 1)}
            className="w-10 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-center text-amber-300 font-medieval"
          />
          <span className="text-amber-300 font-medieval">日</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="p-1 text-green-400 hover:text-green-300 transition-colors"
          >
            <Check className="h-5 w-5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <Calendar className="h-6 w-6 text-amber-500" />
      <div className="flex items-center gap-2">
        <div className="bg-zinc-800/80 border border-amber-500/30 rounded-lg p-3 backdrop-blur-sm hover:border-amber-500/60 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="text-right text-xs text-amber-400 font-medieval">
              西元 {year}年 / 
              {isEditingEra ? (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={editEraName}
                    onChange={(e) => setEditEraName(e.target.value)}
                    className="bg-zinc-700 border border-zinc-600 rounded px-2 py-0.5 text-xs text-amber-300 font-medieval"
                  />
                  <button
                    onClick={handleSaveEra}
                    className="p-0.5 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleCancelEra}
                    className="p-0.5 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <span className="cursor-pointer hover:underline" onClick={handleEditEra}>
                  {eraName} {yearFrom1492}年
                </span>
              )}
            </div>
          </div>
          <div className="text-xl font-bold text-amber-300 font-medieval cursor-pointer" onClick={handleEdit}>
            {month}月{day}日 {weekday}
          </div>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-amber-400 hover:text-amber-300"
          onClick={handleEdit}
        >
          <Edit2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
