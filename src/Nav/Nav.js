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
    // const closeOpenMenus = (e) => {
    //     if (navMenu.current && !navMenu.current.contains(e.target)) {
    //         document.getElementById("active").checked = false
    //     }
    //     //why does adding the conditional work here??!!! this function now allows me to close the menu if and only if the user clicks outside of the menu or manually closes it with the icon
    //     if (!navMenu.current && document.getElementById("active")) {
    //         if (document.getElementById("active").contains(e.target)) {
    //             document.getElementById("active").checked = false
    //         }
    //     }
    // }
    // document.addEventListener(`click`, closeOpenMenus)
    // useEffect(
    //     () => {
    //     }, []
    // )
    // const msgNotification = () => {
    //     if (unread !== 0) {
    //         return <>
    //             <div id="newMsgCount">{unread}</div>
    //         </>
    //     }
    // }
    // return (
    //     <header className="navigation">
    //         <div id="logoSpace">
    //             <Link className="navigation__icon" to="/">
    //                 <h1 id="navName" className="navigation__name">Villager Chess</h1>
    //             </Link>
    //         </div>
    //         <div id="navbarRightSide">
    //             <div id="profileIconAndHamburger">
    //                 <Link className="profileLink" to="/profile" onClick={
    //                     () => {
    //                         // document.getElementById("active").replace("active", "inactive")
    //                         document.getElementById("active").checked = false
    //                     }
    //                 }>{/*<img className="invert" src={profileIcon} />*/}Profile</Link>
    //             </div>
    //             <div id="linkContainer">
    //                 <div ref={navMenu}>
    //                     <input type="checkbox" id="active" />
    //                     <label htmlFor="active" className="menu-btn"><span></span></label>
    //                     <label htmlFor="inactive" className="close"></label>
    //                     <div id="menuWrapper" className="wrapper">
    //                         <ul>
    //                             <li className="navListItem"><Link className="navigation_link" to="/play" onClick={
    //                                 () => {
    //                                     document.getElementById("active").checked = false
    //                                 }
    //                             }>Play</Link></li>
    //                             <li className="navListItem"><Link className="navigation_link" to="/messages" onClick={
    //                                 () => {
    //                                     document.getElementById("active").checked = false
    //                                 }
    //                             }>Messages </Link></li>
    //                             <li className="navListItem"><Link className="navigation_link" to="/tournament" onClick={
    //                                 () => {
    //                                     document.getElementById("active").checked = false
    //                                 }
    //                             }>Tournaments</Link></li>
    //                             <li className="navListItem"><Link className="navigation_link" to="/userList" onClick={
    //                                 () => {
    //                                     document.getElementById("active").checked = false
    //                                 }
    //                             }>Make Friends</Link></li>
    //                             {/* <li className="navListItem"><Link className="navigation_link" to="/addCourse" onClick={
    //                                 () => {
    //                                     document.getElementById("active").checked = false
    //                                 }
    //                             }>Create Challenge</Link></li> */}
    //                             <li className="navListItem"><Link className="navigation_logout" to="" onClick={() => {
    //                                 localStorage.removeItem("villager")
    //                                     navigate("/", { replace: true })
    //                             }}>Logout</Link>
    //                             </li>
    //                         </ul>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     </header>
    // )
    return (
        <header className="navigation" id="navMenu">
            <div id="logo">
                <Link className="logo__icon" to="/">
                    <h1 id="/" className="navigation__name">Villager Chess</h1>
                </Link>
            </div>
            <div id="navList">
            <input type="checkbox" id="active" />
                <label htmlFor="active" className="menu-btn"><span></span></label>
                <label htmlFor="inactive" className="close"></label>
                {/* <div id="navLinksList"> */}
                    <ul id="navLinks">
                        <li className="tempListItem"><Link id="/profile" className="profileLink" to="/profile" >Profile</Link></li>
                        <li className="tempListItem"><Link id="/play" className="navigation_link" to="/play" >Play</Link></li>
                        <li className="tempListItem"><Link id="/messages" className="navigation_link" to="/messages" >Messages </Link></li>
                        <li className="tempListItem"><Link id="/tournament" className="navigation_link" to="/tournament">Tournaments</Link></li>
                        <li className="tempListItem"><Link id="/userList" className="navigation_link" to="/userList" >Make Friends</Link></li>
                        <li className="tempListItem"><Link id="logout" className="navigation_logout" to="" onClick={() => {
                            localStorage.removeItem("villager")
                            navigate("/", { replace: true })
                        }}>Logout</Link>
                        </li>
                    </ul>
                {/* </div> */}
            </div>
        </header>
    )
}