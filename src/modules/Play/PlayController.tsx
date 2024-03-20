import { SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { useAppContext } from "../App/AppProvider";
import { getActiveUserGames } from "../../ServerManager";
import { DigitalGame, Game, OutgoingGame } from "../../Types/Game";
import { findIdentifier } from "../Tournament/actions/find-identifier";
interface PlayContextType {
  // localVillagerUser: any; // Replace 'any' with the actual type of localVillagerUser
  // myChessClubs: ChessClub[];
  // setMyChessClubs: React.Dispatch<React.SetStateAction<ChessClub[]>>;
  // resetChessClubs: () => Promise<void>; // Adjust the return type as necessary
  usersActiveGames: DigitalGame[];
  setUsersActiveGames: React.Dispatch<SetStateAction<DigitalGame[]>>;
  selectedGame: DigitalGame;
  updateSelectedGame: React.Dispatch<SetStateAction<DigitalGame>>;
  resetUserGames: () => void;
  selectedRange: string;
  setSelectedRange: React.Dispatch<SetStateAction<string>>;
  orientation: 'black' | 'white';
  setOrientation: React.Dispatch<SetStateAction<'black' | 'white'>>;
  review: boolean;
  setReview: React.Dispatch<SetStateAction<boolean>>;
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

  const [selectedGame, updateSelectedGame] = useState<DigitalGame>({} as DigitalGame);
  const [orientation, setOrientation] = useState<'black' | 'white'>('white');
  const [review, setReview] = useState(false);
  // const [puzzles, setPuzzles] = useState([]);
  const [selectedRange, setSelectedRange] = useState('');
  const [usersActiveGames, setUsersActiveGames] = useState<DigitalGame[]>([]);

  useEffect(
    () => {
      getActiveUserGames()
        .then(gameData => {
          setUsersActiveGames(gameData);
        })
    }, []
  )
  useEffect(
    () => {
      if (selectedGame.id) {
        const updatedGame = usersActiveGames.find((game: DigitalGame) => game.id === selectedGame.id);
        if (updatedGame) {
          updateSelectedGame(updatedGame);
        }
      }
    }, [usersActiveGames, selectedGame.id]
  )
  useEffect(
    () => {
      if (selectedGame.id && selectedGame.player_w && selectedGame.player_b) {
        if (findIdentifier(selectedGame.player_w) === localVillagerUser.userId) {
          setOrientation('white');
        } else {
          setOrientation('black');
        }
      } else {
        const randomOrientation = Math.floor(Math.random() * 2);
        if (randomOrientation === 1) {
          setOrientation("white");
        }
        if (randomOrientation === 0) {
          setOrientation("black");
        }
      }
    }, [selectedGame, localVillagerUser.userId]
  )
  const resetUserGames = () => {
    getActiveUserGames()
      .then(data => {
        setUsersActiveGames(data);
      });
  }
  return (
    <PlayContext.Provider value={{
      selectedGame, updateSelectedGame, usersActiveGames, setUsersActiveGames, resetUserGames,
      selectedRange, setSelectedRange, orientation, setOrientation, review, setReview
    }}>
      {props.children}
    </PlayContext.Provider>
  )
}

