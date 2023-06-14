import "./HomePage.css"

import { React, useContext, useState, useEffect } from "react"
import { deleteCommunityPost, getAllCommunityPosts, getAllGames, getAllPlayers, getAllTournaments, sendNewGame, submitNewPostToAPI } from "../ServerManager"

export const HomePage = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const [players, setPlayers] = useState([])
    const [communityPosts, setCommunityPosts] = useState([])
    const [tournaments, setTournaments] = useState([])
    const [games, setGames] = useState([])
    const [challenges, setChallenges] = useState([])
    const [newPost, updateNewPost] = useState({
        poster: localVillagerObj.userId,
        message: ""

    })
    const [challengeForApi, updateChallengeForApi] = useState({
        player_w: 0,
        player_b: 0,
        accepted: false,
        computer_opponent: false
    })
    useEffect(
        () => {
            Promise.all([getAllPlayers(), getAllCommunityPosts(), getAllTournaments(), getAllGames()]).then(([playerData, communityPostData, tournamentData, gameData]) => {
                setPlayers(playerData)
                setCommunityPosts(communityPostData)
                setTournaments(tournamentData)
                setGames(gameData)
            })
        }, []
    )
    useEffect(
        () => {
            const challengeGames = games?.filter(game => game.accepted === false)
            console.log(games)
            setChallenges(challengeGames)
        },[games]
    )
    const resetCommunityPosts = () => {
        getAllCommunityPosts().then(data => setCommunityPosts(data))
    }
    //SCROLL TO BOTTOM FUNCTIONALITY FROM LINKUP
    // const scrollToBottom = () => {
    //     messagesEndRef.current?.scrollIntoView({behavior: "auto"})
    // }
    // useEffect(() => {
    //     scrollToBottom()
    // }, [displayedMsgs])

    const handleChange = e => {
        const copy = { ...newPost }
        copy.message = e.target.value
        updateNewPost(copy)
    }
    const handlekeyDown = e => {
        if (e.key === 'Enter') {
            submitNewPostToAPI(newPost).then(() => {
                const copy = { ...newPost }
                copy.message = ""
                updateNewPost(copy)
                resetCommunityPosts()
            })
        }
    }
    const handleDelete = id => {
        if (window.confirm("are you sure?")) {
            deleteCommunityPost(id)
                .then(() => {
                    resetCommunityPosts()
                })
        }
    }
    return <>
        <main id="homepageContainer">
            <h1>Homepage</h1>
            <article id="communityForum">
                <h2>community posts</h2>
                <section id="communityForumMsgs" >
                    {
                        communityPosts.map(post => {
                            const date_time = new Date(post.date_time)
                            const date = date_time.toLocaleDateString('en-us')
                            const time = date_time.toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' })
                            if (post.poster?.id === localVillagerObj.userId) {
                                return (
                                    <li key={post.id} className="communityPost">
                                        <h3>
                                            {post.poster?.full_name}
                                        </h3>
                                        <h5>{date} {time}</h5>
                                        {post.message}
                                        <button onClick={() => handleDelete(post.id)}>delete</button>
                                    </li>
                                )
                            }
                            else {
                                return (
                                    <li key={post.id} className="communityPost">
                                        <h3>
                                            {post.poster?.full_name}
                                        </h3>
                                        <h5>{date} {time}</h5>
                                        {post.message}</li>
                                )
                            }
                        })
                    }
                </section>
                <section id="communityForumInterface">
                    <input id="communityForumInput"
                        type="text"
                        value={newPost.message}
                        onChange={handleChange}
                        onKeyDown={handlekeyDown}
                    />
                    <button id="communityForumSubmitBtn"
                        onClick={() => {
                            submitNewPostToAPI(newPost).then(() => {
                                const copy = { ...newPost }
                                copy.message = ""
                                updateNewPost(copy)
                                getAllCommunityPosts().then(data => setCommunityPosts(data))
                                // resetMessages()
                            })
                        }}
                    >send</button>
                </section>
            </article>
            <article key="openChallenges">
                <section>
                    <h2>open challenges</h2>
                    {
                        challenges?.map(c => {
                            const challengingPlayer = c.player_w ? c.player_w : c.player_b
                            return (
                                <div>{}</div>
                            )
                        })
                    }
                </section>
                <section>
                    <h2>create challenge</h2>
                    <div>play as:
                        <div id="piecesSelectionContainer">
                            <div id="whitePiecesSelect" onClick={() => {
                                const challengeCopy = { ...challengeForApi }
                                challengeCopy.player_w = localVillagerObj.userId
                                challengeCopy.player_b = null
                                updateChallengeForApi(challengeCopy)
                            }}>white</div>
                            <div id="blackPiecesSelect" onClick={() => {
                                const challengeCopy = { ...challengeForApi }
                                challengeCopy.player_b = localVillagerObj.userId
                                challengeCopy.player_w = null
                                updateChallengeForApi(challengeCopy)
                            }}>black</div>
                        </div>
                        <button onClick={() => {
                            if (window.confirm("create open challenge?")) {
                                sendNewGame(challengeForApi)
                            }
                        }}>create</button>
                    </div>
                </section>
            </article>
        </main>
    </>
}
