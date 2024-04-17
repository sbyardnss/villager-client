import { Match } from "tournament-pairings/dist/Match";
import { sendNewGame, updateTournament } from "../../../ServerManager";
import { Game, OutgoingGame } from "../../../Types/Game";
import { Guest } from "../../../Types/Guest";
import { PlayerRelated } from "../../../Types/Player";
import { Tournament } from "../../../Types/Tournament";
import { handleCreatePairings } from "./handle-create-pairings";
import { tournamentAnalysisOutput } from "./matchup-game-analysis";
import { findByIdentifier } from "./find-by-identifier";

type HandleUpdateTournamentFunction = (
  operation: 'editing-players' | 'new-round-normal' | 'normal-play',
  setOperation: React.Dispatch<React.SetStateAction<'editing-players' | 'new-round-normal' | 'normal-play'>>,
  tournamentObj: Tournament,
  selectedPlayersForForce: (PlayerRelated | Guest)[],
  setSelectedPlayersForForce: React.Dispatch<React.SetStateAction<(PlayerRelated | Guest)[]>>,
  analysis: tournamentAnalysisOutput,
  currentRound: number,
  byeGame: OutgoingGame,
  activeTournamentResetter: () => void,
  tournamentGamesResetter: () => void,
  gamesFromThisRound: Game[],
  roundGameIdentifiers?: (string | number)[][],
  gamesStarted?: boolean,
  newAnalysis?: tournamentAnalysisOutput,
  currentPairings?: Match[],
) => void;

export const handleUpdateTournament: HandleUpdateTournamentFunction = (
  operation,
  setOperation,
  tournamentObj,
  selectedPlayersForForce,
  setSelectedPlayersForForce,
  analysis,
  currentRound,
  byeGame,
  activeTournamentResetter,
  tournamentGamesResetter,
  gamesFromThisRound,
  roundGameIdentifiers,
  gamesStarted,
  newAnalysis,
  currentPairings,
) => {

  const tournamentCopy = { ...tournamentObj };

  const newPairings = handleCreatePairings(operation, setOperation, tournamentCopy, analysis, currentRound, byeGame, gamesFromThisRound, currentPairings, roundGameIdentifiers, gamesStarted, selectedPlayersForForce, newAnalysis);
  if (newPairings) {
    if (operation === 'new-round-normal') {
      tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings);
      tournamentCopy.rounds++;
      if (byeGame.player_w.id) {
        sendNewGame(byeGame)
      }
    } else if (operation === 'editing-players') {
      const pastPairings = tournamentCopy.pairings.filter(p => p.round < currentRound);
      tournamentCopy.pairings = pastPairings.concat(newPairings);
    }
    // console.log('tournamentCopy', tournamentCopy.pairings)
    updateTournament(tournamentCopy)
      .then(() => {
        activeTournamentResetter();
        tournamentGamesResetter();
      });
  } else {
    window.alert('Something went wrong. Try again')
  }
  // modalModeSetter('none');
  setOperation('normal-play');
  setSelectedPlayersForForce([]);
}