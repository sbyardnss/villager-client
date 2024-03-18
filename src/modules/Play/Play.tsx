import { SetStateAction, createContext, useContext, useState } from "react";
import { useAppContext } from "../App/AppProvider";
import { getActiveUserGames } from "../../ServerManager";
import { Game } from "../../Types/Game";

interface PlayContextType {
  // localVillagerUser: any; // Replace 'any' with the actual type of localVillagerUser
  // myChessClubs: ChessClub[];
  // setMyChessClubs: React.Dispatch<React.SetStateAction<ChessClub[]>>;
  // resetChessClubs: () => Promise<void>; // Adjust the return type as necessary
  usersActiveGames: Game[];
  setUsersActiveGames: React.Dispatch<SetStateAction<Game[]>>;
  selectedGame: Game;
  updateSelectedGame: React.Dispatch<SetStateAction<Game>>;
  resetUserGames: () => void;
  selectedRange: string;
  setSelectedRange: React.Dispatch<SetStateAction<string>>;
}

export const PlayContext = createContext<PlayContextType | null>(null);

export function usePlayContext() {
  const context = useContext(PlayContext);
  if (context === null) {
    throw new Error("usePlayContext must be within AppProvider");
  }
  return context;
}
//games, resetGames, updateSelectedGameObj, setSelectedRange, puzzles
export const PlayController = (props: any) => {
  const { localVillagerUser } = useAppContext();

  const [selectedGame, updateSelectedGame] = useState<Game>({} as Game);
  const [puzzles, setPuzzles] = useState([]);
  const [selectedRange, setSelectedRange] = useState('');
  const [usersActiveGames, setUsersActiveGames] = useState<Game[]>([]);

  const resetUserGames = () => {
    getActiveUserGames()
      .then(data => {
        setUsersActiveGames(data);
      });
  }
  return (
    <PlayContext.Provider value={{
      selectedGame, updateSelectedGame, usersActiveGames, setUsersActiveGames, resetUserGames, selectedRange, setSelectedRange
    }}>
      {props.children}
    </PlayContext.Provider>
  )
}

