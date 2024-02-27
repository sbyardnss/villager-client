import React, { useState, useEffect } from "react";
// import { Swiss } from "tournament-pairings";
import type { ChessClub } from "../../App/types";
import type { Player, PlayerOnTournament, Guest, NewTournament } from "../Types";
// import { isPlayerOrGuest } from "../../../utils/is-player-or-guest";
import { PlayerSelection } from "./PlayerSelection";
import { getClubsGuests } from "../../../ServerManager";

interface TournamentFormProps {
  clubs: ChessClub[];
  selectedClub: ChessClub;
  selectClub: React.Dispatch<React.SetStateAction<ChessClub>>;
  // playersAndGuests: (Player | Guest)[];
  resetTourneys: () => void;
  createTournament: boolean;
  setCreateTournament: React.Dispatch<React.SetStateAction<boolean>>;
  updater: React.Dispatch<React.SetStateAction<NewTournament>>;
  tournamentObj: NewTournament;
}

export const TournamentForm: React.FC<TournamentFormProps> = ({
  clubs,
  selectedClub,
  selectClub,
  // playersAndGuests,
  resetTourneys,
  createTournament,
  setCreateTournament,
  updater,
  tournamentObj,
}) => {
  const [clubObj, setClubObj] = useState<ChessClub>({} as ChessClub);
  const [clubPlayers, setClubPlayers] = useState<PlayerOnTournament[]>([]);
  const [clubGuests, setClubGuests] = useState<Guest[]>([]);
  const [playersSelected, setPlayersSelected] = useState(false);

  useEffect(
    () => {
      setClubObj(selectedClub);
      setClubGuests(selectedClub.guest_members);
      setClubPlayers(selectedClub.members);
    }, [selectedClub]
  )
  const resetGuests = () => {
    getClubsGuests(selectedClub.id) 
      .then(data => {
        setClubGuests(data);
      })
  }
  if (createTournament) {
    if (!selectedClub.id) {
      return (
        <section id="newTournamentForm">
          <section id="clubSelectionSection">

            <div id="tournamentHeader">
              <div className="setCustomFont">Select Club</div>
              <button className="buttonStyleReject" onClick={() => setCreateTournament(false)}>cancel</button>
            </div>
            <div id="clubSelectionList" className="setCustomFont">
              {
                clubs.map(club => {
                  // if (club.id === selectedClub) {
                  //   return (
                  //     <div
                  //       key={club.id}
                  //       className="selectedClubSelectionTabItem"
                  //       onClick={() => { 
                  //         console.log(club) 
                  //         selectClub(club.id)}}
                  //     >{club.name}</div>
                  //   )
                  // }
                  // else {
                  return (
                    <div
                      key={club.id}
                      className="clubSelectionTabItem"
                      onClick={() => {
                        selectClub(club)
                      }}
                    >{club.name}</div>
                  )
                  // }
                })
              }
            </div>
          </section>
        </section>
      )
    } else {
      return (
        <section id="newTournamentForm">

          <div id="newTournamentClubNameHeader" className="setCustomFont">Club: {clubObj?.name}</div>
          { !playersSelected ?
            <PlayerSelection
              players={clubPlayers}
              guests={clubGuests}
              updatePlayersSelected={setPlayersSelected}
              tournamentObj={tournamentObj}
              updateTournamentObj={updater}
              setCreate={setCreateTournament}
              selectClub={selectClub}
              selectedClub={selectedClub} 
              resetGuests={resetGuests} />
          : ""}
        </section>
      );
    }
  } else {
    return (
      <button id="createTournamentButton" className="setCustomFont" onClick={() => setCreateTournament(true)}>create new tournament</button>
    )
  }
}