import React, { useState, useEffect } from "react";
import { Swiss } from "tournament-pairings";
import { PlayerSelection } from "./PlayerSelection";
import { getClubsGuests, sendNewTournament } from "../../../ServerManager";
import { TournamentParameters } from "./Parameters";
import { type ChessClub, chessClubDefaults } from "../../../Types/ChessClub";
import type { PlayerRelated, PlayerPairingArgument } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";
import type { NewTournament } from "../../../Types/Tournament";

interface TournamentFormProps {
  clubs: ChessClub[];
  selectedClub: ChessClub;
  selectClub: React.Dispatch<React.SetStateAction<ChessClub>>;
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
  resetTourneys,
  createTournament,
  setCreateTournament,
  updater,
  tournamentObj,
}) => {
  const [clubObj, setClubObj] = useState<ChessClub>({} as ChessClub);
  const [clubPlayers, setClubPlayers] = useState<PlayerRelated[]>([]);
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
  const resetNewTournament = () => {
    const copy = {
      ...tournamentObj,
      competitors: [],
      guest_competitors: [],
    };
    updater(copy);
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
                  if (club.id === selectedClub.id) {
                    return (
                      <div
                        key={club.id}
                        className="selectedClubSelectionTabItem"
                        onClick={() => {
                          selectClub(club)
                        }}
                      >{club.name}</div>
                    )
                  }
                  else {
                    return (
                      <div
                        key={club.id}
                        className="clubSelectionTabItem"
                        onClick={() => {
                          selectClub(club)
                        }}
                      >{club.name}</div>
                    )
                  }
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
          {!playersSelected ?
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
            :
            <section id="tournamentParameters">
              <TournamentParameters
                editOrNew={'new'}
                tournamentObj={tournamentObj}
                updateTournamentObj={updater} />
              <div id="tournamentSubmit">
                <button className="buttonStyleApprove" onClick={() => setPlayersSelected(false)}>choose players</button>
                <button
                  className="buttonStyleApprove"
                  onClick={() => {
                    if (tournamentObj.guest_competitors.length > 0 && tournamentObj.in_person === false) {
                      window.alert('No guest competitors on digtal tournament')
                    }
                    else {
                      if (tournamentObj.competitors && tournamentObj.time_setting && tournamentObj.title) {
                        if (window.confirm("Everybody ready?")) {
                          const copy = { ...tournamentObj };
                          const competitorPairing: number[] = []
                          const guestCompetitorPairing: number[] = []
                          const guestPairingIds = tournamentObj.guest_competitors.map(guest => {
                            guestCompetitorPairing.push(guest.id);
                            return { id: guest.guest_id, score: 0 } as PlayerPairingArgument;
                          });
                          const playerPairingIds = tournamentObj.competitors.map(player => {
                            competitorPairing.push(player.id);
                            return { id: player.id, score: 0 } as PlayerPairingArgument;
                          });
                          const allCompetitorsPairing = playerPairingIds.concat(guestPairingIds);
                          const firstRoundPairings = Swiss(allCompetitorsPairing, 1)
                          copy.pairings = firstRoundPairings;
                          copy.club = selectedClub.id;
                          sendNewTournament(copy)
                            .then(() => {
                              resetTourneys();
                              setCreateTournament(false);
                              setPlayersSelected(false);
                              selectClub(chessClubDefaults)
                              resetNewTournament();
                            })
                        }
                      }
                    }
                  }}>
                  Start Tournament
                </button>
                <button className="buttonStyleReject" onClick={() => {
                  setCreateTournament(false)
                  resetNewTournament()
                  resetGuests()
                  selectClub(chessClubDefaults);
                  setPlayersSelected(false)
                }}>cancel</button>
              </div>
            </section>
          }
        </section>
      );
    }
  } else {
    return (
      <button id="createTournamentButton" className="setCustomFont" onClick={() => setCreateTournament(true)}>
        create new tournament
      </button>
    )
  }
}