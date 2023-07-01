import { useState, useEffect, useContext, useRef } from "react"
import { RoundRobin } from "tournament-pairings"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { alterGame, getAllGames, getAllPlayers, getAllTournaments, sendNewGame, sendNewTournament, sendTournamentRoundOutcomes, sendUpdatedGames, updateTournament } from "../ServerManager"
import { ActiveTournament } from "./ActiveTournament"

export const Tournament = () => {
    const { localVillagerObj, tournamentGames, tournaments, setTournaments, players, timeSettings, setGames, selectedTournament, setSelectedTournament, resetTournamentGames, guests } = useContext(TournamentContext)
    const [potentialCompetitors, setPotentialCompetitors] = useState([])
    const [pastTournaments, setPastTournaments] = useState(false)
    const [search, setSearch] = useState("")
    const [createTournament, setCreateTournament] = useState(false)
    const [playersAndGuests, setPlayersAndGuests] = useState([])
    const [newTournament, updateNewTournament] = useState({
        title: "",
        creator: localVillagerObj.userId,
        competitors: [],
        timeSetting: 0,
        rounds: 1,
        in_person: true,
        pairings: []
    })

    // useEffect(
    //     () => {
    //         const unselectedPlayers = players.filter(p => {
    //             return !newTournament.competitors.find(c => c === p.id)
    //         })
    //         setPotentialCompetitors(unselectedPlayers)
    //     }, [players, newTournament]
    // )

    useEffect(
        () => {
            const guestsCopy = [...guests]
            guestsCopy.map(g => g.id = g.guest_id)
            const allPlayersAndGuests = players.concat(guestsCopy)
            setPlayersAndGuests(allPlayersAndGuests)
        },[players, guests]
    )
    //search player useEffect
    useEffect(
        () => {
            if (search !== "") {
                const filteredUsers = playersAndGuests.filter(pc => {
                    return pc.full_name.toLowerCase().includes(search.toLowerCase())
                })
                setPotentialCompetitors(filteredUsers)
            }
            else {
                const unselectedPlayers = playersAndGuests.filter(p => {
                    return !newTournament.competitors.find(c => c === p.id)
                })
                setPotentialCompetitors(unselectedPlayers)
            }
        }, [search, playersAndGuests, newTournament, createTournament]
    )
    //getter/setter for tournaments
    const resetTournaments = () => {
        getAllTournaments()
            .then(data => setTournaments(data))
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
        if (pastTournaments === true) {
            return (
                <section id="pastTournamentList">
                    {
                        tournaments?.map(t => {
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
    const newTournamentForm = () => {
        if (createTournament === true) {
            return (
                <section id="newTournamentForm">
                    <div id="tournamentPlayerSelectionSection">
                        <div id="competitorSelectionSplit">
                            <div id="potentialLabel" className="setColor setCustomFont">Potential:</div>
                            <div id="tournamentPotentialCompetitorSelection">
                                {
                                    potentialCompetitors.map((p, index) => {
                                        return (
                                            <li key={p.id + '-- potentialCompetitor'}
                                                className="newTournamentPlayerListItem"
                                                onClick={() => {
                                                    const copy = [...potentialCompetitors]
                                                    copy.splice(index, 1)
                                                    setPotentialCompetitors(copy)
                                                    const tournamentCopy = { ...newTournament }
                                                    tournamentCopy.competitors.push(p.id)
                                                    updateNewTournament(tournamentCopy)
                                                }}>
                                                {p.full_name}
                                            </li>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div id="competitorSelectionSplit">
                            <div id="selectedLabel" className="setColor setCustomFont">Selected:</div>
                            <div id="tournamentSelectedCompetitors">
                                {
                                    newTournament.competitors.map((competitor, index) => {
                                        const player = playersAndGuests.find(p => p.id === competitor)
                                        return (
                                            <li key={player.id + '-- competitor'}
                                                className="newTournamentPlayerListItem"
                                                onClick={() => {
                                                    const tournamentCopy = { ...newTournament }
                                                    tournamentCopy.competitors.splice(index, 1)
                                                    updateNewTournament(tournamentCopy)
                                                    const copy = [...potentialCompetitors]
                                                    copy.push(competitor)
                                                    setPotentialCompetitors(copy)
                                                }}>
                                                {player.full_name}
                                            </li>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div id="playerSearch" className="setCustomFont">
                        <input
                            id="playerSearchInput"
                            className="text-input"
                            type="text"
                            placeholder="search for player"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="buttonStyleReject"
                            onClick={() => setSearch("")}
                        >reset</button>
                    </div>
                    <section id="tournamentParameters">
                        <div id="tournamentParameterControls">
                            {/* <label className="setColor" htmlFor="title">Tournament name: </label> */}
                            <input
                                type="text"
                                name="title"
                                className="text-input"
                                placeholder="tournament title"
                                value={newTournament.title}
                                onChange={(e) => {
                                    const copy = { ...newTournament }
                                    copy.title = e.target.value
                                    updateNewTournament(copy)
                                }}
                            />
                            <div id="tournamentTimeSettingSelection">
                                <select
                                    className="tournamentFormDropdownSelection"
                                    onChange={(e) => {
                                        const copy = { ...newTournament }
                                        copy.timeSetting = parseInt(e.target.value)//WHY DO I HAVE TO PARSEINT HERE?
                                        updateNewTournament(copy)
                                    }}>
                                    <option key={0} className="timeSelectOption" value={0}>time setting</option>
                                    {
                                        timeSettings.map(ts => {
                                            return (
                                                <option key={ts.id} value={ts.id} className="newTournamentTimeSettingListItem">
                                                    {ts.time_amount} minutes -- {ts.increment} second increment
                                                </option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                            <div>
                                <input id="digitalTournamentCheckbox" className="setColor" type="checkbox" onChange={handleChange} />
                                <label id="digitalTournamentLabel" className="setColor">digital tournament</label>
                            </div>
                        </div>
                        <div id="tournamentSubmit">
                            <button
                                className="buttonStyleApprove"
                                onClick={() => {
                                    if (newTournament.competitors && newTournament.timeSetting && newTournament.title) {
                                        if (window.confirm("Everybody ready?")) {
                                            const copy = { ...newTournament }
                                            copy.pairings = RoundRobin(newTournament.competitors)
                                            sendNewTournament(copy)
                                                .then(() => {
                                                    resetTournaments()
                                                })
                                        }
                                    }
                                }}>
                                Start Tournament
                            </button>
                            <button onClick={() => setCreateTournament(false)}>cancel</button>
                        </div>
                    </section>
                </section>
            )
        }
        else {
            return (
                <button id="createTournamentButton" className="setCustomFont" onClick={() => setCreateTournament(true)}>create new tournament</button>
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
                {newTournamentForm()}
                <article key="activeTournaments" id="activeTournamentsSection">
                    <h3 id="activeTournamentsHeader">active tournaments</h3>
                    <section id="activeTournamentsList" className="setCustomFont">
                        {
                            tournaments?.map(t => {
                                if (t.complete === false) {
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
                    <button className="pastTournamentsBtn setCustomFont" onClick={() => setPastTournaments(!pastTournaments)}>toggle past tournaments</button>
                    {pastTournamentSection()}
                </article>
            </main>
        </>
    }
}