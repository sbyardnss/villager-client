import { Outlet, Route, Routes } from "react-router-dom"
import { HomePage } from "./HomePage/HomePage"
import { UserList } from "./UserList/UserList"

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

            </Route>
        </Routes>
    )
}