export function generateDailyPuzzle() {
  const base = [
    [1, 2, 3, 4],
    [4, 3, 2, 1],
    [2, 1, 4, 3],
    [3, 4, 1, 2],
  ];

  const solution = [...base];
  const grid = solution.map((row) =>
    row.map((num) => (Math.random() > 0.5 ? 0 : num)),
  );

  return { solution, grid };
}
