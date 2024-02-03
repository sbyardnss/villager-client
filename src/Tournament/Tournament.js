import { useState, useEffect, useContext } from "react"
import { RoundRobin, Swiss } from "tournament-pairings"
import { TournamentContext } from "./components/TournamentProvider"
import "./Tournament.css"
import { alterGame, createNewGuest, getAllGuestPlayers, getAllPlayers, getAllTournaments, getMyChessClubs, getMyPastTournaments, sendNewTournament } from "../ServerManager"
import { ActiveTournament } from "./components/ActiveTournament"
import { PlayerSelection } from "./components/PlayerSelection"
import { Parameters } from "./components/Parameters"
import { TournamentForm } from "./components/TournamentForm"

export const Tournament = () => {
    const { localVillagerObj, tournaments, setPlayers, selectedTournament, setSelectedTournament, selectedClub, selectedClubObj, pastTournaments, setPastTournaments } = useContext(TournamentContext)
    const [pastTournamentsToggle, setPastTournamentsToggle] = useState(false)
    // const [pastTournaments, setPastTournaments] = useState([])
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
        }, [selectedClubObj, newGuest, selectedClub]
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
            if (pastTournaments.length) {
                return (
                    <section id="pastTournamentList">
                        {
                            pastTournaments.map(t => {
                                if (t.complete === true) {
                                    const dateFormat = new Date(t.date).toLocaleDateString('en-us')
                                    return (
                                        <li key={t.id}
                                            className="tournamentListItem"
                                            value={t.id}
                                            onClick={(e) => {
                                                setSelectedTournament(e.target.value)
                                            }}>
                                            {t.title}
                                            <span style={{ fontSize: "small", marginLeft: "auto" }}>{dateFormat}</span>
                                        </li>
                                    )
                                }
                            })
                        }
                    </section>
                )
            }
            else {
                return (
                    <div className="setCustomFont">...loading</div>
                )
            }
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
                {
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
                                                        data-cy={`tournament--${t.id}`}
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
                }
            </main >
        </>
    }
}