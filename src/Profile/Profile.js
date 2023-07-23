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
    const { selectedGame, setSelectedGame, setReview, players } = useContext(PlayContext)
    const [profileInfo, setProfileInfo] = useState({
        username: "",
        first_name: "",
        last_name: "",
        password: "",
        email: ""
    })
    const [myTournaments, setMyTournaments] = useState({})
    // const [messages, setMessages] = useState([])
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
        // password: "",
        email: ""
    })
    const [passwordVisible, setPasswordVisible] = useState(false)
    useEffect(
        () => {
            Promise.all([/*getAllMessages(), */getProfile(), getMyGames(), getMyTournaments()]).then(([/*messageData, */profileData, myGameData, tournamentData]) => {
                // setMessages(messageData)
                setProfileInfo(profileData)
                setUpdate(profileData)
                setMyGames(myGameData)
                setMyTournaments(tournamentData)
            })
        }, []
    )
    // console.log(update)
    useEffect(
        () => {
            const gamesIWon = myGames.filter(g => g.winner?.id === localVillagerObj.userId).length
            const losses = myGames.filter(g => g.winner !== null && g.winner.id !== localVillagerObj.userId).length
            const draws = myGames.filter(g => g.win_style === "draw").length
            const completedGames = gamesIWon + losses + draws
            setPerformanceData({
                wins: gamesIWon,
                winPercent: Math.round((gamesIWon / completedGames) * 100),
                losses: losses,
                lossPercent: Math.round((losses / completedGames) * 100),
                draws: draws,
                drawPercent: Math.round((draws / completedGames) * 100)
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
                <button className="cancelProfileEditButton buttonStyleReject" onClick={
                    () => {
                        setPasswordVisible(false)
                    }
                }>hide password</button>
            </>
        }
        else {
            return <>
                <button className="cancelProfileEditButton buttonStyleApprove" onClick={
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
                    <input className="editProfileInput text-input" type="text" value={update.first_name} onChange={
                        (evt) => {
                            const copy = { ...profileInfo }
                            copy.first_name = evt.target.value
                            setUpdate(copy)
                        }
                    }></input>
                    <label className="editProfileInputLabel" htmlFor="last_name">last name</label>
                    <input className="editProfileInput text-input" type="text" value={update.last_name} onChange={
                        (evt) => {
                            const copy = { ...profileInfo }
                            copy.last_name = evt.target.value
                            setUpdate(copy)
                        }
                    }></input>
                    <label className="editProfileInputLabel" htmlFor="username">username</label>
                    <input className="editProfileInput text-input" type="text" value={update.username} onChange={
                        (evt) => {
                            const copy = { ...profileInfo }
                            copy.username = evt.target.value
                            setUpdate(copy)
                        }
                    }></input>
                    <label className="editProfileInputLabel" htmlFor="email">email</label>
                    <input className="editProfileInput text-input" type="text" value={update.email} onChange={
                        (evt) => {
                            const copy = { ...profileInfo }
                            copy.email = evt.target.value
                            setUpdate(copy)
                        }
                    }></input>
                    <label className="editProfileInputLabel" htmlFor="password">set new password (don't forget it!)</label>
                    <input className="editProfileInput text-input" type={showPassword(passwordVisible)} onChange={
                        (evt) => {
                            const copy = { ...profileInfo }
                            copy.password = evt.target.value
                            setUpdate(copy)
                        }
                    }></input>
                    <div id="submitCancelProfileChanges">
                        <button type="submit" className="cancelProfileEditButton buttonStyleApprove" onClick={
                            () => {
                                updateProfile(update, localVillagerObj.userId)
                                setProfileEdit(false)
                                getProfile().then(data => setProfileInfo(data))
                            }
                        }>submit</button>
                        <button className="cancelProfileEditButton buttonStyleReject" onClick={
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
                    <div className="staticProfileInfo">{profileInfo.full_name}</div>
                    <div className="staticProfileInfo">{profileInfo.username}</div>
                    <div className="staticProfileInfo">{profileInfo.email}</div>
                </div>
            )
        }
    }
    return <>
        <main id="profileContainer">
            <article id="profileCard">
                <h2 id="profileHead" className="setCustomFont">Profile</h2>
                <section id="profileInfoAndEdit" className="setCustomFont">
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
                    {/* <section id="profileFriendContainer">
                        <h4>friends</h4>
                        {
                            profileInfo.friends?.map(f => {
                                return (
                                    <li className="profileUserListItem" key={f.id}>
                                        {f.full_name}
                                    </li>
                                )
                            })
                        }
                    </section> */}
                </div>
                <section id="'profilePastGames">
                    <h2 className="setCustomFont profileHeader">Past Games</h2>
                    {
                        myGames.map(game => {
                            const opponent = game.player_w?.id === localVillagerObj.userId ? players.find(p => p.id === game.player_b?.id) : players.find(p => p.id === game.player_w?.id)
                            if (game.pgn !== "" && game.pgn !== null && game.winner !== null) {
                                let tournament = {}
                                if (game.tournament) {
                                    tournament = myTournaments.find(t => t.id === game.tournament)
                                    
                                }
                                const classNameBuilder = () => {
                                    return game.tournament ? "tournamentPastGameListItem" : "pastGameListItem"
                                }
                                return (
                                    <div key={game.id} className={classNameBuilder()}>
                                        <div><span id={game.player_w.id === localVillagerObj.userId ? "whiteChallengeSpan" : "blackChallengeSpan"}>{game.player_w?.id === localVillagerObj.userId ? "white" : "black"}</span></div>
                                        <div className="activeGameInfo">
                                            <div className="opponentSectionForListItem">Vs {opponent?.username}</div>
                                            <div className="mobileTournamentDiv">
                                                <div>{game.tournament ? <img className="trophyIconProfile" src={trophyIcon} /> : ""}</div>
                                                <div className="myGamesListLogisticsInfo">
                                                    <div>{tournament?.title || ""}</div>
                                                    <div>{new Date(game.date_time).toLocaleDateString('en-us')}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            id="reviewBtn"
                                            className="buttonStyleApprove"
                                            onClick={() => {
                                                setReview(true)
                                                setSelectedGame(game.id)
                                                navigate("/play")
                                            }}>Review </button>
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