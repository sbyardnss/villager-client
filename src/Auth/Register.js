import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Auth.css"

export const Register = (props) => {
    const apiKey = process.env.REACT_APP_API;
    const [user, setUser] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: ""
    })
    let navigate = useNavigate()
    const registerNewUser = () => {
        return fetch(`${apiKey}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    window.alert("Account with that email address already exists")
                }
                else {
                    if (res.hasOwnProperty("userId")) {
                        localStorage.setItem("villager", JSON.stringify({
                            userId: res.userId,
                            token: res.token,
                            valid: res.valid
                        }))
                        navigate("/")
                    }
                }
            })
            // .then(createdUser => {
            //     if (createdUser.hasOwnProperty("userId")) {
            //         localStorage.setItem("villager", JSON.stringify({
            //             userId: createdUser.userId,
            //             token: createdUser.token,
            //             valid: createdUser.valid
            //         }))
            //         navigate("/")
            //     }
            // })
    }
    const handleRegister = (e) => {
        e.preventDefault()
        // return fetch(`${apiKey}/players?email=${user.email}`
        // // return fetch(`${apiKey}/players/check_player_registered?email=${user.email}`
        // )
        //     .then(res => res.json())
        //     .then(response => {
        //         if (response.length > 0) {
        //             // Duplicate email. No good.
        //             window.alert("Account with that email address already exists")
        //         }
        //         else {
        //             // Good email, create user.
        //             registerNewUser()
        //         }
        //     })
        registerNewUser()
    }
    const updateUser = (evt) => {
        const copy = { ...user }
        copy[evt.target.id] = evt.target.value
        setUser(copy)
    }
    return (
        <main id="registerContainer" style={{ textAlign: "center" }}>
            <form className="form--login" onSubmit={handleRegister}>
                <h3 className="h3 mb-3 font-weight-normal">Please Register for LinkUp</h3>
                <fieldset className="registerFieldset">
                    <label className="loginLabels" htmlFor="first_name"> First name </label>
                    <input onChange={updateUser}
                        type="text" id="first_name" className="form-control"
                        placeholder="Enter your first name" required autoFocus />
                </fieldset>
                <fieldset className="registerFieldset">
                    <label className="loginLabels" htmlFor="last_name"> Last name </label>
                    <input onChange={updateUser}
                        type="text" id="last_name" className="form-control"
                        placeholder="Enter your last name" required autoFocus />
                </fieldset>
                <fieldset className="registerFieldset">
                    <label className="loginLabels" htmlFor="username"> Username </label>
                    <input onChange={updateUser}
                        type="text" id="username" className="form-control"
                        placeholder="Enter username" required autoFocus />
                </fieldset>
                <fieldset className="registerFieldset">
                    <label className="loginLabels" htmlFor="email"> Email address </label>
                    <input onChange={updateUser}
                        type="email" id="email" className="form-control"
                        placeholder="Email address" required />
                </fieldset>
                <fieldset className="registerFieldset">
                    <label className="loginLabels" htmlFor="email"> Password </label>
                    <input onChange={updateUser}
                        type="password" id="password" className="form-control"
                        placeholder="Password" required />
                </fieldset>
                <fieldset className="buttonFieldset">
                    <button className="signInButton" type="submit"> Register </button>
                    <button className="cancelRegister" onClick={
                        () => {
                            navigate("/login/")
                        }
                    }>Cancel</button>
                </fieldset>
            </form>
        </main>
    )
}