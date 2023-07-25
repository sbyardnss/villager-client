import { useContext, useEffect, useState } from "react"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { createNewGuest, getChessClub, updateTournament } from "../ServerManager"
import { RoundRobin, Swiss } from "tournament-pairings"


export const EditPlayersModal = ({ activeTournamentObj, setEdit, playedRounds, gamesFromThisRound, previousOpponents }) => {
    const { localVillagerObj, players, guests, playersAndGuests, setPlayersAndGuests, selectedClubObj, selectedClub, resetGuests, resetTournaments } = useContext(TournamentContext)
    const [potentialCompetitors, setPotentialCompetitors] = useState([])
    const [search, setSearch] = useState("")
    const [showGuests, setShowGuests] = useState(false)
    const [clubPlayers, setClubPlayers] = useState([])
    const [clubGuests, setClubGuests] = useState([])
    const [pastPairings, setPastPairings] = useState([])
    const [currentPairings, setCurrentPairings] = useState([])
    const [initialPlayersAndGuests, setInitialPlayersAndGuests] = useState([])
    const [addPlayers, setAddPlayers] = useState(false)
    const [removePlayers, setRemovePlayers] = useState(false)
    const [addedPlayersAndGuests, setAddedPlayersAndGuests] = useState([])
    const [editedPlayerOpponentsRef, updateEditedPlayerOpponentsRef] = useState({})
    const [newGuest, updateNewGuest] = useState({
        full_name: "",
        club: 0
    })
    const [tournamentClub, setTournamentClub] = useState({})
    const [tournamentObj, updatedTournamentObj] = useState({
        title: "",
        creator: localVillagerObj.userId,
        competitors: [],
        guest_competitors: [],
        timeSetting: 0,
        rounds: 0,
        in_person: true,
        pairings: [],
        club: 0
    })
    //grabbing initial players and guests to be able to check on creation of new matchups
    useEffect(
        () => {
            if (activeTournamentObj) {
                setInitialPlayersAndGuests(activeTournamentObj.competitors.concat(activeTournamentObj.guest_competitors))
            }
        }, []
    )
    useEffect(
        () => {
            const allCurrentCompetitorsOnUpdated = tournamentObj.competitors.concat(tournamentObj.guest_competitors)
            const allAddedCompetitors = allCurrentCompetitorsOnUpdated.filter(ac => !initialPlayersAndGuests.find(i => {
                if (ac.guest_id) {
                    return ac.guest_id === i.guest_id
                }
                else {
                    if (!ac.guest_id && !i.guest_id) {
                        return ac.id === i.id
                    }
                }
            }))
            setAddedPlayersAndGuests(allAddedCompetitors)
        }, [tournamentObj]
    )
    //setting past pairings based on current round so that new pairings can be appended after editing players
    useEffect(
        () => {
            const tourneyCopy = { ...activeTournamentObj }
            updatedTournamentObj(tourneyCopy)
            const initPlayers = [...activeTournamentObj.competitors]
            const initGuests = [...activeTournamentObj.guest_competitors]
            setInitialPlayersAndGuests(initPlayers.concat(initGuests))
            const pairingsBeforeThisRound = activeTournamentObj.pairings.filter(p => p.round < playedRounds)
            setPastPairings(pairingsBeforeThisRound)
            const currentRoundPairings = activeTournamentObj.pairings.filter(p => p.round === playedRounds)
            setCurrentPairings(currentRoundPairings)
            const guestCopy = { ...newGuest }
            guestCopy.club = activeTournamentObj.club.id
            updateNewGuest(guestCopy)
        }, [activeTournamentObj]
    )
    useEffect(
        () => {
            if (tournamentObj.club) {
                const clubId = tournamentObj.club.id
                getChessClub(clubId)
                    .then(data => setTournamentClub(data))
            }
        }, [tournamentObj.club, guests]
    )
    useEffect(
        () => {
            if (tournamentClub) {
                const clubsPlayers = players?.filter(p => tournamentClub.members?.find(m => m.id === p.id))
                setClubPlayers(clubsPlayers)
                const clubsGuests = guests?.filter(g => tournamentClub.guest_members?.find(gm => gm.id === g.id))
                setClubGuests(clubsGuests)
                const allPlayersAndGuests = clubsPlayers.concat(clubsGuests)
                setPlayersAndGuests(allPlayersAndGuests)
            }
        }, [players, guests, tournamentClub]//adding selectedClub to this dependency array causes players to entirely disappear
    )

    useEffect(
        () => {
            if (search !== "") {
                const filteredUsers = playersAndGuests.filter(pc => {
                    return pc.full_name.toLowerCase().includes(search.toLowerCase()) && !tournamentObj.competitors?.find(member => member.id === pc.id) && !tournamentObj.guest_competitors?.find(member => member.id === pc.id)
                })
                setPotentialCompetitors(filteredUsers)
            }
            else {
                const unselectedPlayers = [...clubPlayers]?.filter(p => !tournamentObj.competitors.find(c => c.id === p.id))
                let unselectedGuests = []
                if (showGuests) {
                    unselectedGuests = [...clubGuests]?.filter(g => !tournamentObj.guest_competitors.find(gc => gc.id === g.id))
                }
                setPotentialCompetitors(unselectedPlayers.concat(unselectedGuests))
            }
        }, [search, showGuests, playersAndGuests, players, guests, clubGuests, clubPlayers]
    )
    // useEffect(
    //     () => {
    //         const addedPlayers = tournamentObj.competitors.filter(c => !activeTournamentObj.competitors.find(ac => ac.id === c.id))
    //         const addedGuests = tournamentObj.guest_competitors.filter(c => !activeTournamentObj.guest_competitors.find(ac => ac.guest_id === c.guest_id))
    //         setAddedPlayersAndGuests(addedPlayers.concat(addedGuests))
    //     },[tournamentObj]
    // )
    // useEffect(
    //     () => {
    //         console.log(addedPlayersAndGuests)

    //         console.log(activeTournamentObj.competitors)
    //     },[addedPlayersAndGuests, tournamentObj]
    // )

    useEffect(
        () => {
            const refObj = {}
            const copy = { ...tournamentObj }
            const allCompetitors = copy.competitors.concat(copy.guest_competitors)
            const competitorIds = allCompetitors.map(c => {
                if (c.guest_id) {
                    return c.guest_id
                }
                else {
                    return c.id
                }
            })
            for (const id of competitorIds) {
                refObj[id] = []
            }
            for (const playerId in previousOpponents) {
                refObj[playerId] = previousOpponents[playerId]
            }
            updateEditedPlayerOpponentsRef(refObj)
        }, [previousOpponents, tournamentObj]
    )

    useEffect(
        () => {
            console.log(addedPlayersAndGuests)
        }, [addedPlayersAndGuests]
    )
    return (
        <article id="editPlayersContainer">
            <div id="editPlayersHeader">
                <h3>Edit Players</h3>
                <button className="buttonStyleReject" onClick={() => {
                    setEdit(false)
                    updatedTournamentObj(activeTournamentObj)
                }}>cancel</button>
            </div>
            <div id="tournamentPlayerSelectionSection">
                <div id="competitorSelectionSplit">
                    <div id="potentialLabel" className="setColor setCustomFont">Potential:</div>
                    <div id="tournamentPotentialCompetitorSelection">
                        {
                            potentialCompetitors?.map((p, index) => {
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
                                            updatedTournamentObj(tournamentCopy)
                                            setSearch("")
                                        }}>
                                        {p?.full_name}
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
                            tournamentObj.competitors?.map((competitor, index) => {
                                const player = playersAndGuests.find(p => p.id === competitor.id)
                                return (
                                    <li key={competitor.id + '-- competitor'}
                                        className="newTournamentPlayerListItem"
                                        onClick={() => {
                                            const tournamentCopy = { ...tournamentObj }
                                            tournamentCopy.competitors.splice(index, 1)
                                            updatedTournamentObj(tournamentCopy)
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
                            tournamentObj.guest_competitors?.map((competitor, index) => {
                                const player = playersAndGuests.find(p => p.guest_id === competitor.guest_id)
                                return (
                                    <li key={competitor.guest_id + '-- competitor'}
                                        className="newTournamentPlayerListItem"
                                        onClick={() => {
                                            const tournamentCopy = { ...tournamentObj }
                                            tournamentCopy.guest_competitors.splice(index, 1)
                                            updatedTournamentObj(tournamentCopy)
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
                        if (newGuest.full_name !== "" && newGuest.club) {
                            createNewGuest(newGuest)
                                .then(() => resetGuests())
                            updateNewGuest({ full_name: "", club: activeTournamentObj.club.id })
                        }
                    }}
                >Create Guest</button>
            </div>
            <div id="editPlayersToggleAndSubmitBtnBlock">
                <button className="buttonStyleApprove" onClick={() => setShowGuests(!showGuests)}>toggle guests</button>
                <button id="submitNewPlayersBtn" className="buttonStyleApprove" onClick={() => {
                    if (activeTournamentObj.in_person === true) {

                        if ((gamesFromThisRound.length === currentPairings.length && !currentPairings.find(p => p.player2 === null)) || (gamesFromThisRound.length === currentPairings.length - 1 && currentPairings.find(p => p.player2 === null))) {
                            window.alert('This round seems to be over. Start new round before adding players')
                            setEdit(false)
                        }
                        //adding players function
                        else {
                            const copy = { ...tournamentObj }
                            if (!gamesFromThisRound.length) {
                                //if new add player conditionals dont work, delete them and revert to just this one
                                //and disallow changes without clean round
                                const playersArg = []
                                for (const opponentRef in editedPlayerOpponentsRef) {
                                    const playerRefObj = {
                                        id: parseInt(opponentRef) || opponentRef,
                                        avoid: editedPlayerOpponentsRef[opponentRef].filter(ref => ref !== 'bye')
                                    }
                                    if (editedPlayerOpponentsRef[opponentRef].includes('bye')) {
                                        playerRefObj.receivedBye = true
                                    }
                                    playersArg.push(playerRefObj)
                                }
                                copy.pairings = pastPairings.concat(Swiss(playersArg, playedRounds))
                            }
                            //adding new players but not affecting current created round matchups with bye pairing fill in
                            //add odd number of players
                            else if (addedPlayersAndGuests.length % 2 === 1) { //works as long as new players length not 1
                                if (addedPlayersAndGuests.length === 1) {
                                    if (currentPairings.find(p => p.player2 === null)) { //works with even and odd players
                                        let byePairing = currentPairings.find(p => p.player2 === null)
                                        const indexOfByePairing = currentPairings.indexOf(byePairing)
                                        const randomNewPlayerIndex = Math.floor(Math.random() * addedPlayersAndGuests.length)
                                        const newPlayerForByeGame = addedPlayersAndGuests.splice(randomNewPlayerIndex, 1)
                                        if (newPlayerForByeGame[0].guest_id) {
                                            const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].guest_id }
                                            currentPairings[indexOfByePairing] = newByePairing
                                        }
                                        else {
                                            const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].id }
                                            currentPairings[indexOfByePairing] = newByePairing
                                        }
                                        const allPairings = pastPairings.concat(currentPairings)
                                        copy.pairings = allPairings
                                    }
                                    else { //works
                                        //create new bye
                                        const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match
                                        const playerIdentifier = addedPlayersAndGuests[0].guest_id || addedPlayersAndGuests[0].id
                                        const newBye = { round: playedRounds, match: lastMatchNumFromCurrentPairings + 1, player1: playerIdentifier, player2: null }
                                        currentPairings.push(newBye)
                                        copy.pairings = pastPairings.concat(currentPairings)
                                    }
                                }
                                else if (currentPairings.find(p => p.player2 === null)) { //works for even and odd
                                    const byePairing = currentPairings.find(p => p.player2 === null)
                                    const indexOfByePairing = currentPairings.indexOf(byePairing)
                                    const randomNewPlayerIndex = Math.floor(Math.random() * addedPlayersAndGuests.length)
                                    const newPlayerForByeGame = addedPlayersAndGuests.splice(randomNewPlayerIndex, 1)
                                    if (newPlayerForByeGame[0].guest_id) {
                                        const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].guest_id }
                                        currentPairings[indexOfByePairing] = newByePairing
                                    }
                                    else {
                                        const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].id }
                                        currentPairings[indexOfByePairing] = newByePairing
                                    }
                                    const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match
                                    const newPlayerArr = []
                                    for (const player of addedPlayersAndGuests) {
                                        if (player.guest_id) {
                                            newPlayerArr.push({ id: player.guest_id })
                                        }
                                        else {
                                            newPlayerArr.push({ id: player.id })
                                        }
                                    }
                                    const newPairings = Swiss(newPlayerArr, playedRounds)
                                    newPairings.map(np => np.match = np.match + lastMatchNumFromCurrentPairings)
                                    const allPairingsForThisRound = currentPairings.concat(newPairings)
                                    const allPairings = pastPairings.concat(allPairingsForThisRound)
                                    copy.pairings = allPairings
                                }
                                else {//works
                                    const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match
                                    const newPlayerArr = []
                                    for (const player of addedPlayersAndGuests) {
                                        if (player.guest_id) {
                                            newPlayerArr.push({ id: player.guest_id })
                                        }
                                        else {
                                            newPlayerArr.push({ id: player.id })
                                        }
                                    }
                                    const newPairings = Swiss(newPlayerArr, playedRounds)
                                    newPairings.map(np => np.match = np.match + lastMatchNumFromCurrentPairings)
                                    const allPairingsForThisRound = currentPairings.concat(newPairings)
                                    const allPairings = pastPairings.concat(allPairingsForThisRound)
                                    copy.pairings = allPairings
                                }
                            }
                            //add even number of players
                            else {//works with even number of players
                                if (currentPairings.find(p => p.player2 === null)) { //works with even and odd players
                                    let byePairing = currentPairings.find(p => p.player2 === null)
                                    const indexOfByePairing = currentPairings.indexOf(byePairing)
                                    const randomNewPlayerIndex = Math.floor(Math.random() * addedPlayersAndGuests.length)
                                    const newPlayerForByeGame = addedPlayersAndGuests.splice(randomNewPlayerIndex, 1)
                                    if (newPlayerForByeGame[0].guest_id) {
                                        const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].guest_id }
                                        currentPairings[indexOfByePairing] = newByePairing
                                    }
                                    else {
                                        const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].id }
                                        currentPairings[indexOfByePairing] = newByePairing
                                    }
                                    const newPlayerArr = []
                                    for (const player of addedPlayersAndGuests) {
                                        if (player.guest_id) {
                                            newPlayerArr.push({ id: player.guest_id })
                                        }
                                        else {
                                            newPlayerArr.push({ id: player.id })
                                        }
                                    }
                                    const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match
                                    let newPairings = []
                                    if (newPlayerArr.length === 1) {
                                        newPairings.push({ round: playedRounds, match: 1, player1: newPlayerArr[0].id, player2: null })
                                    }
                                    else {
                                        newPairings = Swiss(newPlayerArr, playedRounds)
                                    }
                                    newPairings.map(np => np.match = np.match + lastMatchNumFromCurrentPairings)
                                    const allPairingsForThisRound = currentPairings.concat(newPairings)
                                    const allPairings = pastPairings.concat(allPairingsForThisRound)
                                    copy.pairings = allPairings
                                }
                                else {
                                    const newPlayerArr = []
                                    for (const player of addedPlayersAndGuests) {
                                        if (player.guest_id) {
                                            newPlayerArr.push({ id: player.guest_id })
                                        }
                                        else {
                                            newPlayerArr.push({ id: player.id })
                                        }
                                    }
                                    const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match
                                    const newPairings = Swiss(newPlayerArr, playedRounds)
                                    newPairings.map(np => np.match = np.match + lastMatchNumFromCurrentPairings)
                                    const allPairingsForThisRound = currentPairings.concat(newPairings)
                                    const allPairings = pastPairings.concat(allPairingsForThisRound)
                                    copy.pairings = allPairings
                                }
                            }
                            const competitorIds = tournamentObj.competitors.map(tc => {
                                return tc.id
                            })
                            const guestIds = tournamentObj.guest_competitors.map(tgc => {
                                return tgc.id
                            })
                            copy.competitors = competitorIds
                            copy.guest_competitors = guestIds
                            console.log(copy)
                            // updateTournament(copy)
                            //     .then(() => resetTournaments())
                            // setEdit(false)
                        }
                    }
                }}>Submit</button>
            </div>
        </article>
    )
}