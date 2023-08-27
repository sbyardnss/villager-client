import { useState, useEffect, useContext } from "react"
import { RoundRobin, Swiss } from "tournament-pairings"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { alterGame, createNewGuest, getAllGuestPlayers, getAllPlayers, getAllTournaments, getMyChessClubs, sendNewTournament } from "../ServerManager"
import { ActiveTournament } from "./ActiveTournament"
import { PlayerSelection } from "./PlayerSelection"
import { Parameters } from "./Parameters"
import { TournamentForm } from "./TournamentForm"

export const Tournament = () => {
    const { localVillagerObj, tournaments, setTournaments, players, setPlayers, timeSettings, selectedTournament, setSelectedTournament, setGuests, guests, playersAndGuests, selectedClub, setSelectedClub, selectedClubObj, setSelectedClubObj, clubPlayers, clubGuests, resetGuests, myChessClubs, setMyChessClubs, resetTournaments } = useContext(TournamentContext)
    // const [potentialCompetitors, setPotentialCompetitors] = useState([])
    const [pastTournaments, setPastTournaments] = useState(false)
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

    //search player useEffect
    // useEffect(
    //     () => {
    //         if (search !== "") {
    //             // const filteredUsers = playersAndGuests?.filter(pc => {
    //             const filteredUsers = clubPlayers.concat(clubGuests).filter(pc => {
    //                 return pc.full_name.toLowerCase().includes(search.toLowerCase()) && !newTournament.competitors?.find(member => member.id === pc.id) && !newTournament.guest_competitors?.find(member => member.id === pc.id)
    //             })
    //             setPotentialCompetitors(filteredUsers)
    //         }
    //         else {
    //             const unselectedPlayers = clubPlayers.filter(p => !newTournament.competitors.find(c => c.id === p.id))
    //             let unselectedGuests = []
    //             if (showGuests) {
    //                 unselectedGuests = clubGuests.filter(g => !newTournament.guest_competitors.find(gc => gc.id === g.id))
    //             }
    //             setPotentialCompetitors(unselectedPlayers.concat(unselectedGuests))
    //         }
    //     }, [search, showGuests, playersAndGuests, newTournament, createTournament]
    // )
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
    // const resetTournaments = () => {
    //     getAllTournaments()
    //         .then(data => setTournaments(data))
    // }

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

    // const newTournamentForm = () => {
    //     if (createTournament === true) {
    //         if (!selectedClub) {
    //             return (
    //                 <section id="newTournamentForm">
    //                     <section id="clubSelectionSection">
    //                         <div id="tournamentHeader">
    //                             <div className="setCustomFont">Select Club</div>
    //                             <button className="buttonStyleReject" onClick={() => setCreateTournament(false)}>cancel</button>
    //                         </div>
    //                         <div id="clubSelectionList" className="setCustomFont">
    //                             {
    //                                 myChessClubs.map(club => {
    //                                     if (club.id === selectedClub) {
    //                                         return (
    //                                             <div
    //                                                 key={club.id}
    //                                                 className="selectedClubSelectionTabItem"
    //                                                 onClick={() => setSelectedClub(club.id)}
    //                                             >{club.name}</div>
    //                                         )
    //                                     }
    //                                     else {
    //                                         return (
    //                                             <div
    //                                                 key={club.id}
    //                                                 className="clubSelectionTabItem"
    //                                                 onClick={() => setSelectedClub(club.id)}
    //                                             >{club.name}</div>
    //                                         )
    //                                     }
    //                                 })
    //                             }
    //                         </div>
    //                     </section>
    //                 </section>
    //             )
    //         }
    //         else {
    //             return (
    //                 <section id="newTournamentForm">
    //                     <div id="newTournamentClubNameHeader" className="setCustomFont">Club: {selectedClubObj?.name}</div>
    //                     {!playersSelected ?
    //                         <PlayerSelection
    //                             potentialCompetitors={potentialCompetitors}
    //                             setPotentialCompetitors={setPotentialCompetitors}
    //                             search={search}
    //                             setSearch={setSearch}
    //                             createTournament={createTournament}
    //                             setCreateTournament={setCreateTournament}
    //                             playersAndGuests={playersAndGuests}
    //                             selectedClub={selectedClub}
    //                             tournamentObj={newTournament}
    //                             updateTournamentObj={updateNewTournament}
    //                             setPlayersSelected={setPlayersSelected}
    //                             //temporary. add create guest to the playerselection component
    //                             newGuest={newGuest}
    //                             updateNewGuest={updateNewGuest}
    //                         />
    //                         : ""}
    //                     <section id="tournamentParameters">
    //                         {playersSelected ?
    //                             <Parameters
    //                                 editOrNew={'new'}
    //                                 tournamentObj={newTournament}
    //                                 updateTournamentObj={updateNewTournament}
    //                                 handleChange={handleChange}
    //                             />
    //                             : ""}
    //                         {playersSelected ?
    //                             <div id="tournamentSubmit">
    //                                 <button className="buttonStyleApprove" onClick={() => setPlayersSelected(false)}>choose players</button>
    //                                 <button
    //                                     className="buttonStyleApprove"
    //                                     onClick={() => {
    //                                         if (newTournament.guest_competitors.length > 0 && newTournament.in_person === false) {
    //                                             window.alert('No guest competitors on digtal tournament')
    //                                         }
    //                                         else {
    //                                             if (newTournament.competitors && newTournament.timeSetting && newTournament.title) {
    //                                                 if (window.confirm("Everybody ready?")) {
    //                                                     const copy = { ...newTournament }
    //                                                     const allCompetitors = newTournament.competitors.concat(newTournament.guest_competitors)
    //                                                     const competitorPairing = []
    //                                                     const guestCompetitorPairing = []
    //                                                     const allCompetitorsPairing = allCompetitors.map(ac => {
    //                                                         if (ac.guest_id) {
    //                                                             guestCompetitorPairing.push(ac.id)
    //                                                             return { id: ac.guest_id }
    //                                                         }
    //                                                         else {
    //                                                             competitorPairing.push(ac.id)
    //                                                             return { id: ac.id }
    //                                                         }
    //                                                     })
    //                                                     const firstRoundPairings = Swiss(allCompetitorsPairing, 1)
    //                                                     copy.pairings = firstRoundPairings
    //                                                     copy.competitors = competitorPairing
    //                                                     copy.guest_competitors = guestCompetitorPairing
    //                                                     copy.club = selectedClub
    //                                                     sendNewTournament(copy)
    //                                                         .then(() => {
    //                                                             resetTournaments()
    //                                                             setCreateTournament(false)
    //                                                             setShowGuests(false)
    //                                                         })
    //                                                 }
    //                                             }
    //                                         }
    //                                     }}>
    //                                     Start Tournament
    //                                 </button>
    //                                 <button className="buttonStyleReject" onClick={() => {
    //                                     setCreateTournament(false)
    //                                     resetNewTournament()
    //                                     resetPlayers()
    //                                     resetGuests()
    //                                     setSelectedClub(0)
    //                                     setSelectedClubObj({})
    //                                     setShowGuests(false)
    //                                 }}>cancel</button>
    //                             </div>
    //                             : ""}
    //                     </section>
    //                 </section>
    //             )
    //         }
    //     }
    //     else {
    //         return (
    //             <button id="createTournamentButton" className="setCustomFont" onClick={() => setCreateTournament(true)}>create new tournament</button>
    //         )
    //     }
    // }
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
                //createTournament
                createTournament ={createTournament}
                setCreateTournament={setCreateTournament}
                newTournament={newTournament}
                updateNewTournament={updateNewTournament}
                // handleChange={handleChange}
                // potentialCompetitors={potentialCompetitors}
                // setPotentialCompetitors={setPotentialCompetitors}
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
    //setCreatetournament
    //newTournament
    //updateNewTournament
    //handleChange
    //potential Competitors, set
    //playersSelected, set
    //search, set
    //newguest, update
    //resetNewTournament()
    //resetPlayers()
    //setShowGuests(false)
                />
                <article key="activeTournaments" id="activeTournamentsSection">
                    <h3 id="activeTournamentsHeader">my active tournaments</h3>
                    <section id="activeTournamentsList" className="setCustomFont">
                        {
                            tournaments?.map(t => {
                                if (t.complete === false) {
                                    // if (t.competitors.find(c => c.id === localVillagerObj.userId) || t.creator.id === localVillagerObj.userId) {
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
                                    // }
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