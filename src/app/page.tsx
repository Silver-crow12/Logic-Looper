import { currentUser } from "@clerk/nextjs/server";

import GameBoard from "@/components/GameBoard";
import ContributionHeatmap from "@/components/ContributionHeatmap";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const user = await currentUser();
  const today = new Date().toISOString().split("T")[0];

  let puzzle = await prisma.puzzle.findUnique({
    where: { date: today },
  });

  if (!puzzle) {
    const { generateDailyPuzzle } = await import("@/lib/puzzle-generator");
    const { grid, solution } = generateDailyPuzzle();
    puzzle = await prisma.puzzle.create({
      data: {
        date: today,
        grid: JSON.stringify(grid),
        solution: JSON.stringify(solution),
      },
    });
  }

  let userScore = null;
  if (user) {
    userScore = await prisma.score.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 gap-8">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-zinc-900">
          Logic<span className="text-blue-600">Looper</span>
        </h1>
        <p className="text-zinc-500">Daily mental gymnastics.</p>
      </div>

      {/* GAME AREA */}
      <GameBoard
        puzzleGrid={JSON.parse(puzzle.grid as string)}
        solution={JSON.parse(puzzle.solution as string)}
        initialComplete={!!userScore}
      />

      {/* STATS AREA */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-zinc-800 flex items-center gap-2">
          Your Activity
          <span className="text-xs font-normal text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full">
            2026
          </span>
        </h2>

        {/* The Heatmap */}
        <ContributionHeatmap />
      </div>
    </main>
  );
}
