import "./HomePage.css"

import { React, useContext, useState, useEffect } from "react"
import { deleteCommunityPost, getAllCommunityPosts, getAllPlayers, getAllTournaments, submitNewPostToAPI } from "../ServerManager"

export const HomePage = () => {
    const localVillager = localStorage.getItem("villager")
    const localVillagerObj = JSON.parse(localVillager)
    const [players, setPlayers] = useState([])
    const [communityPosts, setCommunityPosts] = useState([])
    const [newPost, updateNewPost] = useState({
        poster: localVillagerObj.userId,

    })
    const [tournaments, setTournaments] = useState([])
    useEffect(
        () => {
            // getAllCommunityPosts().then(data => setCommunityPosts(data))
            Promise.all([getAllPlayers(), getAllCommunityPosts(), getAllTournaments()]).then(([playerData, communityPostData, tournamentData]) => {
                setPlayers(playerData)
                setCommunityPosts(communityPostData)
                setTournaments(tournamentData)
            })
        }, []
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
                // getAllCommunityPosts().then(data => setCommunityPosts(data))
                resetCommunityPosts()
            })
        }
    }
    const handleDelete = id => {
        if (window.confirm("are you sure?")) {
            deleteCommunityPost(id)
                .then(() => {
                    // getAllCommunityPosts()
                    //     .then(data => setCommunityPosts(data))
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
                <h2>open challenges</h2>
            </article>
            <article key="activeTournaments">
                <h2>active tournaments</h2>
                <section id="activeTournaments">
                    {
                        tournaments.map(t => {
                            return (
                                <li key={t.id} className="activeTournamentListItem">
                                    <h3>{t.title}</h3>
                                    {
                                        t.games.map(game => {
                                            return (
                                                <div key={game.id}>
                                                    Round {game.tournament_round}
                                                    <ul>
                                                        <li key={game.player_w.id}>white - {game.player_w.full_name}</li>
                                                        <li key={game.player_b.id}>black - {game.player_b.full_name}</li>
                                                    </ul>
                                                </div>
                                            )
                                        })
                                    }
                                </li>
                            )
                        })
                    }
                </section>
            </article>
        </main>
    </>
}
