import { TournamentForm } from "../components/TournamentForm";
import { ActiveTournament } from "../components/ActiveTournament";
import { useState } from "react";


export function TournamentController() {
    // const [selectedTournament, setSelectedTournament] = useState(0);
    const [createNewTournament, setCreateNewTournament] = useState(false);
    // const [selectedClub, setSelectedClub] = useState(0);

    if (selectedTournament) {
        return <>
            <ActiveTournament />
        </>
    } else {

        return <>
            <main id="tournamentContainer">
                {createNewTournament ?
                    <TournamentForm
                    // createTournament={createTournament}
                    // setCreateTournament={setCreateTournament}
                    // newTournament={newTournament}
                    // updateNewTournament={updateNewTournament}
                    // playersSelected={playersSelected}
                    // setPlayersSelected={setPlayersSelected}
                    // search={search}
                    // setSearch={setSearch}
                    // newGuest={newGuest}
                    // updateNewGuest={updateNewGuest}
                    // resetNewTournament={resetNewTournament}
                    // resetPlayers={resetPlayers}
                    // showGuests={showGuests}
                    // setShowGuests={setShowGuests}
                    />
                    : ""}
                {/* {
                    !createTournament ?
                        <article key="activeTournaments" id="activeTournamentsSection">
                            <h3 id="activeTournamentsHeader">my active tournaments</h3>
                            <section id="activeTournamentsList" className="setCustomFont">
                                {
                                    !tournaments.length ?
                                        <div>...loading</div>
                                        :
                                        tournaments?.map(t => {
                                            if (t.complete === false) {
                                                const dateFormat = new Date(t.date).toLocaleDateString('en-us')
                                                return (
                                                    <li key={t.id}
                                                        className="tournamentListItem"
                                                        value={t.id}
                                                        onClick={(e) => {
                                                            setSelectedTournament(e.target.value)
                                                        }}>
                                                        {t.title}
                                                        <span style={{ fontSize: "small" }}>{dateFormat}</span>
                                                    </li>
                                                )
                                            }
                                        })
                                }
                            </section>
                            <button className="pastTournamentsBtn setCustomFont" onClick={() => {
                                setPastTournamentsToggle(!pastTournamentsToggle)
                                getMyPastTournaments()
                                    .then(data => setPastTournaments(data))
                            }}>toggle past tournaments</button>
                            {pastTournamentSection()}
                        </article>
                        : ""
                } */}
            </main >
        </>
    }
}