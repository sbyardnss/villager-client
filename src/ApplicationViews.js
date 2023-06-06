import { Outlet, Route, Routes } from "react-router-dom"
import { HomePage } from "./HomePage/HomePage"
import { UserList } from "./UserList/UserList"
import { Play } from "./Play/Play"
import { Profile } from "./Profile/Profile"
import { Messages } from "./Messages/Messages"
import { Tournament } from "./Tournament/Tournament"
import { TournamentProvider } from "./Tournament/TournamentProvider"
export const ApplicationViews = () => {
    return (
        <Routes>
            <Route path="/" element={
                <>
                    <Outlet />
                </>
            }>
                <Route path="" element={<HomePage />} />
                <Route path="userList" element={<UserList />} />
                <Route path="play" element={<Play />} />
                <Route path="profile" element={<Profile />} />
                <Route path="messages" element={<Messages />} />

                <Route path="tournament" element={
                    <TournamentProvider>
                        <Tournament />
                    </TournamentProvider>
                } />
            </Route>
        </Routes>
    )
}