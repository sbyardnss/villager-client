import "./Nav.css"

// export const Nav = () => {

//     return <>
//         <div className="nav">
//             <input type="checkbox" />
//                 <span></span>
//                 <span></span>
//                 <div className="menu">
//                     <li><a href="#">home</a></li>
//                     <li><a href="#">about</a></li>
//                     <li><a href="#">cursos</a></li>
//                     <li><a href="#">blog</a></li>
//                     <li><a href="#">contactos</a></li>
//                 </div>
//         </div>
//     </>
// }
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useContext, useEffect, useRef, useState } from "react"
import "./Nav.css"


export const Nav = () => {
    const navMenu = useRef(null)
    const [unread, setUnread] = useState(0)
    const navigate = useNavigate()
    //close open menu
    const closeOpenMenus = (e) => {
        if (navMenu.current && !navMenu.current.contains(e.target)) {
            document.getElementById("active").checked = false
        }
        //why does adding the conditional work here??!!! this function now allows me to close the menu if and only if the user clicks outside of the menu or manually closes it with the icon
        if (!navMenu.current && document.getElementById("active")) {
            if (document.getElementById("active").contains(e.target)) {
                document.getElementById("active").checked = false
            }
        }
    }
    const closeMenuAction = () => {
        document.getElementById("active").checked = false
    }
    document.addEventListener(`click`, closeOpenMenus)

    // const msgNotification = () => {
    //     if (unread !== 0) {
    //         return <>
    //             <div id="newMsgCount">{unread}</div>
    //         </>
    //     }
    // }

    return (
        <header className="navigation" id="navMenu">
            <div id="logo">
                <Link className="logo__icon" to="/">
                    <h1 id="/" className="navigation__name">Villager Chess</h1>
                </Link>
            </div>
            <div id="navList" ref={(navMenu)}>
                <input type="checkbox" id="active" />
                <label htmlFor="active" className="menu-btn"><span></span></label>
                <label htmlFor="inactive" className="close"></label>
                <ul id="navLinks">
                    <li className="tempListItem"><Link id="/profile" className="profileLink" to="/profile" onClick={closeMenuAction}>Profile</Link></li>
                    <li className="tempListItem"><Link id="/play" className="navigation_link" to="/play" onClick={closeMenuAction}>Play</Link></li>
                    <li className="tempListItem"><Link id="/messages" className="navigation_link" to="/messages" onClick={closeMenuAction}>Messages </Link></li>
                    <li className="tempListItem"><Link id="/tournament" className="navigation_link" to="/tournament" onClick={closeMenuAction}>Tournaments</Link></li>
                    <li className="tempListItem"><Link id="/userList" className="navigation_link" to="/userList" onClick={closeMenuAction}>Make Friends</Link></li>
                    <li className="tempListItem"><Link id="logout" className="navigation_logout" to="" onClick={() => {
                        localStorage.removeItem("villager")
                        navigate("/", { replace: true })
                    }}>Logout</Link>
                    </li>
                </ul>
            </div>
        </header>
    )
}