import type { Game, OutgoingGame } from "../../../Types/Game";
import type { Match } from "tournament-pairings/dist/Match";
import { findIdentifier } from "./find-identifier";
import { updatePlayerOppRefObj } from "./update-player-opp-ref";
import { updateBlackWhiteTally } from "./update-black-white-tally";
import { updateTieBreakAndScoreCardData } from "./update-tie-break-score-card-data";


export type ScoreObjType = {
  [key: string]: number; // This part covers the string keys
} & {
  [key: number]: number; // This part covers the number key
};
// export type ScoreObjType = {
//   [key: string]: number; // This part covers the string keys
// } & {
//   [key: number]: number; // This part covers the number key
// };

export type GameResult = {
  white: number | string;
  black: number | string | null;
  winner: number | string | null;
  win_style: string | null;
  round: number;
}

// export type TieBreakObject = {
//   [key: string | number]: {
//     solkoff: number,
//     cumulative: number,
//   };
// }
//might need to be changed
export type BlackWhiteTallyType = {
  // [key: string]: string[];
  [key: string]: ('w' | 'b')[];

};
//might need to be changed
export type PlayerOppRefObjType = {
  [key: string]: (string | number)[];
};

export type ScoreCardType = {
  [key: string]: (string | number)[];
  // [key: string]: Array<string | number>;
} & {
  [key: number]: (string | number)[];
};

export interface tournamentAnalysisOutput {
  scoreCard: ScoreCardType;
  scoreObj: ScoreObjType;
  tieBreakData: GameResult[];
  blackWhiteTally: BlackWhiteTallyType;
  playerOppRefObj: PlayerOppRefObjType;
}

type TournamentAnalysisFunction = (
  games: Game[],
  currentMatchups: Match[],
  // currentMatchupsSetter: React.Dispatch<SetStateAction<Match[]>>,
  currentRound: number,
  byeGame: React.RefObject<OutgoingGame>,
) => tournamentAnalysisOutput;

export const tournamentAnalysis: TournamentAnalysisFunction = (
  games,
  currentMatchups,
  // currentMatchupsSetter,
  currentRound,
  byeGame,
) => {
  const playerOppObjForOutput: PlayerOppRefObjType = {}; // check
  const scoreCardForOutput: ScoreCardType = {}; // check
  const tieBreakDataForOutput: GameResult[] = []; // check
  // const tieBreakDataForOutput: TieBreakObject = {}; // check
  const blackWhiteForOutput: BlackWhiteTallyType = {}; // check
  const scoreObjForOutput: ScoreObjType = {}; // check
  // let gamesToIterate: (OutgoingGame | Game)[] = [];
  // if (byeGame.current?.player_w.id) {
  //   gamesToIterate = (games as (OutgoingGame | Game)[]).concat(byeGame.current);
  // } else {
  //   gamesToIterate = games;
  // }
  // gamesToIterate = games;
  // console.log(games)
  for (const game of games) {
    const gameRound = game.tournament_round;
    let whitePlayerIdentifier: string | number = 0;
    let blackPlayerIdentifier: string | number = 0;
    const gameResult: GameResult = {} as GameResult;
    if (game.player_w) {
      const identifier = findIdentifier(game.player_w);
      whitePlayerIdentifier = identifier;
      gameResult.white = identifier;
    }
    if (game.player_b && game.player_b.id){
      const identifier = findIdentifier(game.player_b);
      blackPlayerIdentifier = identifier;
      gameResult.black = identifier;
    } else {
      gameResult.black = null;
    }
    updateTieBreakAndScoreCardData(game, gameResult, scoreCardForOutput, scoreObjForOutput, gameRound, currentRound, whitePlayerIdentifier, blackPlayerIdentifier);
    tieBreakDataForOutput.push(gameResult);
    updatePlayerOppRefObj(playerOppObjForOutput, whitePlayerIdentifier, blackPlayerIdentifier);

    //CHECKING IF TWO PLAYERS ON GAME FOR BWTALLY
    // if (blackPlayerIdentifier && whitePlayerIdentifier) {
    updateBlackWhiteTally(blackWhiteForOutput, whitePlayerIdentifier, blackPlayerIdentifier);
    // }
  }



  //CURRENT ROUND FOR PLAYEROBJ
  let currentRoundMatchupsOutput: Match[] = [];
  for (const match of currentMatchups) {
    if (match.player1 === null) {
      match.player1 = match.player2;
      match.player2 = null;
    };
    currentRoundMatchupsOutput.push(match);
    if (match.player1) {
      updatePlayerOppRefObj(playerOppObjForOutput, match.player1, match.player2);
    }
  }
  
  // currentMatchupsSetter(currentRoundMatchupsOutput);
  return ({
    playerOppRefObj: playerOppObjForOutput,
    scoreCard: scoreCardForOutput,
    scoreObj: scoreObjForOutput,
    tieBreakData: tieBreakDataForOutput,
    blackWhiteTally: blackWhiteForOutput,
  });
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
//   1: ['bye', .5, 1, 1, 0, 'none',],
//   g1: ['bye', 'none', .5, 1, 1, 0]
// }