import { useState, useEffect, createContext } from "react";
import { getAllGuestPlayers, getAllPlayers, getAllTimeSettings, getAllTournaments, getMyChessClubs, getMyTournaments, getTournamentGames } from "../ServerManager";
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


    //KEEP THIS FOR FUTURE ADDITION AND REMOVAL OF PLAYERS MID TOURNAMENT
    // const [pastPairings, setPastPairings] = useState([])

    useEffect(
        () => {
            Promise.all([getAllPlayers(), getAllGuestPlayers(), getMyTournaments(), getAllTimeSettings()]).then(([playerData, guestData, tournamentData, timeSettingData]) => {
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
            const club = myChessClubs.find(club => club.id === selectedClub)
            setSelectedClubObj(club)
        }, [selectedClub, myChessClubs]
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
        }, [clubPlayers, clubGuests, selectedTournament]
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
    const playerArgCreator = (playerOppRef, refObj, scoreObject, actTourneyPlayers, curRound) => {
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
                score: scoreObject[identifier],
                avoid: refObj[identifier].filter(ref => ref !== 'bye')
            }
            if (refObj[identifier].includes('bye') && playerArg.score > .5) {
                playerArg.score--
            }
            return playerArg
        }
    }
    const createPairings = (tournamentPlayers, oppRefObj, curRound, scoreObject, scoreCard, currentByePlayer) => {
        const playerArgs = []
        //check length of active players
        // console.log(tournamentPlayers.length %2)
        if (tournamentPlayers.length % 2 !== 0) {
            //odd, then find player for bye
            const scoreCardArr = []
            for (const playerId in scoreCard) {
                if (!scoreCard[playerId].includes('bye') && parseInt(playerId) !== currentByePlayer && playerId !== currentByePlayer) {
                    scoreCardArr.push([parseInt(playerId) || playerId, scoreCard[playerId].filter(s => s !== 'none' && s !== 1)])
                }
            }
            scoreCardArr.sort((a, b) => b[1].length - a[1].length)
            //current round not accounted for in scorecard
            
            for (const potentialByePlayerArr of scoreCardArr) {
                //create args for other players and check if the new pairings will work
                for (const oppRef in oppRefObj) {
                    if (parseInt(oppRef) !== potentialByePlayerArr[0] && oppRef !== potentialByePlayerArr[0]) {
                        const playerArgObj = playerArgCreator(oppRef, oppRefObj, scoreObject, tournamentPlayers, curRound)
                        playerArgs.push(playerArgObj)
                    }
                }
                const newMatchupsSansBye = Swiss(playerArgs, curRound + 1)
                if (newMatchupsSansBye && !newMatchupsSansBye.filter(m => m.player2 === null).length) {
                    const byePairing = { round: curRound + 1, match: tournamentPlayers.length / 2 + .5, player1: parseInt(potentialByePlayerArr[0]) || potentialByePlayerArr[0], player2: null }
                    const pairings = newMatchupsSansBye.concat(byePairing)
                    return pairings
                }
                else {
                    if (scoreCardArr.indexOf(potentialByePlayerArr) === scoreCardArr.length - 1) {
                        window.alert('cannot create anymore matchups without double byes or double opponents')
                    }
                }
            }
        }
        else {
            //even, create with swiss
            for (const oppRef in oppRefObj) {
                const playerArgObj = playerArgCreator(oppRef, oppRefObj, scoreObject, tournamentPlayers, curRound)
                playerArgs.push(playerArgObj)
            }
            const pairings = Swiss(playerArgs, curRound + 1)
            if (pairings) {
                return pairings
            }
        }
    }



    return (
        <TournamentContext.Provider value={{
            localVillagerObj, players, setPlayers, timeSettings, tournaments, setTournaments, tournamentGames, setGames,
            selectedTournament, setSelectedTournament, resetTournamentGames, resetGuests,
            setGuests, guests, playersAndGuests, setPlayersAndGuests, selectedClub, setSelectedClub,
            selectedClubObj, setSelectedClubObj, setClubPlayers, clubPlayers, setClubGuests, clubGuests, editPlayers, setEditPlayers,
            myChessClubs, setMyChessClubs, resetTournaments,
            createPairings
        }}>
            {props.children}
        </TournamentContext.Provider>
    )
}