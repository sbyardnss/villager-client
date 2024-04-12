import { findIdentifier } from "./find-identifier";
import { playerArgCreator } from "./create-player-pairing-arg";
import { Swiss } from "tournament-pairings";
import type { PlayerRelated } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";
import type { tournamentAnalysisOutput } from "./matchup-game-analysis";
import { createPairingsWithBye } from "./create-pairings-with-bye";

type CreatePairingsFunction = (
  editOrNew: "edit" | "new",
  tournamentPlayers: (PlayerRelated | Guest)[],
  curRound: number,
  analysisObj: tournamentAnalysisOutput,
  currentByeGameRef?: any
) => any;

export const createPairings: CreatePairingsFunction = (
  editOrNew,
  tournamentPlayers,
  curRound,
  analysisObj,
  currentByeGameRef
) => {
  let playerArgs = [];
  //SETTING TARGET ROUND THIS WAY ACCOUNTS FOR EDITING OR NEW PAIRING
  const targetRound = editOrNew === "new" ? curRound + 1 : curRound;

  if (tournamentPlayers.length % 2 !== 0) {
    //ODD
    //sort player scores from lowest to highest, and try to create pairings, using the selected player as the bye
    //if pairings created and valid, append bye pairing and return
    const matchups = createPairingsWithBye(targetRound, tournamentPlayers, analysisObj, currentByeGameRef);
    if (matchups) {
      return matchups;
    } else {
      window.alert('bad bad bad');
    }

  } else {
    //EVEN
    //simply create args and run through swiss
    for (const player of tournamentPlayers) {
      //EDITING AND EVEN
      const identifier = findIdentifier(player);

      const playerArgObj = playerArgCreator(
        identifier,
        analysisObj,
        tournamentPlayers,
        currentByeGameRef
      );
      if (playerArgObj) playerArgs.push(playerArgObj);
    }
    if (playerArgs) {
      const pairings = Swiss(playerArgs, targetRound, false, true);
      if (pairings) {
        return pairings;
      } else {
        window.alert("unable to create more pairings");
      }
    }
  }
};
// }