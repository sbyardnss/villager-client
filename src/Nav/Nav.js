import "./Nav.css"

import { Link, Navigate, useNavigate } from "react-router-dom"
import { useContext, useEffect, useRef, useState } from "react"
import "./Nav.css"
import graffiti from "../images/villager_graffiti.png"

export const Nav = () => {
    const navMenu = useRef(null)
    const [unread, setUnread] = useState(0)
    const navigate = useNavigate()
    //close open menu
    // const closeOpenMenus = (e) => {
    //     if (navMenu.current && !navMenu.current.contains(e.target)) {
    //         document.getElementById("active").checked = false
    //     }
    //     //why does adding the conditional work here??!!! this function now allows me to close the menu if and only if the user clicks outside of the menu or manually closes it with the icon
    //     if (!navMenu.current && document?.getElementById("active")) {
    //         if (document.getElementById("active").contains(e.target)) {
    //             document.getElementById("active").checked = false
    //         }
    //     }
    // }
    // const closeMenuAction = () => {
    //     document.getElementById("active").checked = false
    // }
    // document.addEventListener(`click`, closeOpenMenus)

    // const msgNotification = () => {
    //     if (unread !== 0) {
    //         return <>
    //             <div id="newMsgCount">{unread}</div>
    //         </>
    //     }
    // }
    const check = (e) => {
        if (e.target.checked === true) {
            // document.getElementById(e.target.id).checked = false
            return false
        }
        else {
            // document.getElementById(e.target.id).checked = true
            return true
        }
    }
    const closeMenuOnNavigate = () => {
        document.getElementById("active").checked = false
    }
    return (
        <header className="navigation" id="navMenu">
            <div id="logo">
                <Link className="logo__icon" to="/">
                    <h1 id="/" className="navigation__name">Villager Chess</h1>
                    {/* <img id="graffiti_logo" src={graffiti}></img> */}
                </Link>
            </div>
            {/* <div id="navList" ref={(navMenu)}> */}
            <div id="navList" >
                <input type="checkbox" id="active" onClick={()=> check}/>
                <label htmlFor="active" className="menu-btn" ><span></span></label>
                <label htmlFor="inactive" className="close"></label>
                <ul id="navLinks">
                    <div className="navDiv">
                        <li className="tempListItem"><Link id="/profile" className="profileLink" to="/profile" onClick={() => closeMenuOnNavigate()}>Profile</Link></li>
                        <li className="tempListItem"><Link id="/play" className="navigation_link" to="/play" onClick={() => closeMenuOnNavigate()}>Play</Link></li>
                    </div>
                    <div className="navDiv">
                        <li className="tempListItem"><Link id="/messages" className="navigation_link" to="/messages" onClick={() => closeMenuOnNavigate()}>Messages </Link></li>
                        <li className="tempListItem"><Link id="/tournament" className="navigation_link" to="/tournament" onClick={() => closeMenuOnNavigate()}>Tournaments</Link></li>
                    </div>
                    <div className="navDiv">
                        <li className="tempListItem"><Link id="/userList" className="navigation_link" to="/userList" onClick={() => closeMenuOnNavigate()}>Make Friends</Link></li>
                        <li className="tempListItem"><Link id="logout" className="navigation_logout" to="" onClick={() => {
                            localStorage.removeItem("villager")
                            navigate("/", { replace: true })
                        }}>Logout</Link>
                        </li>
                    </div>
                </ul>
            </div>
        </header>
    )
}