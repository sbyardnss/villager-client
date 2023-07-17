import { useState, useEffect } from "react"
import { getAllMessages, getAllPlayers, getMyChessClubs, sendDirectMessage } from "../ServerManager"
import "./Messages.css"

export const Messages = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const [messages, setMessages] = useState([])
    const [players, setPlayers] = useState([])
    const [friends, setFriends] = useState([])
    const [recipient, setRecipient] = useState({})
    const [selectedChat, setSelectedChat] = useState(0)
    const [selectedChatMsgs, setSelectedChatMsgs] = useState([])
    const [myChessClubs, setMyChessClubs] = useState([])
    const [clubSelect, setClubSelect] = useState(false)
    const [selectedClub, setSelectedClub] = useState(0)
    const [newMsg, updateNewMsg] = useState({
        message: "",
        recipient: selectedChat
    })
    useEffect(
        () => {
            // getAllCommunityPosts().then(data => setCommunityPosts(data))
            Promise.all([getAllMessages(), getAllPlayers(), getMyChessClubs()]).then(([messageData, playerData, myClubsData]) => {
                setMessages(messageData)
                setPlayers(playerData)
                setMyChessClubs(myClubsData)
            })
        }, []
    )
    useEffect(
        () => {
            // const activeUser = players.find(p => p.id === localVillagerObj.userId)
            // const activeUserFriends = activeUser?.friends

            // CHANGED FRIENDS TO BE ALL PLAYERS IN MY CLUBS
            let myClubs = [...myChessClubs]
            if (selectedClub) {
                myClubs = myClubs.filter(c => c.id === selectedClub)
            }
            const playersInMyClubs = []
            myClubs.map(club => {
                club.members.map(member => {
                    if (member.id !== localVillagerObj.userId && !playersInMyClubs.find(p => p.id === member.id)) {
                        playersInMyClubs.push(member)
                    }
                })
            })
            
            setFriends(playersInMyClubs)
        }, [myChessClubs, selectedClub]
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
    useEffect(
        () => {
            const chatRecipient = friends.find(f => f.id === selectedChat)
            setRecipient(chatRecipient)
        }, [selectedChat]
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
    const selectClubOrSelectRecipient = () => {
        if (clubSelect) {
            return (
                <section id="messagesFriends">
                    <div className="selectChatClubFilter">
                        {selectedChat === 0 ? <div className="setCustomFont setSize">select club</div> : ""}
                        <button className="buttonStyleReject" onClick={() => setClubSelect(false)}>cancel</button>
                    </div>
                    <ul id="messagingFriendList">
                        {
                            myChessClubs.map(club => {
                                return (
                                    <li key={club.id}
                                        className="messagingFriendListItem"
                                        onClick={() => {
                                            setSelectedClub(club.id)
                                            setClubSelect(false)
                                            }}>
                                        {club.name}
                                    </li>
                                )
                            })
                        }
                    </ul>
                </section>
            )
        }
        else {
            return (
                <section id="messagesFriends">
                    <div className="selectChatClubFilter">
                        {selectedChat === 0 ? <div className="setCustomFont setSize">select chat</div> : ""}
                        {selectedChat === 0 ? <button className="buttonStyleReject" onClick={() => setSelectedClub(0)}>remove filter</button> : ""}
                        {selectedChat === 0 ? <button className="buttonStyleApprove" onClick={() => setClubSelect(true)}>filter by club</button>: "" }
                    </div>
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
            )
        }
    }
    const selectChatOrActiveChat = () => {
        if (selectedChat !== 0) {
            // const chatRecipient = friends?.find(f => f.id = selectedChat)
            return <>
                <div id="fullChatAndInterface">
                    {recipient ?
                        <div id="chatRecipientHeader" className=" setCustomFont">
                            {recipient.full_name}
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
                                        <li key={msg.id + '--' + msg.sender} className="receivedMsg">
                                            <div>{msg.message}</div>
                                            <div className="msgDateTimeFormat">{date}</div>
                                            <div className="msgDateTimeFormat">{time}</div>
                                        </li>
                                    )
                                }
                                else {
                                    return (
                                        <li key={msg.id + '--' + msg.recipient} className="sentMsg">
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
            {/* <section id="messagesFriends">
                <div className="selectChatClubFilter">
                    {selectedChat === 0 ? <div className="setCustomFont setSize">select chat</div> : ""}
                    <button className="buttonStyleApprove" onClick={() => setClubSelect(true)}>filter by club</button>
                </div>
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
            </section> */}
            {selectClubOrSelectRecipient()}
            <article id="chatAndInterface">
                {selectChatOrActiveChat()}
            </article>
        </main>
    </>
}