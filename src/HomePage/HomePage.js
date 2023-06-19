import "./HomePage.css"

import { React, useContext, useState, useEffect, useRef } from "react"
import { acceptChallenge, deleteCommunityPost, getAllCommunityPosts, getAllGames, getAllPlayers, getAllTournaments, getPuzzles, sendNewGame, submitNewPostToAPI } from "../ServerManager"
import { PlayContext } from "../Play/PlayProvider"
import { useNavigate } from "react-router-dom"
export const HomePage = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const navigate = useNavigate()
    const { players, games, resetGames, selectedGameObj, selectedGame, setSelectedGame } = useContext(PlayContext)
    const [communityPosts, setCommunityPosts] = useState([])
    const [tournaments, setTournaments] = useState([])
    const [myTournaments, setMyTournaments] = useState([])
    const [tournamentGames, setTournamentGames] = useState([])
    const [challenges, setChallenges] = useState([])
    const [myUnfinishedGames, setMyUnfinishedGames] = useState([])
    // const [puzzles, setPuzzles] = useState([])
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
    // useEffect(
    //     () => {
    //         getPuzzles()
    //             .then(data => setPuzzles(data))
    //     },[]
    // )
    useEffect(
        () => {
            Promise.all([getAllCommunityPosts(), getAllTournaments()]).then(([communityPostData, tournamentData]) => {
                setCommunityPosts(communityPostData)
                setTournaments(tournamentData)
            })
        }, []
    )
    useEffect(
        () => {
            const challengeGames = games?.filter(game => game.accepted === false)
            setChallenges(challengeGames)
            const unfinishedGames = games?.filter(game => {
                return (game.player_b?.id === localVillagerObj.userId || game.player_w?.id === localVillagerObj.userId) && game.winner === null
            })
            setMyUnfinishedGames(unfinishedGames)
        }, [games]
    )
    useEffect(
        () => {
            if (tournaments) {
                const joinedTournaments = tournaments.filter(t => {
                    if (t.complete === false) {
                        return t.competitors.find(c => c === localVillagerObj.userId)
                    }
                })
                setMyTournaments(joinedTournaments)
            }
        }, [tournaments]
    )
    useEffect(
        () => {
            if (myTournaments) {
                const myTournamentGames = games.filter(g => {
                    return myTournaments.find(t => {
                        if (t.in_person === false) {
                            return t.id === g.tournament
                        }
                    })
                })
                setTournamentGames(myTournamentGames)
            }
        }, [myTournaments]
    )
    useEffect(
        () => {
            if (selectedGame !== 0) {
                navigate("/play")
            }
        }, [selectedGame]
    )

    const resetCommunityPosts = () => {
        getAllCommunityPosts()
            .then(data => setCommunityPosts(data))
    }
    //SCROLL TO BOTTOM FUNCTIONALITY FROM LINKUP
    const communityPostsEndRef = useRef(null)
    const scrollToBottom = () => {
        communityPostsEndRef.current.scrollIntoView({ behavior: "auto" })
    }
    useEffect(() => {
        scrollToBottom()
    }, [communityPosts])

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
            {/* <h1>Homepage</h1> */}
            <div id="forumAndOpenChallenges">
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
                                                {post.poster?.username}
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
                                                {post.poster?.username}
                                            </h3>
                                            <h5>{date} {time}</h5>
                                            {post.message}</li>
                                    )
                                }
                            })
                        }
                        <div ref={communityPostsEndRef} />
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
                <div id="openChallengesList">
                    <h2>open challenges</h2>
                    {
                        challenges?.map(c => {
                            const challengingPlayer = c.player_w ? c.player_w : c.player_b
                            if (challengingPlayer.id !== localVillagerObj.userId) {
                                return (
                                    <div key={c.id} className="challengeListItem">
                                        <div>
                                            Challenger: {challengingPlayer.full_name} playing as <span id={c.player_w ? "whiteChallengeSpan" : "blackChallengeSpan"}>{c.player_w ? "white" : "black"}</span>
                                        </div>
                                        <div>
                                            Play as {c.player_w ? "black" : "white"} <button className="challengeBtn"
                                                onClick={() => {
                                                    const copy = { ...c }
                                                    c.player_w ? copy.player_b = localVillagerObj.userId : copy.player_w = localVillagerObj.userId
                                                    c.player_w ? copy.player_w = c.player_w.id : copy.player_b = c.player_b.id
                                                    copy.accepted = true
                                                    acceptChallenge(copy)
                                                        .then(() => resetGames())
                                                }}>confirm</button>
                                        </div>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>
            <article key="challenges" id="challengesArticle">
                <section id="myActiveGames">
                    <h2>My Games</h2>
                    <div id="myUnfinishedGamesScrollWindow">
                        {
                            myUnfinishedGames?.map(ug => {
                                // const opponent = ug.player_w?.id === localVillagerObj.userId ? ug.player_b : ug.player_w
                                const opponent = ug.player_w?.id === localVillagerObj.userId ? players.find(p => p.id === ug.player_b?.id) : players.find(p => p.id === ug.player_w?.id)
                                const isTournamentGame = () => {
                                    return ug.tournament ? "tournamentActiveGameListItem" : "activeGameListItem"
                                }
                                if (opponent) {
                                    return (
                                        <div key={ug.id} className={isTournamentGame()}>
                                            <div>Play as <span id={ug.player_w.id === localVillagerObj.userId ? "whiteChallengeSpan" : "blackChallengeSpan"}>{ug.player_w?.id === localVillagerObj.userId ? "white" : "black"}</span></div>
                                            <div className="opponentSectionForListItem">Opponent: {opponent.username}</div>
                                            <button className="challengeBtn"
                                                onClick={() => {
                                                    setSelectedGame(ug.id)
                                                }}>play</button>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                </section>
                <section id="createChallengeSection">
                    <h3>create challenge</h3>
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
                        <div id="randomSelect" onClick={() => {
                            const challengeCopy = { ...challengeForApi }
                            const randomNumber = Math.floor(Math.random() * 2)
                            if (randomNumber === 1) {
                                challengeCopy.player_w = localVillagerObj.userId
                                challengeCopy.player_b = null
                            }
                            else {
                                challengeCopy.player_b = localVillagerObj.userId
                                challengeCopy.player_w = null
                            }
                            updateChallengeForApi(challengeCopy)
                        }}>random</div>
                        <button onClick={() => {
                            if (window.confirm("create open challenge?")) {
                                sendNewGame(challengeForApi)
                            }
                        }}>create</button>
                    </div>
                </section>
            </article>
            {/* <article>
                <h2>my tournaments</h2>
                {
                    myTournaments?.map(t => {
                        return (
                            <div key={t.id}>{t.title}</div>
                        )
                    })
                }
            </article> */}
        </main>
    </>
}
