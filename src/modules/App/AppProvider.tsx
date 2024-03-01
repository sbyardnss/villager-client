import { PropsWithChildren, createContext, useState, useEffect } from "react";
import { GetLoggedInUser } from "./actions/get-current-user";
import { getMyChessClubs } from "../../ServerManager";
import { AppStateDefaults } from "./state";
import type { ChessClub } from "../../Types/ChessClub";

export const AppContext = createContext(null as any);

interface AppProviderProps extends PropsWithChildren<{}> { };

export function AppProvider({ children }: AppProviderProps) {
  const localVillagerUser = GetLoggedInUser();
  const [myChessClubs, setMyChessClubs] = useState<ChessClub[]>([]);
  useEffect(
    () => {
      getMyChessClubs()
        .then((clubData) => {
          setMyChessClubs(clubData);
          AppStateDefaults.clubs = clubData;
        })
    }, []
  )
  const resetChessClubs = () => {
    return getMyChessClubs()
      .then(data => setMyChessClubs(data));
  }
  return (
    <AppContext.Provider value={{
      // Your context value here
      localVillagerUser, myChessClubs, setMyChessClubs, resetChessClubs
    }}>
      {children}
    </AppContext.Provider>
  );
}