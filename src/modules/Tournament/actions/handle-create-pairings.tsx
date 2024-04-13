import type { Match } from "tournament-pairings/dist/Match";
import { Tournament } from "../../../Types/Tournament";
import { findIdentifier } from "./find-identifier";
import { createPairings } from "./create-pairings";
import { tournamentAnalysisOutput } from "./matchup-game-analysis";
import { Game, OutgoingGame } from "../../../Types/Game";
import { PlayerRelated } from "../../../Types/Player";
import { Guest } from "../../../Types/Guest";
import { createPairingForTwoPlayers } from "./two-players-pairing";
import { resetPairingMatchNumbers } from "./reset-pairing-match-numbers";

type handleCreatePairingsFunction = (
  operation: 'editing-players' | 'new-round-normal' | 'normal-play',
  setOperation: React.Dispatch<React.SetStateAction<'editing-players' | 'new-round-normal' | 'normal-play'>>,
  tournamentObj: Tournament,
  analysisObj: tournamentAnalysisOutput,
  rounds: number,
  byeGameCurrent: OutgoingGame,
  gamesFromThisround: Game[],
  currentPairings?: Match[],
  roundGameIdentifiers?: (string | number)[][],
  gamesStarted?: boolean,
  forcedMatchupsPlayers?: (PlayerRelated | Guest)[],
  newAnalysis?: tournamentAnalysisOutput, //TODO: games_started_conditional_relocate THIS PROP SHOULD BE ABLE TO BE REMOVED TO EDITPLAYERS AFTER REFACTOR
) => Match[]
export const handleCreatePairings: handleCreatePairingsFunction = (
  operation,
  setOperation,
  tournamentObj,
  analysisObj,
  rounds,
  byeGameCurrent,
  gamesFromThisRound,
  currentPairings,
  roundGameIdentifiers,
  gamesStarted,
  forcedMatchupsPlayers,
  newAnalysis,
  // currentByeGameRef,
) => {

  // console.log('all props in create', {
  //   operation: operation,
  //   setOperation: setOperation,
  //   tournamentObj: tournamentObj,
  //   analysisObj: analysisObj,
  //   rounds: rounds,
  //   byeGameCurrent: byeGameCurrent,
  //   gamesFromThisRound: gamesFromThisRound,
  //   currentPairings: currentPairings,
  //   roundGameIdentifiers: roundGameIdentifiers,
  //   gamesStarted: gamesStarted,
  //   forcedMatchupsPlayers: forcedMatchupsPlayers,
  //   newAnalysis: newAnalysis,
  // })
  const copy = { ...tournamentObj };
  let filteredPairings: Match[] = [];

  //initially placing all competitors on tournament object in unmatched
  let unmatchedCompetitors: (PlayerRelated | Guest)[] = [...tournamentObj.competitors.concat(tournamentObj.guest_competitors)];

  // const allAddedCompetitors = tournamentObj.competitors.concat(tournamentObj.guest_competitors);
  const targetRound = operation === 'new-round-normal' ? rounds + 1 : rounds;

  if (forcedMatchupsPlayers && forcedMatchupsPlayers[0] && forcedMatchupsPlayers[1]) {
    filteredPairings.push(createPairingForTwoPlayers([...forcedMatchupsPlayers], targetRound));
    console.log('filteredPairings changed', filteredPairings)

    const forcedPlayerIdentifiers = [...forcedMatchupsPlayers].map(p => findIdentifier(p));

    // unmatchedCompetitors = unmatchedCompetitors.concat(allAddedCompetitors.filter(p => !forcedPlayerIdentifiers.includes(findIdentifier(p))));
    unmatchedCompetitors = unmatchedCompetitors.filter(p => !forcedPlayerIdentifiers.includes(findIdentifier(p)));
    console.log('filtering force', unmatchedCompetitors)
  }

  if (operation === 'new-round-normal') {
    //Simply creating new round
    const remainingPairings = createPairings('new', unmatchedCompetitors, rounds, analysisObj)
    filteredPairings = resetPairingMatchNumbers(filteredPairings.concat(remainingPairings));
    return filteredPairings;
  } else if (operation === 'editing-players' && currentPairings && roundGameIdentifiers) {
    //editing players
    if (gamesStarted && currentPairings && roundGameIdentifiers) {
      //editing players and games HAVE STARTED
      const neededPairingsFromCurrent = currentPairings.filter(p => {
        const playerW = unmatchedCompetitors.find(c => findIdentifier(c) === p.player1);
        const playerB = unmatchedCompetitors.find(c => findIdentifier(c) === p.player2);
        const hasGameBeenPlayed = roundGameIdentifiers.find(i => {
          return i[0] === p.player1 && i[1] === p.player2;
        });
        return (playerW && playerB) || hasGameBeenPlayed;
      });

      filteredPairings = filteredPairings.concat(neededPairingsFromCurrent);
      
      unmatchedCompetitors = unmatchedCompetitors.filter(competitor => {
        const identifier = findIdentifier(competitor);
        return (!neededPairingsFromCurrent.find(p => {
          return p.player1 === identifier || p.player2 === identifier
        }));
      });

      // console.log('neededPairingsFromCurrent', neededPairingsFromCurrent)

      // console.log('unmatchedCompetitors after checking needed matchups', unmatchedCompetitors)

      // console.log('filteredPairings games started', filteredPairings)

    } else if (!gamesStarted && !gamesFromThisRound.length) {
      //editing players and games have NOT STARTED
      // console.log('unmatched competitors before not started creation', unmatchedCompetitors)
      const newPairings = createPairings('edit', unmatchedCompetitors, rounds, analysisObj);
      // console.log('newPairings from unmatched', newPairings)
      filteredPairings = resetPairingMatchNumbers(filteredPairings.concat(newPairings));
      console.log('filteredPairings changed', filteredPairings)
      return filteredPairings;
    } else {
      window.alert('error within games started conditionals')
    }




    // }
  } else {
    window.alert('ERROR: operation state variable unset')
  }



  //ORIGINAL FROM EDIT PLAYERS MODAL

  // const unmatchedCompetitors = allAddedCompetitors.filter(competitor => {
  //   const identifier = findIdentifier(competitor);
  //   return (!filteredPairings.find(p => {
  //     return p.player1 === identifier || p.player2 === identifier
  //   })

  //   );
  // });
  // let newPairings: Match[] = [];
  // if (!gamesStarted && !gamesFromThisRound.length) {
  //   newPairings = createPairings('edit', allAddedCompetitors, rounds, analysis);
  // } else {
  //   //GAMES STARTED
  //   // CANNOT SEND ONE PLAYER TO CREATE PAIRINGS. THAT IS THE REASON FOR IF ELSES BELOW

  //   if (unmatchedCompetitors.length === 1) {
  //     //ONE UNMATCHED PLAYER. SIMPLY CREATING BYE
  //     //can set this match number to 1 because it will be changed before the return
  //     const byeMatchup = { round: rounds, match: 1, player1: findIdentifier(unmatchedCompetitors[0]), player2: null };
  //     //TODO-QUESTION: WHY DOES THIS NEED TO BE CONCAT AND NOT PUSH?
  //     newPairings = filteredPairings.concat(byeMatchup);

  //   } else if (unmatchedCompetitors.length === 2) {
  //     //TWO UNMATCHED PLAYERS. SIMPLY CREATING MATCH
  //     const newMatchup = createPairingForTwoPlayers(unmatchedCompetitors, rounds)
  //     newPairings = filteredPairings.concat(newMatchup);

  //   } else {
  //     //ZERO OR MORE THAN TWO UNMATCHED PLAYERS.
  //     let newlyCreatedPairings = [];
  //     if (unmatchedCompetitors.length) {
  //       newlyCreatedPairings = createPairings('edit', unmatchedCompetitors, rounds, newAnalysis);
  //     }
  //     newPairings = filteredPairings.concat(newlyCreatedPairings);
  //   }
  // }
  let outputPairings: Match[] = [];
  return outputPairings;
}