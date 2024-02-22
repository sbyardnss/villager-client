import { useState, useEffect, createContext } from "react";
import { getAllGuestPlayers, getAllPlayers, getAllTimeSettings, getAllTournaments, getMyChessClubs, getMyOpenTournaments, getTournamentGames } from "../../ServerManager";

export const TournamentContext = createContext()

export const TournamentProvider = (props) => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)

    //base data
    const [players, setPlayers] = useState([])//
    const [guests, setGuests] = useState([])//
    const [timeSettings, setTimeSettings] = useState([])//
    const [tournaments, setTournaments] = useState([])//
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

    useEffect(
        () => {
            Promise.all([getAllPlayers(), getAllGuestPlayers(), getMyOpenTournaments(), getAllTimeSettings()]).then(([playerData, guestData, tournamentData, timeSettingData]) => {
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

    const checkIfUserIsAppCreator = () => {
        if (localVillagerObj.userId === 1) {
            return true
        }
        return false
    }

    return (
        <TournamentContext.Provider value={{
            localVillagerObj, players, setPlayers, timeSettings, tournaments, setTournaments, pastTournaments, setPastTournaments, tournamentGames,
            selectedTournament, setSelectedTournament, resetTournamentGames, resetGuests,
            setGuests, guests, playersAndGuests, setPlayersAndGuests, selectedClub, setSelectedClub,
            selectedClubObj, setSelectedClubObj, setClubPlayers, clubPlayers, setClubGuests, clubGuests, editPlayers, setEditPlayers,
            myChessClubs, setMyChessClubs, resetTournaments,
            checkIfUserIsAppCreator
        }}>
            {props.children}
        </TournamentContext.Provider>
    )
}