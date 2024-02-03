import { setupTournaments } from "../actions/setup-tournaments";

export function beforeEachTournament() {
  setupTournaments();
}