import React, { createContext, useState, useEffect, PropsWithChildren } from "react";
import { getClubMatesAndGuests, getAllTimeSettings, getMyOpenTournaments, getMyChessClubs } from "../../../ServerManager";
import type { Player, Guest } from "../types";
// import { GetLoggedInUser } from "../../App/actions/get-current-user";

export const TournamentContext = createContext(null as any);

interface TournamentProviderProps extends PropsWithChildren<{}> { }

export function TournamentProvider({ children }: TournamentProviderProps) {
  // const localVillagerUser = GetLoggedInUser();

  const [selectedTournament, setSelectedTournament] = useState(0);
  const [selectedClub, setSelectedClub] = useState(0);
  const [myClubsPlayers, setMyClubsPlayers] = useState<Player[]>([]);
  const [myClubsGuests, setMyClubsGuests] = useState<Guest[]>([]);
  const [timeSettings, setTimeSettings] = useState([])
  const [myTournaments, setMyTournaments] = useState([])
  const [myChessClubs, setMyChessClubs] = useState([])
  const [pastTournaments, setPastTournaments] = useState([])

  useEffect(
    () => {
      getClubMatesAndGuests()
        .then(clubMateData => {
          const players: Player[] = [];
          const guests: Guest[] = [];
          clubMateData.forEach((mate: Player | Guest) => {
            if ('guest_id' in mate) {
              guests.push(mate);
            } else {
              players.push(mate);
            }
          })
          setMyClubsGuests(guests);
          setMyClubsPlayers(players);
        });
    }, []
  )
  useEffect(
    () => {
      Promise.all([getMyOpenTournaments(), getAllTimeSettings()])
        .then(([tournamentData, timeData]) => {
          setMyTournaments(tournamentData);
          setTimeSettings(timeData);
        })
    }, []
  )

  useEffect(
    () => {
      if (pastTournaments.length) {
        setMyTournaments(myTournaments.concat(pastTournaments))
      }
    }, [pastTournaments, myTournaments]
  );

  const resetTournaments = () => {
    getMyOpenTournaments()
      .then(data => setMyTournaments(data));
  }

  // const resetTournamentGames = () => {
  //   getTournamentGames(selectedTournament)
  //     .then(data => setTournamentGames(data))
  // }
  // const resetGuests = () => {
  //   getAllGuestPlayers()
  //     .then(data => setGuests(data))
  // }

  const checkIfUserIsAppCreator = () => {
    if (localVillagerUser.userId === 1) {
      return true
    }
    return false
  }
  return (
    <TournamentContext.Provider value={{
      // Your context value here
      selectedTournament, setSelectedTournament, selectedClub, setSelectedClub
    }}>
      {children}
    </TournamentContext.Provider>
  );
}