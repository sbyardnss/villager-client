import { Outlet, Route, Routes } from "react-router-dom"
// import { HomePage } from "./HomePage/HomePage"
// import { UserList } from "./UserList/UserList"
import { Play } from "./Play/Play"
import { Profile } from "./Profile/Profile"
import { Messages } from "./Messages/Messages"
import { Tournament } from "./Tournament/Tournament"
// import { TournamentProvider } from "./Tournament/components/TournamentProvider"
import { PlayProvider } from "./Play/PlayProvider"
// import { ChessClubs } from "./ChessClubs/ChessClubs"
import { ChessClubs } from "./modules/ChessClubs/ChessClubs"
import { TournamentProvider } from "./modules/Tournaments/controllers/TournamentProvider";
import { AppProvider } from "./Context/AppProvider";
import { HomePage } from "./components/HomePage";

export const ApplicationViews = () => {
    // return (
    //     <Routes>
    //         <Route path="/" element={
    //             <>
    //                 <Outlet />
    //             </>
    //         }>
    //             <Route path="" element={
    //                 <PlayProvider>
    //                     <HomePage />
    //                 </PlayProvider>
    //             } />
    //             {/* <Route path="userList" element={<UserList />} /> */}
    //             <Route path="play" element={
    //                 <PlayProvider>
    //                     <Play />
    //                 </PlayProvider>
    //             } />

    //             <Route path="profile" element={
    //                 <PlayProvider>
    //                     <Profile />
    //                 </PlayProvider>
    //             } />
    //             <Route path="messages" element={<Messages />} />
    //             <Route path="tournament" element={
    //                 <TournamentProvider>
    //                     <Tournament />
    //                 </TournamentProvider>
    //             } />
    //             <Route path="clubs" element={<ChessClubs />} />
    //         </Route>
    //     </Routes>
    // )
    return (
        <AppProvider>
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
                </Route>
                <Route path="clubs" element={<ChessClubs />} />
            </Routes>
        </AppProvider>
    )
}