import type { ScoreObjType, tournamentAnalysisOutput } from "./matchup-game-analysis";

export type TieBreakObject = {
  [key: string | number]: {
    // name: string,
    solkoff: number,
    cumulative: number,
  };
}

const tieBreakPlayerDefaults = {
  solkoff: 0,
  cumulative: 0,
}



type TieBreakerFunction = (
  analysis: tournamentAnalysisOutput,
  // playerArr: [string, number, string][],
) => TieBreakObject;

// type cumulativeTieBreakerFunction = (

// ) => any;

export const tieBreakers: TieBreakerFunction = (
  analysis,
  // playerArr,
) => {

  const tieBreaksForOutput: TieBreakObject = {};
  for (const gameResult of analysis.tieBreakData) {
    if (gameResult.black) {
      if (gameResult.winner) {
        const winnerKey = gameResult.winner;
        const loserKey = gameResult.winner === gameResult.white ? gameResult.black : gameResult.white;

        //if winner of normal game
        if (!tieBreaksForOutput[winnerKey]) {
          tieBreaksForOutput[winnerKey] = { ...tieBreakPlayerDefaults, solkoff: analysis.scoreObj[loserKey], cumulative: 1 };
        } else {
          tieBreaksForOutput[winnerKey].solkoff += analysis.scoreObj[loserKey];
          tieBreaksForOutput[winnerKey].cumulative += (tieBreaksForOutput[winnerKey].cumulative + 1);
        }
        //loser of normal game
        if (!tieBreaksForOutput[loserKey]) {
          tieBreaksForOutput[loserKey] = { ...tieBreakPlayerDefaults, solkoff: analysis.scoreObj[winnerKey], cumulative: 0 };
        } else {
          tieBreaksForOutput[loserKey].solkoff += analysis.scoreObj[winnerKey];
          tieBreaksForOutput[loserKey].cumulative += (tieBreaksForOutput[loserKey].cumulative);
        }
      }

      //draw game
      if (gameResult.win_style === 'draw') {

        //white
        if (!tieBreaksForOutput[gameResult.white]) {
          tieBreaksForOutput[gameResult.white] = { ...tieBreakPlayerDefaults, solkoff: analysis.scoreObj[gameResult.black], cumulative: .5 };
        } else {
          tieBreaksForOutput[gameResult.white].solkoff += analysis.scoreObj[gameResult.black];
          tieBreaksForOutput[gameResult.white].cumulative += (tieBreaksForOutput[gameResult.white].cumulative + .5);
        }
        //black
        if (!tieBreaksForOutput[gameResult.black]) {
          tieBreaksForOutput[gameResult.black] = { ...tieBreakPlayerDefaults, solkoff: analysis.scoreObj[gameResult.white], cumulative: .5 };
        } else {
          tieBreaksForOutput[gameResult.black].cumulative += (tieBreaksForOutput[gameResult.black].cumulative + .5);
        }
      }
    } else {

      //bye
      if (!tieBreaksForOutput[gameResult.white]) {
        tieBreaksForOutput[gameResult.white] = { ...tieBreakPlayerDefaults, solkoff: 0, cumulative: .5 };
      } else {
        tieBreaksForOutput[gameResult.white].cumulative += tieBreaksForOutput[gameResult.white].cumulative;
      }
    }
  }
  return tieBreaksForOutput;
}
