import { useContext } from "react"
import { Parameters } from "./Parameters"
import { PlayerSelection } from "./PlayerSelection"
import { TournamentContext } from "./TournamentProvider"
import { Swiss } from "tournament-pairings"
import { sendNewTournament } from "../ServerManager"


export const TournamentForm = ({ createTournament, setCreateTournament, newTournament, updateNewTournament, handleChange, potentialCompetitors, setPotentialCompetitors, playersSelected, setPlayersSelected, search, setSearch, newGuest, updateNewGuest, resetNewTournament, resetPlayers }) => {
    const { myChessClubs, selectedClub, setSelectedClub, selectedClubObj, setSelectedClubObj, playersAndGuests, resetGuests, resetTournaments } = useContext(TournamentContext)


    //PROPS
    //createTournament
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

    if (createTournament === true) {
        if (!selectedClub) {
            return (
                <section id="newTournamentForm">
                    <section id="clubSelectionSection">
                        <div id="tournamentHeader">
                            <div className="setCustomFont">Select Club</div>
                            <button className="buttonStyleReject" onClick={() => setCreateTournament(false)}>cancel</button>
                        </div>
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
                    {!playersSelected ?
                        <PlayerSelection
                            potentialCompetitors={potentialCompetitors}
                            setPotentialCompetitors={setPotentialCompetitors}
                            search={search}
                            setSearch={setSearch}
                            createTournament={createTournament}
                            setCreateTournament={setCreateTournament}
                            playersAndGuests={playersAndGuests}
                            selectedClub={selectedClub}
                            tournamentObj={newTournament}
                            updateTournamentObj={updateNewTournament}
                            setPlayersSelected={setPlayersSelected}
                            //temporary. add create guest to the playerselection component
                            newGuest={newGuest}
                            updateNewGuest={updateNewGuest}
                        />
                        : ""}
                    <section id="tournamentParameters">
                        {playersSelected ?
                            <Parameters
                                editOrNew={'new'}
                                tournamentObj={newTournament}
                                updateTournamentObj={updateNewTournament}
                                handleChange={handleChange}
                            />
                            : ""}
                        {playersSelected ?
                            <div id="tournamentSubmit">
                                <button className="buttonStyleApprove" onClick={() => setPlayersSelected(false)}>choose players</button>
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
                                                            // setShowGuests(false)
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
                                    setPlayersSelected(false)
                                    // setShowGuests(false)
                                }}>cancel</button>
                            </div>
                            : ""}
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