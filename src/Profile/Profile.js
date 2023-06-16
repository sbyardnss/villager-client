import { React, useContext, useState, useEffect } from "react"
import { getProfile, getAllMessages, updateProfile, getMyGames, getTournament, getMyTournaments } from "../ServerManager"
import "./Profile.css"
import { PlayContext } from "../Play/PlayProvider"
import { useNavigate } from "react-router-dom"

export const Profile = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const navigate = useNavigate()
    const { selectedGame, setSelectedGame, selectedGameObj, orientation, setOrientation, resetGames, setReview, review } = useContext(PlayContext)
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
            if (selectedGame !== 0) {
                navigate("/play")
            }
        }, [selectedGame]
    )
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
            return null
        }
    }
    return <>
        <main id="profileContainer">
            <article>
                Profile
                <section id="profileInfo">
                    {updateProfileSection()}
                    <button className="editProfileButton" onClick={
                        () => {
                            setProfileEdit(true)
                        }
                    }>Edit</button>
                </section>
                <section id="profileFriendContainer">
                    <h4>friends</h4>
                    {
                        profileInfo.friends?.map(f => {
                            const unreadMsgsFromPlayer = messages.find(msg => msg.sender === f.id && msg.read === false)
                            if (unreadMsgsFromPlayer) {
                                return (
                                    <li className="profileUserListItem" key={f.id}>
                                        <div>
                                            {f.full_name}
                                        </div>
                                        <h5>new messages!</h5>
                                    </li>
                                )
                            }
                            else {
                                return (
                                    <li className="profileUserListItem" key={f.id}>
                                        {f.full_name}
                                    </li>
                                )
                            }
                        })
                    }
                </section>
                <section id="'profilePastGames">
                    {
                        myGames.map(game => {
                            const opponent = game.player_w?.id === localVillagerObj.userId ? game.player_b : game.player_w
                            const color = game.player_w?.id === localVillagerObj.userId ? "white" : "black"
                            const opponentColor = game.player_w?.id === localVillagerObj.userId ? "black" : "white"
                            const tournamentInfo = () => {
                                if (game.tournament) {
                                    const gameTournament = myTournaments.find(t => t.id === game.tournament)
                                    console.log(gameTournament)
                                    return (
                                        <div>{gameTournament.title}</div>
                                    )
                                }
                            }
                            
                            if (game.pgn !== "" && game.pgn !== null && game.winner !== null) {
                                return (
                                    <div key={game.id}>
                                        <div>{new Date(game.date_time).toLocaleDateString('en-us')}</div>
                                        <div>{opponent.full_name} -- {opponentColor}</div>
                                        <div>Playing as {color}</div>
                                        {tournamentInfo()}
                                        <button onClick={() => {
                                            setReview(true)
                                            setSelectedGame(game.id)
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