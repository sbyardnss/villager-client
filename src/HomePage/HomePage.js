import "./HomePage.css"

import { React, useContext, useState, useEffect } from "react"
import { Chessboard } from "react-chessboard"
import Chess from "chess.js"

export const HomePage = () => {
    return <>
        <h2>Homepage</h2>
        <section>
            <h3>community posts</h3>
        </section>
        <section>
            <h4>open challenges</h4>
        </section>
        <section>
            <h4>active tournaments</h4>
        </section>
    </>
}
