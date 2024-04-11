import { OutgoingGame } from "../../../Types/Game";
import { Guest } from "../../../Types/Guest"
import { PlayerRelated } from "../../../Types/Player"
import { Tournament } from "../../../Types/Tournament";
import { createPairings } from "../actions/create-pairings";
import { sendNewGame, updateTournament } from "../../../ServerManager";
import { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";

interface NewRoundProps {
  tournamentObj: Tournament;
  activePlayers: (PlayerRelated | Guest)[];
  modalModeSetter: React.Dispatch<React.SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round'>>;
  currentRound: number;
  byeGameCurrent: OutgoingGame;
  activeTournamentResetter: () => void;
  tournamentGamesResetter: () => void;
  analysis: tournamentAnalysisOutput;
}

export const NewRoundModal: React.FC<NewRoundProps> = ({
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
    <div className="tournament-modal-fixed">
    <button
      className="progressionControlBtn controlBtnApprove"
      onClick={() => {
        if (window.confirm("create round?")) {
          const tournamentCopy = { ...tournamentObj }
          const newPairings = createPairings('new', activePlayers, currentRound, analysis, byeGameCurrent)
          tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings)
          tournamentCopy.rounds++
          if (byeGameCurrent.player_w.id) {
            sendNewGame(byeGameCurrent)
          }
          updateTournament(tournamentCopy)
            .then(() => {
              // tournamentResetter();
              activeTournamentResetter();
              tournamentGamesResetter();
            });
          modalModeSetter('none');
        }
      }}>
    </button>
  </div>
  </>
}