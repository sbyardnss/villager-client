import type { tournamentAnalysisOutput } from "./matchup-game-analysis";

/*
Using Record in your TypeScript code is not strictly necessary but is highly recommended for certain scenarios, 
especially when you want to define an object type with specific keys and values.The Record utility type is particularly 
useful for creating objects that map keys to values of a specific type, ensuring type safety for both the keys and the values.
It's a concise way to define the shape of an object where you know the types of the keys and values in advance.

However, if your use case does not require such strict type definitions for the keys and values of an object, or 
if you prefer a more flexible approach, you might choose not to use Record.For example, if you're working with objects 
that can have arbitrary keys and values, or if you're dealing with a scenario where the keys and values are not known 
until runtime, you might opt for a more general object type definition.
*/
export interface TieBreakObject {
  //Record used for typing 
  solkoff: Record<string | number, number>;
  cumulative: Record<string | number, number>;
}

type TieBreakerFunction = (
  analysis: tournamentAnalysisOutput,
  playerArr: [string, number, string][],
) => TieBreakObject;

export const tieBreakers: TieBreakerFunction = (
  analysis,
  playerArr,
) => {
  //TODO: CHANGE PROP SO THAT WE DONT HAVE TO MAP HERE
  // const playerIds = playerArr.map(p => p[2]);

  //TODO: LEARN HOW TO USE THIS ON THE FLY
  const tieBreaksForOutput: TieBreakObject = {
    solkoff: playerArr.map(p => p[2]).reduce((playerIds, key) => ({ ...playerIds, [key]: 0 }), {}),
    cumulative: playerArr.map(p => p[2]).reduce((playerIds, key) => ({ ...playerIds, [key]: 0 }), {}),
  };

  for (const gameResult of analysis.tieBreakData) {
    if (gameResult.black) {
      if (gameResult.winner) {
        //normal game
        const winnerKey = gameResult.winner;
        const loserKey = gameResult.winner === gameResult.white ? gameResult.black : gameResult.white;
        
        //solkoff
        tieBreaksForOutput.solkoff[winnerKey] += analysis.scoreObj[loserKey];
        tieBreaksForOutput.solkoff[loserKey] += analysis.scoreObj[winnerKey];
        //cumulative
        tieBreaksForOutput.cumulative[winnerKey] += (tieBreaksForOutput.cumulative[winnerKey] + 1);
        tieBreaksForOutput.cumulative[loserKey] += (tieBreaksForOutput.cumulative[loserKey]);
      } else {
        //draw

        //solkoff
        tieBreaksForOutput.solkoff[gameResult.white] += analysis.scoreObj[gameResult.black];
        tieBreaksForOutput.solkoff[gameResult.black] += analysis.scoreObj[gameResult.white];
        //cumulative
        tieBreaksForOutput.cumulative[gameResult.white] += (tieBreaksForOutput.cumulative[gameResult.white] + .5);
        tieBreaksForOutput.cumulative[gameResult.black] += (tieBreaksForOutput.cumulative[gameResult.black] + .5);
      }
    } else {
      tieBreaksForOutput.cumulative[gameResult.white] += (tieBreaksForOutput.cumulative[gameResult.white]);
    }
  }
  return tieBreaksForOutput;
}
