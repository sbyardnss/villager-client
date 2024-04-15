import type { tournamentAnalysisOutput } from "./matchup-game-analysis"
import type { Guest } from "../../../Types/Guest";
import type { PlayerRelated } from "../../../Types/Player";
import { findIdentifier } from "./find-identifier";
export interface PlayerArg {
  id: string | number;
  score: number;
  receivedBye: boolean;
  avoid: Array<string | number>;
  colors: Array<'w' | 'b'>;
  pairedUpDown?: boolean;
  rating?: number | null;
}
export const playerArgDefaults: PlayerArg = {
  id: 0,
  score: 0,
  receivedBye: false,
  avoid: [],
  colors: [],
  // pairedUpDown: false,
  // rating: null,
}

type PlayerArgCreatorFunction = (
  identifier: number | string,
  analysisObj: tournamentAnalysisOutput,
  activeTourneyPlayers: (PlayerRelated | Guest)[],
  currentByeGameRef?: any,//TODO - ANY
) => PlayerArg | undefined;
export const playerArgCreator: PlayerArgCreatorFunction = (
  identifier,
  analysisObj,
  activeTourneyPlayers,
  currentByeGameRef?
) => {
  let isActive = true
  let playerArg: PlayerArg = { ...playerArgDefaults };
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
    //DO WE NEED THIS TO ADD CURRENT BY INFO? MAYBE WHEN EDITING PLAYERS?
    if (currentByeGameRef?.player_w?.id) {
      console.log('within bye ref conditional')
      playerArg = {
        id: identifier,
        score: analysisObj.scoreObj[identifier] || 0,
        colors: analysisObj.blackWhiteTally[identifier] || [],
        avoid: analysisObj.playerOppRefObj[identifier] ? analysisObj.playerOppRefObj[identifier].filter(ref => ref !== 'bye') : [],
        // receivedBye: false,
        receivedBye: findIdentifier(currentByeGameRef?.player_w) === identifier ? true : false,
      }
    } else {
      playerArg = {
        id: identifier,
        score: analysisObj.scoreObj[identifier] || 0,
        colors: analysisObj.blackWhiteTally[identifier] || [],
        avoid: analysisObj.playerOppRefObj[identifier] ? analysisObj.playerOppRefObj[identifier].filter(ref => ref !== 'bye') : [],
        receivedBye: false,
      }
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