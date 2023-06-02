import "./HomePage.css"

import { React, useContext, useState, useEffect } from "react"
import { getAllCommunityPosts } from "../ServerManager"

export const HomePage = () => {
    const [communityPosts, setCommunityPosts] = useState([])
    useEffect(
        () => {
            getAllCommunityPosts().then(data => setCommunityPosts(data))
        }, []
    )

    return <>
        <main id="homepageContainer">
            <h2>Homepage</h2>
            <article>
                <h3>community posts</h3>
                <section id="communityForumMsgs">
                    {
                        communityPosts.map(post => {
                            return <>
                                {post.poster.full_name} {post.message}
                            </>
                        })
                    }
                </section>
            </article>
            <article>
                <h4>open challenges</h4>
            </article>
            <article>
                <h4>active tournaments</h4>
            </article>
        </main>
    </>
}
