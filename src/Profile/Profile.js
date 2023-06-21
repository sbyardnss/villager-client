import { React, useContext, useState, useEffect } from "react"
import { getProfile, getAllMessages, updateProfile, getMyGames, getTournament, getMyTournaments } from "../ServerManager"
import "./Profile.css"
import { PlayContext } from "../Play/PlayProvider"
import { useNavigate } from "react-router-dom"
import trophyIcon from "../images/small_trophy_with_background.png"

export const Profile = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const navigate = useNavigate()
    const { selectedGame, setSelectedGame, updateSelectedGameObj, selectedGameObj, orientation, setOrientation, resetGames, setReview, review, players } = useContext(PlayContext)
    const [profileInfo, setProfileInfo] = useState({
        username: "",
        first_name: "",
        last_name: "",
        password: "",
        email: ""
    })
    const [myTournaments, setMyTournaments] = useState({})
    const [messages, setMessages] = useState([])
    const [myGames, setMyGames] = useState([])
    const [profileEdit, setProfileEdit] = useState(false)
    const [performanceData, setPerformanceData] = useState({
        wins: 0,
        winPercent: 0.0,
        losses: 0,
        lossPercent: 0.0,
        draws: 0,
        drawPercent: 0.0

    })
    const [update, setUpdate] = useState({
        username: "",
        first_name: "",
        last_name: "",
        password: "",
        email: ""
    })
    const [passwordVisible, setPasswordVisible] = useState(false)
    useEffect(
        () => {
            Promise.all([getAllMessages(), getProfile(), getMyGames(), getMyTournaments()]).then(([messageData, profileData, myGameData, tournamentData]) => {
                setMessages(messageData)
                setProfileInfo(profileData)
                setUpdate(profileData)
                setMyGames(myGameData)
                setMyTournaments(tournamentData)
            })
        }, []
    )
    useEffect(
        () => {
            const gamesIWon = myGames.filter(g => g.winner?.id === localVillagerObj.userId).length
            const losses = myGames.filter(g => g.winner !== null && g.winner.id !== localVillagerObj.userId).length
            const draws = myGames.filter(g => g.win_style === "draw").length
            const completedGames = myGames.filter(g => g.winner !== null).length
            setPerformanceData({
                wins: gamesIWon,
                winPercent: (completedGames / gamesIWon) * 100,
                losses: losses,
                lossPercent: (completedGames / losses) * 100,
                draws: draws,
                drawPercent: (completedGames / draws) * 100
            })
        }, [myGames]
    )
    // useEffect(
    //     () => {
    //         if (review === true) {
    //             navigate("/play")
    //         }
    //     },[selectedGameObj]
    // )
    const showPassword = (passwordVisible) => {
        if (passwordVisible === true) {
            return "text"
        }
        else {
            return "password"
        }
    }
    const showPasswordButtons = () => {
        if (passwordVisible === true) {
            return <>
                <button className="cancelProfileEditButton" onClick={
                    () => {
                        setPasswordVisible(false)
                    }
                }>hide password</button>
            </>
        }
        else {
            return <>
                <button className="cancelProfileEditButton" onClick={
                    () => {
                        setPasswordVisible(true)
                    }
                }>show password</button>
            </>
        }
    }
    const updateProfileSection = () => {
        if (profileEdit) {
            return <>
                <section id="updateProfileSection">
                    <h4>update profile</h4>
                    <label className="editProfileInputLabel" htmlFor="first_name">first name</label>
                    <input className="editProfileInput" type="text" value={update.first_name} onChange={
                        (evt) => {
                            const copy = { ...profileInfo }
                            copy.first_name = evt.target.value
                            setUpdate(copy)
                        }
                    }></input>
                    <label className="editProfileInputLabel" htmlFor="last_name">last name</label>
                    <input className="editProfileInput" type="text" value={update.last_name} onChange={
                        (evt) => {
                            const copy = { ...profileInfo }
                            copy.last_name = evt.target.value
                            setUpdate(copy)
                        }
                    }></input>
                    <label className="editProfileInputLabel" htmlFor="username">username</label>
                    <input className="editProfileInput" type="text" value={update.username} onChange={
                        (evt) => {
                            const copy = { ...profileInfo }
                            copy.username = evt.target.value
                            setUpdate(copy)
                        }
                    }></input>
                    <label className="editProfileInputLabel" htmlFor="email">email</label>
                    <input className="editProfileInput" type="text" value={update.email} onChange={
                        (evt) => {
                            const copy = { ...profileInfo }
                            copy.email = evt.target.value
                            setUpdate(copy)
                        }
                    }></input>
                    <label className="editProfileInputLabel" htmlFor="password">password</label>
                    <input className="editProfileInput" type={showPassword(passwordVisible)} value={update.password} onChange={
                        (evt) => {
                            const copy = { ...profileInfo }
                            copy.password = evt.target.value
                            setUpdate(copy)
                        }
                    }></input>
                    <div id="submitCancelProfileChanges">
                        <button type="submit" className="cancelProfileEditButton" onClick={
                            () => {
                                updateProfile(update, localVillagerObj.userId)
                                setProfileEdit(false)
                                getProfile().then(data => setProfileInfo(data))
                            }
                        }>submit</button>
                        <button className="cancelProfileEditButton" onClick={
                            () => {
                                setProfileEdit(false)
                                setUpdate({})
                            }
                        }>cancel</button>
                        {showPasswordButtons()}
                    </div>
                </section>
            </>
        }
        else {
            return (
                <div id="profileInfo">
                    <div>{profileInfo.full_name}</div>
                    <div>{profileInfo.username}</div>
                    <div>{profileInfo.email}</div>
                </div>
            )
        }
    }
    return <>
        <main id="profileContainer">
            <article>
                <h2 id="profileHead">Profile</h2>
                <section id="profileInfoAndEdit">

                    {updateProfileSection()}
                    <button className="editProfileButton" onClick={
                        () => {
                            setProfileEdit(true)
                        }
                    }>Edit</button>
                </section>
                <div id="profilePerformanceAndFriends">
                    <section id="profilePerformaceData">
                        <div>Won: {performanceData.wins}  ({performanceData.winPercent}%)</div>
                        <div>Lost: {performanceData.losses}  ({performanceData.losses === 0 ? 0 : performanceData.lossPercent}%)</div>
                        <div>Draw: {performanceData.draws}  ({performanceData.draws === 0 ? 0 : performanceData.drawPercent}%)</div>
                    </section>
                    <section id="profileFriendContainer">
                        <h4>friends</h4>
                        {
                            profileInfo.friends?.map(f => {
                                // const unreadMsgsFromPlayer = messages.find(msg => msg.sender === f.id && msg.read === false)
                                // if (unreadMsgsFromPlayer) {
                                //     return (
                                //         <li className="profileUserListItem" key={f.id}>
                                //             <div>
                                //                 {f.full_name}
                                //             </div>
                                //             <h5>new messages!</h5>
                                //         </li>
                                //     )
                                // }
                                // else {
                                return (
                                    <li className="profileUserListItem" key={f.id}>
                                        {f.full_name}
                                    </li>
                                )
                                // }
                            })
                        }
                    </section>
                </div>
                <section id="'profilePastGames">
                    {
                        myGames.map(game => {
                            const opponent = game.player_w?.id === localVillagerObj.userId ? players.find(p => p.id === game.player_b.id) : players.find(p => p.id === game.player_w.id)
                            // console.log(players)
                            // const color = game.player_w?.id === localVillagerObj.userId ? "white" : "black"
                            // const opponentColor = game.player_w?.id === localVillagerObj.userId ? "black" : "white"
                            // const tournamentInfo = () => {
                            //     if (game.tournament) {
                            //         const gameTournament = myTournaments.find(t => t.id === game.tournament)
                            //         return (
                            //             <div>{gameTournament.title}</div>
                            //         )
                            //     }
                            // }
                            if (game.pgn !== "" && game.pgn !== null && game.winner !== null) {
                                let tournament = {}
                                if (game.tournament) {
                                    tournament = getTournament(game.tournament)
                                }
                                const classNameBuilder = () => {
                                    return game.tournament ? "tournamentPastGameListItem" : "pastGameListItem"
                                }
                                return (
                                    // <div key={game.id} className={classNameBuilder()}>
                                    //     <div>{new Date(game.date_time).toLocaleDateString('en-us')}</div>
                                    //     <div>{opponent.username} -- {opponentColor}</div>
                                    //     <div>{game.tournament ? <img className="trophyIconProfile" src={trophyIcon} /> : ""}</div>
                                    //     <div>Playing as {color}</div>
                                    //     {tournamentInfo()}
                                    //     <div className="pastGamesListLogisticsInfo">
                                    //         <div>{tournament?.title || ""}</div>
                                    //         <div>{new Date(game.date_time).toLocaleDateString('en-us')}</div>
                                    //     </div>
                                    //     <button onClick={() => {
                                    //         setReview(true)
                                    //         setSelectedGame(game.id)
                                    //         const gameObjForPlay = myGames.find(g => g.id === selectedGame)
                                    //         updateSelectedGameObj(gameObjForPlay)
                                    //         navigate("/play")
                                    //     }}>Review Game</button>
                                    // </div>
                                    <div key={game.id} className={classNameBuilder()}>
                                        <div><span id={game.player_w.id === localVillagerObj.userId ? "whiteChallengeSpan" : "blackChallengeSpan"}>{game.player_w?.id === localVillagerObj.userId ? "white" : "black"}</span></div>
                                        <div className="activeGameInfo">
                                            <div className="opponentSectionForListItem">Vs {opponent?.username}</div>
                                            <div>{game.tournament ? <img className="trophyIconHomepage" src={trophyIcon} /> : ""}</div>
                                            <div className="myGamesListLogisticsInfo">
                                                <div>{tournament?.title || ""}</div>
                                                <div>{new Date(game.date_time).toLocaleDateString('en-us')}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => {
                                            setReview(true)
                                            setSelectedGame(game.id)
                                            // const gameObjForPlay = myGames.find(g => g.id === selectedGame)
                                            // updateSelectedGameObj(gameObjForPlay)
                                            // if (selectedGameObj === gameObjForPlay) {
                                            navigate("/play")
                                            // }
                                        }}>Review Game</button>
                                    </div>
                                )
                            }
                        })
                    }
                </section>
            </article>
        </main>
    </>
}