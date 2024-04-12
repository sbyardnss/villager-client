// import { SetStateAction, useState } from "react";
import { updateTournament, sendNewGame, reopenTournament } from "../../../ServerManager";
import { createPairings } from "../actions/create-pairings";
import { findIdentifier } from "../actions/find-identifier";
import { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { checkIfUserIsAppCreator } from "../actions/check-if-creator";
import type { PlayerRelated } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";
import type { Tournament } from "../../../Types/Tournament";
import type { Match } from "tournament-pairings/dist/Match";
import type { Game, OutgoingGame } from "../../../Types/Game";

interface TournamentControlsProps {
  operation: 'editing-players' | 'new-round-normal' | 'normal-play';
  setOperation: React.Dispatch<React.SetStateAction<'editing-players' | 'new-round-normal' | 'normal-play'>>;

  // updater: React.Dispatch<React.SetStateAction<Tournament>>;
  tournamentResetter: () => void;
  tournamentGamesResetter: () => void;
  activeTournamentResetter: () => void;
  modalMode: 'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round' | 'force-match';
  modalModeSetter: React.Dispatch<React.SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round' | 'force-match'>>;
  scoringMode: 'scoring' | 'editing' | 'table';
  scoringModeSetter: React.Dispatch<React.SetStateAction<'scoring' | 'editing' | 'table'>>;
  tournamentObj: Tournament;
  currentMatchups: Match[];
  //TODO: FIX PLAYERRELATEDISSUE
  gameForApi: Game | any;
  //TODO: FIX PLAYERRELATEDISSUE
  byeGameCurrent: OutgoingGame;
  userIsCreator: boolean;
  activePlayers: (PlayerRelated | Guest)[];
  currentRound: number;
  analysis: tournamentAnalysisOutput;
  roundComplete: boolean;
}
export const TournamentControls: React.FC<TournamentControlsProps> = ({
  operation,
  setOperation,
  // updater,
  tournamentResetter,
  tournamentGamesResetter,
  activeTournamentResetter,
  modalMode,
  modalModeSetter,
  scoringMode,
  scoringModeSetter,
  tournamentObj,
  currentMatchups,
  //TODO: FIX PLAYERRELATED ISSUE
  gameForApi,
  byeGameCurrent,
  userIsCreator,
  activePlayers,
  currentRound,
  analysis,
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
  // if (!tournamentObj.complete && (userIsCreator || checkIfUserIsAppCreator())) {
  return (
    <div id="tournamentProgressionControls">
      {!tournamentObj.complete && (userIsCreator || checkIfUserIsAppCreator()) ?
        <button
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            // if (window.confirm("create round?")) {
            //   const tournamentCopy = { ...tournamentObj }
            //   const newPairings = createPairings('new', activePlayers, currentRound, analysis, byeGame.current)
            //   tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings)
            //   tournamentCopy.rounds++
            //   if (byeGame.player_w.id) {
            //     sendNewGame(byeGame)
            //   }
            //   updateTournament(tournamentCopy)
            //     .then(() => {
            //       // tournamentResetter();
            //       activeTournamentResetter();
            //       tournamentGamesResetter();
            //     });
            //   modalModeSetter('none');
            // }
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
  // } else {
  //   return (
  //   )
  // }
}
