import "./HomePage.css"

import { React, useContext, useState, useEffect, useRef } from "react"
import { Chessboard } from "react-chessboard"
import Chess from "chess.js"
import { acceptChallenge, deleteCommunityPost, getAllCommunityPosts, getAllGames, getAllPlayers, getAllTournaments, getPuzzles, sendNewGame, submitNewPostToAPI } from "../ServerManager"
import { PlayContext } from "../Play/PlayProvider"
import { useNavigate } from "react-router-dom"
import trophyIcon from "../images/small_trophy_with_background.png"
export const HomePage = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const navigate = useNavigate()
    const { players, games, resetGames, selectedGameObj, updateSelectedGameObj, selectedGame, setSelectedGame, puzzles, selectedPuzzle, setSelectedPuzzle, selectedRange, setSelectedRange } = useContext(PlayContext)
    const [communityPosts, setCommunityPosts] = useState([])
    const [tournaments, setTournaments] = useState([])
    const [myTournaments, setMyTournaments] = useState([])
    const [tournamentGames, setTournamentGames] = useState([])
    const [challenges, setChallenges] = useState([])
    const [myUnfinishedGames, setMyUnfinishedGames] = useState([])
    const [displayedPuzzle, setDisplayedPuzzle] = useState({})
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
    console.log(myUnfinishedGames)
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
    // update tournament games
    // useEffect(
    //     () => {
    //         if (myTournaments) {
    //             const myTournamentGames = games.filter(g => {
    //                 return myTournaments.find(t => {
    //                     if (t.in_person === false) {
    //                         return t.id === g.tournament
    //                     }
    //                 })
    //             })
    //             setTournamentGames(myTournamentGames)
    //         }
    //     }, [myTournaments]
    // )
    // useEffect(
    //     () => {
    //         if (selectedGame !== 0) {
    //             navigate("/play")
    //         }
    //     }, [selectedGame]
    // )
    useEffect(
        () => {
            if (selectedPuzzle.fen !== "") {
                navigate("/play")
            }
        }, [selectedPuzzle]
    )
    //update displayed puzzle
    // useEffect(
    //     () => {
    //         if (puzzles) {

    //             const firstPuzzle = puzzles.puzzles[0]
    //             setDisplayedPuzzle(firstPuzzle)
    //         }
    //     },[puzzles]
    // )

    const resetCommunityPosts = () => {
        getAllCommunityPosts()
            .then(data => setCommunityPosts(data))
    }
    //SCROLL TO BOTTOM FUNCTIONALITY FROM LINKUP
    const scrollToBottom = () => {
        const communityPostElement = document.getElementById("communityForumMsgs")
        communityPostElement.scrollTop = communityPostElement.scrollHeight
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
            <div id="homepageLayoutDiv">
                <div id="forumAndActiveGames">
                    <article id="communityForum">
                        <h2 className="setCustomFont">Public Forum</h2>
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
                        </section>
                        <section id="communityForumInterface">
                            <input id="communityForumInput"
                                type="text"
                                className="text-input"
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
                    <article key="activeGames" id="activeGamesArticle">
                        <section id="myActiveGames">
                            <h2 id="activeGamesHeader" className="setCustomFont">My Games</h2>
                            {/* <button id="homepagePlayButton">play</button> */}
                            <div id="myUnfinishedGamesScrollWindow">
                                <div id="activeGamesUl">
                                    {
                                        myUnfinishedGames?.map(ug => {
                                            // const opponent = ug.player_w?.id === localVillagerObj.userId ? ug.player_b : ug.player_w
                                            let tournament = {}
                                            if (ug.tournament) {
                                                tournament = tournaments.find(t => t.id === ug.tournament)
                                            }
                                            console.log(tournament)
                                            const opponent = ug.player_w?.id === localVillagerObj.userId ? players.find(p => p.id === ug.player_b?.id) : players.find(p => p.id === ug.player_w?.id)
                                            const isTournamentGame = () => {
                                                return ug.tournament ? "tournamentActiveGameListItem" : "activeGameListItem"
                                            }
                                            const isSelected = () => {
                                                return ug.id === selectedGame ? "selectedGameListItem" : "gameListItem"
                                            }
                                            if (opponent) {
                                                return (
                                                    <div key={ug.id} className={isTournamentGame()} id={isSelected()}>
                                                        <div><span id={ug.player_w.id === localVillagerObj.userId ? "whiteChallengeSpan" : "blackChallengeSpan"}>{ug.player_w?.id === localVillagerObj.userId ? "white" : "black"}</span></div>
                                                        <div className="activeGameInfo">
                                                            <div className="opponentSectionForListItem">vs {opponent.username}</div>
                                                            <div>{ug.tournament ? <img className="trophyIconHomepage" src={trophyIcon} /> : ""}</div>
                                                            <div className="myGamesListLogisticsInfo">
                                                                <div>{tournament?.title || ""}</div>
                                                                <div>{new Date(ug.date_time).toLocaleDateString('en-us')}</div>
                                                            </div>
                                                        </div>
                                                        <button className="challengeBtn buttonStyleApprove"
                                                            onClick={() => {
                                                                setSelectedGame(ug.id)
                                                                const gameObjForPlay = games.find(g => g.id === selectedGame)
                                                                updateSelectedGameObj(gameObjForPlay)
                                                                navigate("/play")
                                                            }}>select</button>
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            </div>
                        </section>
                    </article>
                </div>
                <div id="challengesAndPuzzles">
                    <div id="challengesArticle">
                        <div className="challengesBackground"></div>
                        <section id="createChallengeSection">
                            <h3 className="setCustomFont">create challenge</h3>
                            <div id="createChallengeDiv">
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
                            </div>
                            <button
                                className="buttonStyleAmbiguous"
                                onClick={() => {
                                    if (window.confirm("create open challenge?")) {
                                        sendNewGame(challengeForApi)
                                    }
                                }}>create</button>
                        </section>
                        <h2 className="setCustomFont">open challenges</h2>
                        {
                            challenges?.map(c => {
                                const challengingPlayer = c.player_w ? c.player_w : c.player_b
                                if (challengingPlayer.id !== localVillagerObj.userId) {
                                    return (
                                        <div key={c.id} className="challengeListItem">
                                            <div>
                                                {/* <div>Challenger:</div> */}
                                                <div className="openChallengerInfo">
                                                    Play <span id={c.player_w ? "blackChallengeSpan" : "whiteChallengeSpan"}>{c.player_w ? "black" : "white"}</span> vs <span id={c.player_w ? "whiteChallengeSpan" : "blackChallengeSpan"}>{challengingPlayer.username}</span>
                                                    <button className="challengeBtn buttonStyleAmbiguous"
                                                        onClick={() => {
                                                            const copy = { ...c }
                                                            c.player_w ? copy.player_b = localVillagerObj.userId : copy.player_w = localVillagerObj.userId
                                                            c.player_w ? copy.player_w = c.player_w.id : copy.player_b = c.player_b.id
                                                            copy.accepted = true
                                                            acceptChallenge(copy)
                                                                .then(() => resetGames())
                                                        }}>accept</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                    <div id="puzzlesArticle">
                        <div id="puzzleParamaters">
                            {/* <label id="puzzleLabel" htmlFor="puzzleRatingSelect">select puzzle rating</label> */}
                            <div id="puzzleSelectAndSubmit">
                                <select id="puzzleSelect" onChange={(e) => setSelectedRange(e.target.value)}>
                                    <option value={800}>select puzzle rating</option>
                                    <option value={800}>800</option>
                                    <option value={900}>900</option>
                                    <option value={1000}>1000</option>
                                    <option value={1100}>1100</option>
                                    <option value={1200}>1200</option>
                                    <option value={1300}>1300</option>
                                    <option value={1400}>1400</option>
                                    <option value={1500}>1500</option>
                                    <option value={1600}>1600</option>
                                    <option value={1700}>1700</option>
                                    <option value={1800}>1800</option>
                                    <option value={1900}>1900</option>
                                    <option value={2000}>2000</option>
                                    <option value={2100}>2100</option>
                                    <option value={2200}>2200</option>
                                </select>
                                <button id="submitPuzzleSelectionBtn" className="buttonStyleApprove">submit</button>
                            </div>
                        </div>
                        <div id="chessBoardContainer">
                            <Chessboard
                                id="chessboardHomepage"
                                position={displayedPuzzle?.fen}
                                arePiecesDraggable={false} />
                        </div>
                        <button className="buttonStyleReject">try this puzzle</button>
                    </div>
                </div>
            </div>


        </main>
    </>
}
