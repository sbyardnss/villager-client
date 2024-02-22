import { PropsWithChildren, createContext, useState, useEffect } from "react";
import { GetLoggedInUser } from "../modules/App/actions/get-current-user";
import { getMyChessClubs } from "../ServerManager";

export const AppContext = createContext(null as any);

interface AppProviderProps extends PropsWithChildren<{}> { };

export function AppProvider({ children}: AppProviderProps) {
  const localVillagerUser = GetLoggedInUser();
  const [myChessClubs, setMyChessClubs] = useState([]);
useEffect(
    () => {
      getMyChessClubs()
        .then((clubData) => {
          setMyChessClubs(clubData);
        })
    }, []
  )
  return (
    <AppContext.Provider value={{
      // Your context value here
      localVillagerUser, myChessClubs, setMyChessClubs
    }}>
      {children}
    </AppContext.Provider>
  );
}