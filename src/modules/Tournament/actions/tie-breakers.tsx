import type { tournamentAnalysisOutput } from "./matchup-game-analysis";





type TieBreakerFunction = (
  analysis: tournamentAnalysisOutput,
  // playerArr: [string, number, string][],
) => any;

// type cumulativeTieBreakerFunction = (

// ) => any;

export const tieBreakers: TieBreakerFunction = (
  analysis,
  // playerArr,
) => {
  // const solkoffTieBreakArr = [];
  console.log(analysis);
  // console.log(playerArr)
  const solkoffTieBreakObj: { [key: string | number]: number } = {};
  const cumulativeTieBreakObj: { [key: string | number]: number } = {};

  for (const gameResult of analysis.tieBreakData) {
    console.log(gameResult)
    const whiteIdentifier = gameResult.white;
    const blackIdentifier = gameResult.black;
    // if (!solkoffTieBreakObj[gameResult.white]) {
    //   solkoffTieBreakObj[gameResult.white] = 0;
    // } else {
    //   if (gameResult.winner === gameResult.white) {

    //   }
    // }

    // if (gameResult.black && !solkoffTieBreakObj[gameResult.black]) {
    //   solkoffTieBreakObj[gameResult.black] = 0;
    // }

    // if (!cumulativeTieBreakObj[gameResult.white]) {
    //   cumulativeTieBreakObj[gameResult.white] = 0;
    // }

    // if (gameResult.black && !cumulativeTieBreakObj[gameResult.black]) {
    //   cumulativeTieBreakObj[gameResult.black] = 0;
    // }

    //NEED AN OBJECT WITH IDENTIFIER AS KEY AND NUMBER AS SCORE
    //NEED 0 FOR ANY PLAYER THAT HAS NO SCORE
    if (!gameResult.winner)
      console.log(gameResult)
    if (blackIdentifier) {
      // console.log(gameResult)
      // console.log(typeof analysis.scoreObj[blackIdentifier])
      // if (solkoffTieBreakObj[gameResult.winner]) {
      //   solkoffTieBreakObj[gameResult.winner] += analysis.scoreObj[blackIdentifier];
      // } else {
      //   solkoffTieBreakObj[gameResult.winner] = analysis.scoreObj[blackIdentifier];
      // }
      // if (!solkoffTieBreakObj[gameResult.winner]) {
      //   solkoffTieBreakObj[gameResult.winner] = 0;
      // }
      // solkoffTieBreakObj[gameResult.winner] = analysis.scoreObj[blackIdentifier];
    }
    // if (gameResult.winner === gameResult.white) {
    //   solkoffTieBreakObj[gameResult]
    // }
  }

  return [solkoffTieBreakObj, cumulativeTieBreakObj];
}





// export const cumulativeTieBreaker: cumulativeTieBreakerFunction = () => {

// }