import { Match } from "tournament-pairings/dist/Match";
import { sendNewGame, updateTournament } from "../../../ServerManager";
import { Game, OutgoingGame } from "../../../Types/Game";
import { Guest } from "../../../Types/Guest";
import { PlayerRelated } from "../../../Types/Player";
import { Tournament } from "../../../Types/Tournament";
import { handleCreatePairings } from "./handle-create-pairings";
import { tournamentAnalysisOutput } from "./matchup-game-analysis";

type HandleUpdateTournamentFunction = (
  operation: 'editing-players' | 'new-round-normal' | 'normal-play',
  setOperation: React.Dispatch<React.SetStateAction<'editing-players' | 'new-round-normal' | 'normal-play'>>,
  tournamentObj: Tournament,
  selectedPlayersForForce: (PlayerRelated | Guest)[],
  setSelectedPlayersForForce: React.Dispatch<React.SetStateAction<(PlayerRelated | Guest)[]>>,
  activePlayers: (PlayerRelated | Guest)[],
  analysis: tournamentAnalysisOutput,
  currentRound: number,
  byeGame: OutgoingGame,
  activeTournamentResetter: () => void,
  tournamentGamesResetter: () => void,
  roundGameIdentifiers?: (string | number)[][],
  gamesStarted?: boolean,
  gamesFromThisRound?: Game[],
  forcedMatchupsPlayers?: (PlayerRelated | Guest)[],
  newAnalysis?: tournamentAnalysisOutput,
  currentPairings?: Match[],
) => void;

export const handleUpdateTournament: HandleUpdateTournamentFunction = (
  operation,
  setOperation,
  tournamentObj,
  selectedPlayersForForce,
  setSelectedPlayersForForce,
  activePlayers,
  analysis,
  currentRound,
  byeGame,
  activeTournamentResetter,
  tournamentGamesResetter,
  roundGameIdentifiers,
  gamesStarted,
  gamesFromThisRound,
  forcedMatchupsPlayers,
  newAnalysis,
  currentPairings,
) => {
  const tournamentCopy = { ...tournamentObj };
  if (operation === 'new-round-normal') {
    if (selectedPlayersForForce.length === 2 && selectedPlayersForForce[0].full_name && selectedPlayersForForce[1].full_name) {
      const newPairings = handleCreatePairings(operation, setOperation, tournamentObj, analysis, currentRound, undefined, undefined, false, undefined, [...selectedPlayersForForce], undefined);
      tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings);
    } else {
      const newPairings = handleCreatePairings(operation, setOperation, tournamentObj, analysis, currentRound, undefined, undefined, false, undefined, undefined, undefined);
      tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings);
    }
    tournamentCopy.rounds++;
    if (byeGame.player_w.id) {
      sendNewGame(byeGame)
    }
  } else if (operation === 'editing-players') {
    /*
currentPairings,
  roundGameIdentifiers,
  gamesStarted,
  gamesFromThisRound,
  forcedMatchupsPlayers,
  newAnalysis,
    */
    if (selectedPlayersForForce.length === 2 && selectedPlayersForForce[0].full_name && selectedPlayersForForce[1].full_name) {
      // const newPairings = handleCreatePairings(operation, setOperation, tournamentObj, analysis, currentRound, undefined, undefined, false, undefined, [...selectedPlayersForForce], undefined);
      const newPairings = handleCreatePairings(operation, setOperation, tournamentObj, analysis, currentRound, currentPairings, roundGameIdentifiers, gamesStarted, gamesFromThisRound, [...selectedPlayersForForce], newAnalysis);
      tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings);
    } else {
      // const newPairings = handleCreatePairings(operation, setOperation, tournamentObj, analysis, currentRound, undefined, undefined, false, undefined, undefined, undefined);
      const newPairings = handleCreatePairings(operation, setOperation, tournamentObj, analysis, currentRound, currentPairings, roundGameIdentifiers, gamesStarted, gamesFromThisRound, undefined, newAnalysis);
      tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings);
    }
  }

  console.log('tournamentCopy', tournamentCopy)

  // if (byeGame.player_w.id) {
  //   sendNewGame(byeGame)
  // }
  updateTournament(tournamentCopy)
    .then(() => {
      activeTournamentResetter();
      tournamentGamesResetter();
    });
  // modalModeSetter('none');
  setSelectedPlayersForForce([]);
}