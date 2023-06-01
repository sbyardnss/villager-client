import { Outlet, Route, Routes } from "react-router-dom"
import { HomePage } from "./HomePage/HomePage"

export const ApplicationViews = () => {
    return (
        <Routes>
            <Route path="/" element={
                <>
                    <Outlet />
                </>
            }>
                    <Route path="" element={<HomePage />} />
            </Route>
        </Routes>
    )
}