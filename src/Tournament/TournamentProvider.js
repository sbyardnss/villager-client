import { useState, useEffect, createContext } from "react";
import { getAllGuestPlayers, getAllPlayers, getAllTimeSettings, getMyTournaments, getTournamentGames } from "../ServerManager";

export const TournamentContext = createContext()

export const TournamentProvider = (props) => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)

    //base data
    const [players, setPlayers] = useState([])
    const [guests, setGuests] = useState([])
    const [timeSettings, setTimeSettings] = useState([])
    const [tournaments, setTournaments] = useState([])

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
    //tournament games disappearing if i move within here at all. should be stable within app though
    useEffect(
        () => { 
            if (selectedTournament) {
                getTournamentGames(selectedTournament)
                    .then((data) => setTournamentGames(data))
            }
        }, [selectedTournament]
    ) 
    //this one is needed currently. find a way to get rid of it
    useEffect(
        () => {
            const allCompetitors = players.concat(guests)
            setPlayersAndGuests(allCompetitors)
        }, [players, guests, selectedClub, selectedTournament, editPlayers]
    )
    

    //only show guests and players that are in selected club
    //REPLACE STATE VARIABLES FOR GUESTS AND PLAYERS WITH CLUBPLAYERS AND CLUBGUESTS
    useEffect(
        () => {
            const clubsPlayers = players.filter(p => selectedClubObj?.members?.find(m => m.id === p.id))
            setClubPlayers(clubsPlayers)
            const clubsGuests = guests.filter(g => selectedClubObj?.guest_members?.find(gm => gm.id === g.id))
            setClubGuests(clubsGuests)
            const allPlayersAndGuests = clubsPlayers.concat(clubsGuests)
            setPlayersAndGuests(allPlayersAndGuests)
        }, [selectedClubObj, selectedClub, players, guests]//adding selectedClub to this dependency array causes players to entirely disappear
    )


    const resetTournamentGames = () => {
        getTournamentGames(selectedTournament)
            .then(data => setTournamentGames(data))
    }
    const resetGuests = () => {
        getAllGuestPlayers()
            .then(data => setGuests(data))
    }


    return (
        <TournamentContext.Provider value={{
            localVillagerObj, players, setPlayers, timeSettings, tournaments, setTournaments, tournamentGames, setGames,
            selectedTournament, setSelectedTournament, resetTournamentGames, resetGuests,
            setGuests, guests, playersAndGuests, setPlayersAndGuests, selectedClub, setSelectedClub,
            selectedClubObj, setSelectedClubObj,setClubPlayers, clubPlayers, setClubGuests, clubGuests, editPlayers, setEditPlayers
        }}>
            {props.children}
        </TournamentContext.Provider>
    )
}