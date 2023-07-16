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

    useEffect(
        () => {
            Promise.all([getAllPlayers(), getMyTournaments(), getAllTimeSettings(), getAllGames(), getAllGuestPlayers()]).then(([playerData, tournamentData, timeSettingData, gameData, guestData]) => {
                setPlayers(playerData)
                setTournaments(tournamentData)
                setTimeSettings(timeSettingData)
                setGames(gameData)
                setGuests(guestData)
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
    useEffect(
        () => {
            const allPlayersAndGuests = players.concat(guests)
            setPlayersAndGuests(allPlayersAndGuests)
        },[players, guests]
    )
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
    const resetGuests = () => {
        getAllGuestPlayers()
            .then(data => setGuests(data))
    }
    return (
        <TournamentContext.Provider value={{
            localVillagerObj, players, timeSettings, tournaments, setTournaments, tournamentGames, setGames,
            selectedTournament, setSelectedTournament, pastPairings, resetGames, resetTournamentGames,
            setGuests, guests, playersAndGuests, setPlayersAndGuests
        }}>
            {props.children}
        </TournamentContext.Provider>
    )
}