import { useState, useEffect, createContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllGames, getAllPlayers, getAllTimeSettings, getAllTournaments } from "../ServerManager";

export const TournamentContext = createContext()

export const TournamentProvider = (props) => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const [players, setPlayers] = useState([])
    const [tournaments, setTournaments] = useState([])
    const [timeSettings, setTimeSettings] = useState([])
    const [games, setGames] = useState([])
    const [tournamentGames, setTournamentGames] = useState([])
    useEffect(
        () => {
            Promise.all([getAllPlayers(), getAllTournaments(), getAllTimeSettings(), getAllGames()]).then(([playerData, tournamentData, timeSettingData, gameData]) => {
                setPlayers(playerData)
                setTournaments(tournamentData)
                setTimeSettings(timeSettingData)
                setGames(gameData)
                // const games = gameData.filter(g => g.tournament)
                // setTournamentGames(games)
            })
        }, []
    )
    useEffect(
        () => {
            const tourneyGamesOnly = games.filter(g => g.tournament)
            setTournamentGames(tourneyGamesOnly)
        }, [games]
    )

    return (
        <TournamentContext.Provider value={{
            localVillagerObj, players, timeSettings, tournaments, setTournaments, tournamentGames, setGames
        }}>
            {props.children}
        </TournamentContext.Provider>
    )
}