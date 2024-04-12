import type { Match } from "tournament-pairings/dist/Match";
import { Tournament } from "../../../Types/Tournament";
import { findIdentifier } from "./find-identifier";
import { createPairings } from "./create-pairings";
import { tournamentAnalysisOutput } from "./matchup-game-analysis";
import { Game } from "../../../Types/Game";
import { PlayerRelated } from "../../../Types/Player";
import { Guest } from "../../../Types/Guest";
import { createPairingForTwoPlayers } from "./two-players-pairing";


type handleCreatePairingsFunction = (
  purpose: 'editing-players' | 'forcing-matchup-new',//TODO: ADD FORCE TO EDITING PLAYERS | 'edit-with-force',
  // editOrNew: 'new' | 'edit',
  tournamentObj: Tournament,
  analysisObj: tournamentAnalysisOutput,
  rounds: number,
  currentPairings?: Match[],
  roundGameIdentifiers?: (string | number)[][],
  gamesStarted?: boolean,
  gamesFromThisround?: Game[],
  forcedMatchupsPlayers?: (PlayerRelated | Guest)[],
  newAnalysis?: tournamentAnalysisOutput, //TODO: games_started_conditional_relocate THIS PROP SHOULD BE ABLE TO BE REMOVED TO EDITPLAYERS AFTER REFACTOR
) => Match[]
export const handleCreatePairings: handleCreatePairingsFunction = (
  purpose,
  // editOrNew,
  tournamentObj,
  analysisObj,
  rounds,
  currentPairings,
  roundGameIdentifiers,
  gamesStarted,
  gamesFromThisRound,
  forcedMatchupsPlayers,
  newAnalysis,
  // currentByeGameRef,
) => {

  const copy = { ...tournamentObj };
  let filteredPairings: Match[] = [];
  let unmatchedCompetitors: (PlayerRelated | Guest)[] = [];
  const allAddedCompetitors = tournamentObj.competitors.concat(tournamentObj.guest_competitors);
  console.log(rounds)
  const targetRound = purpose === 'forcing-matchup-new' ? rounds + 1 : rounds; 
  if (forcedMatchupsPlayers && forcedMatchupsPlayers[0].id && forcedMatchupsPlayers[1].id) {
    console.log('input of forcedMatchupsPlayers', [...forcedMatchupsPlayers])
    filteredPairings.push(createPairingForTwoPlayers([...forcedMatchupsPlayers], targetRound));
    console.log('filteredPairings immediately after adding force', filteredPairings);

    const forcedPlayerIdentifiers = [...forcedMatchupsPlayers].map(p => findIdentifier(p));
    console.log('forcedPlayerIdentifiers', forcedPlayerIdentifiers);

    unmatchedCompetitors = unmatchedCompetitors.concat(allAddedCompetitors.filter(p => !forcedPlayerIdentifiers.includes(findIdentifier(p))));
    console.log('unmatchedCompetitors', unmatchedCompetitors)
  } else {
    window.alert('two ids not found')
  }

  if (!currentPairings) {
    console.log('no pairings', unmatchedCompetitors)
    console.log('created', createPairings('new', unmatchedCompetitors, rounds, analysisObj))
    const remainingPairings = createPairings('new', unmatchedCompetitors, rounds, analysisObj)
    filteredPairings = filteredPairings.concat(remainingPairings);
    // return filteredPairings.concat(createPairings('new', unmatchedCompetitors, rounds, analysisObj, undefined));
    console.log('filteredPairings after remaining create', filteredPairings)
  }


  let outputPairings: Match[] = [];



/*

  //NEED FOR BOTH

  if (purpose === 'editing-players' && currentPairings && roundGameIdentifiers) {
    //CONDITIONAL
    // filtering pairings to only those between active players or those that have been submitted
    filteredPairings = currentPairings.filter(p => {
      const allPreviousCompetitors = tournamentObj.competitors.concat(tournamentObj.guest_competitors);
      const playerW = allPreviousCompetitors.find(c => findIdentifier(c) === p.player1);
      const playerB = allPreviousCompetitors.find(c => findIdentifier(c) === p.player2);

      const hasGameBeenPlayed = roundGameIdentifiers.find(i => {
        return i[0] === p.player1 && i[1] === p.player2;
      });

      return (playerW && playerB) || hasGameBeenPlayed;
    });

    unmatchedCompetitors = allAddedCompetitors.filter(competitor => {
      const identifier = findIdentifier(competitor);
      return (!filteredPairings.find(p => {
        return p.player1 === identifier || p.player2 === identifier
      }));
    });
  } else {
    if (forcedMatchupsPlayers)
      unmatchedCompetitors = allAddedCompetitors.filter(c => {
        return findIdentifier(c) !== findIdentifier(forcedMatchupsPlayers[0]) &&
          findIdentifier(c) !== findIdentifier(forcedMatchupsPlayers[1]);
      })
  }



  //CONDITIONAL, BUT CAN INLINE WITH TERNARY. Else 1 to account for one force matchup created
  const lastMatchNumFromCurrentPairings = purpose === 'editing-players' && currentPairings ? currentPairings[currentPairings.length - 1]?.match : 1;


  let newlyCreatedPairings = [];
  //GAMES NOT STARTED
  //TODO: games_started_conditional_relocate THIS SHOULD BE ABLE TO BE MOVED INTO EDIT PLAYERS AND CLEAN UP THIS FUNCTION
  if (!gamesStarted && !gamesFromThisRound?.length) {
    if (forcedMatchupsPlayers?.length) {
      //CREATING PAIR WITH FORCE
      newlyCreatedPairings = createPairings('new', unmatchedCompetitors, rounds, analysisObj);
    } else {
      //CREATING PAIRS WITH EDITED PLAYERS AND GAMES NOT STARTED
      newlyCreatedPairings = createPairings('edit', allAddedCompetitors, rounds, analysisObj);
    }
  } else {
    //GAMES STARTED
    if (unmatchedCompetitors.length === 1) {
      //ONE UNMATCHED PLAYER. SIMPLY CREATING BYE
      const byeMatchup = { round: rounds, match: lastMatchNumFromCurrentPairings, player1: findIdentifier(unmatchedCompetitors[0]), player2: null };
      //TODO-QUESTION: WHY DOES THIS NEED TO BE CONCAT AND NOT PUSH?
      outputPairings = filteredPairings.concat(byeMatchup);

    } else if (unmatchedCompetitors.length === 2) {
      //TWO UNMATCHED PLAYERS. SIMPLY CREATING MATCH

      const randomWhite = Math.floor(Math.random() * 2)
      const whitePlayer = findIdentifier(unmatchedCompetitors.splice(randomWhite, 1)[0])
      const blackPlayer = findIdentifier(unmatchedCompetitors[0])
      const newMatchup = {
        round: rounds,
        match: lastMatchNumFromCurrentPairings,
        player1: whitePlayer,
        player2: blackPlayer,
      };
      outputPairings = filteredPairings.concat(newMatchup);
      // if (analysis.playerOppRefObj[whitePlayer].includes(blackPlayer) || analysis.playerOppRefObj[blackPlayer].includes(whitePlayer)) {
      //   window.alert('adding and removing players may result in duplicate matches')
      // }
    } else {
      // let newlyCreatedPairings = [];
      if (unmatchedCompetitors.length && newAnalysis) {
        newlyCreatedPairings = createPairings('edit', unmatchedCompetitors, rounds, newAnalysis);
      }
      // outputPairings = filteredPairings.concat(newlyCreatedPairings);
      outputPairings = filteredPairings.concat(newlyCreatedPairings);
    }
  }
  */
 return outputPairings;
}