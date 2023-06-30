import React, { useState, useRef } from "react"
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"
import "./Auth.css"
import { loginUser } from "../ServerManager";
import graffiti from "../images/villager_graffiti.png"
import skellyHand from "../images/Copy of The Villager Skull Hand.png"
export const Login = () => {
    const username = useRef()
    const password = useRef()
    const invalidDialog = useRef()
    const navigate = useNavigate()

    const handleLogin = (e) => {
        e.preventDefault()

        const user = {
            username: username.current.value,
            password: password.current.value
        }
        loginUser(user)
            .then(res => {
                if ("valid" in res && res.valid && "token" in res) {
                    localStorage.setItem("villager", JSON.stringify(res))
                    navigate("/")
                }
                else {
                    invalidDialog.current.showModal()
                }
            })
    }

    return (
        <main className="container--login">
            <dialog className="dialog dialog--auth" ref={invalidDialog}>
                <div>Username or password was not valid.</div>
                <button className="button--close" onClick={e => invalidDialog.current.close()}>Close</button>
            </dialog>
            <img id="skellyHand" src={skellyHand}></img>
            <section id="loginBox">
                <form className="form--login" onSubmit={handleLogin}>
                    {/* <div id="loginLogo">
                        <h1>Villager Chess</h1>
                    </div> */}
                    {/* <img id="graffiti_logo" src={graffiti}></img> */}
                    {/* <img id="skellyHand" src={skellyHand}></img> */}
                    <fieldset id="centerItems">
                        <label className="loginLabels" htmlFor="inputUsername">Username</label>
                        <input type="username"
                            ref={username}
                            className="form-control"
                            placeholder="username"
                            required autoFocus />
                        <label className="loginLabels" htmlFor="inputPassword"> Password </label>
                        <input type="password"
                            ref={password}
                            className="form-control"
                            placeholder="password"
                            required autoFocus />
                        <button className="signInButton" type="submit">
                            Sign in
                        </button>
                        <section>
                            <Link className="link--register" to="/register">Not a member yet?</Link>
                        </section>
                    </fieldset>
                </form>
            </section>
        </main>
    )
}