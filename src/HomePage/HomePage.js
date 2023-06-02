import "./HomePage.css"

import { React, useContext, useState, useEffect } from "react"
import { getAllCommunityPosts, getAllPlayers, getAllTournaments } from "../ServerManager"

export const HomePage = () => {
    const [players, setPlayers] = useState([])
    const [communityPosts, setCommunityPosts] = useState([])
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

    return <>
        <main id="homepageContainer">
            <h1>Homepage</h1>
            <article key="communityForum">
                <h2>community posts</h2>
                <section id="communityForumMsgs" >
                    {
                        communityPosts.map(post => {
                            return (
                                <li key={post.id} className="communityPost">
                                    <h3>
                                        {post.poster.full_name}
                                    </h3>
                                    {post.message}</li>
                            )
                        })
                    }
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
                                                <div>
                                                    Round {game.tournament_round}
                                                    <div>
                                                        <li>white - {game.player_w.full_name}</li>
                                                        <li>black - {game.player_b.full_name}</li>
                                                    </div>
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
