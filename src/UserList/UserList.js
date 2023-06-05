import { React, useContext, useState, useEffect } from "react"
import { getAllPlayers, addFriend, removeFriend } from "../ServerManager"
import "./UserList.css"
export const UserList = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const [players, setPlayers] = useState([])

    useEffect(
        () => {
            // getAllCommunityPosts().then(data => setCommunityPosts(data))
            Promise.all([getAllPlayers()]).then(([playerData]) => {
                setPlayers(playerData)
            })
        }, []
    )
    const resetPlayers = () => {
        getAllPlayers()
            .then(data => setPlayers(data))
    }
    return <>
        <main id="userListContainer">
            <h1>User List</h1>
            {
                players.map(p => {
                    if (p.id !== localVillagerObj.userId) {
                        if (p.is_friend === 0) {
                            return (
                                <li key={p.id}>
                                    {p.full_name}
                                    <button onClick={() => {
                                        addFriend(p.id)
                                        .then(() => resetPlayers())
                                    }}>Add Friend</button>
                                </li>
                            )
                        }
                        else {
                            return (
                                <li key={p.id}>
                                    {p.full_name}
                                    <button onClick={() => {
                                        removeFriend(p.id)
                                        .then(() => resetPlayers())
                                    }}>Remove Friend</button>
                                </li>
                            )
                        }
                    }
                })
            }
        </main>
    </>
}