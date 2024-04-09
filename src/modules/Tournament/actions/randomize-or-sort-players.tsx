import { tournamentAnalysisOutput } from "./matchup-game-analysis";

type RandomizeOrSortPlayersFunction = (
  targetRound: number,
  analysisObj: tournamentAnalysisOutput,
) => string[];

const shuffleArray = (arr: string[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const randomizeOrSortPlayers: RandomizeOrSortPlayersFunction = (
  targetRound,
  analysisObj,
) => {
  if (targetRound > 1) {
    return Object.keys(analysisObj.scoreObj).sort((a, b) => analysisObj.scoreObj[a] - analysisObj.scoreObj[b]);
  } else {
    return shuffleArray(Object.keys(analysisObj.scoreObj));
  }
}