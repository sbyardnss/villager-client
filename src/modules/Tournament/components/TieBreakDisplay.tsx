import { useEffect, useState } from "react";
import type { Guest } from "../../../Types/Guest";
import type { PlayerRelated } from "../../../Types/Player";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import { tieBreakers, type TieBreakObject } from "../actions/tie-breakers";

/*
arr input for tiebreaks:  [playerFullName, parseFloat(scoreObj[player], identifier)][]

*/

interface TieBreakDisplayProps {
  // tournamentPlayers: (PlayerRelated | Guest)[];
  analysis: tournamentAnalysisOutput;
  playerScores: [string, number, string][];
}

export const TieBreakDisplay: React.FC<TieBreakDisplayProps> = ({
  // tournamentPlayers,
  analysis,
  playerScores,
}) => {
  const [tieBreaks, setTieBreaks] = useState<TieBreakObject>({ solkoff: {}, cumulative: {} });

  useEffect(
    () => {
      const tieBreakData = tieBreakers(analysis, playerScores);
      setTieBreaks(tieBreakData);
    }, [analysis, playerScores]
  )
  // const solkoffResultsArr = solkoffTieBreaker(analysis);
  // console.log('tiebreaks', tieBreakers(analysis, results))
  console.log('state variable', tieBreaks);
  return (
    <div id="tieBreakResults">
      <div id="fullResults">
        <div className="resultsHeader">solkoff</div>
        <div id="solkoffResults">
          {/* {
            solkoffResultsArr.map(playerResult => {
              const player = typeof playerResult[0] === 'string' ? allPlayersArr.find(player => player.guest_id === playerResult[0])
                : allPlayersArr.find(player => player.id === playerResult[0])
              return (
                <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                  <div>{player?.full_name}: </div>
                  <div>{playerResult[1]}</div>
                </div>
              )
            })
          } */}
          {/* {
            Object.keys(tieBreaks.solkoff).forEach(player => {

            })
          } */}
        </div>
      </div>
      <div id="fullResults">
        <div className="resultsHeader">cumulative</div>
        <div id="cumulativeResults">
          {/* {
            cumulativeResultsArr.map(playerResult => {
              const player = typeof playerResult[0] === 'string' ? allPlayersArr.find(player => player.guest_id === playerResult[0])
                : allPlayersArr.find(player => player.id === playerResult[0])
              return (
                <div key={playerResult[0] + '--' + playerResult[1]} className="resultsModalListItem">
                  <div>{player?.full_name}: </div>
                  <div>{playerResult[1]}</div>
                </div>
              )
            })
          } */}
        </div>
      </div>
    </div>
  )
}