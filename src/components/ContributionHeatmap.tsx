"use client";

import { useEffect, useState } from "react";
import { getAllActivity } from "@/lib/db";
import { eachDayOfInterval, format, subYears } from "date-fns";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const today = new Date();
const startDate = subYears(today, 1);
const dates = eachDayOfInterval({ start: startDate, end: today });

export default function ContributionHeatmap() {
  const [data, setData] = useState<Record<string, number>>({});

  useEffect(() => {
    getAllActivity().then((activities) => {
      const map: Record<string, number> = {};
      activities.forEach((act) => {
        let intensity = 1;
        if (act.score >= 100) intensity = 4;
        else if (act.score >= 80) intensity = 3;
        else if (act.score >= 50) intensity = 2;
        map[act.date] = intensity;
      });
      setData(map);
    });
  }, []);

  // Intensity Colors using custom hex #414BEA
  const getColor = (level: number) => {
    switch (level) {
      case 1: return "bg-[#414BEA]/20"; // Lightest
      case 2: return "bg-[#414BEA]/50";
      case 3: return "bg-[#414BEA]/80";
      case 4: return "bg-[#414BEA]";    // Solid Royal Blue
      default: return "bg-muted";       // Empty (Grayish)
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[800px]">
        <div className="flex gap-1">
          <div className="grid grid-rows-7 grid-flow-col gap-1">
            {dates.map((date) => {
              const dateKey = format(date, "yyyy-MM-dd");
              const level = data[dateKey] || 0;
              
              return (
                <TooltipProvider key={dateKey}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: Math.random() * 0.05, duration: 0.2 }}
                        className={cn(
                          "w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all",
                          getColor(level)
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-bold">{format(date, "MMM d, yyyy")}</p>
                      <p className="text-xs text-muted-foreground">
                        {level > 0 ? `Level ${level}` : "No activity"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="w-3 h-3 bg-muted rounded-sm" />
          <div className="w-3 h-3 bg-[#414BEA]/20 rounded-sm" />
          <div className="w-3 h-3 bg-[#414BEA]/50 rounded-sm" />
          <div className="w-3 h-3 bg-[#414BEA]/80 rounded-sm" />
          <div className="w-3 h-3 bg-[#414BEA] rounded-sm" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}