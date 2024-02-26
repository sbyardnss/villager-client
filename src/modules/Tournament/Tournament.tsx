import { getClubMatesAndGuests, getAllTimeSettings, getMyOpenTournaments, getMyPastTournaments } from "../../ServerManager";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "../App/AppProvider";
import type { PlayerOnTournament, Guest, NewTournament, Tournament, TournamentPairing, TimeSetting } from "./Types";
import { ActiveTournament } from "./components/ActiveTournament";
import { TournamentForm } from "./components/TournamentForm";
import { TournamentList } from "./components/TournamentList";
import "../../styles/Tournament.css";

export const TournamentController = () => {
  const { localVillagerUser, myChessClubs } = useContext(AppContext);
  const [clubMatesAndGuests, setClubMatesAndGuests] = useState<(PlayerOnTournament | Guest)[]>([]);
  const [timeSettings, setTimeSettings] = useState<TimeSetting[]>([]);
  const [myOpenTournaments, setMyOpenTournaments] = useState<Tournament[]>([]);
  const [createNewTournament, setCreateNewTournament] = useState(false);
  const [selectedClub, setSelectedClub] = useState(0);
  const [selectedTournament, setSelectedTournament] = useState(0);
  const [pastTournaments, setPastTournaments] = useState<Tournament[]>([]);
  const [showPastTournaments, setShowPastTournaments] = useState(false);
  const [newGuest, updateNewGuest] = useState({
    full_name: "",
    club: 0,
  });
  const [newTournament, updateNewTournament] = useState<NewTournament>({
    title: "",
    creator: localVillagerUser.userId,
    competitors: [],
    guest_competitors: [],
    timeSetting: 0,
    rounds: 1,
    in_person: true,
    pairings: [],
    club: 0
  })

  const resetTournaments = () => {
    getMyOpenTournaments()
      .then(data => setMyOpenTournaments(data));
  }
  const resetNewTournament = () => {
    updateNewTournament({
      title: "",
      creator: localVillagerUser.userId,
      competitors: [],
      guest_competitors: [],
      timeSetting: 0,
      rounds: 1,
      in_person: true,
      pairings: [],
      club: 0
    })
  }

  const handleUpdateTournament = () => {

  }
  useEffect(
    () => {
      Promise.all([getClubMatesAndGuests(), getAllTimeSettings(), getMyOpenTournaments()])
        .then(([mateAndGuestData, timeSettingData, openTournamentData]) => {
          setClubMatesAndGuests(mateAndGuestData);
          setTimeSettings(timeSettingData);
          setMyOpenTournaments(openTournamentData);
        });
    }, []
  )
  if (selectedTournament) {
    return <>
      <ActiveTournament />
    </>
  } else {
    return <>
      <main id="tournamentContainer">
        {createNewTournament
          ?
          <TournamentForm 
            clubs={myChessClubs}
            selectedClub={selectedClub}
            selectClub={setSelectedClub}
            playersAndGuests={clubMatesAndGuests}
            resetTourneys={resetTournaments}
            setCreateTournament={setCreateNewTournament}
            updater={updateNewTournament} />
          :
          <article key="activeTournaments" id="activeTournamentsSection">
            <h3 id="activeTournamentsHeader">my active tournaments</h3>
            <TournamentList
              tournaments={myOpenTournaments}
              currentOrPast={'current'}
              selectTournament={setSelectedTournament} />
            <button className="pastTournamentsBtn setCustomFont" onClick={() => {
              setShowPastTournaments(!showPastTournaments);
              getMyPastTournaments()
                .then(data => setPastTournaments(data))
            }}>toggle past tournaments</button>
            {
              showPastTournaments 
              ?
              <TournamentList
                tournaments={pastTournaments}
                currentOrPast={'past'}
                selectTournament={setSelectedTournament} />
              : ""
            }
          </article>
        }
      </main>
    </>
  }

}