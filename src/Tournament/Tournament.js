import { useState, useEffect, useContext } from "react"
import { RoundRobin, Swiss } from "tournament-pairings"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { alterGame, createNewGuest, getAllGuestPlayers, getAllPlayers, getAllTournaments, getMyChessClubs, getMyPastTournaments, sendNewTournament } from "../ServerManager"
import { ActiveTournament } from "./ActiveTournament"
import { PlayerSelection } from "./PlayerSelection"
import { Parameters } from "./Parameters"
import { TournamentForm } from "./TournamentForm"

export const Tournament = () => {
    const { localVillagerObj, tournaments, setTournaments, players, setPlayers, timeSettings, selectedTournament, setSelectedTournament, setGuests, guests, playersAndGuests, selectedClub, setSelectedClub, selectedClubObj, setSelectedClubObj, clubPlayers, clubGuests, resetGuests, myChessClubs, setMyChessClubs, resetTournaments } = useContext(TournamentContext)
    // const [potentialCompetitors, setPotentialCompetitors] = useState([])
    const [pastTournamentsToggle, setPastTournamentsToggle] = useState(false)
    const [pastTournaments, setPastTournaments] = useState([])
    const [search, setSearch] = useState("")
    const [createTournament, setCreateTournament] = useState(false)
    const [showGuests, setShowGuests] = useState(false)

    const [playersSelected, setPlayersSelected] = useState(false)

    const [newGuest, updateNewGuest] = useState({
        full_name: "",
        club: 0
    })
    const [newTournament, updateNewTournament] = useState({
        title: "",
        creator: localVillagerObj.userId,
        competitors: [],
        guest_competitors: [],
        timeSetting: 0,
        rounds: 1,
        in_person: true,
        pairings: [],
        club: 0
    })

    useEffect(
        () => {
            const guestCopy = { ...newGuest }
            guestCopy.club = selectedClub
            updateNewGuest(guestCopy)
        }, [selectedClubObj]
    )

    const resetNewTournament = () => {
        updateNewTournament({
            title: "",
            creator: localVillagerObj.userId,
            competitors: [],
            guest_competitors: [],
            timeSetting: 0,
            rounds: 1,
            in_person: true,
            pairings: [],
            club: 0
        })
    }


    const resetPlayers = () => {
        getAllPlayers()
            .then(data => setPlayers(data))
    }
    const handleChange = (evt) => {
        if (evt.target.checked) {
            const copy = { ...newTournament }
            copy.in_person = false
            updateNewTournament(copy)
        }
        else {
            const copy = { ...newTournament }
            copy.in_person = true
            updateNewTournament(copy)
        }
    }
    const pastTournamentSection = () => {
        if (pastTournamentsToggle === true) {
            return (
                <section id="pastTournamentList">
                    {
                        pastTournaments.map(t => {
                            if (t.complete === true) {
                                return (
                                    <li key={t.id}
                                        className="tournamentListItem"
                                        value={t.id}
                                        onClick={(e) => {
                                            setSelectedTournament(e.target.value)
                                        }}>
                                        {t.title}
                                    </li>
                                )
                            }
                        })
                    }
                </section>
            )
        }
    }
    if (selectedTournament) {
        return <>
            <ActiveTournament
                tournamentId={selectedTournament}
            />
        </>
    }
    else {
        return <>
            <main id="tournamentContainer">
                {/* {newTournamentForm()} */}
                <TournamentForm
                    createTournament={createTournament}
                    setCreateTournament={setCreateTournament}
                    newTournament={newTournament}
                    updateNewTournament={updateNewTournament}
                    playersSelected={playersSelected}
                    setPlayersSelected={setPlayersSelected}
                    search={search}
                    setSearch={setSearch}
                    newGuest={newGuest}
                    updateNewGuest={updateNewGuest}
                    resetNewTournament={resetNewTournament}
                    resetPlayers={resetPlayers}
                    showGuests={showGuests}
                    setShowGuests={setShowGuests}

                />
                <article key="activeTournaments" id="activeTournamentsSection">
                    <h3 id="activeTournamentsHeader">my active tournaments</h3>
                    <section id="activeTournamentsList" className="setCustomFont">
                        {
                            tournaments?.map(t => {
                                const dateFormat = new Date(t.date).toLocaleDateString('en-us')
                                if (t.complete === false) {
                                    return (
                                        <li key={t.id}
                                            className="tournamentListItem"
                                            value={t.id}
                                            onClick={(e) => {
                                                setSelectedTournament(e.target.value)
                                            }}>
                                            <div>
                                                {t.title}
                                            </div>
                                            <div style={{ fontSize: "small" }}>
                                                {dateFormat}
                                            </div>
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
            </main >
        </>
    }
}