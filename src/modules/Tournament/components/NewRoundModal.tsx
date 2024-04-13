import { Game, OutgoingGame } from "../../../Types/Game";
import { Guest } from "../../../Types/Guest"
import { PlayerRelated } from "../../../Types/Player"
import { Tournament } from "../../../Types/Tournament";
import { createPairings } from "../actions/create-pairings";
import { sendNewGame, updateTournament } from "../../../ServerManager";
import { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { handleCreatePairings } from "../actions/handle-create-pairings";
import { Match } from "tournament-pairings/dist/Match";
import { handleUpdateTournament } from "../actions/handle-update-tournament";

//TODO: CSS-ISSUE --throughout this component
interface NewRoundProps {
  operation: 'editing-players' | 'new-round-normal' | 'normal-play';
  setOperation: React.Dispatch<React.SetStateAction<'editing-players' | 'new-round-normal' | 'normal-play'>>;
  // tournamentObj: Tournament;
  // activePlayers: (PlayerRelated | Guest)[];
  modalModeSetter: React.Dispatch<React.SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round' | 'force-match'>>;
  // currentRound: number;
  // byeGameCurrent: OutgoingGame;
  // activeTournamentResetter: () => void;
  // tournamentGamesResetter: () => void;
  // analysis: tournamentAnalysisOutput;
  // currentPairings: Match[];
  // roundGameIdentifiers: (string | number)[][];
  // forcedMatchupsPlayers: (PlayerRelated | Guest)[];
  // setForcedMatchupsPlayers: React.Dispatch<React.SetStateAction<(PlayerRelated | Guest)[]>>;
  // newAnalysis: tournamentAnalysisOutput;
  // gamesStarted: boolean;
  // gamesFromThisRound: Game[];
  callHandleUpdateTournament: () => void;
}

export const NewRoundModal: React.FC<NewRoundProps> = ({
  operation,
  setOperation,
  // tournamentObj,
  // activePlayers,
  modalModeSetter,
  // currentRound,
  // byeGameCurrent,
  // activeTournamentResetter,
  // tournamentGamesResetter,
  // analysis,
  // currentPairings,
  // roundGameIdentifiers,
  // forcedMatchupsPlayers,
  // setForcedMatchupsPlayers,
  // newAnalysis,
  // gamesStarted,
  // gamesFromThisRound,
  callHandleUpdateTournament,
}) => {
  return <>
    <div className="tournament-modal-fixed column a-center">
      <div className="d-flex j-between w-100">
        <h2 className="setCustomFont">Need a forced match?</h2>
        <button
          className="progressionControlBtn buttonStyleReject"
          onClick={() => {
            if (operation === 'editing-players') {
              modalModeSetter('edit-players');
            } else {
              setOperation('normal-play');
              modalModeSetter('none');
            }
          }}>
          cancel
        </button>
      </div>
      <button
        className="large-control-button"
        onClick={() => {
          if (window.confirm("create round?")) {
            // const tournamentCopy = { ...tournamentObj }
            // //handleCreatePairings
            // if (operation === 'editing-players') {
            //   const newPairings = handleCreatePairings(operation, setOperation, tournamentObj, analysis, currentRound, currentPairings, roundGameIdentifiers, gamesStarted, gamesFromThisRound, forcedMatchupsPlayers, newAnalysis )
            //   tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings)
            // } else {
            //   const newPairings = handleCreatePairings(operation, setOperation, tournamentObj, analysis, currentRound, undefined, undefined, undefined, undefined, undefined, undefined)
            //   tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings)
            // }
            // // const newPairings = createPairings('new', activePlayers, currentRound, analysis, byeGameCurrent)
            // tournamentCopy.rounds++
            // console.log('tournamentCopy', tournamentCopy)

            //TODO: UPDATE-TOURNAMENT-HANDLER
            // if (byeGameCurrent.player_w.id) {
            //   sendNewGame(byeGameCurrent)
            // }
            // updateTournament(tournamentCopy)
            //   .then(() => {
            //     // tournamentResetter();
            //     activeTournamentResetter();
            //     tournamentGamesResetter();
            //   });
            // handleUpdateTournament(operation, setOperation, tournamentObj, forcedMatchupsPlayers, setForcedMatchupsPlayers, activePlayers, analysis, currentRound, byeGameCurrent, activeTournamentResetter, tournamentGamesResetter);
            callHandleUpdateTournament();
            // setOperation('normal-play');
            modalModeSetter('none');
          }
        }}>
        Start round
      </button>
      <button
        className="large-control-button"
        onClick={() => modalModeSetter('force-match')}>
        Start round with a forced match
      </button>
    </div>
  </>
}