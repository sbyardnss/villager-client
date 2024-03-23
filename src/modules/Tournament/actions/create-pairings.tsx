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
  analysisObj: tournamentAnalysisOutput,
  // currentByePlayer?: number | string,
  currentByeGameRef?: any,
) => any;

export const createPairings: CreatePairingsFunction = (
  editOrNew,
  tournamentPlayers,
  curRound,
  analysisObj,
  currentByeGameRef,
) => {
  //check whether odd or even number of players
  //if so choose bye player and then continue to iterate
  //iterate players

  const targetRound = editOrNew === 'new' ? curRound + 1 : curRound
  let playerArgs = []
  //TODO: TEST AND SEE IF WE NEED TO USE THIS ZOMBIE CODE TO CREATE BYE GAME
  /*
  console.log('currentByeGameRef', currentByeGameRef)
  if (tournamentPlayers.length % 2 !== 0) {
    //TODO: FIX ANY
    const playerIdentifierArr: any = [];
    const attemptedByePlayerIdentifiers = [];
    //PUSHING IN PLAYERS THAT HAVE ALREADY HAD A BYE GAME
    // for (const playerIdentifier in analysisObj.scoreCard) {
    //   //TODO: ENSURE THIS IS WORKING FOR GUESTS
    //   if (analysisObj.scoreCard[playerIdentifier].includes('bye')) {
    //     attemptedByePlayerIdentifiers.push(playerIdentifier);
    //   }
    // }
    //TRYING TO MAKE AN OBJECT FOR potentialByePlayersScoreCard WITH IDENTIFIERS AS KEYS. WAIT. WE CAN JUST USE THE scoreObj
    //TODO: 'BYE ON SCORE WOULD BE EASIER'
    const scoreArrNoBye = Object.entries({ ...analysisObj.scoreCard }).filter(score => !score[1].includes('bye'));

    //sort scoreArrNoBye by [1] from lowest to highest
    //TODO: ENSURE THIS WORKS FOR GUESTS
    const scoreArrTotals: [string | number, number][] = scoreArrNoBye.map(a => {
      const identifier = parseInt(a[0]) || a[0];
      const playerScore = analysisObj.scoreObj[identifier];
      return [identifier, playerScore];
    });
    
    console.log('scoreArrNoBye', scoreArrNoBye)
    console.log('scoreArrTotals', scoreArrTotals)
    const sortedScoreArrTotals = scoreArrTotals.sort((a, b) => a[1] - b[1]);
    console.log('sortedScoreArrTotals', sortedScoreArrTotals)
    //iterate players from scoreArrNoBye and attempt to create pairings
    for (const playerScore of sortedScoreArrTotals) {
      console.log('playerScore, in this thing', playerScore)
    }
    //     const potentialByePlayersScoreCard: [string, (string | number)[]][] = Object.entries({ ...analysisObj.scoreCard }).filter(playerScore => {
    //       playerIdentifierArr.push(parseInt(playerScore[0]) || playerScore[0]);
    //       return !playerScore[1].includes('bye');
    //     }).sort((a, b) => {
    //       return b[1].filter(score => score !== 'none' && score !== 1).length - a[1].filter(score => score !== 'none' && score !== 1).length
    //     });
    //     console.log('potentialByePlayersScoreCard type', typeof potentialByePlayersScoreCard)
    //     console.log('potentialByePlayersScoreCard', potentialByePlayersScoreCard)// output [["2", [0.5]], ["3", [0]], ["4", [0.5]], ["1", [1]]]
    //     console.log('playerIdentifierArr', playerIdentifierArr) // output [1, 2, 3, 4]


    // //TODO: SUPER BROKEN BEGIN. THIS IS CREATING FULL ROUND PAIRINGS FOR THE NUMBER OF PLAYERS
    //     for (const playerScore of potentialByePlayersScoreCard) {
    //       console.log('playerScore', playerScore)
    //       const potentialByeIdentifier = parseInt(playerScore[0]) || playerScore[0];
    //       for (const playerId of playerIdentifierArr) {
    //         let countParse = 0;
    //         if (parseInt(playerId) !== potentialByeIdentifier && playerId !== potentialByeIdentifier) {// TODO: I BELIEVE THIS IS CAUSING THE ISSUE
    //           countParse ++;
    //           console.log('countParse', countParse)
    //           const playerArgObj: PlayerArg | undefined = playerArgCreator(playerId, analysisObj, tournamentPlayers);
    //           if (playerArgObj)
    //             playerArgs.push(playerArgObj);
    //         }
    //       }
    //       console.log('playerArgs', playerArgs)
    //       console.log('targetRound', targetRound)
    //       const newMatchupsSansBye = Swiss(playerArgs, targetRound, false, true)
    //       if (newMatchupsSansBye && !newMatchupsSansBye.filter(m => m.player2 === null).length) {
    //         const byePairing = { round: targetRound, match: tournamentPlayers.length / 2 + .5, player1: potentialByeIdentifier, player2: null };
    //         const pairings = newMatchupsSansBye.concat(byePairing);
    //         return pairings;
    //       } else if (Object.keys(potentialByePlayersScoreCard).indexOf(playerScore) < Object.keys(potentialByePlayersScoreCard).length) {
    //         playerArgs = [];
    //       } else {
    //         if (Object.keys(potentialByePlayersScoreCard).indexOf(playerScore) === Object.keys(potentialByePlayersScoreCard).length - 1) {
    //           window.alert('cannot create anymore matchups without double byes or double opponents')
    //           return null
    //         }
    //       }
    //     }
    //TODO: SUPER BROKEN END
  }
  else {
    */
  // console.log(findIdentifier(currentByeGameRef.player_w))
  for (const player of tournamentPlayers) {
    const identifier = findIdentifier(player)

    const playerArgObj = playerArgCreator(identifier, analysisObj, tournamentPlayers, currentByeGameRef)
    if (playerArgObj)
      playerArgs.push(playerArgObj)
  }
  if (playerArgs) {
    // console.log('playerArgs', playerArgs)
    // console.log('targetRound', targetRound)
    const pairings = Swiss(playerArgs, targetRound, false, true)
    if (pairings) {
      return pairings
    } else {
      window.alert('bad bad bad');
    }
  }
  // else {
  //   window.alert('unable to create more pairings');
  //   return null
  // }
}
// }