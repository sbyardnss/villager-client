import type { tournamentAnalysisOutput } from "./matchup-game-analysis"
import type { Guest } from "../../../Types/Guest";
import type { PlayerRelated } from "../../../Types/Player";
export interface PlayerArg {
  id: string | number;
  score: number;
  pairedUpDown?: boolean;
  receivedBye?: boolean;
  avoid?: Array<string | number>;
  colors?: Array<'w' | 'b'>;
  rating?: number | null;
}
type PlayerArgCreatorFunction = (
  identifier: number | string,
  analysisObj: tournamentAnalysisOutput,
  activeTourneyPlayers: (PlayerRelated | Guest)[],
) => PlayerArg | undefined;
export const playerArgCreator: PlayerArgCreatorFunction = (identifier, analysisObj, activeTourneyPlayers) => {
  let isActive = true
  let playerArg: PlayerArg = {} as PlayerArg;
  //check if player is active and get identifier
  if (typeof identifier === 'string') {
    //TODO: IS THIS AN ISSUE USING ONLY GUEST TYPING HERE
    if (!activeTourneyPlayers.find((ap: PlayerRelated | Guest) => (ap as Guest).guest_id === identifier)) {
      isActive = false;
    }
  }
  else {
    if (!activeTourneyPlayers.find((ap: PlayerRelated | Guest) => ap.id === identifier)) {
      isActive = false;
    }
  }
  if (isActive) {
    playerArg = {
      id: identifier,
      score: analysisObj.scoreObj[identifier] || 0,
      colors: analysisObj.blackWhiteTally[identifier] || [],
      avoid: analysisObj.playerOppRefObj[identifier] ? analysisObj.playerOppRefObj[identifier].filter(ref => ref !== 'bye') : [],
      receivedBye: false,
    }
    if (analysisObj.playerOppRefObj[identifier]) {
      // if (analysisObj.playerOppRefObj[identifier].includes('bye') && playerArg.score > .5) {
      //   playerArg.score--
      // }
      if (analysisObj.playerOppRefObj[identifier].includes('bye')) {
        playerArg.receivedBye = true;
        if (playerArg.score > .5) {
          playerArg.score--;
        }
      }
    }
    return playerArg
  }
}