import { React, useContext, useState, useEffect } from "react"
import { getProfile, getAllMessages } from "../ServerManager"
import "./Profile.css"

export const Profile = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)

    const [profileInfo, setProfileInfo] = useState({})
    const [messages, setMessages] = useState([])
    useEffect(
        () => {
            // getAllCommunityPosts().then(data => setCommunityPosts(data))
            Promise.all([getAllMessages(), getProfile()]).then(([messageData, profileData]) => {
                setMessages(messageData)
                setProfileInfo(profileData)
            })
        }, []
    )
    console.log(messages)
    return <>
        <main id="profileContainer">
            <article>
                Profile
                <section id="profileFriendContainer">
                    <h4>friends</h4>
                    {
                        profileInfo.friends?.map(f => {
                            const unreadMsgsFromPlayer = messages.find(msg => msg.sender === f.id && msg.read === false)
                            if (unreadMsgsFromPlayer) {
                                return (
                                    <li key={f.id}>
                                        {f.full_name}
                                    </li>
                                )
                            }
                            else {
                                return (
                                    <li key={f.id}>
                                        {f.full_name}
                                    </li>
                                )
                            }
                        })
                    }
                </section>
            </article>
        </main>
    </>
}