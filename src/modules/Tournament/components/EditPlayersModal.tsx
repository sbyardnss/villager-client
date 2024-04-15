import React, { useState, useEffect } from "react"
import { Guest } from "../../../Types/Guest"
import { TournamentParameters } from "./Parameters"
import { PlayerSelection } from "./PlayerSelection"
import { NewTournament, Tournament } from "../../../Types/Tournament"
import type { PlayerRelated } from "../../../Types/Player";
import { Game, OutgoingGame } from "../../../Types/Game";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { tournamentAnalysis } from "../actions/matchup-game-analysis";
import "../../../styles/Tournament.css";
import { ChessClub } from "../../../Types/ChessClub";
import { getClubsGuests } from "../../../ServerManager";
import { Match } from "tournament-pairings/dist/Match";

interface EditPlayersModalProps {
  setOperation: React.Dispatch<React.SetStateAction<'editing-players' | 'new-round-normal' | 'normal-play'>>;
  tournamentObj: Tournament;
  modalModeSetter: React.Dispatch<React.SetStateAction<'none' | 'results' | 'edit-players' | 'end-tournament' | 'new-round' | 'force-match'>>;
  byeGame: React.RefObject<OutgoingGame>;
  rounds: number;
  tourneyGames: Game[];
  tournamentClub: ChessClub;
  setPastPairings: React.Dispatch<React.SetStateAction<Match[]>>;
  currentPairings: Match[];
  setCurrentPairings: React.Dispatch<React.SetStateAction<Match[]>>
  setNewAnalysis: React.Dispatch<React.SetStateAction<tournamentAnalysisOutput>>;
  editedTournament: Tournament;
  updateEditedTournament: React.Dispatch<React.SetStateAction<Tournament>>;
  gamesStarted: boolean;
  setGamesStarted: React.Dispatch<React.SetStateAction<boolean>>;
  callHandleUpdateTournament: () => void;

}

export const EditPlayersModal: React.FC<EditPlayersModalProps> = ({
  setOperation,
  tournamentObj,
  modalModeSetter,
  byeGame,
  rounds,
  tourneyGames,
  tournamentClub,
  setPastPairings,
  currentPairings,
  setCurrentPairings,
  setNewAnalysis,
  editedTournament,
  updateEditedTournament,
  gamesStarted,
  setGamesStarted,
  callHandleUpdateTournament,
}) => {
  const [playersSelected, setPlayersSelected] = useState(false);
  const [clubPlayers, setClubPlayers] = useState<PlayerRelated[]>([]);
  const [clubGuests, setClubGuests] = useState<Guest[]>([]);
  useEffect(
    () => {
      updateEditedTournament({ ...tournamentObj });
      let currentRoundPairings: Match[] = [];
      let previousPairings: Match[] = [];
      tournamentObj.pairings.forEach(pairing => {
        if (pairing.round === rounds) {
          currentRoundPairings.push(pairing);
        } else {
          previousPairings.push(pairing);
        }
      });
      setCurrentPairings(currentRoundPairings);
      setPastPairings(previousPairings)
    }, [tournamentObj, rounds]
  )
  useEffect(
    () => {
      setClubPlayers(tournamentClub.members);
      setClubGuests(tournamentClub.guest_members);
    }, [tournamentClub]
  )
  useEffect(
    () => {
      const allNewPlayers = editedTournament.competitors.concat(editedTournament.guest_competitors);
      const editedPlayersAnalysis = tournamentAnalysis(tourneyGames, currentPairings, rounds, byeGame, allNewPlayers);
      setNewAnalysis(editedPlayersAnalysis);
    }, [editedTournament]
  )
  

  const resetGuests = () => {
    getClubsGuests(tournamentClub.id)
      .then(data => {
        setClubGuests(data);
      });
  };


  return (
    <div id="editPlayersModal" className="setCustomFont">
      <article id="editPlayersContainer">
        <div id="editPlayersHeader">
          <h3>Edit Players</h3>
          <button className="buttonStyleReject" onClick={() => {
            setOperation('normal-play');
            modalModeSetter('none');
          }}>cancel</button>
        </div>
        {!playersSelected ?
          <PlayerSelection
            editOrNew={"edit"}
            players={clubPlayers}
            guests={clubGuests}
            updatePlayersSelected={setPlayersSelected}
            tournamentObj={editedTournament}
            resetGuests={resetGuests}
            selectedClub={tournamentClub}
            updateTournamentObj={updateEditedTournament as React.Dispatch<React.SetStateAction<NewTournament | Tournament>>}
          />
          : ""}
        {playersSelected ?
          <TournamentParameters
            editOrNew={"edit"}
            tournamentObj={editedTournament}
            updateTournamentObj={updateEditedTournament as React.Dispatch<React.SetStateAction<NewTournament | Tournament>>}
            gamesStarted={gamesStarted}
            setGamesStarted={setGamesStarted}
          />
          : null}
        {playersSelected ?
          <div id="editPlayersToggleAndSubmitBtnBlock">
            <button className="buttonStyleApprove" onClick={() => setPlayersSelected(false)}>choose players</button>
            <button
              data-cy="submit-players-btn"
              id="submitNewPlayersBtn"
              className="buttonStyleApprove"
              onClick={() => {
                if (!gamesStarted) {
                  modalModeSetter('new-round');
                } else if (gamesStarted) {
                  if (window.confirm("Confirm games have already started")) {
                    modalModeSetter('none');
                    callHandleUpdateTournament();
                  }
                }
              }}>
              Submit
            </button>
          </div>
          : ""}
      </article>
    </div>
  )

}