import { useState, useEffect, useContext } from "react"
import { RoundRobin, Swiss } from "tournament-pairings"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { alterGame, createNewGuest, getAllGuestPlayers, getAllPlayers, getAllTournaments, getMyChessClubs, sendNewTournament } from "../ServerManager"
import { ActiveTournament } from "./ActiveTournament"

export const Tournament = () => {
    const { localVillagerObj, tournaments, setTournaments, players, setPlayers, timeSettings, selectedTournament, setSelectedTournament, setGuests, guests, playersAndGuests, selectedClub, setSelectedClub, selectedClubObj, setSelectedClubObj, clubPlayers, clubGuests, resetGuests, myChessClubs, setMyChessClubs } = useContext(TournamentContext)
    const [potentialCompetitors, setPotentialCompetitors] = useState([])
    const [pastTournaments, setPastTournaments] = useState(false)
    const [search, setSearch] = useState("")
    const [createTournament, setCreateTournament] = useState(false)
    const [showGuests, setShowGuests] = useState(false)
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

    //search player useEffect
    useEffect(
        () => {
            if (search !== "") {
                const filteredUsers = playersAndGuests.filter(pc => {
                    return pc.full_name.toLowerCase().includes(search.toLowerCase()) && !newTournament.competitors?.find(member => member.id === pc.id) && !newTournament.guest_competitors?.find(member => member.id === pc.id)
                })
                setPotentialCompetitors(filteredUsers)
            }
            else {
                const unselectedPlayers = clubPlayers.filter(p => !newTournament.competitors.find(c => c.id === p.id))
                let unselectedGuests = []
                if (showGuests) {
                    unselectedGuests = clubGuests.filter(g => !newTournament.guest_competitors.find(gc => gc.id === g.id))
                }
                setPotentialCompetitors(unselectedPlayers.concat(unselectedGuests))
            }
        }, [search, showGuests, playersAndGuests, newTournament, createTournament]
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
    //getter/setter for tournaments
    const resetTournaments = () => {
        getAllTournaments()
            .then(data => setTournaments(data))
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
            if (!selectedClub) {
                return (
                    <section id="newTournamentForm">
                        <section id="clubSelectionSection">
                            <div className="setCustomFont">Select Club</div>
                            <div id="clubSelectionList" className="setCustomFont">
                                {
                                    myChessClubs.map(club => {
                                        if (club.id === selectedClub) {
                                            return (
                                                <div
                                                    key={club.id}
                                                    className="selectedClubSelectionTabItem"
                                                    onClick={() => setSelectedClub(club.id)}
                                                >{club.name}</div>
                                            )
                                        }
                                        else {
                                            return (
                                                <div
                                                    key={club.id}
                                                    className="clubSelectionTabItem"
                                                    onClick={() => setSelectedClub(club.id)}
                                                >{club.name}</div>
                                            )
                                        }
                                    })
                                }
                            </div>
                        </section>
                    </section>
                )
            }
            else {
                return (
                    <section id="newTournamentForm">
                        <div id="newTournamentClubNameHeader" className="setCustomFont">Club: {selectedClubObj?.name}</div>
                        <div id="tournamentPlayerSelectionSection">
                            <div id="competitorSelectionSplit">
                                <div id="potentialLabel" className="setColor setCustomFont">Potential:</div>
                                <div id="tournamentPotentialCompetitorSelection">
                                    {
                                        potentialCompetitors.map((p, index) => {
                                            return (
                                                <li key={p.guest_id ? p.guest_id + '-- potentialCompetitor' : p.id + '-- potentialCompetitor'}
                                                    className="newTournamentPlayerListItem"
                                                    onClick={() => {
                                                        const copy = [...potentialCompetitors]
                                                        copy.splice(index, 1)
                                                        setPotentialCompetitors(copy)
                                                        const tournamentCopy = { ...newTournament }
                                                        if (p.guest_id) {
                                                            tournamentCopy.guest_competitors.push(p)
                                                        }
                                                        else {
                                                            tournamentCopy.competitors.push(p)
                                                        }
                                                        updateNewTournament(tournamentCopy)
                                                        setSearch("")
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
                                            const player = playersAndGuests.find(p => p.id === competitor.id)
                                            return (
                                                <li key={competitor.id + '-- competitor'}
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
                                    {
                                        newTournament.guest_competitors.map((competitor, index) => {
                                            const player = playersAndGuests.find(p => p.guest_id === competitor.guest_id)
                                            return (
                                                <li key={competitor.guest_id + '-- competitor'}
                                                    className="newTournamentPlayerListItem"
                                                    onClick={() => {
                                                        const tournamentCopy = { ...newTournament }
                                                        tournamentCopy.guest_competitors.splice(index, 1)
                                                        updateNewTournament(tournamentCopy)
                                                        const copy = [...potentialCompetitors]
                                                        copy.push(competitor)
                                                        setPotentialCompetitors(copy)
                                                    }}>
                                                    {player?.full_name}
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
                                placeholder="search for player or guest"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                id="resetPlayerSearchBtn"
                                className="buttonStyleReject"
                                onClick={() => setSearch("")}
                            >reset</button>
                        </div>
                        <div id="createGuestDiv">
                            <input
                                className="text-input"
                                id="newGuestInput"
                                type="text"
                                placeholder="new guest name"
                                onChange={(e) => {
                                    const copy = { ...newGuest }
                                    copy.full_name = e.target.value
                                    updateNewGuest(copy)
                                }}
                            />
                            <button
                                id="newGuestSubmitBtn"
                                className="setCustomFont"
                                onClick={() => {
                                    if (newGuest.full_name !== "" && selectedClub) {
                                        createNewGuest(newGuest)
                                            .then(() => resetGuests())
                                    }
                                }}
                            >Create Guest</button>
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
                                <button className="buttonStyleApprove" onClick={() => setShowGuests(!showGuests)}>toggle guests</button>
                                <button
                                    className="buttonStyleApprove"
                                    onClick={() => {
                                        if (newTournament.guest_competitors.length > 0 && newTournament.in_person === false) {
                                            window.alert('No guest competitors on digtal tournament')
                                        }
                                        else {
                                            if (newTournament.competitors && newTournament.timeSetting && newTournament.title) {
                                                if (window.confirm("Everybody ready?")) {
                                                    const copy = { ...newTournament }
                                                    const allCompetitors = newTournament.competitors.concat(newTournament.guest_competitors)
                                                    const competitorPairing = []
                                                    const guestCompetitorPairing = []
                                                    const allCompetitorsPairing = allCompetitors.map(ac => {
                                                        if (ac.guest_id) {
                                                            guestCompetitorPairing.push(ac.id)
                                                            return { id: ac.guest_id }
                                                        }
                                                        else {
                                                            competitorPairing.push(ac.id)
                                                            return { id: ac.id }
                                                        }
                                                    })
                                                    const firstRoundPairings = Swiss(allCompetitorsPairing, 1)
                                                    copy.pairings = firstRoundPairings
                                                    copy.competitors = competitorPairing
                                                    copy.guest_competitors = guestCompetitorPairing
                                                    copy.club = selectedClub
                                                    sendNewTournament(copy)
                                                        .then(() => {
                                                            resetTournaments()
                                                            setCreateTournament(false)
                                                            setShowGuests(false)
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
                                    resetPlayers()
                                    resetGuests()
                                    setSelectedClub(0)
                                    setSelectedClubObj({})
                                    setShowGuests(false)
                                }}>cancel</button>
                            </div>
                        </section>
                    </section>
                )
            }
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
                    <h3 id="activeTournamentsHeader">my active tournaments</h3>
                    <section id="activeTournamentsList" className="setCustomFont">
                        {
                            tournaments?.map(t => {
                                if (t.complete === false) {
                                    if (t.competitors.includes(localVillagerObj.userId) || t.creator.id === localVillagerObj.userId) {
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