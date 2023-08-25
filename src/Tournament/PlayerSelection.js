import { useContext } from "react"
import { createNewGuest } from "../ServerManager"
import { TournamentContext } from "./TournamentProvider"


export const PlayerSelection = ({potentialCompetitors, setPotentialCompetitors, search, setSearch, showGuests, setShowGuests, playersAndGuests, setPlayersSelected, newGuest, updateNewGuest, tournamentObj, updateTournamentObj, selectedClub}) => {

    const {resetGuests} = useContext(TournamentContext)
    //CONTEXT
    //resetGuests


    //TOURNAMENT SETUP
    //potentialCompetitors and set
    //search, setSearch
    //playersAndGuests
    //newGuest, updateNewGuest
    
    //differing
    //newTournament
    //updateNewTournament


    //EDITPLAYERSMODAL
    //potentialCompetitors and set
    //search, setSearch
    //playersAndGuests
    //newGuest, updateNewGuest
    
    //differing
    //tournamentObj
    //updatedTournamentObj
    


    return (
        <section>
                <h3 className="setTournamentFontSize setColor">select players</h3>
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
                                            const tournamentCopy = { ...tournamentObj }
                                            if (p.guest_id) {
                                                tournamentCopy.guest_competitors.push(p)
                                            }
                                            else {
                                                tournamentCopy.competitors.push(p)
                                            }
                                            updateTournamentObj(tournamentCopy)
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
                            tournamentObj.competitors.map((competitor, index) => {
                                const player = playersAndGuests.find(p => p.id === competitor.id)
                                return (
                                    <li key={competitor.id + '-- competitor'}
                                        className="newTournamentPlayerListItem"
                                        onClick={() => {
                                            const tournamentCopy = { ...tournamentObj }
                                            tournamentCopy.competitors.splice(index, 1)
                                            updateTournamentObj(tournamentCopy)
                                            const copy = [...potentialCompetitors]
                                            copy.push(competitor)
                                            setPotentialCompetitors(copy)
                                        }}>
                                        {player?.full_name}
                                    </li>
                                )
                            })
                        }
                        {
                            tournamentObj.guest_competitors.map((competitor, index) => {
                                const player = playersAndGuests.find(p => p.guest_id === competitor.guest_id)
                                return (
                                    <li key={competitor.guest_id + '-- competitor'}
                                        className="newTournamentPlayerListItem"
                                        onClick={() => {
                                            const tournamentCopy = { ...tournamentObj }
                                            tournamentCopy.guest_competitors.splice(index, 1)
                                            updateTournamentObj(tournamentCopy)
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
                    value={newGuest.full_name}
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
                            updateNewGuest({ full_name: "", club: selectedClub })
                        }
                    }}
                >Create Guest</button>
            </div>
            <button className="buttonStyleApprove" onClick={() => setShowGuests(!showGuests)}>toggle guests</button>
            <button className="buttonStyleReject" onClick={() => setPlayersSelected(true)}>confirm</button>
        </section>
    )
}