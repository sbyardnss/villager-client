import { useState, useEffect } from "react"
import { getAllMessages, getAllPlayers, sendDirectMessage } from "../ServerManager"
import "./Messages.css"

export const Messages = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const [messages, setMessages] = useState([])
    const [players, setPlayers] = useState([])
    const [friends, setFriends] = useState([])
    const [selectedChat, setSelectedChat] = useState(0)
    const [selectedChatMsgs, setSelectedChatMsgs] = useState([])
    const [newMsg, updateNewMsg] = useState({
        message: "",
        recipient: selectedChat
    })
    useEffect(
        () => {
            // getAllCommunityPosts().then(data => setCommunityPosts(data))
            Promise.all([getAllMessages(), getAllPlayers()]).then(([messageData, playerData]) => {
                setMessages(messageData)
                setPlayers(playerData)
            })
        }, []
    )

    useEffect(
        () => {
            const activeUser = players.find(p => p.id === localVillagerObj.userId)
            const activeUserFriends = activeUser?.friends
            setFriends(activeUserFriends)
        }, [players]
    )
    useEffect(
        () => {
            const filteredMsgs = messages.filter(m => m.sender === selectedChat || m.recipient === selectedChat)
            const sortedMsgs = filteredMsgs.sort((a, b) => {
                const aDate = Date.parse(a.date_time)
                const bDate = Date.parse(b.date_time)
                return aDate < bDate ? -1 : aDate > bDate ? +1 : 0
            })
            setSelectedChatMsgs(sortedMsgs)
            const msgCopy = { ...newMsg }
            msgCopy.recipient = selectedChat
            updateNewMsg(msgCopy)
        }, [selectedChat, messages]
    )
    const resetMessages = () => {
        getAllMessages()
            .then(data => setMessages(data))
    }
    const handleKeyDown = e => {
        if (e.key === 'Enter') {
            sendDirectMessage(newMsg).then(() => {
                const copy = { ...newMsg }
                copy.message = ""
                updateNewMsg(copy)
                resetMessages()
            })
        }
    }
    const selectChatOrActiveChat = () => {
        if (selectedChat !== 0) {
            return <>
                <div id="fullChatAndInterface">
                    <section id="chat">
                        {
                            selectedChatMsgs.map(msg => {
                                if (msg.recipient === localVillagerObj.userId) {
                                    return (
                                        <li key={msg.id} className="receivedMsg">
                                            {msg.message}
                                        </li>
                                    )
                                }
                                else {
                                    return (
                                        <li key={msg.id} className="sentMsg">
                                            {msg.message}
                                        </li>
                                    )
                                }
                            })
                        }
                    </section>
                    <div>
                        <input
                            id="chatInterface"
                            type="text"
                            value={newMsg.message}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => {
                                const copy = { ...newMsg }
                                copy.message = e.target.value
                                updateNewMsg(copy)
                            }} />
                        <button
                            onClick={() => sendDirectMessage(newMsg)
                                .then(() => {
                                    resetMessages()
                                    const copy = { ...newMsg }
                                    copy.message = ""
                                    updateNewMsg(copy)
                                })}
                        >send</button>
                    </div>
                    {/* <button id="exitChatBtn" onClick={() => setSelectedChat(0)}>
                        exit
                    </button> */}
                </div>
            </>
        }

    }
    const selectChatAnimation = document.querySelector('section#messagesFriends');
    selectChatAnimation?.addEventListener('click', function () {
        selectChatAnimation?.classList.add('animate');
    });
    selectChatAnimation?.addEventListener('animationend', function () {
        selectChatAnimation?.classList.remove('animate')
    })
    return <>
        <main id="messagingContainer">

            <section id="messagesFriends">
                <ul id="messagingFriendList">
                    {
                        friends?.map(f => {
                            return (
                                <li key={f.id}
                                    className={f.id === selectedChat ? "selectedFriendListItem" : "messagingFriendListItem"}
                                    onClick={() => setSelectedChat(f.id)}>
                                    {f.full_name}
                                </li>
                            )
                        })
                    }
                </ul>
            </section>
            <article id="chatAndInterface">
                {selectChatOrActiveChat()}
            </article>
        </main>
    </>
}