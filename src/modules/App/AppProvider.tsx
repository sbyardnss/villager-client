import { PropsWithChildren, createContext, useState, useEffect, useContext } from "react";
import { GetLoggedInUser } from "./actions/get-current-user";
import { getClubMatesAndGuests, getMyChessClubs } from "../../ServerManager";
import { AppStateDefaults } from "./state";
import type { ChessClub } from "../../Types/ChessClub";
import { PlayerRelated } from "../../Types/Player";
import { Guest } from "../../Types/Guest";

interface AppContextType {
  localVillagerUser: any; // Replace 'any' with the actual type of localVillagerUser
  myChessClubs: ChessClub[];
  setMyChessClubs: React.Dispatch<React.SetStateAction<ChessClub[]>>;
  resetChessClubs: () => Promise<void>; // Adjust the return type as necessary
  clubMatesAndGuests: (PlayerRelated | Guest)[];
  setClubMatesAndGuests: React.Dispatch<React.SetStateAction<(PlayerRelated | Guest)[]>>;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useAppContext must be within AppProvider");
  }
  return context;
}

interface AppProviderProps extends PropsWithChildren<{}> { };

export function AppProvider({ children }: AppProviderProps) {
  const localVillagerUser = GetLoggedInUser();
  const [myChessClubs, setMyChessClubs] = useState<ChessClub[]>([]);
  const [clubMatesAndGuests, setClubMatesAndGuests] = useState<(PlayerRelated | Guest)[]>([]);

  // useEffect(
  //   () => {
  //     getMyChessClubs()
  //       .then((clubData) => {
  //         setMyChessClubs(clubData);
  //         AppStateDefaults.clubs = clubData;
  //       })
  //   }, []
  // )
  useEffect(
    () => {
      Promise.all([getClubMatesAndGuests(), getMyChessClubs()])
        .then(([mateAndGuestData, chessClubData]) => {
          setClubMatesAndGuests(mateAndGuestData);
          setMyChessClubs(chessClubData);
        });
    }, []
  )
  const resetChessClubs = () => {
    return getMyChessClubs()
      .then(data => setMyChessClubs(data));
  }
  return (
    <AppContext.Provider value={{
      // Your context value here
      localVillagerUser, myChessClubs, setMyChessClubs, resetChessClubs,
      clubMatesAndGuests, setClubMatesAndGuests,
    }}>
      {children}
    </AppContext.Provider>
  );
}