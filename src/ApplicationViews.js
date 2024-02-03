import { Outlet, Route, Routes } from "react-router-dom"
import { HomePage } from "./HomePage/HomePage"
import { UserList } from "./UserList/UserList"
import { Play } from "./Play/Play"
import { Profile } from "./Profile/Profile"
import { Messages } from "./Messages/Messages"
import { Tournament } from "./Tournament/Tournament"
import { TournamentProvider } from "./Tournament/components/TournamentProvider"
import { PlayProvider } from "./Play/PlayProvider"
import { ChessClubs } from "./ChessClubs/ChessClubs"


export const ApplicationViews = () => {
    return (
        <Routes>
            <Route path="/" element={
                <>
                    <Outlet />
                </>
            }>
                <Route path="" element={
                    <PlayProvider>
                        <HomePage />
                    </PlayProvider>
                } />
                {/* <Route path="userList" element={<UserList />} /> */}
                <Route path="play" element={
                    <PlayProvider>
                        <Play />
                    </PlayProvider>
                } />

                <Route path="profile" element={
                    <PlayProvider>
                        <Profile />
                    </PlayProvider>
                } />
                <Route path="messages" element={<Messages />} />
                <Route path="tournament" element={
                    <TournamentProvider>
                        <Tournament />
                    </TournamentProvider>
                } />
                <Route path="clubs" element={<ChessClubs />} />
            </Route>
        </Routes>
    )
}