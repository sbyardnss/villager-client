import { AppStateDefaults } from "../../App/state";
import { getMyOpenTournaments } from "../../../ServerManager";

export function loadOpenUserTournaments() {
  AppStateDefaults.activeTournaments = getMyOpenTournaments();
}