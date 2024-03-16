import { getClubMatesAndGuests, getMyOpenTournaments, getMyPastTournaments } from "../../ServerManager";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "../App/AppProvider";
import type { Guest } from "../../Types/Guest";
// import type { Match } from "tournament-pairings/dist/Match";
import { ActiveTournament } from "./components/ActiveTournament";
import { TournamentForm } from "./components/TournamentForm";
import { TournamentList } from "./components/TournamentList";
import "../../styles/Tournament.css";
import type { ChessClub } from "../../Types/ChessClub";
import type { PlayerRelated } from "../../Types/Player";
// import type { TimeSetting } from "../../Types/TimeSetting";
import type { Tournament, NewTournament } from "../../Types/Tournament";

export const TournamentController = () => {
  const { myChessClubs } = useContext(AppContext);
  const [clubMatesAndGuests, setClubMatesAndGuests] = useState<(PlayerRelated | Guest)[]>([]);
  // const [timeSettings, setTimeSettings] = useState<TimeSetting[]>([]);
  const [myOpenTournaments, setMyOpenTournaments] = useState<Tournament[]>([]);
  const [createNewTournament, setCreateNewTournament] = useState(false);
  const [selectedClub, setSelectedClub] = useState<ChessClub>({} as ChessClub);
  const [selectedTournament, setSelectedTournament] = useState<Tournament>({} as Tournament);
  const [pastTournaments, setPastTournaments] = useState<Tournament[]>([]);
  const [showPastTournaments, setShowPastTournaments] = useState(false);
  const [newTournament, updateNewTournament] = useState<NewTournament>({
    title: "",
    // creator: localVillagerUser.userId,
    competitors: [],
    guest_competitors: [],
    time_setting: 0,
    rounds: 1,
    in_person: true,
    pairings: [],
    club: 0
  })

  const resetTournaments = () => {
    getMyOpenTournaments()
      .then(data => setMyOpenTournaments(data));
  }
  useEffect(
    () => {
      Promise.all([getClubMatesAndGuests(), getMyOpenTournaments()])
        .then(([mateAndGuestData, openTournamentData]) => {
          setClubMatesAndGuests(mateAndGuestData);
          setMyOpenTournaments(openTournamentData);
        });
    }, []
  )
  useEffect(
    () => {
      console.log(newTournament)
    }, [newTournament]
  )
  if (selectedTournament.id) {
    return <>
      <ActiveTournament
        selectedTournament={selectedTournament}
        selectTournament={setSelectedTournament}
        selectClub={setSelectedClub}
        selectedClub={selectedClub}
        resetTourneys={resetTournaments}
        allClubMates={clubMatesAndGuests} />
    </>
  } else {
    return <>
      <main id="tournamentContainer">
        <TournamentForm
          clubs={myChessClubs}
          selectedClub={selectedClub}
          selectClub={setSelectedClub}
          // playersAndGuests={clubMatesAndGuests}
          resetTourneys={resetTournaments}
          createTournament={createNewTournament}
          setCreateTournament={setCreateNewTournament}
          updater={updateNewTournament}
          tournamentObj={newTournament} />
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
      </main>
    </>
  }

}