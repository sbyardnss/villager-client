import "./HomePage.css"

import { React, useContext, useState, useEffect } from "react"
import { Chessboard } from "react-chessboard"
export const HomePage = () => {
    return <>
        <main id="homepageContainer">
            <section>
                <Chessboard></Chessboard>
            </section>
        </main>
    </>
}