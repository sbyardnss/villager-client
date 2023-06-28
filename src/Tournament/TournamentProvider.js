import { useState, useEffect, createContext } from "react";
import { getAllGames, getAllGuestPlayers, getAllPlayers, getAllTimeSettings, getAllTournaments, getTournamentGames } from "../ServerManager";

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

    useEffect(
        () => {
            Promise.all([getAllPlayers(), getAllTournaments(), getAllTimeSettings(), getAllGames(), getAllGuestPlayers()]).then(([playerData, tournamentData, timeSettingData, gameData, guestData]) => {
                setPlayers(playerData)
                setTournaments(tournamentData)
                setTimeSettings(timeSettingData)
                setGames(gameData)
                setGuests(guestData)
            })
        }, []
    )
    // useEffect(
    //     () => {
    //         if (selectedTournament) {
    //             const selectedTournamentObj = tournaments.find(t => t.id === selectedTournament)
    //             // const tourneyGamesOnly = games.filter(g => g.tournament === selectedTournament)
    //             console.log(selectedTournamentObj)
    //             setTournamentGames(selectedTournamentObj.games)
    //         }
    //     }, [games, selectedTournament]
    // )
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
    return (
        <TournamentContext.Provider value={{
            localVillagerObj, players, timeSettings, tournaments, setTournaments, tournamentGames, setGames,
            selectedTournament, setSelectedTournament, pastPairings, resetGames, resetTournamentGames
        }}>
            {props.children}
        </TournamentContext.Provider>
    )
}