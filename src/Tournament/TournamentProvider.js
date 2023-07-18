import { useState, useEffect, createContext } from "react";
import { getAllGames, getAllGuestPlayers, getAllPlayers, getAllTimeSettings, getAllTournaments, getMyTournaments, getTournamentGames } from "../ServerManager";

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
            if (selectedTournament) {
                getTournamentGames(selectedTournament)
                    .then((data) => setTournamentGames(data))
            }
        }, [selectedTournament]
    )
    // useEffect(
    //     () => {
    //         const allCompetitors = players.concat(guests)
    //         setPlayersAndGuests(allCompetitors)
    //     }, [players, guests, selectedClub, selectedTournament]
    // )

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
        }, [selectedClubObj, selectedClub, players, guests]
    )

    //REPLACEMENT USEEFFECT FOR ABOVE
    // useEffect(
    //     () => {
    //         if (selectedTournament) {
    //             const selectedTournamentGames = games.filter(g => g.tournament === selectedTournament)
    //             setTournamentGames(selectedTournamentGames)
    //         }
    //     }, [games]
    // )

    //KEEP THIS FOR FUTURE ADDITION AND REMOVAL OF PLAYERS MID TOURNAMENT
    // useEffect(
    //     () => {
    //         const previousPairings = []
    //         tournamentGames.map(tg => {
    //             const pairing = [tg.player_w?.id, tg.player_b?.id]
    //             previousPairings.push(pairing)
    //         })
    //         setPastPairings(previousPairings)
    //     }, [tournamentGames]
    // )

    const resetTournamentGames = () => {
        getTournamentGames(selectedTournament)
            .then(data => setTournamentGames(data))
    }

    return (
        <TournamentContext.Provider value={{
            localVillagerObj, players, setPlayers, timeSettings, tournaments, setTournaments, tournamentGames, setGames,
            selectedTournament, setSelectedTournament, resetTournamentGames,
            setGuests, guests, playersAndGuests, setPlayersAndGuests, selectedClub, setSelectedClub,
            selectedClubObj, setSelectedClubObj, clubPlayers, clubGuests
        }}>
            {props.children}
        </TournamentContext.Provider>
    )
}