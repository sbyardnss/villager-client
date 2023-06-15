import { useState, useEffect, createContext } from "react";
import { getAllGames, getAllPlayers } from "../ServerManager";

export const PlayContext = createContext()

export const PlayProvider = (props) => {
    //wrap homepage and play modules
    //provide whether game is against computer or human
    //provide selected game data
    //provide orientation
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const [selectedGame, setSelectedGame] = useState(0)
    const [orientation, setOrientation] = useState("white")
    const [games, setGames] = useState([])
    const [players, setPlayers] = useState([])
    const [selectedGameObj, updateSelectedGameObj] = useState({
        player_w: null,
        player_b: null,
        computer_opponent: null,
        pgn: "",
        is_tournament: false,
        timeSetting: null,
        accepted: true,
        winner: null,
        bye: false
    })

    useEffect(
        () => {
            Promise.all([getAllPlayers(), getAllGames()]).then(([playerData, gameData]) => {
                setPlayers(playerData)
                setGames(gameData)
            })
        }, []
    )
    useEffect(
        () => {
            const gameObjForPlay = games.find(g => g.id === selectedGame)
            updateSelectedGameObj(gameObjForPlay)
        }, [selectedGame]
    )
    useEffect(
        () => {
            if (selectedGameObj?.id) {
                if (selectedGameObj.player_w?.id === localVillagerObj.userId) {
                    setOrientation("white")
                }
                if (selectedGameObj.player_b?.id === localVillagerObj.userId) {
                    setOrientation("black")
                }
            }
            else {
                const randomOrientation = Math.floor(Math.random() * 2)
                if (randomOrientation === 1) {
                    setOrientation("white")
                }
                if (randomOrientation === 0) {
                    setOrientation("black")
                }
            }
        }, [selectedGameObj]
    )
    const resetGames = () => {
        getAllGames()
            .then(data => setGames(data))
    }
    return (
        <PlayContext.Provider value={{
            selectedGame, setSelectedGame, selectedGameObj, games, players, resetGames,
            orientation, setOrientation
        }}>
            {props.children}
        </PlayContext.Provider>
    )
}