import { useContext, useEffect, useState } from "react"
import { TournamentContext } from "./TournamentProvider"
import "./Tournament.css"
import { createNewGuest, getChessClub, getTournament, updateTournament } from "../ServerManager"
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
        }, [search, showGuests, playersAndGuests, players, guests, clubGuests, clubPlayers, tournamentObj]
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

    // if (!addPlayers && !removePlayers) {
    //     return (
    //         <article id="editPlayersContainerInitial" >
    //             <div id="editPlayersHeader" >
    //                 <h3 >Edit Players</h3>
    //                 <button className="buttonStyleReject" onClick={() => {
    //                     setEdit(false)
    //                     setAddPlayers(false)
    //                     setRemovePlayers(false)
    //                 }}>cancel</button>
    //             </div>
    //             <div id="editPlayersInitialBtnBlock">
    //                 <button className="editPlayersInitialBtn setCustomFont" onClick={() => {
    //                     setAddPlayers(true)
    //                     setRemovePlayers(false)
    //                 }}>add players</button>
    //                 <button className="editPlayersInitialBtn setCustomFont" onClick={() => {
    //                     setRemovePlayers(true)
    //                     setAddPlayers(false)
    //                 }}>remove players</button>
    //             </div>
    //         </article>
    //     )
    // }
    // else {
    return (
        <article id="editPlayersContainer">
            <div id="editPlayersHeader">
                <h3>Edit Players</h3>
                <button className="buttonStyleReject" onClick={() => {
                    getTournament(activeTournamentObj.id)
                        .then(data => updatedTournamentObj(data))
                    setEdit(false)
                    // updatedTournamentObj(activeTournamentObj)
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
                                            // if (addPlayers) {
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
                                            // }
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
                                            // if (removePlayers) {
                                            const tournamentCopy = { ...tournamentObj }
                                            tournamentCopy.competitors.splice(index, 1)
                                            updatedTournamentObj(tournamentCopy)
                                            const copy = [...potentialCompetitors]
                                            copy.push(competitor)
                                            setPotentialCompetitors(copy)
                                            // }
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
                                            // if (removePlayers) {
                                            const tournamentCopy = { ...tournamentObj }
                                            tournamentCopy.guest_competitors.splice(index, 1)
                                            updatedTournamentObj(tournamentCopy)
                                            const copy = [...potentialCompetitors]
                                            copy.push(competitor)
                                            setPotentialCompetitors(copy)
                                            // }
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
                        else {
                            //filter current round matchups
                            const filteredPairings = currentPairings.filter(p => {
                                const playerW = typeof p.player1 === 'string' ? tournamentObj.guest_competitors.find(g => g.guest_id === p.player1) : tournamentObj.competitors.find(pl => pl.id === p.player1)
                                const playerB = typeof p.player2 === 'string' ? tournamentObj.guest_competitors.find(g => g.guest_id === p.player2) : tournamentObj.competitors.find(pl => pl.id === p.player2)
                                //if either player missing, remove matchup and add player to unmatchedplayer array
                                // if (playerW && !playerB) {
                                //     unMatchedPlayersAndGuests.push(playerW)
                                // }
                                // if (!playerW && playerB) {
                                //     unMatchedPlayersAndGuests.push(playerB)
                                // }
                                return playerW && playerB
                            })
                            const allAddedCompetitors = tournamentObj.competitors.concat(tournamentObj.guest_competitors)
                            const unMatchedPlayersAndGuests = allAddedCompetitors.filter(ac => {
                                const identifier = ac.guest_id ? ac.guest_id : ac.id
                                if (!filteredPairings.find(p => p.player1 === identifier || p.player2 === identifier)) {
                                    return true
                                }
                                return false
                            })
                            const matchesPerRound = unMatchedPlayersAndGuests.length % 2 === 0 ? unMatchedPlayersAndGuests.length / 2 : (unMatchedPlayersAndGuests.length + 1) / 2
                            const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match
                            //check length of players to be matched. if one create bye
                            if (unMatchedPlayersAndGuests.length === 1) {
                                const unmatchedPlayerOrGuest = unMatchedPlayersAndGuests[0]
                                let identifier = undefined
                                if (unmatchedPlayerOrGuest.guest_id) {
                                    identifier = unmatchedPlayerOrGuest.guest_id
                                }
                                else {
                                    identifier = unmatchedPlayerOrGuest.id
                                }
                                const byeMatchup = { round: playedRounds, match: lastMatchNumFromCurrentPairings, player1: identifier, player2: null }
                                filteredPairings.push(byeMatchup)
                            }
                            else if (unMatchedPlayersAndGuests.length === 2) {
                                const randomWhite = Math.floor(Math.random() * 2)
                                const whitePlayer = unMatchedPlayersAndGuests.splice(randomWhite, 1)[0]
                                const blackPlayer = unMatchedPlayersAndGuests[0]
                                const newMatchup = { round: playedRounds, match: lastMatchNumFromCurrentPairings, player1: whitePlayer.guest_id || whitePlayer.id, player2: blackPlayer.guest_id || blackPlayer.id }
                                filteredPairings.push(newMatchup)
                            }
                            else {
                                //create new array from tournament competitors and guests
                                const playerAndGuestIdsForPairing = unMatchedPlayersAndGuests.map(pg => {
                                    if (pg.guest_id) {
                                        return pg.guest_id
                                    }
                                    else {
                                        return pg.id
                                    }
                                })
                                const playerIdObjectsForPairing = playerAndGuestIdsForPairing.map(pg => {
                                    let hadBye = false
                                    if (previousOpponents[pg]?.includes('bye')) {
                                        hadBye = true
                                    }
                                    const previousOppArr = previousOpponents[pg]?.filter(op => op !== 'bye')
                                    if (previousOpponents[pg]) {
                                        return { id: pg, avoid: previousOpponents[pg], receivedBye: hadBye }
                                    }
                                    else {
                                        return { id: pg }
                                    }
                                })
                                const newMatchups = Swiss(playerIdObjectsForPairing, playedRounds)
                                newMatchups.map(nm => {
                                    filteredPairings.push(nm)
                                })
                            }
                            // console.log(filteredPairings)
                            for (let i = 0; i < filteredPairings.length; i++) {
                                filteredPairings[i].match = i + 1
                            }
                            const copy = { ...tournamentObj }
                            copy.pairings = pastPairings.concat(filteredPairings)
                            const competitorIds = tournamentObj.competitors.map(tc => {
                                return tc.id
                            })
                            const guestIds = tournamentObj.guest_competitors.map(tgc => {
                                return tgc.id
                            })
                            copy.competitors = competitorIds
                            copy.guest_competitors = guestIds
                            console.log(copy)
                            updateTournament(copy)
                                .then(() => resetTournaments())
                            setEdit(false)



                            //add to updated tournament

                        }






                        //FIRST VERSION. WORKS FOR ADDING BUT NOT REMOVING
                        // if ((gamesFromThisRound.length === currentPairings.length && !currentPairings.find(p => p.player2 === null)) || (gamesFromThisRound.length === currentPairings.length - 1 && currentPairings.find(p => p.player2 === null))) {
                        //     window.alert('This round seems to be over. Start new round before adding players')
                        //     setEdit(false)
                        // }
                        // //adding players function
                        // else {
                        //     const copy = { ...tournamentObj }
                        //     if (!gamesFromThisRound.length) {
                        //         //if new add player conditionals dont work, delete them and revert to just this one
                        //         //and disallow changes without clean round
                        //         const playersArg = []
                        //         for (const opponentRef in editedPlayerOpponentsRef) {
                        //             const playerRefObj = {
                        //                 id: parseInt(opponentRef) || opponentRef,
                        //                 avoid: editedPlayerOpponentsRef[opponentRef].filter(ref => ref !== 'bye')
                        //             }
                        //             if (editedPlayerOpponentsRef[opponentRef].includes('bye')) {
                        //                 playerRefObj.receivedBye = true
                        //             }
                        //             playersArg.push(playerRefObj)
                        //         }
                        //         copy.pairings = pastPairings.concat(Swiss(playersArg, playedRounds))
                        //     }
                        //     //adding new players but not affecting current created round matchups with bye pairing fill in
                        //     //add odd number of players
                        //     else if (addedPlayersAndGuests.length % 2 === 1) { //works as long as new players length not 1
                        //         if (addedPlayersAndGuests.length === 1) {
                        //             if (currentPairings.find(p => p.player2 === null)) { //works with even and odd players
                        //                 let byePairing = currentPairings.find(p => p.player2 === null)
                        //                 const indexOfByePairing = currentPairings.indexOf(byePairing)
                        //                 const randomNewPlayerIndex = Math.floor(Math.random() * addedPlayersAndGuests.length)
                        //                 const newPlayerForByeGame = addedPlayersAndGuests.splice(randomNewPlayerIndex, 1)
                        //                 if (newPlayerForByeGame[0].guest_id) {
                        //                     const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].guest_id }
                        //                     currentPairings[indexOfByePairing] = newByePairing
                        //                 }
                        //                 else {
                        //                     const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].id }
                        //                     currentPairings[indexOfByePairing] = newByePairing
                        //                 }
                        //                 const allPairings = pastPairings.concat(currentPairings)
                        //                 copy.pairings = allPairings
                        //             }
                        //             else { //works
                        //                 //create new bye
                        //                 const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match
                        //                 const playerIdentifier = addedPlayersAndGuests[0].guest_id || addedPlayersAndGuests[0].id
                        //                 const newBye = { round: playedRounds, match: lastMatchNumFromCurrentPairings + 1, player1: playerIdentifier, player2: null }
                        //                 currentPairings.push(newBye)
                        //                 copy.pairings = pastPairings.concat(currentPairings)
                        //             }
                        //         }
                        //         else if (currentPairings.find(p => p.player2 === null)) { //works for even and odd
                        //             const byePairing = currentPairings.find(p => p.player2 === null)
                        //             const indexOfByePairing = currentPairings.indexOf(byePairing)
                        //             const randomNewPlayerIndex = Math.floor(Math.random() * addedPlayersAndGuests.length)
                        //             const newPlayerForByeGame = addedPlayersAndGuests.splice(randomNewPlayerIndex, 1)
                        //             if (newPlayerForByeGame[0].guest_id) {
                        //                 const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].guest_id }
                        //                 currentPairings[indexOfByePairing] = newByePairing
                        //             }
                        //             else {
                        //                 const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].id }
                        //                 currentPairings[indexOfByePairing] = newByePairing
                        //             }
                        //             const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match
                        //             const newPlayerArr = []
                        //             for (const player of addedPlayersAndGuests) {
                        //                 if (player.guest_id) {
                        //                     newPlayerArr.push({ id: player.guest_id })
                        //                 }
                        //                 else {
                        //                     newPlayerArr.push({ id: player.id })
                        //                 }
                        //             }
                        //             const newPairings = Swiss(newPlayerArr, playedRounds)
                        //             newPairings.map(np => np.match = np.match + lastMatchNumFromCurrentPairings)
                        //             const allPairingsForThisRound = currentPairings.concat(newPairings)
                        //             const allPairings = pastPairings.concat(allPairingsForThisRound)
                        //             copy.pairings = allPairings
                        //         }
                        //         else {//works
                        //             const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match
                        //             const newPlayerArr = []
                        //             for (const player of addedPlayersAndGuests) {
                        //                 if (player.guest_id) {
                        //                     newPlayerArr.push({ id: player.guest_id })
                        //                 }
                        //                 else {
                        //                     newPlayerArr.push({ id: player.id })
                        //                 }
                        //             }
                        //             const newPairings = Swiss(newPlayerArr, playedRounds)
                        //             newPairings.map(np => np.match = np.match + lastMatchNumFromCurrentPairings)
                        //             const allPairingsForThisRound = currentPairings.concat(newPairings)
                        //             const allPairings = pastPairings.concat(allPairingsForThisRound)
                        //             copy.pairings = allPairings
                        //         }
                        //     }
                        //     //add even number of players
                        //     else {//works with even number of players
                        //         if (currentPairings.find(p => p.player2 === null)) { //works with even and odd players
                        //             let byePairing = currentPairings.find(p => p.player2 === null)
                        //             const indexOfByePairing = currentPairings.indexOf(byePairing)
                        //             const randomNewPlayerIndex = Math.floor(Math.random() * addedPlayersAndGuests.length)
                        //             const newPlayerForByeGame = addedPlayersAndGuests.splice(randomNewPlayerIndex, 1)
                        //             if (newPlayerForByeGame[0].guest_id) {
                        //                 const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].guest_id }
                        //                 currentPairings[indexOfByePairing] = newByePairing
                        //             }
                        //             else {
                        //                 const newByePairing = { round: byePairing.round, match: byePairing.match, player1: byePairing.player1, player2: newPlayerForByeGame[0].id }
                        //                 currentPairings[indexOfByePairing] = newByePairing
                        //             }
                        //             const newPlayerArr = []
                        //             for (const player of addedPlayersAndGuests) {
                        //                 if (player.guest_id) {
                        //                     newPlayerArr.push({ id: player.guest_id })
                        //                 }
                        //                 else {
                        //                     newPlayerArr.push({ id: player.id })
                        //                 }
                        //             }
                        //             const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match
                        //             let newPairings = []
                        //             if (newPlayerArr.length === 1) {
                        //                 newPairings.push({ round: playedRounds, match: 1, player1: newPlayerArr[0].id, player2: null })
                        //             }
                        //             else {
                        //                 newPairings = Swiss(newPlayerArr, playedRounds)
                        //             }
                        //             newPairings.map(np => np.match = np.match + lastMatchNumFromCurrentPairings)
                        //             const allPairingsForThisRound = currentPairings.concat(newPairings)
                        //             const allPairings = pastPairings.concat(allPairingsForThisRound)
                        //             copy.pairings = allPairings
                        //         }
                        //         else {
                        //             const newPlayerArr = []
                        //             for (const player of addedPlayersAndGuests) {
                        //                 if (player.guest_id) {
                        //                     newPlayerArr.push({ id: player.guest_id })
                        //                 }
                        //                 else {
                        //                     newPlayerArr.push({ id: player.id })
                        //                 }
                        //             }
                        //             const lastMatchNumFromCurrentPairings = currentPairings[currentPairings.length - 1]?.match
                        //             const newPairings = Swiss(newPlayerArr, playedRounds)
                        //             newPairings.map(np => np.match = np.match + lastMatchNumFromCurrentPairings)
                        //             const allPairingsForThisRound = currentPairings.concat(newPairings)
                        //             const allPairings = pastPairings.concat(allPairingsForThisRound)
                        //             copy.pairings = allPairings
                        //         }
                        //     }
                        //     const competitorIds = tournamentObj.competitors.map(tc => {
                        //         return tc.id
                        //     })
                        //     const guestIds = tournamentObj.guest_competitors.map(tgc => {
                        //         return tgc.id
                        //     })
                        //     copy.competitors = competitorIds
                        //     copy.guest_competitors = guestIds
                        //     console.log(copy)
                        //     // updateTournament(copy)
                        //     //     .then(() => resetTournaments())
                        //     // setEdit(false)
                        // }
                    }
                }}>Submit</button>
            </div>
        </article>
    )
    // }
}