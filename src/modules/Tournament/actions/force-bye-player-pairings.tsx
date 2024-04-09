import { Match } from "tournament-pairings/dist/Match";
import { Guest } from "../../../Types/Guest";
import { PlayerRelated } from "../../../Types/Player";
import { tournamentAnalysisOutput } from "./matchup-game-analysis";
import { PlayerArg, playerArgCreator } from "./create-player-pairing-arg";
import { Swiss } from "tournament-pairings";
import { findIdentifier } from "./find-identifier";

type ForceByePairingFunction = (
  targetRound: number,
  tournamentPlayers: (PlayerRelated | Guest)[],
  analysisObj: tournamentAnalysisOutput,
  currentByeGameRef?: any
) => Match[] | null;

export const forceByePlayerPairings: ForceByePairingFunction = (
  targetRound,
  tournamentPlayers,
  analysisObj,
  currentByeGameRef,
) => {
  const orderedIdentifiers = Object.keys(analysisObj.scoreObj).sort((a, b) => analysisObj.scoreObj[a] - analysisObj.scoreObj[b]);

  //THIS IS AN ARRAY OF IDENTIFIERS, SORTED FROM LOWEST SCORE TO HIGHEST, FOR PLAYERS THAT HAVE NOT HAD BYE
  const notHadByeOrderedIdentifiers = orderedIdentifiers.filter(identifier => !analysisObj.scoreCard[identifier].includes('bye'));

  for (const identifier of notHadByeOrderedIdentifiers) {
    const allPlayersSansByeAttempt = tournamentPlayers.filter(p => findIdentifier(p) !== (parseInt(identifier) || identifier));

    const playerArgs: PlayerArg[] = [];
    allPlayersSansByeAttempt.forEach(player => {
      const playerIdentifier = findIdentifier(player);
      const playerArg = playerArgCreator(playerIdentifier, analysisObj, tournamentPlayers, currentByeGameRef);
      if (playerArg) {
        playerArgs.push(playerArg);
      }
    })

    if (playerArgs) {
      const swissPairingsSansBye = Swiss(playerArgs, targetRound, false, true);
      if (swissPairingsSansBye) {
        const byeMatchup = { round: targetRound, match: swissPairingsSansBye.length + 1, player1: parseInt(identifier) || identifier, player2: null };
        return swissPairingsSansBye.concat(byeMatchup);
      }
    }
  }
  return null;
}
