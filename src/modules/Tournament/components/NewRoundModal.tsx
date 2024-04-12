import { OutgoingGame } from "../../../Types/Game";
import { Guest } from "../../../Types/Guest"
import { PlayerRelated } from "../../../Types/Player"
import { Tournament } from "../../../Types/Tournament";
import { createPairings } from "../actions/create-pairings";
import { sendNewGame, updateTournament } from "../../../ServerManager";
import { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { handleCreatePairings } from "../actions/handle-create-pairings";

//TODO: CSS-ISSUE --throughout this component
interface NewRoundProps {
  operation: 'editing-players' | 'new-round-normal' | 'normal-play';
  setOperation: React.Dispatch<React.SetStateAction<'editing-players' | 'new-round-normal' | 'normal-play'>>;
  tournamentObj: Tournament;
  activePlayers: (PlayerRelated | Guest)[];
  modalModeSetter: React.Dispatch<React.SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round' | 'force-match'>>;
  currentRound: number;
  byeGameCurrent: OutgoingGame;
  activeTournamentResetter: () => void;
  tournamentGamesResetter: () => void;
  analysis: tournamentAnalysisOutput;
}

export const NewRoundModal: React.FC<NewRoundProps> = ({
  operation,
  setOperation,
  tournamentObj,
  activePlayers,
  modalModeSetter,
  currentRound,
  byeGameCurrent,
  activeTournamentResetter,
  tournamentGamesResetter,
  analysis,
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
              const tournamentCopy = { ...tournamentObj }
              //handleCreatePairings
              const newPairings = handleCreatePairings('new-round-normal', setOperation, tournamentObj, analysis, currentRound, undefined, undefined, undefined, undefined, undefined, undefined)
              // const newPairings = createPairings('new', activePlayers, currentRound, analysis, byeGameCurrent)
              tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings)
              tournamentCopy.rounds++
              console.log('tournamentCopy', tournamentCopy)

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
              setOperation('normal-play');
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