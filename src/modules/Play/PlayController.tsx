import { createContext, useContext, useEffect, useState } from "react";
import { useAppContext } from "../App/AppProvider";
import { getActiveUserGames } from "../../ServerManager";
import type { DigitalGame, Game, OutgoingGame } from "../../Types/Game";
import { digitalGameDefaults } from "../../Types/Game";
import { findIdentifier } from "../Tournament/actions/find-identifier";
import { findByIdentifier } from "../Tournament/actions/find-by-identifier";
import type { PlayerRelated } from "../../Types/Player";
import { playerRelatedDefaults } from "../../Types/Player";
interface PlayContextType {
  // localVillagerUser: any; // Replace 'any' with the actual type of localVillagerUser
  // myChessClubs: ChessClub[];
  // setMyChessClubs: React.Dispatch<React.SetStateAction<ChessClub[]>>;
  // resetChessClubs: () => Promise<void>; // Adjust the return type as necessary
  usersActiveGames: DigitalGame[];
  setUsersActiveGames: React.Dispatch<React.SetStateAction<DigitalGame[]>>;
  selectedGame: DigitalGame;
  updateSelectedGame: React.Dispatch<React.SetStateAction<DigitalGame>>;
  resetUserGames: () => void;
  selectedRange: string;
  setSelectedRange: React.Dispatch<React.SetStateAction<string>>;
  orientation: 'black' | 'white';
  setOrientation: React.Dispatch<React.SetStateAction<'black' | 'white'>>;
  review: boolean;
  setReview: React.Dispatch<React.SetStateAction<boolean>>;
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
  const { localVillagerUser, clubMatesAndGuests } = useAppContext();

  const [selectedGame, updateSelectedGame] = useState<DigitalGame>({ ...digitalGameDefaults });
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
      const userPlayerObject = findByIdentifier(localVillagerUser.userId, clubMatesAndGuests);
    }, [localVillagerUser, clubMatesAndGuests]
  )
  useEffect(//TODO: DO WE NEED THIS USEEFFECT?
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
        if (selectedGame.player_w.id === localVillagerUser.userId) {
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
    }, [selectedGame]
  )
  //TODO: RESET INDIVIDUAL GAME may not need once websocket added?
  const resetUserGames = () => {
    getActiveUserGames()
      .then(data => {
        setUsersActiveGames(data);
      });
  }
  return (
    <PlayContext.Provider value={{
      selectedGame, updateSelectedGame, usersActiveGames, setUsersActiveGames, resetUserGames,
      selectedRange, setSelectedRange, orientation, setOrientation, review, setReview,
    }}>
      {props.children}
    </PlayContext.Provider>
  )
}

