import type { Match } from "tournament-pairings/dist/Match";

export const resetPairingMatchNumbers = (pairings: Match[]): Match[] => {
  pairings.forEach((p, index) => {
    p.match = index + 1;
  });
  return pairings;
}