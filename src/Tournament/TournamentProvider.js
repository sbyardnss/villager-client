import { useState, useEffect, createContext } from "react";
import { getAllGames, getAllPlayers, getAllTimeSettings, getAllTournaments } from "../ServerManager";

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

    useEffect(
        () => {
            Promise.all([getAllPlayers(), getAllTournaments(), getAllTimeSettings(), getAllGames()]).then(([playerData, tournamentData, timeSettingData, gameData]) => {
                setPlayers(playerData)
                setTournaments(tournamentData)
                setTimeSettings(timeSettingData)
                setGames(gameData)
            })
        }, []
    )
    useEffect(
        () => {
            const tourneyGamesOnly = games.filter(g => g.tournament === selectedTournament)
            setTournamentGames(tourneyGamesOnly)
        }, [games, selectedTournament]
    )
    useEffect(
        () => {
            const previousPairings = []
            tournamentGames.map(tg => {
                const pairing = [tg.player_w?.id, tg.player_b?.id]
                previousPairings.push(pairing)
            })
            setPastPairings(previousPairings)
        },[tournamentGames]
    )

    return (
        <TournamentContext.Provider value={{
            localVillagerObj, players, timeSettings, tournaments, setTournaments, tournamentGames, setGames,
            selectedTournament, setSelectedTournament, pastPairings
        }}>
            {props.children}
        </TournamentContext.Provider>
    )
}