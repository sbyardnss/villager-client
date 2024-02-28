import { findIdentifier } from "./find-identifier";
import { playerArgCreator } from "./create-player-pairing-arg";
import { Swiss } from "tournament-pairings";
import type { PlayerOnTournament, Guest } from "../Types";
import type { PlayerOppRefObjType, ScoreCardType, ScoreObjType, BlackWhiteTallyType } from "./matchup-game-analysis";

type CreatePairingsFunction = (
  editOrNew: string,
  tournamentPlayers: (PlayerOnTournament | Guest)[],
  curRound: number,
  opponentReferenceObj: PlayerOppRefObjType,
  currentByePlayer: PlayerOnTournament | Guest,
  bwTally: BlackWhiteTallyType,
  scoreObject: ScoreObjType,
  scoreCard: ScoreCardType
) => any;

export const createPairings: CreatePairingsFunction = (
  editOrNew,
  tournamentPlayers,
  curRound, 
  opponentReferenceObj,
  currentByePlayer,
  bWTally,
  scoreObject,
  scoreCard,
) => {
  //check whether odd or even number of players
  //if so choose bye player and then continue to iterate
  //iterate players

  const targetRound = editOrNew === 'new' ? curRound + 1 : curRound
  let playerArgs = []
  if (tournamentPlayers.length % 2 !== 0) {
    const scoreCardArr = []
    const playerIdentifierArr = []
    //filter out players that have had bye and note number of losses 
    for (const player of tournamentPlayers) {
      const identifier = findIdentifier(player)
      playerIdentifierArr.push(identifier)
      if (scoreCard[identifier]) {
        if (!scoreCard[identifier].includes('bye') && identifier !== currentByePlayer) {
          scoreCardArr.push([identifier, scoreCard[identifier].filter(s => s !== 'none' && s !== 1)])
        }
      }
    }
    //sort by most losses
    scoreCardArr.sort((a, b) => b[1].length - a[1].length)
    // iterate potential bye players and find a pairing set that will work
    for (const potentialByePlayerArr of scoreCardArr) {
      for (const playerIdentifier of playerIdentifierArr) {
        // let playerBWTally = []
        // if (bWTally[parseInt(playerIdentifier)] || bWTally[playerIdentifier]) {
        //     playerBWTally = bWTally[parseInt(playerIdentifier)] || bWTally[playerIdentifier]
        // }
        const playerBWTally = bWTally[playerIdentifier] || []
        if (parseInt(playerIdentifier) !== potentialByePlayerArr[0] && playerIdentifier !== potentialByePlayerArr[0]) {
          const playerArgObj = playerArgCreator(playerIdentifier, opponentReferenceObj, scoreObject, tournamentPlayers, playerBWTally)
          playerArgs.push(playerArgObj)
        }
      }

      const newMatchupsSansBye = Swiss(playerArgs, targetRound, false, true)
      if (newMatchupsSansBye && !newMatchupsSansBye.filter(m => m.player2 === null).length) {
        const byePairing = { round: targetRound, match: tournamentPlayers.length / 2 + .5, player1: parseInt(potentialByePlayerArr[0]) || potentialByePlayerArr[0], player2: null }
        const pairings = newMatchupsSansBye.concat(byePairing)
        return pairings
      }
      else if (scoreCardArr.indexOf(potentialByePlayerArr) < scoreCardArr.length - 1) {
        playerArgs = []
      }
      else {
        if (scoreCardArr.indexOf(potentialByePlayerArr) === scoreCardArr.length - 1) {
          window.alert('cannot create anymore matchups without double byes or double opponents')
          return null
        }
      }
    }


  }
  else {
    for (const player of tournamentPlayers) {
      const identifier = findIdentifier(player)
      // let playerBWTally = []
      // if (bWTally[parseInt(identifier)] || bWTally[identifier]) {
      //     playerBWTally = bWTally[parseInt(identifier)] || bWTally[identifier]
      // }

      const playerBWTally = bWTally[identifier] || []
      const playerArgObj = playerArgCreator(identifier, opponentReferenceObj, scoreObject, tournamentPlayers, playerBWTally)
      playerArgs.push(playerArgObj)
    }
    const pairings = Swiss(playerArgs, targetRound, false, true)
    if (pairings) {
      return pairings
    }
    else {
      window.alert('unable to create more pairings')
      return null
    }
  }
}