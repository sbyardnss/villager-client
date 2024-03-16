import { useRef } from "react"
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"
import "./Auth.css"
import { loginUser } from "../ServerManager";
// import graffiti from "../images/villager_graffiti.png"
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
            {/* this may be causing the error that franks phone was having on login */}
            <dialog className="dialog dialog--auth" ref={invalidDialog}>
                <div>Username or password was not valid.</div>
                <button className="button--close" onClick={e => invalidDialog.current.close()}>Close</button>
            </dialog>

            <section id="loginBox">
                <form className="form--login" onSubmit={handleLogin}>
                    <h1>{window.innerWidth > 630 ? "ONLY STYLED FOR MOBILE BEYOND THIS POINT": ""}</h1> 
            <img id="skellyHand" src={skellyHand} alt="skeleton_hand"></img>
            {/* <h4>currently down for maintenance</h4>
                    <h4>will be back up Wednesday 7/19</h4> */}
                    <fieldset id="centerItems">
                        <label className="loginLabels" htmlFor="inputUsername">Username</label>
                        <input type="username"
                            ref={username}
                            className="login-form-control"
                            placeholder="username"
                            required autoFocus />
                        <label className="loginLabels" htmlFor="inputPassword"> Password </label>
                        <input type="password"
                            ref={password}
                            className="login-form-control"
                            placeholder="password"
                            required autoFocus />
                        <button className="signInButton" type="submit">
                            Sign in
                        </button>
                    </fieldset>
                            <Link className="link--register" to="/register">Not a member yet?</Link>
                </form>
            </section>
        </main>
    )
}