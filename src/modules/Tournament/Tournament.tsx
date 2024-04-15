import { getMyOpenTournaments, getMyPastTournaments } from "../../ServerManager";
import { useEffect, useState } from "react";
import { useAppContext } from "../App/AppProvider";
import { ActiveTournament } from "./components/ActiveTournament";
import { TournamentForm } from "./components/TournamentForm";
import { TournamentList } from "./components/TournamentList";
import "../../styles/Tournament.css";
import type { ChessClub } from "../../Types/ChessClub";
import { chessClubDefaults } from "../../Types/ChessClub";
import type { Tournament, NewTournament } from "../../Types/Tournament";
import { selectedTournamentDefaults, newTournamentDefaults } from "../../Types/Tournament";
import { useParams } from "react-router";

export const TournamentMain = () => {
  const { tournamentId } = useParams();
  const { myChessClubs, clubMatesAndGuests } = useAppContext();
  const [myOpenTournaments, setMyOpenTournaments] = useState<Tournament[]>([]);
  const [createNewTournament, setCreateNewTournament] = useState(false);
  const [selectedClub, setSelectedClub] = useState<ChessClub>({ ...chessClubDefaults });
  const [selectedTournament, setSelectedTournament] = useState<Tournament>({ ...selectedTournamentDefaults });
  const [pastTournaments, setPastTournaments] = useState<Tournament[]>([]);
  const [showPastTournaments, setShowPastTournaments] = useState(false);
  const [newTournament, updateNewTournament] = useState<NewTournament>({ ...newTournamentDefaults })

  const resetTournaments = () => {
    getMyOpenTournaments()
      .then(data => setMyOpenTournaments(data));
  }

  useEffect(
    () => {
      getMyOpenTournaments()
        .then(data => setMyOpenTournaments(data));
    }, []
  )

  useEffect(
    () => {
      if (tournamentId && myOpenTournaments) {
        const tournamentFromParam = myOpenTournaments.find(t => t.id === parseInt(tournamentId));
        if (tournamentFromParam) {
          setSelectedTournament(tournamentFromParam);
        }
      }
    }, [tournamentId, myOpenTournaments]
  )
  if (selectedTournament.id) {
    return <>
      <ActiveTournament
        key={selectedTournament.id}
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