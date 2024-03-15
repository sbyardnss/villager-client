import type { Guest } from "../../../Types/Guest";
import type { PlayerRelated } from "../../../Types/Player";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { solkoffTieBreaker, cumulativeTieBreaker } from "../actions/tie-breakers";

/*
arr input for tiebreaks:  [playerFullName, parseFloat(scoreObj[player], identifier)][]

*/

interface TieBreakDisplayProps {
  tournamentPlayers: (PlayerRelated | Guest)[];
  analysis: tournamentAnalysisOutput;
}

export const TieBreakDisplay: React.FC<TieBreakDisplayProps> = ({
  tournamentPlayers,
  analysis,
}) => {
  return<></>
}