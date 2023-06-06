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
    const [tournamentGames, setTournamentGames] = useState([])
    useEffect(
        () => {
            Promise.all([getAllPlayers(), getAllTournaments(), getAllTimeSettings(), getAllGames()]).then(([playerData, tournamentData, timeSettingData, gameData]) => {
                setPlayers(playerData)
                setTournaments(tournamentData)
                setTimeSettings(timeSettingData)
                const games = gameData.filter(g => g.tournament)
                setTournamentGames(games)
            })
        }, []
    )

    return (
        <TournamentContext.Provider value={{
            localVillagerObj, players, timeSettings, tournaments, setTournaments, tournamentGames
        }}>
            {props.children}
        </TournamentContext.Provider>
    )
}