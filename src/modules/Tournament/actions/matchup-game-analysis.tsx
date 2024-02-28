import type { Game } from "../../../Types/Game";
import type { Match } from "tournament-pairings/dist/Match";

interface tournamentAnalysisProps {
  games: Game[];
  currentMatchups: Match[];
}

type ScoreObjType = {
  [key: string]: number; // This part covers the string keys
} & {
  [key: number]: number; // This part covers the number key
};

type TieBreakObject = {
  white: number | string;
  black: number | string;
  winner: number | string;
  win_style: string | null;
  round: number;
}

//might need to be changed
type BlackWhiteTallyType = {
  [key: string]: string[];
};
//might need to be changed
type PlayerOppRefObjType = {
  [key: string]: (string | number)[];
};

type ScoreCardType = {
  [key: string]: Array<string | number>;
} & {
  [key: number]: Array<string | number>;
};

interface tournamentAnalysisOutput {
  scoreCard: ScoreCardType;
  scoreObj: ScoreObjType;
  tieBreakData: TieBreakObject[];
  blackWhiteTally: BlackWhiteTallyType;
  playerOppRefObj: PlayerOppRefObjType;
}

type TournamentAnalysisFunction = (
  games: Game[],
  currentMatchups: Match[]
) => tournamentAnalysisOutput;

export const tournamentAnalysis: TournamentAnalysisFunction = (
  games,
  currentMatchups,
) => {
  console.log('hello', games)
  const playerOppObj: PlayerOppRefObjType = {};
  const scoreCard: ScoreCardType = {};
  const tieBreakInfo: TieBreakObject[] = [];
  const blackWhite: BlackWhiteTallyType = {};
  const scoreObj: ScoreObjType = {};
  for (const game of games) {

  }


  return ({} as tournamentAnalysisOutput);
}

//output needs

//playerOppRefObj
//FOR SWISS GENERATOR
// ORDER: iterating MATCHUPS in order ======
// currently made from matchups
// can be made from game objects, also ?
// {
//   1: ['g1', 3, 2],
//   g1: [1, 2, 'bye'],
//   2: [3, 'g1', 1],
//   3: [2, 1]
// }

//blackWhiteTally
//FOR SWISS GENERATOR
// ORDER: iterating GAMES in order ======
//can be made with game objects
// {
//   1: ['b', 'w'],
//   2: ['w', 'b'],
//   g1: ['b', 'w']
// }

//results for tiebreak
//FOR TIEBREAKS
// ORDER: iterating GAMES in order ======
//needs game object to complete
// [
//   { 
      //   white: 'g1',
      //   black: 1,
      //   winner: 1,
      //   win_style: 'checkmate',
      //   round: 1
      // },
// ]


//scoreObj
//for table final score
// ORDER: iterating SCORECARD in order ======

//could be replaced by scoreCard?
// {
//   1: 2,
//   g1: 1,
//   3: 3,
//   4: 0
// }


//scoreCard
// FOR EASY TABLE ITERATION
// ORDER: iterating PLAYERS THEN ITERATING THEIR GAMES ======

//made from games

// {
//   1: ['bye', 'none', .5, 1, 1, 0],
//   g1: ['bye', 'none', .5, 1, 1, 0]
// }