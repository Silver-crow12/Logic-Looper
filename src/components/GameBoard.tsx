"use client";

import { useState, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Lightbulb } from "lucide-react";
import { useSync } from "@/hooks/useSync";
import { saveActivity } from "@/lib/db";
import { toast } from "sonner"; 

interface GameBoardProps {
  puzzleGrid: number[][];
  solution: number[][];
  initialComplete: boolean;
}

export default function GameBoard({ puzzleGrid, solution, initialComplete }: GameBoardProps) {
  useSync();
  const { user } = useUser();
  
  // Initialize grid with a deep copy of the puzzle
  const [grid, setGrid] = useState<number[][]>(puzzleGrid.map(row => [...row]));
  const [isWon, setIsWon] = useState(initialComplete);
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedHints = localStorage.getItem(`hints-${today}`);
    if (savedHints) setHintsUsed(parseInt(savedHints, 10));
  }, []);

  const handleCellClick = (row: number, col: number) => {
    // Prevent clicking if won or if it's a fixed cell
    if (isWon || puzzleGrid[row][col] !== 0) return;

    const newGrid = grid.map((r) => [...r]);
    const val = newGrid[row][col];
    // Cycle numbers 1-4
    newGrid[row][col] = val >= 4 ? 1 : val + 1;
    
    setGrid(newGrid);
    checkWin(newGrid);
  };

  const resetGame = () => {
    // 1. Reset Grid to original puzzle state
    setGrid(puzzleGrid.map(row => [...row]));
    // 2. Allow playing again
    setIsWon(false);
    // 3. Reset hints for this practice session
    setHintsUsed(0);
    
    toast.info("Game Reset", {
      description: "Good luck solving it again!",
    });
  };

  const useHint = () => {
    if (isWon) return;

    if (hintsUsed >= 3) {
      toast.error("No hints remaining", {
        description: "You've used all 3 hints for today.",
      });
      return;
    }

    const candidates: { r: number; c: number }[] = [];
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (puzzleGrid[r][c] !== 0) return;
        if (cell === 0 || cell !== solution[r][c]) {
          candidates.push({ r, c });
        }
      });
    });

    if (candidates.length === 0) return;

    const random = candidates[Math.floor(Math.random() * candidates.length)];
    const newGrid = grid.map((r) => [...r]);
    newGrid[random.r][random.c] = solution[random.r][random.c];
    
    setGrid(newGrid);
    
    const newCount = hintsUsed + 1;
    setHintsUsed(newCount);
    // We only save hint usage to localStorage, so replays don't consume daily limit permanently if you don't want them to.
    // However, for strict daily limits, keep the localStorage set:
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`hints-${today}`, newCount.toString());
    
    checkWin(newGrid);
  };

  const checkWin = async (currentGrid: number[][]) => {
    if (JSON.stringify(currentGrid) === JSON.stringify(solution)) {
      setIsWon(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      
      const today = new Date().toISOString().split("T")[0];
      // Save score only if not already saved (prevents duplicate db hits on replay)
      if (!initialComplete) {
         await saveActivity(today, 100, 60, "Medium");
      }
      
      toast.success("Puzzle Solved!", {
        description: "Great job! Challenge complete.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* HEADER */}
      <div className="flex w-full max-w-sm justify-between items-center px-2">
         <Button 
            variant="outline" 
            size="sm" 
            onClick={useHint}
            disabled={isWon || hintsUsed >= 3}
            className={`gap-2 ${hintsUsed >= 3 ? "opacity-50" : "hover:bg-primary/10 hover:text-primary border-primary/20"}`}
          >
            <Lightbulb className={`w-4 h-4 ${hintsUsed < 3 ? "text-primary fill-primary" : "text-zinc-400"}`} />
            <span>Hints: {3 - hintsUsed}/3</span>
          </Button>

         {isWon && (
            <span className="text-primary font-bold text-sm flex items-center gap-1 animate-in fade-in">
              <Trophy className="w-4 h-4" /> Solved!
            </span>
         )}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-4 gap-2 bg-card p-4 rounded-xl shadow-xl border border-border">
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isFixed = puzzleGrid[r][c] !== 0;
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`
                  w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-3xl font-bold rounded-lg cursor-pointer transition-all select-none
                  ${
                    isFixed
                      ? "bg-muted text-muted-foreground cursor-default" 
                      : cell === 0
                      ? "bg-background hover:bg-accent border-2 border-dashed border-border text-foreground"
                      : "bg-primary text-primary-foreground shadow-md hover:brightness-110 active:scale-95 border-none"
                  }
                `}
              >
                {cell !== 0 && cell}
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER ACTIONS */}
      {!user && isWon && (
        <div className="bg-primary/10 p-4 rounded-lg text-center animate-in slide-in-from-bottom-2">
          <p className="text-sm text-primary mb-2">Sign in to save your streak!</p>
          <SignInButton mode="modal">
            <Button>Sign In to Sync</Button>
          </SignInButton>
        </div>
      )}

      {/* UPDATED: Play Again Button now calls resetGame instead of reload */}
      {isWon && (
        <Button 
          variant="ghost" 
          onClick={resetGame} 
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4" /> 
          Play Again
        </Button>
      )}
    </div>
  );
}