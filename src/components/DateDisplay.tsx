"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

export function DateDisplay() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      setCurrentDate(new Date());

      const intervalId = setInterval(() => {
        setCurrentDate(new Date());
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(intervalId);
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  if (!currentDate) {
    return (
      <div className="flex items-center gap-2 text-zinc-400">
        <Calendar className="h-4 w-4" />
        <span className="text-sm">加载中...</span>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const weekday = weekdays[currentDate.getDay()];

  return (
    <div className="flex items-center gap-2 text-zinc-300">
      <Calendar className="h-4 w-4 text-amber-500" />
      <span className="text-sm font-medium">
        {year}年{month}月{day}日 {weekday}
      </span>
    </div>
  );
}
