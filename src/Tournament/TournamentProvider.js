import { useState, useEffect, createContext } from "react";
import { getAllGames, getAllGuestPlayers, getAllPlayers, getAllTimeSettings, getAllTournaments, getMyTournaments, getTournamentGames } from "../ServerManager";

export const TournamentContext = createContext()

export const TournamentProvider = (props) => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const [players, setPlayers] = useState([])
    const [tournaments, setTournaments] = useState([])
    const [selectedTournament, setSelectedTournament] = useState(0)
    const [timeSettings, setTimeSettings] = useState([])
    const [games, setGames] = useState([])
    const [tournamentGames, setTournamentGames] = useState([])
    const [pastPairings, setPastPairings] = useState([])
    const [guests, setGuests] = useState([])
    const [playersAndGuests, setPlayersAndGuests] = useState([])
    const [selectedClub, setSelectedClub] = useState(0)
    const [selectedClubObj, setSelectedClubObj] = useState({})

    useEffect(
        () => {
            Promise.all([/*getAllPlayers(), */getMyTournaments(), getAllTimeSettings(), getAllGames()/*, getAllGuestPlayers()*/]).then(([/*playerData, */tournamentData, timeSettingData, gameData/*, guestData*/]) => {
                // setPlayers(playerData)
                setTournaments(tournamentData)
                setTimeSettings(timeSettingData)
                setGames(gameData)
                // setGuests(guestData)
            })
        }, []
    )
    useEffect(
        () => {
            getAllPlayers()
                .then(data => setPlayers(data))
            getAllGuestPlayers()
                .then(data => setGuests(data))
        },[selectedClub]
    )
    //only show guests and players that are in selected club
    useEffect(
        () => {
            const clubPlayers = players.filter(p => selectedClubObj?.members?.find(m => m.id === p.id))
            setPlayers(clubPlayers)
            const clubGuests = guests.filter(g => selectedClubObj?.guest_members?.find(gm => gm.id === g.id))
            setGuests(clubGuests)
            const allPlayersAndGuests = clubPlayers.concat(clubGuests)
            setPlayersAndGuests(allPlayersAndGuests)
        },[selectedClubObj]
    )
    useEffect(
        () => {
            if (selectedTournament) {
                getTournamentGames(selectedTournament)
                    .then((data) => setTournamentGames(data))
            }
        }, [selectedTournament]
    )

    //THIS USEEFFECT MIGHT BE UNNECESSARY
    // useEffect(
    //     () => {
    //         // const allPlayersAndGuests = players.concat(guests)

    //         const playersInSelectedClub = players.filter(p => selectedClubObj?.members?.find(m => m.id === p.id))
    //         const guestPlayersInSelectedClub = guests.filter(g => selectedClubObj?.guest_members?.find(gm => gm.id === g.id))
    //         const allPlayersAndGuestsInSelectedClub = playersInSelectedClub.concat(guestPlayersInSelectedClub)
    //         setPlayersAndGuests(allPlayersAndGuestsInSelectedClub)
    //     },[players, guests, selectedClubObj]
    // )
    useEffect(
        () => {
            const previousPairings = []
            tournamentGames.map(tg => {
                const pairing = [tg.player_w?.id, tg.player_b?.id]
                previousPairings.push(pairing)
            })
            setPastPairings(previousPairings)
        }, [tournamentGames]
    )
    const resetGames = () => {
        getAllGames()
            .then(data => setGames(data))
    }
    const resetTournamentGames = () => {
        getTournamentGames(selectedTournament)
            .then(data => setTournamentGames(data))
    }
    // const resetGuests = () => {
    //     getAllGuestPlayers()
    //         .then(data => setGuests(data))
    // }
    return (
        <TournamentContext.Provider value={{
            localVillagerObj, players, timeSettings, tournaments, setTournaments, tournamentGames, setGames,
            selectedTournament, setSelectedTournament, pastPairings, resetGames, resetTournamentGames,
            setGuests, guests, playersAndGuests, setPlayersAndGuests, selectedClub, setSelectedClub,
            selectedClubObj, setSelectedClubObj
        }}>
            {props.children}
        </TournamentContext.Provider>
    )
}