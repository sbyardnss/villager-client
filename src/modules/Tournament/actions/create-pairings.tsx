import { findIdentifier } from "./find-identifier";
import { PlayerArg, playerArgCreator } from "./create-player-pairing-arg";
import { Swiss } from "tournament-pairings";
import type { PlayerRelated } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";
import type { tournamentAnalysisOutput } from "./matchup-game-analysis";

type CreatePairingsFunction = (
  editOrNew: string,
  tournamentPlayers: (PlayerRelated | Guest)[],
  curRound: number,
  // currentByePlayer: number | string,
  analysisObj: tournamentAnalysisOutput,
) => any;

export const createPairings: CreatePairingsFunction = (
  editOrNew,
  tournamentPlayers,
  curRound,
  // currentByeGameRef,
  analysisObj,
) => {
  //check whether odd or even number of players
  //if so choose bye player and then continue to iterate
  //iterate players

  const targetRound = editOrNew === 'new' ? curRound + 1 : curRound
  let playerArgs = []
  if (tournamentPlayers.length % 2 !== 0) {
    //TODO: FIX ANY
    const playerIdentifierArr: any = [];
    const potentialByePlayersScoreCard: [string, (string | number)[]][] = Object.entries({ ...analysisObj.scoreCard }).filter(playerScore => {
      playerIdentifierArr.push(parseInt(playerScore[0]) || playerScore[0]);
      return !playerScore[1].includes('bye');
    }).sort((a, b) => {
      return b[1].filter(score => score !== 'none' && score !== 1).length - a[1].filter(score => score !== 'none' && score !== 1).length
    });

    for (const playerScore in potentialByePlayersScoreCard) {
      const potentialByeIdentifier = parseInt(potentialByePlayersScoreCard[playerScore][0]) || potentialByePlayersScoreCard[playerScore][0];
      for (const playerId of playerIdentifierArr) {
        if (parseInt(playerId) !== potentialByeIdentifier && playerId !== potentialByeIdentifier) {
          const playerArgObj: PlayerArg | undefined = playerArgCreator(playerId, analysisObj, tournamentPlayers);
          if (playerArgObj)
            playerArgs.push(playerArgObj);
        }
      }

      const newMatchupsSansBye = Swiss(playerArgs, targetRound, false, true)
      if (newMatchupsSansBye && !newMatchupsSansBye.filter(m => m.player2 === null).length) {
        const byePairing = { round: targetRound, match: tournamentPlayers.length / 2 + .5, player1: potentialByeIdentifier, player2: null };
        const pairings = newMatchupsSansBye.concat(byePairing);
        return pairings;
      } else if (Object.keys(potentialByePlayersScoreCard).indexOf(playerScore) < Object.keys(potentialByePlayersScoreCard).length) {
        playerArgs = [];
      } else {
        if (Object.keys(potentialByePlayersScoreCard).indexOf(playerScore) === Object.keys(potentialByePlayersScoreCard).length - 1) {
          window.alert('cannot create anymore matchups without double byes or double opponents')
          return null
        }
      }
    }

  }
  else {
    for (const player of tournamentPlayers) {
      const identifier = findIdentifier(player)

      const playerArgObj = playerArgCreator(identifier, analysisObj, tournamentPlayers)
      if (playerArgObj)
        playerArgs.push(playerArgObj)
    }
    if (playerArgs) {
      const pairings = Swiss(playerArgs, targetRound, false, true)
      if (pairings) {
        return pairings
      }
    }
    else {
      window.alert('unable to create more pairings');
      return null
    }
  }
}