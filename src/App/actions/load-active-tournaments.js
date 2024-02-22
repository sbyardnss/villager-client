import { AppStateDefaults } from "../state";
import { getMyChessClubs } from "../../ServerManager";

export function LoadMyClubs() {
  AppStateDefaults.clubs = getMyChessClubs();
}

