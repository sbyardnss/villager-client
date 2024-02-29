import type { tournamentAnalysisOutput } from "./matchup-game-analysis"
import type { Guest, PlayerOnTournament } from "../Types";
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
  activeTourneyPlayers: (PlayerOnTournament | Guest)[],
) => PlayerArg | undefined;
export const playerArgCreator: PlayerArgCreatorFunction = (identifier, analysisObj, activeTourneyPlayers) => {
  let isActive = true
  let playerArg: PlayerArg = {} as PlayerArg;
  //check if player is active and get identifier
  if (typeof identifier === 'string') {
    //TODO: IS THIS AN ISSUE USING ONLY GUEST TYPING HERE
    if (!activeTourneyPlayers.find((ap: PlayerOnTournament | Guest) => (ap as Guest).guest_id === identifier)) {
      isActive = false
    }
  }
  else {
    if (!activeTourneyPlayers.find((ap: PlayerOnTournament | Guest) => ap.id === identifier)) {
      isActive = false;
    }
  }
  if (isActive) {
    playerArg = {
      id: identifier,
      score: analysisObj.scoreObj[identifier] || 0,
      colors: analysisObj.blackWhiteTally[identifier],
      avoid: analysisObj.playerOppRefObj[identifier] ? analysisObj.playerOppRefObj[identifier].filter(ref => ref !== 'bye') : []
    }
    if (analysisObj.playerOppRefObj[identifier]) {
      if (analysisObj.playerOppRefObj[identifier].includes('bye') && playerArg.score > .5) {
        playerArg.score--
      }
    }
    return playerArg
  }
}