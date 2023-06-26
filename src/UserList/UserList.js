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
            <h1 id="userListTitle" className="setCustomFont">Users</h1>
            <ul id="userList">
                {
                    players.map(p => {
                        if (p.id !== localVillagerObj.userId) {
                            if (p.is_friend === 0) {
                                return (
                                    <li key={p.id}
                                        className="userListItem">
                                        {p.full_name}
                                        <button
                                            className="buttonStyleApprove"
                                            onClick={() => {
                                                addFriend(p.id)
                                                    .then(() => resetPlayers())
                                            }}>Add Friend</button>
                                    </li>
                                )
                            }
                            else {
                                return (
                                    <li key={p.id}
                                        className="userListFriendItem">
                                        {p.full_name}
                                        <button
                                            className="buttonStyleReject"
                                            onClick={() => {
                                                removeFriend(p.id)
                                                    .then(() => resetPlayers())
                                            }}>Remove Friend</button>
                                    </li>
                                )
                            }
                        }
                    })
                }
            </ul>
        </main>
    </>
}