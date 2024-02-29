import { findIdentifier } from "./find-identifier";
import { PlayerArg, playerArgCreator } from "./create-player-pairing-arg";
import { Swiss } from "tournament-pairings";
import type { PlayerOnTournament, Guest } from "../Types";
import type { tournamentAnalysisOutput, PlayerOppRefObjType, ScoreCardType, ScoreObjType, BlackWhiteTallyType } from "./matchup-game-analysis";

type CreatePairingsFunction = (
  editOrNew: string,
  tournamentPlayers: (PlayerOnTournament | Guest)[],
  curRound: number,
  // opponentReferenceObj: PlayerOppRefObjType,
  currentByePlayer: number | string,
  // bwTally: BlackWhiteTallyType,
  // scoreObject: ScoreObjType,
  // scoreCard: ScoreCardType
  analysisObj: tournamentAnalysisOutput,
) => any;

export const createPairings: CreatePairingsFunction = (
  editOrNew,
  tournamentPlayers,
  curRound,
  // opponentReferenceObj,
  currentByePlayer,
  // bWTally,
  // scoreObject,
  // scoreCard,
  analysisObj,
) => {
  //check whether odd or even number of players
  //if so choose bye player and then continue to iterate
  //iterate players

  const targetRound = editOrNew === 'new' ? curRound + 1 : curRound
  let playerArgs = []
  if (tournamentPlayers.length % 2 !== 0) {

    /* 
    const scoreCardArr = []
    const playerIdentifierArr = []
    //filter out players that have had bye and note number of losses 
    for (const player of tournamentPlayers) {
      const identifier = findIdentifier(player)
      // console.log(identifier)
      playerIdentifierArr.push(identifier)
      if (analysisObj.scoreCard[identifier]) {
        console.log(analysisObj.scoreCard[identifier])
        if (!analysisObj.scoreCard[identifier].includes('bye') && identifier !== currentByePlayer) {
          scoreCardArr.push([identifier, analysisObj.scoreCard[identifier].filter(s => s !== 'none' && s !== 1)]);
        }
      }
    }
    //sort by most losses
    //TODO: FIX THE ANY HERE
    // scoreCardArr.sort((a: (number | string | Array<number | string>)[], b: (number | string | Array<number | string>)[]) => b[1].length - a[1].length)
    console.log(typeof scoreCardArr[0])
    console.log('scoreCardArr', scoreCardArr)
    */

    //TODO: FIX ANY
    const playerIdentifierArr: any = [];
    const potentialByePlayersScoreCard: [string, (string | number)[]][] = Object.entries({ ...analysisObj.scoreCard }).filter(playerScore => {
      // const identifier = parseInt(playerScore[0]) || playerScore[0];
      // return !playerScore[1].includes('bye') && identifier !== currentByePlayer;
      playerIdentifierArr.push(parseInt(playerScore[0]) || playerScore[0]);
      return !playerScore[1].includes('bye');
    }).sort((a, b) => {
      return b[1].filter(score => score !== 'none' && score !== 1).length - a[1].filter(score => score !== 'none' && score !== 1).length
    });
    // potentialByePlayersScoreCard.filter(playerScore => )

    for (const playerScore in potentialByePlayersScoreCard) {
      const potentialByeIdentifier = parseInt(potentialByePlayersScoreCard[playerScore][0]) || potentialByePlayersScoreCard[playerScore][0];
      console.log(potentialByeIdentifier)
      for (const playerId of playerIdentifierArr) {
        if (parseInt(playerId) !== potentialByeIdentifier && playerId !== potentialByeIdentifier) {
          const playerBWTally = analysisObj.blackWhiteTally[playerId];
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
      //WE WANT TO ASSIGN THE PLAYER WITH THE MOST LOSSES AND NO PREVIOUS BYE TO BE THE BYE PLAYER
    }

    console.log(tournamentPlayers)
    // iterate potential bye players and find a pairing set that will work
    /*
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
    */


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