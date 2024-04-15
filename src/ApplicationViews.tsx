import { Outlet, Route, Routes } from "react-router-dom"
import { Play } from "./modules/Play/components/Play";
import { ChessClubs } from "./modules/ChessClubs/ChessClubs"
import { AppProvider } from "./modules/App/AppProvider";
import { HomePage } from "./modules/HomePage/HomePage";
import { TournamentMain } from "./modules/Tournament/Tournament"
import { PlayController } from "./modules/Play/PlayController"
export const ApplicationViews = () => {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={
          <>
            <Outlet />
          </>
        }>
          <Route path="" element={
            <PlayController>
              <HomePage />
            </PlayController>
          } />
          <Route path="play" element={
            <PlayController>
              <Play />
            </PlayController>
          } />
        </Route>
        <Route path="clubs" element={<ChessClubs />} />
        <Route path="tournament/:tournamentId?" element={
          <TournamentMain />
        } />
      </Routes>
    </AppProvider>
  )
}