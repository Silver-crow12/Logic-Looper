import { prisma } from "@/lib/prisma";
import { inngest } from "./client";

import { generateDailyPuzzle } from "@/lib/puzzle-generator";

export const generateDailyPuzzleJob = inngest.createFunction(
  { id: "generate-daily-puzzle" }, 
  { cron: "0 0 * * *" },
  async ({ step }) => {
    
   
    const { grid, solution } = await step.run("generate-logic", async () => {
      return generateDailyPuzzle();
    });

   
    const puzzle = await step.run("save-to-db", async () => {
      const today = new Date().toISOString().split("T")[0]; 
      
      return await prisma.puzzle.upsert({
        where: { date: today },
        update: {}, 
        create: {
          date: today,
          grid: JSON.stringify(grid),
          solution: JSON.stringify(solution),
        },
      });
    });

    return { success: true, date: puzzle.date };
  }
);