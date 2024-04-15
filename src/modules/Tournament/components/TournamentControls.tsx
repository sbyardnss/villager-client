import { sendNewGame, reopenTournament } from "../../../ServerManager";
import { checkIfUserIsAppCreator } from "../actions/check-if-creator";
import type { Tournament } from "../../../Types/Tournament";
import type { Match } from "tournament-pairings/dist/Match";
import type { Game } from "../../../Types/Game";

interface TournamentControlsProps {
  setOperation: React.Dispatch<React.SetStateAction<'editing-players' | 'new-round-normal' | 'normal-play'>>;
  tournamentGamesResetter: () => void;
  modalMode: 'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round' | 'force-match';
  modalModeSetter: React.Dispatch<React.SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round' | 'force-match'>>;
  scoringModeSetter: React.Dispatch<React.SetStateAction<'scoring' | 'editing' | 'table'>>;
  tournamentObj: Tournament;
  currentMatchups: Match[];
  gameForApi: Game | any;
  userIsCreator: boolean;
  roundComplete: boolean;
}
export const TournamentControls: React.FC<TournamentControlsProps> = ({
  setOperation,
  tournamentGamesResetter,
  modalModeSetter,
  scoringModeSetter,
  tournamentObj,
  currentMatchups,
  gameForApi,
  userIsCreator,
  roundComplete,
}) => {
  const newRoundButtonDigitalTournament = () => {
    if (tournamentObj.in_person === false) {
      return (
        <button className="controlBtnApprove progressionControlBtn" onClick={() => {
          currentMatchups.forEach((matchup: Match) => {
            if (matchup.player2 !== null) {
              const copy = { ...gameForApi }
              const [w, b] = [matchup.player1, matchup.player2]
              if (typeof w === 'string') {
                copy.player_w_model_type = 'guestplayer'
              }
              else {
                copy.player_w_model_type = 'player'
              }
              if (typeof b === 'string') {
                copy.player_b_model_type = 'guestplayer'
              }
              else {
                copy.player_b_model_type = 'player'
              }
              copy.winner = null
              copy.winner_model_type = null
              copy.player_w = w
              copy.player_b = b
              sendNewGame(copy)
                // THIS WORKS HERE BUT THERE MUST BE A BETTER WAY
                .then(() => tournamentGamesResetter());
            }
            // else {
            //   sendNewGame(byeGame.current)
            //     .then(() => tournamentGamesResetter());
            // }
          })
        }}>create round games</button>
      )
    }

  }
  return (
    <div id="tournamentProgressionControls">
      {!tournamentObj.complete && (userIsCreator || checkIfUserIsAppCreator()) ?
        <button
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            setOperation('new-round-normal');
            modalModeSetter('new-round');
          }}>
          New Round
        </button>
        : ""}
      {!tournamentObj.complete && (userIsCreator || checkIfUserIsAppCreator()) ?
        <button
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            scoringModeSetter('scoring');
          }}>
          scoring
        </button>
        : ""}
      {!tournamentObj.complete && (userIsCreator || checkIfUserIsAppCreator()) ?
        <button
          data-cy="edit-scores-tournament-control-btn"
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            scoringModeSetter('editing');
          }}>
          edit scores
        </button>
        : ""}
      {!tournamentObj.complete && (userIsCreator || checkIfUserIsAppCreator()) ?
        newRoundButtonDigitalTournament()
        : ""}
      {tournamentObj.in_person === true && !tournamentObj.complete && (userIsCreator || checkIfUserIsAppCreator()) ?
        <button
          data-cy="edit-players-tournament-controls-btn"
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            if (roundComplete) {
              window.alert('This round seems to be over. Start new round before adding players')
              modalModeSetter('none');
            }
            else {
              setOperation('editing-players');
              modalModeSetter('edit-players');
            }
          }}>edit players</button>
        : ""}
      {!tournamentObj.complete ?
        <button
          data-cy="view-table-tournament-control-btn"
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            scoringModeSetter('table');
          }}>View Table</button>
        : ""}
      {tournamentObj.complete && (userIsCreator || checkIfUserIsAppCreator()) ?
        <div id="tournamentProgressionControls">
          <button
            className="progressionControlBtn controlBtnApprove"
            onClick={() => reopenTournament(tournamentObj.id)}>
            Reopen Tourney
          </button>
        </div>
        : ""}
    </div>
  )
}
