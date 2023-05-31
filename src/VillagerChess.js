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

export const VillagerChess = () => {
  return <Routes>
    <Route path="*" element={
      <>
        <ApplicationViews />
      </>
    } />
  </Routes>
}

export default VillagerChess;
