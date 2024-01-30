import { useState, useEffect, createContext } from "react";
import { getAllGuestPlayers, getAllPlayers, getAllTimeSettings, getAllTournaments, getMyChessClubs, getMyOpenTournaments, getMyTournaments, getTournamentGames } from "../../ServerManager";
import { Swiss } from "tournament-pairings";
export const TournamentContext = createContext()

export const TournamentProvider = (props) => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)

    //base data
    const [players, setPlayers] = useState([])
    const [guests, setGuests] = useState([])
    const [timeSettings, setTimeSettings] = useState([])
    const [tournaments, setTournaments] = useState([])
    const [pastTournaments, setPastTournaments] = useState([])
    const [myChessClubs, setMyChessClubs] = useState([])

    //contingent data
    const [tournamentGames, setTournamentGames] = useState([])
    const [playersAndGuests, setPlayersAndGuests] = useState([])
    const [clubPlayers, setClubPlayers] = useState([])
    const [clubGuests, setClubGuests] = useState([])
    const [selectedClubObj, setSelectedClubObj] = useState({})

    //reference variables
    const [selectedTournament, setSelectedTournament] = useState(0)
    const [selectedClub, setSelectedClub] = useState(0)
    const [editPlayers, setEditPlayers] = useState(false)

    //remove this asap
    const [games, setGames] = useState([])


    useEffect(
        () => {
            Promise.all([getAllPlayers(), getAllGuestPlayers(), /*getMyTournaments()*/ getMyOpenTournaments(), getAllTimeSettings()]).then(([playerData, guestData, tournamentData, timeSettingData]) => {
                setPlayers(playerData)
                setGuests(guestData)
                setTournaments(tournamentData)
                setTimeSettings(timeSettingData)
            })
        }, []
    )
    useEffect(
        () => {
            getMyChessClubs()
                .then(data => setMyChessClubs(data))
        }, [players, guests]
    )
    
    useEffect(
        () => {
            if (pastTournaments.length) {
                setTournaments(tournaments.concat(pastTournaments))
            }
        },[pastTournaments, tournaments]
    )
    //tournament games disappearing if i move within here at all. should be stable within app though
    useEffect(
        () => {
            if (selectedTournament) {
                getTournamentGames(selectedTournament)
                    .then((data) => setTournamentGames(data))
            }
        }, [selectedTournament, tournaments]
    )

    //this one is needed currently. find a way to get rid of it
    // useEffect(
    //     () => {
    //         const allCompetitors = players.concat(guests)
    //         setPlayersAndGuests(allCompetitors)
    //     }, [players, guests, selectedClub, selectedTournament, editPlayers]
    // )

    useEffect(
        () => {
            if (selectedTournament) {
                const tournamentObj = tournaments.find(t => t.id === selectedTournament)
                const club = myChessClubs.find(club => club.id === tournamentObj.club.id)
                setSelectedClubObj(club)
            }
            else {
                const club = myChessClubs.find(club => club.id === selectedClub)
                setSelectedClubObj(club)
            }
        }, [selectedClub, myChessClubs, selectedTournament, tournaments]
    )

    //only show guests and players that are in selected club
    //REPLACE STATE VARIABLES FOR GUESTS AND PLAYERS WITH CLUBPLAYERS AND CLUBGUESTS
    useEffect(
        () => {
            if (selectedClubObj) {
                const clubsPlayers = players.filter(p => selectedClubObj?.members?.find(m => m.id === p.id))
                setClubPlayers(clubsPlayers)
                const clubsGuests = guests.filter(g => selectedClubObj?.guest_members?.find(gm => gm.id === g.id))
                setClubGuests(clubsGuests)
                // const allPlayersAndGuests = clubsPlayers.concat(clubsGuests)
                // setPlayersAndGuests(allPlayersAndGuests)
            }
        }, [selectedClubObj, players, guests, editPlayers, selectedTournament]//adding selectedClub to this dependency array causes players to entirely disappear
    )
    //added this useEffect to replace playersAndGuests useEffect from line 63ish
    //if it stops working simply remove this one and comment that one back in
    useEffect(
        () => {
            if (clubPlayers && clubGuests) {
                const allCompetitors = players.concat(guests)
                setPlayersAndGuests(allCompetitors)
            }
        }, [clubPlayers, clubGuests, selectedTournament, players, guests]
    )
    const resetTournaments = () => {
        getAllTournaments()
            .then(data => setTournaments(data))
    }

    const resetTournamentGames = () => {
        getTournamentGames(selectedTournament)
            .then(data => setTournamentGames(data))
    }
    const resetGuests = () => {
        getAllGuestPlayers()
            .then(data => setGuests(data))
    }
    const playerArgCreator = (playerOppRef, refObj, scoreObject, actTourneyPlayers, playerBWTally) => {
        let identifier = null
        let isActive = true
        let playerArg = {}
        //check if player is active and get identifier
        if (isNaN(parseInt(playerOppRef))) {
            identifier = playerOppRef
            if (!actTourneyPlayers.find(ap => ap.guest_id === identifier)) {
                isActive = false
            }
        }
        else {
            identifier = parseInt(playerOppRef)
            if (!actTourneyPlayers.find(ap => ap.id === identifier)) {
                isActive = false
            }
        }
        if (isActive) {
            playerArg = {
                id: identifier,
                score: scoreObject[identifier] || 0,
                colors: playerBWTally,
                avoid: refObj[identifier] ? refObj[identifier].filter(ref => ref !== 'bye') : []
            }
            if (refObj[identifier]) {
                if (refObj[identifier].includes('bye') && playerArg.score > .5) {
                    playerArg.score--
                }
            }
            return playerArg
        }
    }

    const checkIfUserIsAppCreator = () => {
        if (localVillagerObj.userId === 1) {
            return true
        }
        return false
    }


    const findIdentifier = (playerObj) => {
        return playerObj?.guest_id ? playerObj?.guest_id : playerObj?.id
    }

    const createPairings = (editOrNew, tournamentPlayers, opponentReferenceObj, curRound, scoreObject, scoreCard, currentByePlayer, bWTally) => {
        //check whether odd or even number of players
        //if so choose bye player and then continue to iterate
        //iterate players

        const targetRound = editOrNew === 'new' ? curRound + 1 : curRound
        let playerArgs = []
        if (tournamentPlayers.length % 2 !== 0) {
            const scoreCardArr = []
            const playerIdentifierArr = []
            //filter out players that have had bye and note number of losses 
            for (const player of tournamentPlayers) {
                const identifier = findIdentifier(player)
                playerIdentifierArr.push(identifier)
                if (scoreCard[identifier]) {
                    if (!scoreCard[identifier].includes('bye') && identifier !== currentByePlayer) {
                        scoreCardArr.push([identifier, scoreCard[identifier].filter(s => s !== 'none' && s !== 1)])
                    }
                }
            }
            //sort by most losses
            scoreCardArr.sort((a, b) => b[1].length - a[1].length)
            // iterate potential bye players and find a pairing set that will work
            for (const potentialByePlayerArr of scoreCardArr) {
                for (const playerIdentifier of playerIdentifierArr) {
                    // let playerBWTally = []
                    // if (bWTally[parseInt(playerIdentifier)] || bWTally[playerIdentifier]) {
                    //     playerBWTally = bWTally[parseInt(playerIdentifier)] || bWTally[playerIdentifier]
                    // }
                    const playerBWTally = bWTally[playerIdentifier] || []
                    if (parseInt(playerIdentifier) !== potentialByePlayerArr[0] && playerIdentifier !== potentialByePlayerArr[0]) {
                        const playerArgObj = playerArgCreator(playerIdentifier, opponentReferenceObj, scoreObject, tournamentPlayers, playerBWTally)
                        playerArgs.push(playerArgObj)
                    }
                }

                const newMatchupsSansBye = Swiss(playerArgs, targetRound, false, true)
                if (newMatchupsSansBye && !newMatchupsSansBye.filter(m => m.player2 === null).length) {
                    const byePairing = { round: targetRound, match: tournamentPlayers.length / 2 + .5, player1: parseInt(potentialByePlayerArr[0]) || potentialByePlayerArr[0], player2: null }
                    const pairings = newMatchupsSansBye.concat(byePairing)
                    return pairings
                }
                else if (scoreCardArr.indexOf(potentialByePlayerArr) < scoreCardArr.length - 1) {
                    playerArgs = []
                }
                else {
                    if (scoreCardArr.indexOf(potentialByePlayerArr) === scoreCardArr.length - 1) {
                        window.alert('cannot create anymore matchups without double byes or double opponents')
                        return null
                    }
                }
            }


        }
        else {
            for (const player of tournamentPlayers) {
                const identifier = findIdentifier(player)
                // let playerBWTally = []
                // if (bWTally[parseInt(identifier)] || bWTally[identifier]) {
                //     playerBWTally = bWTally[parseInt(identifier)] || bWTally[identifier]
                // }

                const playerBWTally = bWTally[identifier] || []
                const playerArgObj = playerArgCreator(identifier, opponentReferenceObj, scoreObject, tournamentPlayers, playerBWTally)
                playerArgs.push(playerArgObj)
            }
            const pairings = Swiss(playerArgs, targetRound, false, true)
            if (pairings) {
                return pairings
            }
            else {
                window.alert('unable to create more pairings')
                return null
            }
        }
    }




    return (
        <TournamentContext.Provider value={{
            localVillagerObj, players, setPlayers, timeSettings, tournaments, setTournaments, pastTournaments, setPastTournaments, tournamentGames,
            selectedTournament, setSelectedTournament, resetTournamentGames, resetGuests,
            setGuests, guests, playersAndGuests, setPlayersAndGuests, selectedClub, setSelectedClub,
            selectedClubObj, setSelectedClubObj, setClubPlayers, clubPlayers, setClubGuests, clubGuests, editPlayers, setEditPlayers,
            myChessClubs, setMyChessClubs, resetTournaments,
            createPairings, findIdentifier, checkIfUserIsAppCreator
        }}>
            {props.children}
        </TournamentContext.Provider>
    )
}