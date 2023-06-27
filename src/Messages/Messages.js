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
            const chatRecipient = friends?.find(f => f.id = selectedChat)
            return <>
                <div id="fullChatAndInterface">
                    {chatRecipient ?

                        <div id="chatRecipientHeader" className=" setCustomFont">
                            {chatRecipient.username}
                            <button className="buttonStyleReject"
                                onClick={() => setSelectedChat(0)}>exit chat</button>
                        </div>
                        : ""}
                    <section id="chat">
                        {
                            selectedChatMsgs.map(msg => {
                                const date = new Date(msg.date_time).toLocaleDateString('en-us')
                                const time = new Date(msg.date_time).toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' })
                                if (msg.recipient === localVillagerObj.userId) {
                                    return (
                                        <li key={msg.id +'--' +msg.sender} className="receivedMsg">
                                            <div>{msg.message}</div>
                                            <div className="msgDateTimeFormat">{date}</div>
                                            <div className="msgDateTimeFormat">{time}</div>
                                        </li>
                                    )
                                }
                                else {
                                    return (
                                        <li key={msg.id +'--' +msg.recipient} className="sentMsg">
                                            <div>{msg.message}</div>
                                            <div className="msgDateTimeFormat">{date}</div>
                                            <div className="msgDateTimeFormat">{time}</div>
                                        </li>
                                    )
                                }
                            })
                        }
                    </section>
                    <div id="chatInterface">
                        <input
                            id="chatInput"
                            type="text"
                            className="text-input"
                            value={newMsg.message}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => {
                                const copy = { ...newMsg }
                                copy.message = e.target.value
                                updateNewMsg(copy)
                            }} />
                        <button
                            id="sendMsgBtn"
                            className="buttonStyleApprove"
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
                {selectedChat === 0 ? <div className="setCustomFont setSize">select chat</div> : ""}
                <ul id={selectedChat === 0 ? "messagingFriendList" : "activeChatMessagingFriendList"}>
                    {
                        friends?.map(f => {
                            return (
                                <li key={f.id + '--' + f.username}
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