import { useNavigate } from "react-router-dom"
import "../ChessClubs/ChessClubs.css"
import { useEffect, useState } from "react"
import { getMyChessClubs } from "../ServerManager"

export const ChessClubs = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const navigate = useNavigate()
    const [myChessClubs, setMyChessClubs] = useState([])

    useEffect(
        () => {
            getMyChessClubs()
                .then(data => setMyChessClubs(data))
        }, []
    )
    console.log(myChessClubs)

    return <>
        <main id="chessClubsContainer">
            <section id="myChessClubsList">
                {
                    myChessClubs.map(club => {
                        return (
                            <li className="setCustomFont">{club.name}</li>
                        )
                    
                    })
                }
            </section>
        </main>
    </>
}