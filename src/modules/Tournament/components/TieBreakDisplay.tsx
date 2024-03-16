import { useEffect, useState } from "react";
import type { Guest } from "../../../Types/Guest";
import type { PlayerRelated } from "../../../Types/Player";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { tieBreakers } from "../actions/tie-breakers";
import { findByIdentifier } from "../actions/find-by-identifier";

interface TieBreakDisplayProps {
  allClubMates: (PlayerRelated | Guest)[];
  analysis: tournamentAnalysisOutput;
  playerScores: [string, number, string][];
}

export const TieBreakDisplay: React.FC<TieBreakDisplayProps> = ({
  allClubMates,
  analysis,
  playerScores,
}) => {
  const [solkoff, setSolkoff] = useState<[string, number][]>([]);
  const [cumulative, setCumulative] = useState<[string, number][]>([]);

  useEffect(
    () => {
      const tieBreakData = tieBreakers(analysis, playerScores);
      const solkoffEntries = Object.entries(tieBreakData.solkoff).sort((a, b) => b[1] - a[1]);
      const cumulativeEntries = Object.entries(tieBreakData.cumulative).sort((a, b) => b[1] - a[1]);
      //TODO: WHY WOULDN'T THIS WORK?
      // const sortedSolkoff = Object.fromEntries(Object.entries(tieBreakData.solkoff).sort((a, b) => b[1] - a[1]));
      setSolkoff(solkoffEntries);
      setCumulative(cumulativeEntries);
    }, [analysis, playerScores]
  )

  return (
    <div id="tieBreakResults">
      <div id="fullResults">
        <div className="resultsHeader">solkoff</div>
        <div id="solkoffResults">
          {
            solkoff.map(playerResult => {
              const player = findByIdentifier(playerResult[0], allClubMates);
              return (
                <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                  <div>{player?.full_name}: </div>
                  <div>{playerResult[1]}</div>
                </div>
              )
            })
          }
        </div>
      </div>
      <div id="fullResults">
        <div className="resultsHeader">cumulative</div>
        <div id="cumulativeResults">
          {
            cumulative.map(playerResult => {
              const player = findByIdentifier(playerResult[0], allClubMates);
              return (
                <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                  <div>{player?.full_name}: </div>
                  <div>{playerResult[1]}</div>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}