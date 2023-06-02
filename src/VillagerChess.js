// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
import { Route, Routes } from "react-router-dom"
import { ApplicationViews } from "./ApplicationViews";
import { Login } from "./Auth/Login";
import { Register } from "./Auth/Register";
import { Authorized } from "./Authorized";
import { Nav } from "./Nav/Nav";

export const VillagerChess = () => {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="*" element={
      <>
        <Authorized>
          <Nav />
          <ApplicationViews />
        </Authorized>
      </>
    } />
  </Routes>
}

export default VillagerChess;
