import { SetStateAction } from "react";
import type { Guest, PlayerOnTournament, Tournament } from "../Types";
import { updateTournament, sendNewGame, reopenTournament } from "../../../ServerManager";
import { createPairings } from "../actions/create-pairings";
import type { Match } from "tournament-pairings/dist/Match";
import { Game } from "../../../Types/Game";
import { findIdentifier } from "../actions/find-identifier";
import { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { checkIfUserIsAppCreator } from "../actions/check-if-creator";

interface TournamentControlsProps {
  // updater: React.Dispatch<SetStateAction<Tournament>>;
  tournamentResetter: () => void;
  tournamentGamesResetter: () => void;
  modalMode: 'none' | 'results' | 'edit-players' | 'end-tournament';
  modalModeSetter: React.Dispatch<SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament'>>;
  scoringMode: 'scoring' | 'editing' | 'table';
  scoringModeSetter: React.Dispatch<SetStateAction<'scoring' | 'editing' | 'table'>>;
  tournamentObj: Tournament;
  currentMatchups: Match[];
  //TODO: FIX PLAYERRELATEDISSUE
  gameForApi: Game | any;
  //TODO: FIX PLAYERRELATEDISSUE
  byeGame: any;
  userIsCreator: boolean;
  activePlayers: (PlayerOnTournament | Guest)[];
  currentRound: number;
  analysis: tournamentAnalysisOutput;
  roundComplete: boolean;
}
export const TournamentControls: React.FC<TournamentControlsProps> = ({
  // updater,
  tournamentResetter,
  tournamentGamesResetter,
  modalMode,
  modalModeSetter,
  scoringMode,
  scoringModeSetter,
  tournamentObj,
  currentMatchups,
  //TODO: FIX PLAYERRELATED ISSUE
  gameForApi,
  byeGame,
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
            else {
              sendNewGame(byeGame.current)
                .then(() => tournamentGamesResetter());
            }
          })
        }}>create round games</button>
      )
    }

  }
  if (!tournamentObj.complete && (userIsCreator || checkIfUserIsAppCreator())) {
    return (
      <div id="tournamentProgressionControls">
        <button
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            if (window.confirm("create round?")) {
              // if (byeGame.player_w.id) {
              //   sendNewGame(byeGame)
              // }
              const tournamentCopy = { ...tournamentObj }
              // const newPairings = createPairings('new', activeTournamentPlayers, playerOpponentsReferenceObj, currentRound, scoreObj, scoreCard, byeGame.player_w, blackWhiteTally)
              const newPairings = createPairings('new', activePlayers, currentRound, findIdentifier(byeGame.current.player_w), analysis)
              tournamentCopy.pairings = tournamentCopy.pairings.concat(newPairings)
              tournamentCopy.rounds++
              console.log('tournamentCopy', tournamentCopy)
              // tournamentCopy.competitors = tournamentCopy.competitors.map(c => { return c.id })
              // tournamentCopy.guest_competitors = tournamentCopy.guest_competitors.map(gc => { return gc.id })
              console.log(tournamentCopy)
              // updateTournament(tournamentCopy)
              //   .then(() => {
              //     tournamentResetter();
              //     tournamentGamesResetter();
              //   })
              // modalModeSetter('none');
            }
          }}>
          New Round
        </button>
        <button
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            scoringModeSetter('scoring');
          }}>
          scoring
        </button>
        <button
          className="progressionControlBtn controlBtnApprove"
          onClick={() => {
            scoringModeSetter('editing');
          }}>
          edit scores
        </button>
        {newRoundButtonDigitalTournament()}
        <button className="progressionControlBtn controlBtnApprove" onClick={() => {
          if (roundComplete) {
            window.alert('This round seems to be over. Start new round before adding players')
            modalModeSetter('none');
          }
          else {
            modalModeSetter('edit-players');
          }
        }}>edit players</button>
      </div>
    )
  } else {
    return (
      <div id="tournamentProgressionControls">
        <button
          className="progressionControlBtn controlBtnApprove"
          onClick={() => reopenTournament(tournamentObj.id)}>
            Reopen Tourney
        </button>
      </div>
    )
  }
}
